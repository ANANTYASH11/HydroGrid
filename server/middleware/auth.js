/**
 * JWT Authentication Middleware
 * Verifies the JWT token from the Authorization header
 * Attaches the decoded user data to req.user for downstream use
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Middleware that requires a valid JWT token
 * Usage: router.get('/protected', protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
      });
    }

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token',
    });
  }
};

/**
 * adminOnly - Middleware that restricts access to admin users
 * Must be used AFTER the protect middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied - admin only',
    });
  }
};

module.exports = { protect, adminOnly };
