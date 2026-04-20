/**
 * Usage Routes
 * POST /api/usage            - Add new reading
 * GET  /api/usage            - Get usage data (with filters)
 * GET  /api/usage/dashboard  - Dashboard aggregated stats
 * POST /api/usage/simulate   - Generate IoT simulation data
 * GET  /api/usage/leaderboard - Efficiency leaderboard
 * GET  /api/usage/carbon     - Carbon footprint estimation
 */

const express = require('express');
const router = express.Router();
const {
  addUsage,
  getUsage,
  getDashboardStats,
  simulateIoT,
  getLeaderboard,
  getCarbonFootprint,
} = require('../controllers/usageController');
const { protect } = require('../middleware/auth');

// All usage routes require authentication
router.use(protect);

router.post('/', addUsage);
router.get('/', getUsage);
router.get('/dashboard', getDashboardStats);
router.post('/simulate', simulateIoT);
router.get('/leaderboard', getLeaderboard);
router.get('/carbon', getCarbonFootprint);

module.exports = router;
