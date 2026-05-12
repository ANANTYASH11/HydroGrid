const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { protect } = require('../middleware/auth');
const { getGroqAI } = require('../utils/groqAI');

// Simple Memory Cache to save tokens and reduce latency
const aiMemoryCache = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

const getCachedResponse = (req, endpoint) => {
  const cacheKey = `${req.user.id}_${endpoint}`; // Use id instead of _id for SQL compatibility
  const cached = aiMemoryCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (req, endpoint, data) => {
  const cacheKey = `${req.user.id}_${endpoint}`;
  aiMemoryCache[cacheKey] = { timestamp: Date.now(), data };
};

// All AI endpoints demand auth to identify the user
router.use(protect);

// Helper to get last 30 days of user usage data aggregated by day and type
async function getUserUsageContext(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await query(`
    SELECT 
      date_trunc('day', timestamp) as date,
      type,
      SUM(value) as value
    FROM usage_data
    WHERE user_id = $1 AND timestamp >= $2
    GROUP BY date, type
    ORDER BY date ASC
  `, [userId, startDate]);
  
  const daysMap = {};
  result.rows.forEach(u => {
    const d = u.date.toISOString().split('T')[0];
    if (!daysMap[d]) daysMap[d] = { date: d, water: 0, electricity: 0 };
    if (u.type === 'water') daysMap[d].water += parseFloat(u.value);
    else daysMap[d].electricity += parseFloat(u.value);
  });
  return Object.values(daysMap);
}

/**
 * @route   GET /api/ai/detect-anomalies
 */
router.get('/detect-anomalies', async (req, res) => {
  try {
    const cached = getCachedResponse(req, 'anomalies');
    if (cached) return res.json(cached);

    const usageContext = await getUserUsageContext(req.user.id, 30);
    const groq = getGroqAI();
    
    if (!groq.enabled || usageContext.length < 5) return res.json({ success: true, anomalies: [] });

    const prompt = `Analyze this 30-day daily water (Liters) and electricity (kWh) usage data for anomalies (unusual spikes or drops). Keep it realistic to a household.\nData: ${JSON.stringify(usageContext)}`;
    const schema = `{
      "anomalies": [
        {
          "date": "YYYY-MM-DD",
          "actualValue": 120,
          "expectedValue": 55,
          "deviation": 118,
          "reason": "Short text explaining likely cause (e.g., 'Likely AC left running')",
          "severity": "HIGH or MEDIUM"
        }
      ]
    }`;

    const parsedData = await groq.generateJSONResponse(prompt, schema);
    const anomalies = (parsedData.anomalies || []).map(a => ({
      ...a,
      actualValue: parseFloat(a.actualValue || 0),
      expectedValue: parseFloat(a.expectedValue || 0),
      deviation: parseFloat(a.deviation || 0)
    }));
    const responseData = { success: true, anomalies };
    setCachedResponse(req, 'anomalies', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, message: 'AI error' });
  }
});

/**
 * @route   GET /api/ai/predict-next-30-days
 */
router.get('/predict-next-30-days', async (req, res) => {
  try {
    const cached = getCachedResponse(req, 'forecast');
    if (cached) return res.json(cached);

    const usageContext = await getUserUsageContext(req.user.id, 30);
    const groq = getGroqAI();
    if (!groq.enabled || usageContext.length < 5) return res.json({ success: true, forecast: [] });

    const prompt = `Based on the latest 30 days of water and electricity usage, forecast the exact usage for the NEXT 30 consecutive days sequentially. Do not skip days. Notice any weekly/weekend patterns and apply them to the forecast.\nData: ${JSON.stringify(usageContext)}`;
    const schema = `{
      "forecast": [
        {
          "date": "YYYY-MM-DD",
          "predictedWater": 140.5,
          "waterLower": 130.0,
          "waterUpper": 150.0,
          "predictedElectricity": 12.5,
          "electricityLower": 11.0,
          "electricityUpper": 14.0,
          "confidence": 0.85
        }
      ]
    }`;

    const parsedData = await groq.generateJSONResponse(prompt, schema);
    const forecast = (parsedData.forecast || []).map(f => ({
      ...f,
      predictedWater: parseFloat(f.predictedWater || 0),
      waterLower: parseFloat(f.waterLower || 0),
      waterUpper: parseFloat(f.waterUpper || 0),
      predictedElectricity: parseFloat(f.predictedElectricity || 0),
      electricityLower: parseFloat(f.electricityLower || 0),
      electricityUpper: parseFloat(f.electricityUpper || 0),
      confidence: parseFloat(f.confidence || 0)
    }));
    const responseData = { success: true, forecast };
    setCachedResponse(req, 'forecast', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, message: 'AI error' });
  }
});

