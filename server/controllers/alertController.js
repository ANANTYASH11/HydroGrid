/**
 * Alert Controller
 * Manages threshold-based alerts and notifications
 * Provides CRUD operations and threshold checking
 */

const Alert = require('../models/Alert');

/**
 * GET /api/alerts
 * Retrieve alerts for the authenticated user
 * Query params: severity, type, read (true/false), limit
 */
const getAlerts = async (req, res, next) => {
  try {
    const { severity, type, read, limit = 50 } = req.query;

    // Build filter query
    const filter = { userId: req.user._id };
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    if (read !== undefined) filter.read = read === 'true';

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Get unread count for the notification badge
    const unreadCount = await Alert.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      count: alerts.length,
      unreadCount,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/alerts/:id/read
 * Mark a specific alert as read
 */
const markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/alerts/read-all
 * Mark all alerts as read for the authenticated user
 */
const markAllRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All alerts marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/alerts/:id
 * Delete a specific alert
 */
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, markRead, markAllRead, deleteAlert };
