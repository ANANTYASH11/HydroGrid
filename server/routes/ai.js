/**
 * AI Routes - Anomaly Detection, Forecasting, Recommendations, NLP
 * Endpoints for machine learning features
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Usage = require('../models/Usage');
const {
  detectAnomalies,
  forecastUsage,
  generateRecommendations,
  estimateDeviceBreakdown,
  calculateAdvancedAnalytics
} = require('../utils/aiEngine');
const { getGroqAI } = require('../utils/groqAI');

/**
 * @route   GET /api/ai/detect-anomalies
 * @desc    Detect anomalies in usage data
 * @access  Private
 * @query   days - number of days to analyze (default 30)
 * @query   threshold - z-score threshold (default 2.5)
 */
router.get('/detect-anomalies', auth, async (req, res) => {
  try {
    const { days = 30, threshold = 2.5 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const usageData = await Usage.find({
      userId: req.user.id,
      timestamp: { $gte: daysAgo }
    })
      .sort({ timestamp: 1 })
      .lean();

    if (!usageData.length) {
      return res.status(200).json({
        success: true,
        anomalies: [],
        message: 'No anomalies detected (insufficient data)'
      });
    }

    const usageArray = usageData.map(d => ({
      date: d.timestamp,
      value: d.waterUsage + d.electricityUsage
    }));

    const anomalies = detectAnomalies(usageArray, parseFloat(threshold));

    res.json({
      success: true,
      anomalies,
      count: anomalies.length,
      timeframe: `${days} days`,
      analysisDate: new Date().toISOString()
    });
  } catch (err) {
    console.error('Anomaly detection error:', err);
    res.status(500).json({
      success: false,
      message: 'Error detecting anomalies',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/ai/predict-next-30-days
 * @desc    Forecast usage for next 30 days
 * @access  Private
 */
router.get('/predict-next-30-days', auth, async (req, res) => {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 60);

    const usageData = await Usage.find({
      userId: req.user.id,
      timestamp: { $gte: daysAgo }
    })
      .sort({ timestamp: 1 })
      .lean();

    if (usageData.length < 7) {
      return res.status(200).json({
        success: true,
        forecast: [],
        message: 'Insufficient historical data for accurate forecast'
      });
    }

    const usageArray = usageData.map(d => ({
      date: d.timestamp,
      value: d.waterUsage + d.electricityUsage
    }));

    const forecast = forecastUsage(usageArray, 30);

    res.json({
      success: true,
      forecast,
      averagePredicted: Math.round(forecast.reduce((a, b) => a + b.predicted, 0) / forecast.length),
      confidence: 0.85,
      method: 'Exponential Smoothing with Seasonal Adjustment'
    });
  } catch (err) {
    console.error('Forecast error:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating forecast',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get personalized energy saving recommendations
 * @access  Private
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 60);

    const usageData = await Usage.find({
      userId: req.user.id,
      timestamp: { $gte: daysAgo }
    })
      .sort({ timestamp: 1 })
      .lean();

    if (!usageData.length) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: 'Insufficient data for recommendations'
      });
    }

    const usageArray = usageData.map(d => ({
      date: d.timestamp,
      value: d.waterUsage + d.electricityUsage
    }));

    const recommendations = generateRecommendations(usageArray);

    res.json({
      success: true,
      recommendations,
      totalPotentialSavings: recommendations.reduce((a, b) => a + b.potentialSavings, 0),
      count: recommendations.length
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/ai/device-breakdown
 * @desc    Estimate device-level usage breakdown
 * @access  Private
 */
router.get('/device-breakdown', auth, async (req, res) => {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);

    const usageData = await Usage.find({
      userId: req.user.id,
      timestamp: { $gte: daysAgo }
    })
      .lean();

    const totalUsage = usageData.reduce((a, b) => a + b.electricityUsage, 0);
    const breakdown = estimateDeviceBreakdown(totalUsage);

    res.json({
      success: true,
      devices: breakdown,
      totalUsage,
      note: 'Breakdown is estimated based on typical appliance consumption patterns'
    });
  } catch (err) {
    console.error('Device breakdown error:', err);
    res.status(500).json({
      success: false,
      message: 'Error calculating device breakdown',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/ai/analytics
 * @desc    Get advanced analytics and insights
 * @access  Private
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const usageData = await Usage.find({
      userId: req.user.id,
      timestamp: { $gte: daysAgo }
    })
      .sort({ timestamp: 1 })
      .lean();

    if (!usageData.length) {
      return res.status(200).json({
        success: true,
        analytics: null,
        message: 'No data available for analysis'
      });
    }

    const usageArray = usageData.map(d => ({
      date: d.timestamp,
      value: d.waterUsage + d.electricityUsage
    }));

    const analytics = calculateAdvancedAnalytics(usageArray);

    res.json({
      success: true,
      analytics,
      period: `${days} days`,
      dataPoints: usageData.length
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      message: 'Error calculating analytics',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/ai/query
 * @desc    Natural language query using Groq AI (requires GROQ_API_KEY)
 * @access  Private
 * @body    { question: "Why is my bill higher?" }
 */
router.post('/query', auth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const groq = getGroqAI();

    // Check if Groq API key is configured
    if (!groq.enabled) {
      return res.status(503).json({
        success: false,
        message: 'AI Chat feature not yet configured',
        setupInstructions: {
          step1: 'Get API key from https://console.groq.com',
          step2: 'Add GROQ_API_KEY to .env file',
          step3: 'Restart the server',
          estimated_wait: '2-3 minutes'
        }
      });
    }

    // Gather context about user's usage
    const recentUsage = await Usage.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    const avgUsage = recentUsage.length > 0
      ? recentUsage.reduce((a, b) => a + b.electricityUsage, 0) / recentUsage.length
      : 0;

    // Process query with Groq
    const response = await groq.processQuery(question, {
      currentUsage: recentUsage[0]?.electricityUsage || 0,
      averageUsage: Math.round(avgUsage),
      dataPoints: recentUsage.length
    });

    res.json({
      success: true,
      answer: response,
      question,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({
      success: false,
      message: 'Error processing query',
      error: err.message
    });
  }
});

module.exports = router;