/**
 * @route   GET /api/ai/recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const cached = getCachedResponse(req, 'recommendations');
    if (cached) return res.json(cached);

    const usageContext = await getUserUsageContext(req.user.id, 30);
    const groq = getGroqAI();
    if (!groq.enabled || usageContext.length < 5) return res.json({ success: true, recommendations: [] });

    const prompt = `Look at these household usage values. Recommend 4 specific, actionable strategies tailored to their unique pattern (e.g. if electricity is high, focus on AC/lights. If water is high, leaks/laundry). Return INR estimates.\nData: ${JSON.stringify(usageContext)}`;
    const schema = `{
      "recommendations": [
        {
          "title": "Short Emoji Title (e.g. 🧊 Fix Fridge)",
          "description": "1 sentence explanation.",
          "estimatedSavings": "₹200-300/month",
          "priority": "HIGH, MEDIUM, or LOW"
        }
      ]
    }`;

    const parsedData = await groq.generateJSONResponse(prompt, schema);
    const responseData = { success: true, recommendations: parsedData.recommendations || [] };
    setCachedResponse(req, 'recommendations', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, message: 'AI error' });
  }
});

/**
 * @route   GET /api/ai/device-breakdown
 */
router.get('/device-breakdown', async (req, res) => {
  try {
    const cached = getCachedResponse(req, 'breakdown');
    if (cached) return res.json(cached);

    const usageContext = await getUserUsageContext(req.user.id, 30);
    const groq = getGroqAI();
    if (!groq.enabled || usageContext.length < 5) return res.json({ success: true, devices: [] });

    const prompt = `Based on total historical electricity usage, guess the proportional breakdown by appliances out of 100%. Total cost should approximate ₹8 per total kWh used.\nData: ${JSON.stringify(usageContext)}`;
    const schema = `{
      "devices": [
        {
          "name": "Air Conditioning",
          "usage": 45,
          "cost": "₹3500",
          "trend": "UP, DOWN, or STABLE"
        }
      ]
    }`;

    const parsedData = await groq.generateJSONResponse(prompt, schema);
    const responseData = { success: true, devices: parsedData.devices || [] };
    setCachedResponse(req, 'breakdown', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, message: 'AI error' });
  }
});

/**
 * @route   GET /api/ai/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const cached = getCachedResponse(req, 'analytics');
    if (cached) return res.json(cached);

    const usageContext = await getUserUsageContext(req.user.id, 30);
    const groq = getGroqAI();
    if (!groq.enabled || usageContext.length < 5) return res.json({ success: true, analytics: {} });

    const prompt = `Analyze this dataset to compute overall analytics. Calculate sum, averages, and infer the likely daily peak hour block based on typical Indian usage profiles.\nData: ${JSON.stringify(usageContext)}`;
    const schema = `{
      "analytics": {
        "totalUsage": 2500,
        "avgDaily": 83.3,
        "peakHourElectricity": "6 PM - 10 PM",
        "costPerUnit": 8.5,
        "estimatedBill": 21500,
        "trend": "IMPROVING or DECLINING",
        "trendPercent": -12.4,
        "efficiency": "EXCELLENT, GOOD, POOR"
      }
    }`;

    const parsedData = await groq.generateJSONResponse(prompt, schema);
    const a = parsedData.analytics || {};
    const analytics = {
      ...a,
      totalUsage: parseFloat(a.totalUsage || 0),
      avgDaily: parseFloat(a.avgDaily || 0),
      costPerUnit: parseFloat(a.costPerUnit || 0),
      estimatedBill: parseFloat(a.estimatedBill || 0),
      trendPercent: parseFloat(a.trendPercent || 0)
    };
    const responseData = { success: true, analytics };
    setCachedResponse(req, 'analytics', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, message: 'AI error' });
  }
});

module.exports = router;
