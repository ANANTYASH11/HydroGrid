/**
 * ML Training Routes
 * POST /api/ml/train             - Train ML models on aggregated data
 * GET  /api/ml/training-data     - Get training data for analysis
 * GET  /api/ml/states-analysis   - Analyze data across all states
 * GET  /api/ml/insights/:state   - Get AI insights for specific state
 * POST /api/ml/send-prediction-alerts - Send prediction-based alerts to users
 */

const express = require('express');
const router = express.Router();
const { getTrainingData, trainModel, getStatesAnalysis, getStateInsights, sendPredictionAlerts } = require('../controllers/mlController');
const { protect } = require('../middleware/auth');

// Public routes (for admin/analytics dashboard)
router.get('/training-data', getTrainingData);
router.post('/train', trainModel);
router.get('/states-analysis', getStatesAnalysis);
router.get('/insights/:state', getStateInsights);
router.post('/send-prediction-alerts', protect, sendPredictionAlerts);

module.exports = router;
