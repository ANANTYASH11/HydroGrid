/**
 * Usage Controller (Supabase/Postgres version)
 * Handles CRUD operations for water/electricity usage data using Raw SQL
 */

const { query } = require('../database/db');
const { sendAlertEmail } = require('../utils/emailService');

const INDIA_TARIFFS = {
  default: {
    electricity: [
      { upto: 100, rate: 4.0 },
      { upto: 300, rate: 6.5 },
      { upto: Infinity, rate: 8.5 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: 25000, rate: 0.05 },
      { upto: Infinity, rate: 0.08 },
    ],
  },
  maharashtra: {
    electricity: [
      { upto: 100, rate: 4.41 },
      { upto: 300, rate: 8.82 },
      { upto: 500, rate: 11.72 },
      { upto: Infinity, rate: 12.92 },
    ],
    water: [
      { upto: 10000, rate: 0.05 },
      { upto: 25000, rate: 0.08 },
      { upto: Infinity, rate: 0.12 },
    ],
  },
  delhi: {
    electricity: [
      { upto: 200, rate: 3.0 },
      { upto: 400, rate: 4.5 },
      { upto: 800, rate: 6.5 },
      { upto: 1200, rate: 7.0 },
      { upto: Infinity, rate: 8.0 },
    ],
    water: [
      { upto: 20000, rate: 0.0 }, // Free upto 20KL in Delhi for domestic
      { upto: 30000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  karnataka: {
    electricity: [
      { upto: 50, rate: 4.15 },
      { upto: 100, rate: 5.6 },
      { upto: 200, rate: 7.15 },
      { upto: Infinity, rate: 8.2 },
    ],
    water: [
      { upto: 8000, rate: 0.07 },
      { upto: 15000, rate: 0.11 },
      { upto: 25000, rate: 0.18 },
      { upto: Infinity, rate: 0.25 },
    ],
  },
  uttar_pradesh: {
    electricity: [
      { upto: 150, rate: 5.5 },
      { upto: 300, rate: 6.0 },
      { upto: 500, rate: 6.5 },
      { upto: Infinity, rate: 7.0 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  gujarat: {
    electricity: [
      { upto: 50, rate: 3.05 },
      { upto: 100, rate: 3.5 },
      { upto: 250, rate: 4.15 },
      { upto: Infinity, rate: 5.2 },
    ],
    water: [
      { upto: 15000, rate: 0.04 },
      { upto: Infinity, rate: 0.06 },
    ],
  },
  tamil_nadu: {
    electricity: [
      { upto: 100, rate: 0.0 }, // Free 100 units
      { upto: 200, rate: 2.25 },
      { upto: 500, rate: 4.5 },
      { upto: Infinity, rate: 6.6 },
    ],
    water: [
      { upto: 10000, rate: 0.04 },
      { upto: Infinity, rate: 0.08 },
    ],
  },
  west_bengal: {
    electricity: [
      { upto: 102, rate: 5.3 },
      { upto: 180, rate: 5.97 },
      { upto: 300, rate: 6.97 },
      { upto: Infinity, rate: 7.31 },
    ],
    water: [
      { upto: 10000, rate: 0.02 },
      { upto: Infinity, rate: 0.04 },
    ],
  },
  telangana: {
    electricity: [
      { upto: 100, rate: 3.3 },
      { upto: 200, rate: 4.3 },
      { upto: 300, rate: 7.2 },
      { upto: 400, rate: 8.5 },
      { upto: Infinity, rate: 10.0 },
    ],
    water: [
      { upto: 15000, rate: 0.05 },
      { upto: Infinity, rate: 0.1 },
    ],
  },
  rajasthan: {
    electricity: [
      { upto: 50, rate: 4.75 },
      { upto: 150, rate: 6.5 },
      { upto: 300, rate: 7.35 },
      { upto: Infinity, rate: 7.95 },
    ],
    water: [
      { upto: 15000, rate: 0.03 },
      { upto: Infinity, rate: 0.06 },
    ],
  },
  andhra_pradesh: {
    electricity: [
      { upto: 30, rate: 1.9 },
      { upto: 75, rate: 3.0 },
      { upto: 125, rate: 4.5 },
      { upto: 225, rate: 6.0 },
      { upto: Infinity, rate: 9.5 },
    ],
    water: [
      { upto: 10000, rate: 0.04 },
      { upto: Infinity, rate: 0.08 },
    ],
  },
  kerala: {
    electricity: [
      { upto: 50, rate: 3.15 },
      { upto: 100, rate: 3.95 },
      { upto: 150, rate: 5.0 },
      { upto: 250, rate: 6.4 },
      { upto: Infinity, rate: 8.5 },
    ],
    water: [
      { upto: 5000, rate: 0.04 },
      { upto: 10000, rate: 0.05 },
      { upto: 20000, rate: 0.06 },
      { upto: Infinity, rate: 0.15 },
    ],
  },
  punjab: {
    electricity: [
      { upto: 100, rate: 4.19 },
      { upto: 300, rate: 6.64 },
      { upto: Infinity, rate: 7.73 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  haryana: {
    electricity: [
      { upto: 50, rate: 2.0 },
      { upto: 150, rate: 2.5 },
      { upto: 250, rate: 5.25 },
      { upto: 500, rate: 6.3 },
      { upto: Infinity, rate: 7.1 },
    ],
    water: [
      { upto: 10000, rate: 0.04 },
      { upto: Infinity, rate: 0.07 },
    ],
  },
  bihar: {
    electricity: [
      { upto: 100, rate: 6.1 },
      { upto: 200, rate: 6.95 },
      { upto: Infinity, rate: 8.05 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.06 },
    ],
  },
  madhya_pradesh: {
    electricity: [
      { upto: 50, rate: 4.21 },
      { upto: 150, rate: 5.17 },
      { upto: 300, rate: 6.74 },
      { upto: Infinity, rate: 7.12 },
    ],
    water: [
      { upto: 10000, rate: 0.04 },
      { upto: Infinity, rate: 0.08 },
    ],
  },
  odisha: {
    electricity: [
      { upto: 50, rate: 3.0 },
      { upto: 200, rate: 4.8 },
      { upto: 400, rate: 5.8 },
      { upto: Infinity, rate: 6.2 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  assam: {
    electricity: [
      { upto: 120, rate: 5.4 },
      { upto: 240, rate: 6.6 },
      { upto: Infinity, rate: 7.6 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  chhattisgarh: {
    electricity: [
      { upto: 100, rate: 3.7 },
      { upto: 200, rate: 3.9 },
      { upto: 400, rate: 5.3 },
      { upto: Infinity, rate: 6.5 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  goa: {
    electricity: [
      { upto: 100, rate: 1.5 },
      { upto: 200, rate: 2.25 },
      { upto: 300, rate: 2.85 },
      { upto: 400, rate: 3.3 },
      { upto: Infinity, rate: 4.1 },
    ],
    water: [
      { upto: 15000, rate: 0.02 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  himachal_pradesh: {
    electricity: [
      { upto: 125, rate: 1.55 },
      { upto: 250, rate: 3.15 },
      { upto: Infinity, rate: 4.4 },
    ],
    water: [
      { upto: 10000, rate: 0.02 },
      { upto: Infinity, rate: 0.04 },
    ],
  },
  jharkhand: {
    electricity: [
      { upto: 200, rate: 6.25 },
      { upto: Infinity, rate: 6.5 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  uttarakhand: {
    electricity: [
      { upto: 100, rate: 3.1 },
      { upto: 200, rate: 4.2 },
      { upto: 400, rate: 5.8 },
      { upto: Infinity, rate: 6.55 },
    ],
    water: [
      { upto: 10000, rate: 0.02 },
      { upto: Infinity, rate: 0.04 },
    ],
  },
  chandigarh: {
    electricity: [
      { upto: 150, rate: 2.75 },
      { upto: 400, rate: 4.25 },
      { upto: Infinity, rate: 4.65 },
    ],
    water: [
      { upto: 15000, rate: 0.03 },
      { upto: Infinity, rate: 0.06 },
    ],
  },
  jammu_and_kashmir: {
    electricity: [
      { upto: 100, rate: 2.5 },
      { upto: 200, rate: 3.5 },
      { upto: Infinity, rate: 4.5 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: Infinity, rate: 0.05 },
    ],
  },
  puducherry: {
    electricity: [
      { upto: 100, rate: 1.9 },
      { upto: 200, rate: 3.0 },
      { upto: Infinity, rate: 5.0 },
    ],
    water: [
      { upto: 10000, rate: 0.04 },
      { upto: Infinity, rate: 0.08 },
    ],
  }
};

const addUsage = async (req, res, next) => {
  try {
    const { type, value, source = 'manual' } = req.body;
    const unit = type === 'water' ? 'liters' : 'kWh';
    
    // Calculate cost based on hardcoded rates (simplified for now)
    const cost = type === 'water' ? value * 0.05 : value * 8;

    const result = await query(
      'INSERT INTO usage_data (user_id, state, type, value, unit, cost, source) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, req.user.state, type, value, unit, cost, source]
    );

    const usage = result.rows[0];
    
    // Ensure numeric values are numbers, not strings
    usage.value = parseFloat(usage.value);
    usage.cost = parseFloat(usage.cost);

    checkAndCreateAlert(req.user, type, value).catch(err => console.error('Alert Error:', err));

    res.status(201).json({ success: true, data: usage });
  } catch (error) {
    next(error);
  }
};

const getUsage = async (req, res, next) => {
  try {
    const { type, startDate, endDate, limit = 100 } = req.query;
    let sql = 'SELECT * FROM usage_data WHERE user_id = $1';
    let params = [req.user.id];
    let count = 2;

    if (type) {
      sql += ` AND type = $${count++}`;
      params.push(type);
    }
    if (startDate) {
      sql += ` AND timestamp >= $${count++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      sql += ` AND timestamp <= $${count++}`;
      params.push(new Date(endDate));
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${count}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // This month stats
    const thisMonthRes = await query(
      `SELECT type, SUM(value) as "totalValue", SUM(cost) as "totalCost", AVG(value) as "avgValue" 
       FROM usage_data WHERE user_id = $1 AND timestamp >= $2 GROUP BY type`,
      [userId, thisMonthStart]
    );

    // Last month stats
    const lastMonthRes = await query(
      `SELECT type, SUM(value) as "totalValue", SUM(cost) as "totalCost" 
       FROM usage_data WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3 GROUP BY type`,
      [userId, lastMonthStart, lastMonthEnd]
    );

    // Past 7 days (for chart)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const dailyRes = await query(
       `SELECT (date_trunc('day', timestamp AT TIME ZONE 'Asia/Kolkata'))::date::text as "dateStr", type, SUM(value) as "totalValue", SUM(cost) as "totalCost"
        FROM usage_data WHERE user_id = $1 AND timestamp >= $2
        GROUP BY "dateStr", type ORDER BY "dateStr" ASC`,
       [userId, sevenDaysAgo]
    );

    // Past 6 months (for chart)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRes = await query(
       `SELECT date_trunc('month', timestamp) as month, type, SUM(value) as "totalValue", SUM(cost) as "totalCost"
        FROM usage_data WHERE user_id = $1 AND timestamp >= $2
        GROUP BY month, type ORDER BY month ASC`,
       [userId, sixMonthsAgo]
    );

    // Process rows to match frontend format
    const formatRows = (rows) => {
        const water = rows.find(r => r.type === 'water') || { totalValue: 0, totalCost: 0, avgValue: 0 };
        const electricity = rows.find(r => r.type === 'electricity') || { totalValue: 0, totalCost: 0, avgValue: 0 };
        
        // Convert SQL numeric strings to floats
        return { 
          water: {
            totalValue: parseFloat(water.totalValue || 0),
            totalCost: parseFloat(water.totalCost || 0),
            avgValue: parseFloat(water.avgValue || 0)
          }, 
          electricity: {
            totalValue: parseFloat(electricity.totalValue || 0),
            totalCost: parseFloat(electricity.totalCost || 0),
            avgValue: parseFloat(electricity.avgValue || 0)
          } 
        };
    };

    const current = formatRows(thisMonthRes.rows);
    const previous = formatRows(lastMonthRes.rows);
    
    // Map daily data to expected _id format
    const dailyUsage = dailyRes.rows.map(r => ({
        _id: { date: r.dateStr, type: r.type },
        totalValue: parseFloat(r.totalValue),
        totalCost: parseFloat(r.totalCost)
    }));

    const monthlyUsage = monthlyRes.rows.map(r => ({
        _id: { month: r.month.toISOString().slice(0, 7), type: r.type },
        totalValue: parseFloat(r.totalValue),
        totalCost: parseFloat(r.totalCost)
    }));

    const recentAlertsRes = await query('SELECT * FROM alerts WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5', [userId]);

    res.json({
      success: true,
      data: {
        current,
        previous,
        savings: {
          water: parseFloat((previous.water.totalCost - current.water.totalCost).toFixed(2)),
          electricity: parseFloat((previous.electricity.totalCost - current.electricity.totalCost).toFixed(2)),
          total: parseFloat(((previous.water.totalCost - current.water.totalCost) + (previous.electricity.totalCost - current.electricity.totalCost)).toFixed(2))
        },
        dailyUsage,
        monthlyUsage,
        recentAlerts: recentAlertsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

const simulateIoT = async (req, res, next) => {
  try {
    const { days = 30 } = req.body; // Default to 30 days for a realistic report
    const now = new Date();
    let totalInserted = 0;

    for (let d = 0; d < Math.min(days, 60); d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);

      // Reset hours to midnight for consistent daily generation
      date.setHours(0, 0, 0, 0);

      // Water readings (4-9 readings per day)
      const waterCount = Math.floor(Math.random() * 6) + 4;
      for (let i = 0; i < waterCount; i++) {
        const hour = Math.floor(Math.random() * 24);
        const ts = new Date(date);
        ts.setHours(hour, Math.floor(Math.random() * 60));
        
        let val = 15 + Math.random() * 50; // 15-65 Liters per bucket/use
        if (hour >= 6 && hour <= 9) val *= 1.8; // Morning peak
        if (hour >= 19 && hour <= 21) val *= 1.4; // Evening peak

        const costRate = 0.08; // ₹0.08 per liter (~₹80 per KL) - more realistic for tiered water
        
        await query(
           'INSERT INTO usage_data (user_id, state, type, value, unit, cost, source, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
           [req.user.id, req.user.state || 'Delhi', 'water', val, 'liters', val * costRate, 'iot', ts]
        );
        totalInserted++;
      }

      // Electricity readings (one per hour)
      for (let h = 0; h < 24; h++) {
        const ts = new Date(date);
        ts.setHours(h, 0);
        
        let val = 0.3 + Math.random() * 0.7; // 0.3-1.0 kWh base load
        if (h >= 18 && h <= 23) val = 1.8 + Math.random() * 2.5; // AC/Lights peak
        if (h >= 7 && h <= 10) val = 1.2 + Math.random() * 1.5; // Morning prep peak
        
        const costRate = 7.5; // ₹7.5 per kWh (average Indian tier)
        
        await query(
           'INSERT INTO usage_data (user_id, state, type, value, unit, cost, source, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
           [req.user.id, req.user.state || 'Delhi', 'electricity', val, 'kWh', val * costRate, 'iot', ts]
        );
        totalInserted++;
      }
    }

    res.status(201).json({ success: true, count: totalInserted, message: `Successfully simulated ${totalInserted} readings over ${days} days.` });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.avatar, u.badges,
        SUM(CASE WHEN d.type = 'water' THEN d.value ELSE 0 END) as "totalWaterValue",
        SUM(CASE WHEN d.type = 'electricity' THEN d.value ELSE 0 END) as "totalElectricityValue",
        SUM(d.cost) as "totalCost",
        COUNT(d.id) as "readingCount",
        (SUM(d.cost) / NULLIF(COUNT(d.id), 0)) as "efficiencyScore"
      FROM users u
      LEFT JOIN usage_data d ON u.id = d.user_id
      GROUP BY u.id
      ORDER BY "efficiencyScore" ASC NULLS LAST
      LIMIT 10
    `);

    res.json({ 
      success: true, 
      data: result.rows.map(r => ({
        ...r,
        totalWaterValue: parseFloat(r.totalWaterValue || 0),
        totalElectricityValue: parseFloat(r.totalElectricityValue || 0),
        totalCost: parseFloat(r.totalCost || 0),
        efficiencyScore: parseFloat(r.efficiencyScore || 0)
      })) 
    });
  } catch (error) {
    next(error);
  }
};

const getMapStateStats = async (req, res, next) => {
  try {
    const ALL_INDIAN_STATES = [
      'Andaman and Nicobar Islands', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
      'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Goa', 'Gujarat', 
      'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Lakshadweep', 
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
      'Delhi', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Odisha', 'Andhra Pradesh', 
      'Jammu and Kashmir', 'Ladakh'
    ];

    const result = await query(
      'SELECT state, type, AVG(value) as "avgValue" FROM usage_data GROUP BY state, type'
    );

    const formattedData = {};
    const getRegion = (s) => {
      const north = ['Punjab','Haryana','Himachal Pradesh','Jammu and Kashmir','Ladakh','Rajasthan','Chandigarh','Delhi','Uttarakhand','Uttar Pradesh'];
      const south = ['Andhra Pradesh','Karnataka','Kerala','Tamil Nadu','Telangana','Lakshadweep','Daman and Diu'];
      const east  = ['Bihar','Jharkhand','Odisha','West Bengal','Andaman and Nicobar Islands'];
      const west  = ['Goa','Gujarat','Maharashtra','Dadra and Nagar Haveli'];
      const north_east    = ['Arunachal Pradesh','Assam','Manipur','Meghalaya','Mizoram','Nagaland','Sikkim','Tripura'];
      
      if (north.includes(s)) return 'North';
      if (south.includes(s)) return 'South';
      if (east.includes(s)) return 'East';
      if (west.includes(s)) return 'West';
      if (north_east.includes(s)) return 'NE';
      return 'Central';
    };

    ALL_INDIAN_STATES.forEach(state => {
      const baseWater = 80 + Math.random() * 100;
      formattedData[state] = { 
        water: parseFloat(baseWater.toFixed(1)), 
        electricity: parseFloat((2 + Math.random() * 6).toFixed(2)),
        pop: Math.floor(Math.random() * 50) + 1,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        region: getRegion(state),
        alerts: Math.floor(Math.random() * 15),
        renewable: Math.floor(Math.random() * 60) + 10,
        monthly: [70, 85, 90, 80, 95, 100, 80],
        yearly: [800, 850, 900, 950, 1000]
      };
    });

    result.rows.forEach(stat => {
      if (formattedData[stat.state]) {
        if (stat.type === 'water') formattedData[stat.state].water = parseFloat(parseFloat(stat.avgValue).toFixed(1));
        if (stat.type === 'electricity') formattedData[stat.state].electricity = parseFloat(parseFloat(stat.avgValue).toFixed(2));
      }
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};

const getCarbonFootprint = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    let startDate = new Date();
    startDate.setDate(1);

    const result = await query(
      'SELECT SUM(value) as "totalKwh" FROM usage_data WHERE user_id = $1 AND type = \'electricity\' AND timestamp >= $2',
      [req.user.id, startDate]
    );

    const totalKwh = parseFloat(result.rows[0]?.totalKwh || 0);
    const carbonKg = parseFloat((totalKwh * 0.42).toFixed(2));

    res.json({
      success: true,
      data: {
        totalKwh,
        carbonKg,
        carbonTons: parseFloat((carbonKg / 1000).toFixed(4)),
        treesNeeded: Math.ceil(carbonKg / 22),
        period
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Utility for alerts
 */
async function checkAndCreateAlert(user, type, value) {
  if (!user || !user.id) {
    console.error('❌ checkAndCreateAlert: Invalid user object', user);
    throw new Error('Invalid user object in checkAndCreateAlert');
  }

  const threshold = type === 'water' ? user.settings?.waterThreshold || 500 : user.settings?.electricityThreshold || 50;
  if (value <= threshold) return;

  const severity = value > threshold * 1.5 ? 'red' : 'yellow';
  const message = `${severity === 'red' ? '🚨' : '⚠️'} ${type} usage (${value}) exceeds your limit of ${threshold}`;

  const alertRes = await query(
    'INSERT INTO alerts (user_id, type, severity, message, threshold, actual_value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user.id, type, severity, message, threshold, value]
  );

  console.log(`📧 Creating alert for User ID: ${user.id}, Email: ${user.email}, Type: ${type}`);
  sendAlertEmail(user, alertRes.rows[0]).catch(e => console.error('Alert Email Error:', e));
}

const getTariffEstimate = async (req, res, next) => {
  try {
    const stateKey = (req.query.state || 'default').toLowerCase();
    const electricityUnits = Math.max(0, parseFloat(req.query.electricityUnits || 0));
    const waterLiters = Math.max(0, parseFloat(req.query.waterLiters || 0));

    // Try finding exact state from SQL, otherwise fallback to hardcoded
    const tariffRes = await query('SELECT * FROM tariffs WHERE state = $1', [stateKey]);
    let tariffs = INDIA_TARIFFS[stateKey] || INDIA_TARIFFS.default;
    
    if (tariffRes.rows.length > 0) {
      tariffs = {
        electricity: tariffRes.rows[0].electricity,
        water: tariffRes.rows[0].water
      };
    }
    const calculate = (val, slabs) => {
        let total = 0;
        let rem = val;
        let prev = 0;
        for (const s of slabs) {
            const size = s.upto === Infinity ? rem : s.upto - prev;
            const use = Math.min(rem, size);
            total += use * s.rate;
            rem -= use;
            prev = s.upto;
            if (rem <= 0) break;
        }
        return total;
    };

    const electricityCost = calculate(electricityUnits, tariffs.electricity);
    const waterCost = calculate(waterLiters, tariffs.water);

    res.json({
      success: true,
      data: {
        state: stateKey,
        electricity: {
          total: parseFloat(electricityCost.toFixed(2)),
          units: electricityUnits
        },
        water: {
          total: parseFloat(waterCost.toFixed(2)),
          liters: waterLiters
        },
        totalEstimatedBill: parseFloat((electricityCost + waterCost).toFixed(2)),
        currency: 'INR',
        source: tariffRes.rows.length > 0 ? 'Dynamic ML' : 'Official Data'
      }
    });
  } catch (error) { next(error); }
};


const getTariffTemplate = (req, res) => {
    res.json(INDIA_TARIFFS);
};

const uploadTariffs = async (req, res) => {
    try {
        const tariffUploadMap = req.body;
        let updatedCount = 0;

        for (const [stateKey, data] of Object.entries(tariffUploadMap)) {
            await query(
                'INSERT INTO tariffs (state, electricity, water, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (state) DO UPDATE SET electricity = $2, water = $3, updated_at = NOW()',
                [stateKey.toLowerCase(), JSON.stringify(data.electricity), JSON.stringify(data.water)]
            );
            updatedCount++;
        }
        res.json({ success: true, message: `Successfully updated ${updatedCount} state tariffs!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
  addUsage,
  getUsage,
  getDashboardStats,
  simulateIoT,
  getLeaderboard,
  getMapStateStats,
  getCarbonFootprint,
  getTariffEstimate,
  getTariffTemplate,
  uploadTariffs
};
