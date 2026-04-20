/**
 * Alert Routes
 * GET    /api/alerts          - Get user's alerts
 * PUT    /api/alerts/read-all - Mark all alerts as read
 * PUT    /api/alerts/:id/read - Mark specific alert as read
 * DELETE /api/alerts/:id      - Delete an alert
 */

const express = require('express');
const router = express.Router();
const { getAlerts, markRead, markAllRead, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

// All alert routes require authentication
router.use(protect);

router.get('/', getAlerts);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteAlert);

module.exports = router;
