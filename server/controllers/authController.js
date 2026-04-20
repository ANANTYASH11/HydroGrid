/**
 * Authentication Controller
 * Handles user registration, login, profile retrieval, and profile updates
 * Uses JWT tokens for stateless authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a JWT token for the given user ID
 * Token expires in 30 days
 * @param {string} id - User's MongoDB ObjectId
 * @returns {string} - Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * POST /api/auth/register
 * Register a new user account
 * Creates user, hashes password (via model middleware), returns JWT
 */
const register = async (req, res, next) => {
  try {
    console.log('📝 Register request received:', { email: req.body.email, name: req.body.name });
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists in database
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create the new user (password is hashed automatically by the model middleware)
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    console.log('✅ User registered successfully:', { email, userId: user._id });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings,
        badges: user.badges,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT token
 * Validates email/password combination
 */
const login = async (req, res, next) => {
  try {
    console.log('🔑 Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email and include the password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare provided password with stored hash
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    console.log('✅ User logged in successfully:', { email, userId: user._id });

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings,
        badges: user.badges,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

/**
 * GET /api/auth/profile
 * Get the currently authenticated user's profile
 * Requires valid JWT token (handled by protect middleware)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile and settings
 * Only allows updating specific fields (not password or role directly)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, settings } = req.body;
    const updateData = {};

    // Only update fields that were provided
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = { ...req.user.settings, ...settings };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
