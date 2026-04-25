/**
 * Alert Model - Stores threshold-based alerts and notifications
 * Alerts are generated when usage exceeds defined thresholds
 * Color-coded by severity: green (info), yellow (warning), red (critical)
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Reference to the user this alert belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Type of resource the alert is about
  type: {
    type: String,
    enum: ['water', 'electricity', 'system', 'prediction', 'anomaly'],
    required: true,
  },
  // Severity level determines the color coding in the UI
  severity: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    required: true,
  },
  // Human-readable alert message
  message: {
    type: String,
    required: true,
  },
  // The threshold that was exceeded
  threshold: {
    type: Number,
  },
  // The actual value that triggered the alert
  actualValue: {
    type: Number,
  },
  // Whether the user has seen/acknowledged this alert
  read: {
    type: Boolean,
    default: false,
  },
  // When the alert was generated
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for fetching unread alerts efficiently
alertSchema.index({ userId: 1, read: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);
