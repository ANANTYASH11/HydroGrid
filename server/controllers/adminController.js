/**
 * Admin Controller (Supabase/Postgres version)
 */

const { query } = require('../config/db');

const getStats = async (req, res) => {
  try {
    const userCount = await query('SELECT COUNT(*) FROM users');
    const recordCount = await query('SELECT COUNT(*) FROM usage_data');
    const alertCount = await query('SELECT COUNT(*) FROM alerts WHERE read = false');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await query('SELECT COUNT(DISTINCT user_id) FROM usage_data WHERE timestamp >= $1', [today]);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRecords = await query('SELECT COUNT(*) FROM usage_data WHERE timestamp >= $1', [weekAgo]);

    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      activeToday: parseInt(activeToday.rows[0].count),
      totalRecords: parseInt(recordCount.rows[0].count),
      recordsThisWeek: parseInt(weekRecords.rows[0].count),
      activeAlerts: parseInt(alertCount.rows[0].count),
      systemHealth: { database: 'connected', api: 'running' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await query('SELECT id as "_id", name, email, role, state, created_at as "createdAt" FROM users ORDER BY created_at DESC');
    
    const enrichedUsers = await Promise.all(users.rows.map(async (u) => {
        const count = await query('SELECT COUNT(*) FROM usage_data WHERE user_id = $1', [u._id]);
        return { ...u, recordCount: parseInt(count.rows[0].count) };
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOverview = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await query('SELECT COUNT(*) FROM users WHERE created_at >= $1', [thirtyDaysAgo]);
    const newRecords = await query('SELECT COUNT(*) FROM usage_data WHERE timestamp >= $1', [thirtyDaysAgo]);
    
    const avgRes = await query(`
        SELECT AVG(count) as avgCount FROM (
            SELECT COUNT(*) as count FROM usage_data GROUP BY user_id
        ) s
    `);

    res.json({
      lastMonth: {
        newUsers: parseInt(newUsers.rows[0].count),
        newRecords: parseInt(newRecords.rows[0].count),
        avgRecordsPerUser: parseFloat(avgRes.rows[0]?.avgcount || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const stats = await query('SELECT COUNT(*) as users, (SELECT COUNT(*) FROM usage_data) as records FROM users');
    res.json({
        stats: stats.rows[0],
        recentUsers: (await query('SELECT * FROM users ORDER BY created_at DESC LIMIT 5')).rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStats, getUsers, getOverview, getDashboard };
