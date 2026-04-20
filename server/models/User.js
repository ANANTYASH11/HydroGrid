/**
 * User Model - Defines the schema for user accounts
 * Handles authentication data, profile info, and gamification (badges)
 * Passwords are hashed using bcrypt before saving
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // User's display name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  // Email used for login - must be unique
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  // Hashed password (never stored in plain text)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  // Role-based access control: 'user' or 'admin'
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Profile avatar URL
  avatar: {
    type: String,
    default: '',
  },
  // Gamification badges earned by the user
  badges: [{
    name: String,        // Badge title (e.g., "Water Saver")
    icon: String,        // Icon identifier
    earnedAt: {          // When the badge was earned
      type: Date,
      default: Date.now,
    },
    description: String, // How the badge was earned
  }],
  // User preferences and settings
  settings: {
    // Alert threshold for water usage (liters per day)
    waterThreshold: { type: Number, default: 500 },
    // Alert threshold for electricity usage (kWh per day)
    electricityThreshold: { type: Number, default: 50 },
    // Whether to receive notifications
    notifications: { type: Boolean, default: true },
    // Preferred theme
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  },
}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true,
});

/**
 * Pre-save middleware: Hash password before saving to database
 * Only runs if the password field has been modified
 */
userSchema.pre('save', async function(next) {
  // Skip hashing if password hasn't changed
  if (!this.isModified('password')) return next();
  
  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: Compare provided password with stored hash
 * Used during login authentication
 * @param {string} candidatePassword - The password to verify
 * @returns {boolean} - Whether the password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
