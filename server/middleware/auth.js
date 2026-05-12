/**
 * JWT Authentication Middleware (Supabase/Postgres version)
 */

const jwt = require('jsonwebtoken');
const { query } = require('../database/db');

/**
 * protect - Middleware that requires a valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized - no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user (SQL version)
    const result = await query('SELECT id, name, email, role, state, settings, avatar FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized - invalid token' });
  }
};

/**
 * adminOnly - Restricts access to admin users
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied - admin only' });
  }
};

module.exports = { protect, adminOnly };
