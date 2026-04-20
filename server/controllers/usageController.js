/**
 * Usage Controller
 * Handles CRUD operations for water/electricity usage data
 * Includes dashboard stats, IoT simulation, leaderboard, and carbon footprint
 */

const Usage = require('../models/Usage');
const Alert = require('../models/Alert');
const User = require('../models/User');

/**
 * POST /api/usage
 * Add a new usage reading (manual meter entry)
 * Automatically calculates cost and checks thresholds for alerts
 */
const addUsage = async (req, res, next) => {
  try {
    const { type, value, source } = req.body;

    // Create new usage record
    const usage = await Usage.create({
      userId: req.user._id,
      type,
      value,
      source: source || 'manual',
    });

    // Check if usage exceeds threshold and generate alert if needed
    await checkAndCreateAlert(req.user, type, value);

    res.status(201).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/usage
 * Retrieve usage data with optional filters
 * Query params: type (water/electricity), startDate, endDate, limit
 */
const getUsage = async (req, res, next) => {
  try {
    const { type, startDate, endDate, limit = 100 } = req.query;

    // Build filter query
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const usage = await Usage.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: usage.length,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/usage/dashboard
 * Get aggregated dashboard statistics
 * Returns totals, averages, comparisons, and recent readings
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Time ranges for comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Aggregate this month's totals by type
    const thisMonthStats = await Usage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: thisMonthStart },
        },
      },
      {
        $group: {
          _id: '$type',
          totalValue: { $sum: '$value' },
          totalCost: { $sum: '$cost' },
          avgValue: { $avg: '$value' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate last month's totals for comparison
    const lastMonthStats = await Usage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      {
        $group: {
          _id: '$type',
          totalValue: { $sum: '$value' },
          totalCost: { $sum: '$cost' },
        },
      },
    ]);

    // Get daily usage for the past 7 days (for line chart)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const dailyUsage = await Usage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type',
          },
          totalValue: { $sum: '$value' },
          totalCost: { $sum: '$cost' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Get monthly usage for the past 6 months (for bar chart)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyUsage = await Usage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
            type: '$type',
          },
          totalValue: { $sum: '$value' },
          totalCost: { $sum: '$cost' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Format response data
    const formatStats = (stats) => {
      const water = stats.find(s => s._id === 'water') || { totalValue: 0, totalCost: 0, avgValue: 0, count: 0 };
      const electricity = stats.find(s => s._id === 'electricity') || { totalValue: 0, totalCost: 0, avgValue: 0, count: 0 };
      return { water, electricity };
    };

    const current = formatStats(thisMonthStats);
    const previous = formatStats(lastMonthStats);

    // Calculate savings (difference from last month)
    const waterSavings = previous.water.totalCost - current.water.totalCost;
    const electricitySavings = previous.electricity.totalCost - current.electricity.totalCost;

    // Get recent alerts
    const recentAlerts = await Alert.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        current,
        previous,
        savings: {
          water: parseFloat(waterSavings.toFixed(2)),
          electricity: parseFloat(electricitySavings.toFixed(2)),
          total: parseFloat((waterSavings + electricitySavings).toFixed(2)),
        },
        dailyUsage,
        monthlyUsage,
        recentAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/usage/simulate
 * Generate simulated IoT sensor data
 * Creates realistic random readings for demo purposes
 */
const simulateIoT = async (req, res, next) => {
  try {
    const { days = 1 } = req.body;
    const readings = [];
    const now = new Date();

    // Generate readings for each day
    for (let d = 0; d < Math.min(days, 30); d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);

      // Generate 4-8 water readings per day (realistic household pattern)
      const waterReadings = Math.floor(Math.random() * 5) + 4;
      for (let i = 0; i < waterReadings; i++) {
        const hour = Math.floor(Math.random() * 24);
        const readingDate = new Date(date);
        readingDate.setHours(hour, Math.floor(Math.random() * 60));

        // Water usage varies by time of day (higher in morning and evening)
        let baseUsage = 20 + Math.random() * 40;
        if (hour >= 6 && hour <= 9) baseUsage *= 1.5;  // Morning peak
        if (hour >= 18 && hour <= 21) baseUsage *= 1.3; // Evening peak

        readings.push({
          userId: req.user._id,
          type: 'water',
          value: parseFloat(baseUsage.toFixed(1)),
          source: 'iot',
          timestamp: readingDate,
        });
      }

      // Generate 24 electricity readings per day (hourly smart meter)
      for (let hour = 0; hour < 24; hour++) {
        const readingDate = new Date(date);
        readingDate.setHours(hour, 0);

        // Electricity varies: low at night, peaks during day
        let baseUsage = 0.5 + Math.random() * 1;
        if (hour >= 7 && hour <= 9) baseUsage = 2 + Math.random() * 2;   // Morning
        if (hour >= 12 && hour <= 14) baseUsage = 1.5 + Math.random() * 1.5; // Afternoon
        if (hour >= 18 && hour <= 23) baseUsage = 2.5 + Math.random() * 3;  // Evening peak
        if (hour >= 0 && hour <= 5) baseUsage = 0.3 + Math.random() * 0.5;  // Night low

        readings.push({
          userId: req.user._id,
          type: 'electricity',
          value: parseFloat(baseUsage.toFixed(2)),
          source: 'iot',
          timestamp: readingDate,
        });
      }
    }

    // Bulk insert all readings
    const inserted = await Usage.insertMany(readings);

    res.status(201).json({
      success: true,
      message: `Generated ${inserted.length} IoT readings for ${days} day(s)`,
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/usage/leaderboard
 * Get the most efficient users ranked by their efficiency scores
 * Efficiency = lower cost per reading = better
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Usage.aggregate([
      // Group by user and calculate total usage and cost
      {
        $group: {
          _id: '$userId',
          totalWaterValue: {
            $sum: { $cond: [{ $eq: ['$type', 'water'] }, '$value', 0] },
          },
          totalElectricityValue: {
            $sum: { $cond: [{ $eq: ['$type', 'electricity'] }, '$value', 0] },
          },
          totalCost: { $sum: '$cost' },
          readingCount: { $sum: 1 },
        },
      },
      // Calculate efficiency score (lower is better)
      {
        $addFields: {
          efficiencyScore: {
            $cond: [
              { $gt: ['$readingCount', 0] },
              { $divide: ['$totalCost', '$readingCount'] },
              0,
            ],
          },
        },
      },
      // Sort by efficiency (ascending - lower cost per reading is better)
      { $sort: { efficiencyScore: 1 } },
      // Limit to top 10
      { $limit: 10 },
      // Join with User collection to get names
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      // Format the output
      {
        $project: {
          _id: 1,
          name: '$user.name',
          avatar: '$user.avatar',
          badges: '$user.badges',
          totalCost: { $round: ['$totalCost', 2] },
          totalWaterValue: { $round: ['$totalWaterValue', 1] },
          totalElectricityValue: { $round: ['$totalElectricityValue', 2] },
          efficiencyScore: { $round: ['$efficiencyScore', 4] },
          readingCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/usage/carbon
 * Estimate carbon footprint based on electricity usage
 * Uses global average: 0.42 kg CO₂ per kWh
 */
const getCarbonFootprint = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    // Determine period start date
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Aggregate electricity usage for the period
    const result = await Usage.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'electricity',
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalKwh: { $sum: '$value' },
        },
      },
    ]);

    const totalKwh = result.length > 0 ? result[0].totalKwh : 0;
    // CO₂ emission factor: 0.42 kg CO₂ per kWh (global average)
    const carbonKg = parseFloat((totalKwh * 0.42).toFixed(2));
    // Trees needed to offset (1 tree absorbs ~22 kg CO₂/year)
    const treesNeeded = Math.ceil(carbonKg / 22);

    res.json({
      success: true,
      data: {
        totalKwh: parseFloat(totalKwh.toFixed(2)),
        carbonKg,
        carbonTons: parseFloat((carbonKg / 1000).toFixed(4)),
        treesNeeded,
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Check usage against thresholds and create alerts
 * Called automatically when new usage data is added
 */
async function checkAndCreateAlert(user, type, value) {
  const threshold = type === 'water'
    ? user.settings?.waterThreshold || 500
    : user.settings?.electricityThreshold || 50;

  // Determine severity based on how much the threshold is exceeded
  let severity = 'green';
  let message = '';

  if (value > threshold * 1.5) {
    severity = 'red';
    message = `🚨 Critical: ${type} usage (${value}) is ${Math.round((value / threshold - 1) * 100)}% above your threshold of ${threshold}`;
  } else if (value > threshold * 1.2) {
    severity = 'yellow';
    message = `⚠️ Warning: ${type} usage (${value}) is approaching your limit of ${threshold}`;
  } else if (value > threshold) {
    severity = 'yellow';
    message = `📊 Notice: ${type} usage (${value}) slightly exceeds your threshold of ${threshold}`;
  }

  // Only create alert if threshold was exceeded
  if (severity !== 'green') {
    await Alert.create({
      userId: user._id,
      type,
      severity,
      message,
      threshold,
      actualValue: value,
    });
  }
}

module.exports = {
  addUsage,
  getUsage,
  getDashboardStats,
  simulateIoT,
  getLeaderboard,
  getCarbonFootprint,
};
