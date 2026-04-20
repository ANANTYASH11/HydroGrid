/**
 * Report Routes
 * GET /api/reports              - Generate report data
 * GET /api/reports/download/csv - Download as CSV
 * GET /api/reports/download/pdf - Download as PDF
 */

const express = require('express');
const router = express.Router();
const { generateReport, downloadCSV, downloadPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All report routes require authentication
router.use(protect);

router.get('/', generateReport);
router.get('/download/csv', downloadCSV);
router.get('/download/pdf', downloadPDF);

module.exports = router;
