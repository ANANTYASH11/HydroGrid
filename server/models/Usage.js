/**
 * Usage Model - Stores water and electricity consumption readings
 * Each document represents a single meter reading or IoT data point
 * Supports both manual entry and simulated IoT data
 */

const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  // Reference to the user who owns this usage data
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for fast lookups by user
  },
  // Type of resource being measured
  type: {
    type: String,
    enum: ['water', 'electricity'],
    required: [true, 'Usage type is required'],
  },
  // The consumption value
  value: {
    type: Number,
    required: [true, 'Usage value is required'],
    min: [0, 'Value cannot be negative'],
  },
  // Unit of measurement (liters for water, kWh for electricity)
  unit: {
    type: String,
    default: function() {
      return this.type === 'water' ? 'liters' : 'kWh';
    },
  },
  // Estimated cost for this usage (calculated based on rates)
  cost: {
    type: Number,
    default: 0,
  },
  // How the data was collected
  source: {
    type: String,
    enum: ['manual', 'iot'],
    default: 'manual',
  },
  // When the reading was taken
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // Index for date-range queries
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Compound index for efficient queries: find user's usage by type and date
usageSchema.index({ userId: 1, type: 1, timestamp: -1 });

/**
 * Pre-save middleware: Automatically calculate cost based on usage
 * Indian rates: ₹0.05 per liter (water) | ₹8 per kWh (electricity)
 */
usageSchema.pre('save', function(next) {
  if (this.type === 'water') {
    this.cost = parseFloat((this.value * 0.05).toFixed(2));   // ₹0.05/liter
  } else {
    this.cost = parseFloat((this.value * 8).toFixed(2));      // ₹8/kWh
  }
  next();
});

module.exports = mongoose.model('Usage', usageSchema);
