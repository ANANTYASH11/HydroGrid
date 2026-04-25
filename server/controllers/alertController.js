/**
 * Alert Controller (Supabase/Postgres version)
 */

const { query } = require('../config/db');

const getAlerts = async (req, res, next) => {
  try {
    const { severity, type, read, limit = 50 } = req.query;
    let sql = 'SELECT * FROM alerts WHERE user_id = $1';
    let params = [req.user.id];
    let count = 2;

    if (severity) { sql += ` AND severity = $${count++}`; params.push(severity); }
    if (type) { sql += ` AND type = $${count++}`; params.push(type); }
    if (read !== undefined) { sql += ` AND read = $${count++}`; params.push(read === 'true'); }

    sql += ` ORDER BY timestamp DESC LIMIT $${count}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);
    const unreadRes = await query('SELECT COUNT(*) FROM alerts WHERE user_id = $1 AND read = false', [req.user.id]);

    res.json({
      success: true,
      count: result.rows.length,
      unreadCount: parseInt(unreadRes.rows[0].count),
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE alerts SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await query('UPDATE alerts SET read = true WHERE user_id = $1 AND read = false', [req.user.id]);
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, markRead, markAllRead, deleteAlert };
