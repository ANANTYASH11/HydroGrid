/**
 * Authentication Controller (Supabase/Postgres version)
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const { sendWelcomeEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, state = 'Unknown' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password, state) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email.toLowerCase(), hashedPassword, state]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    sendWelcomeEmail(user).catch(e => console.error('Email Error:', e));

    return res.status(201).json({
      success: true,
      data: {
        _id: user.id, // Keep _id for frontend compatibility
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        settings: user.settings,
        badges: user.badges,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        avatar: user.avatar,
        settings: user.settings,
        badges: user.badges
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, settings } = req.body;
    
    const currentUserRes = await query('SELECT settings FROM users WHERE id = $1', [req.user.id]);
    const currentSettings = currentUserRes.rows[0].settings || {};
    const newSettings = settings ? { ...currentSettings, ...settings } : currentSettings;

    const result = await query(
      'UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), settings = $3 WHERE id = $4 RETURNING *',
      [name, avatar, JSON.stringify(newSettings), req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token, state = 'Unknown' } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name, picture } = ticket.getPayload();

    let result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    let user = result.rows[0];

    if (user) {
      const update = await query(
        'UPDATE users SET avatar = $1, state = CASE WHEN $2 != \'Unknown\' THEN $2 ELSE state END WHERE id = $3 RETURNING *',
        [picture, state, user.id]
      );
      user = update.rows[0];
    } else {
      const newUser = await query(
        'INSERT INTO users (name, email, password, avatar, state, badges) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email.toLowerCase(), 'google_auth_' + Date.now(), picture, state, JSON.stringify([{
          name: 'Google Pioneer',
          icon: '🔐',
          description: 'Signed up with Google OAuth',
          earnedAt: new Date()
        }])]
      );
      user = newUser.rows[0];
    }

    const token_jwt = generateToken(user.id);
    res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        avatar: user.avatar,
        settings: user.settings,
        badges: user.badges
      },
      token: token_jwt
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, googleAuth };
