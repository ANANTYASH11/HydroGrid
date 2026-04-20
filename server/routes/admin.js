const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * Admin Routes
 * All routes require authentication and admin role
 */

// Protect all admin routes
router.use(protect, adminOnly);

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', adminController.getStats);

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', adminController.getUsers);

/**
 * GET /api/admin/overview
 * Get system overview
 */
router.get('/overview', adminController.getOverview);

/**
 * GET /api/admin/dashboard
 * Get complete admin dashboard data
 */
router.get('/dashboard', adminController.getDashboard);

module.exports = router;
