/**
 * Authentication Routes
 * POST /api/auth/register     - Create new account
 * POST /api/auth/login        - Login and get JWT
 * POST /api/auth/google       - Google OAuth authentication
 * GET  /api/auth/profile      - Get current user profile
 * PUT  /api/auth/profile      - Update user profile
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes (require valid JWT)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
