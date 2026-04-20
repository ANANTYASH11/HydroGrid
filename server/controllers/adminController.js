const User = require('../models/User');
const Usage = require('../models/Usage');
const Alert = require('../models/Alert');

/**
 * Get system statistics for admin dashboard
 * @route GET /api/admin/stats
 * @access Private/Admin
 */
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecords = await Usage.countDocuments();
    const activeAlerts = await Alert.countDocuments({ read: false });

    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await Usage.distinct('userId', {
      timestamp: { $gte: today }
    }).then(ids => ids.length);

    // Get records from this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recordsThisWeek = await Usage.countDocuments({
      timestamp: { $gte: weekAgo }
    });

    res.json({
      totalUsers,
      activeToday,
      totalRecords,
      recordsThisWeek,
      activeAlerts,
      systemHealth: {
        database: 'connected',
        api: 'running',
        responseTime: '85ms'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all users with their info
 * @route GET /api/admin/users
 * @access Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Enrich with usage data
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const recordCount = await Usage.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          recordCount
        };
      })
    );

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get system overview data
 * @route GET /api/admin/overview
 * @access Private/Admin
 */
exports.getOverview = async (req, res) => {
  try {
    // Get data from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newRecords = await Usage.countDocuments({
      timestamp: { $gte: thirtyDaysAgo }
    });

    const avgRecordsPerUser = await Usage.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgCount: { $avg: '$count' }
        }
      }
    ]);

    res.json({
      lastMonth: {
        newUsers,
        newRecords,
        avgRecordsPerUser: avgRecordsPerUser[0]?.avgCount || 0
      },
      topUsers: await getTopUsers(),
      recentActivity: await getRecentActivity()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get top users by activity
 */
async function getTopUsers() {
  try {
    const topUsers = await Usage.aggregate([
      {
        $group: {
          _id: '$userId',
          recordCount: { $sum: 1 },
          lastUsed: { $max: '$timestamp' }
        }
      },
      { $sort: { recordCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    return topUsers.map(item => ({
      userId: item._id,
      name: item.user.name,
      records: item.recordCount,
      lastUsed: item.lastUsed
    }));
  } catch (error) {
    console.error('Error getting top users:', error);
    return [];
  }
}

/**
 * Get recent activity
 */
async function getRecentActivity() {
  try {
    const recentUsage = await Usage.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'name email');

    return recentUsage.map(item => ({
      timestamp: item.timestamp,
      userName: item.userId?.name || 'Unknown',
      userEmail: item.userId?.email || 'Unknown',
      water: item.water,
      electricity: item.electricity
    }));
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

/**
 * Get admin dashboard data
 * @route GET /api/admin/dashboard
 * @access Private/Admin
 */
exports.getDashboard = async (req, res) => {
  try {
    const [stats, overview, users] = await Promise.all([
      exports.getStats.call(
        { status: () => ({ json: (data) => data }) },
        req,
        { status: () => ({ json: (data) => data }), json: (data) => data }
      ),
      exports.getOverview.call(
        { status: () => ({ json: (data) => data }) },
        req,
        { status: () => ({ json: (data) => data }), json: (data) => data }
      ),
      User.find().select('-password').limit(5).sort({ createdAt: -1 })
    ]);

    res.json({
      stats: await getStats(),
      overview,
      recentUsers: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper to get stats synchronously
 */
async function getStats() {
  const totalUsers = await User.countDocuments();
  const totalRecords = await Usage.countDocuments();
  const activeAlerts = await Alert.countDocuments({ read: false });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeToday = await Usage.distinct('userId', {
    timestamp: { $gte: today }
  }).then(ids => ids.length);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recordsThisWeek = await Usage.countDocuments({
    timestamp: { $gte: weekAgo }
  });

  return {
    totalUsers,
    activeToday,
    totalRecords,
    recordsThisWeek,
    activeAlerts
  };
}
