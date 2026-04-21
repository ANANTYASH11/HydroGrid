# AI Features Implementation Guide

## ✅ Completed AI Features

### 1. **Anomaly Detection** ✨
**Endpoint**: `GET /api/ai/detect-anomalies?days=30&threshold=2.5`

Detects unusual usage patterns using Z-score statistical method.

**Response**:
```json
{
  "success": true,
  "anomalies": [
    {
      "date": "2026-04-15T10:00:00Z",
      "value": 250,
      "severity": 3.2,
      "expected": 100,
      "deviation": 150,
      "reason": "SPIKE"
    }
  ],
  "count": 5
}
```

**Use Cases**:
- Detect water leaks (sudden increases)
- Identify equipment failures
- Spot unusual consumption spikes
- Prevent waste

---

### 2. **Predictive Forecasting** 📊
**Endpoint**: `GET /api/ai/predict-next-30-days`

Forecasts usage for the next 30 days using exponential smoothing + seasonal adjustment.

**Response**:
```json
{
  "success": true,
  "forecast": [
    {
      "date": "2026-04-22T00:00:00Z",
      "predicted": 120,
      "lower": 108,
      "upper": 132,
      "confidence": 0.85
    }
  ],
  "averagePredicted": 125
}
```

**Benefits**:
- Budget planning
- Anticipate peak usage
- Plan maintenance
- Identify seasonal patterns

---

### 3. **Smart Recommendations** 💡
**Endpoint**: `GET /api/ai/recommendations`

Analyzes usage patterns and provides personalized energy-saving recommendations.

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "shift_to_offpeak",
      "title": "Shift Usage to Off-Peak Hours",
      "description": "Move laundry from 9:00 to 22:00 for 15% savings",
      "potentialSavings": 15,
      "priority": "HIGH"
    },
    {
      "id": "optimize_appliances",
      "title": "Optimize High-Usage Appliances",
      "description": "Your AC uses 40% more than neighbors",
      "potentialSavings": 35,
      "priority": "MEDIUM"
    }
  ],
  "totalPotentialSavings": 50
}
```

**Recommendations Include**:
- Peak hour shifting
- Appliance optimization
- Usage stabilization
- Weekend reduction tips
- Comparative benchmarking

---

### 4. **Device Breakdown** ⚡
**Endpoint**: `GET /api/ai/device-breakdown`

Estimates energy consumption by device type using appliance signatures.

**Response**:
```json
{
  "success": true,
  "devices": [
    {
      "device": "AC",
      "usage": 420,
      "percentage": 35,
      "icon": "❄️",
      "color": "#00BCD4"
    },
    {
      "device": "Refrigerator",
      "usage": 180,
      "percentage": 15,
      "icon": "🧊",
      "color": "#00ACC1"
    }
  ],
  "totalUsage": 1200
}
```

**Device Categories**:
- AC/Heating (35%)
- Refrigerator (15%)
- Water Heater (12%)
- Lighting (10%)
- Cooking (8%)
- Electronics (10%)
- Washing Machine (6%)
- Other (4%)

---

### 5. **Advanced Analytics** 📈
**Endpoint**: `GET /api/ai/analytics?days=30`

Comprehensive statistical analysis with trends, patterns, and insights.

**Response**:
```json
{
  "success": true,
  "analytics": {
    "overall": {
      "mean": 125,
      "std": 35,
      "median": 120,
      "min": 45,
      "max": 280
    },
    "trend": {
      "direction": "UP",
      "percentage": 15,
      "lastWeekAvg": 135,
      "previousWeekAvg": 117
    },
    "dailyBreakdown": [...],
    "hourlyPattern": [...]
  }
}
```

**Insights**:
- Daily/hourly patterns
- Weekly trends
- Seasonal analysis
- Peak demand identification

---

### 6. **Groq NLP Integration** 🤖
**Endpoint**: `POST /api/ai/query`
**Requires**: `GROQ_API_KEY` environment variable

Ask questions in natural language about your energy usage.

**Request**:
```json
{
  "question": "Why is my bill higher this month?"
}
```

**Response**:
```json
{
  "success": true,
  "answer": "Your usage increased 20% due to higher AC usage in April (warmer weather). I recommend using the AC 2 hours less per day, which could save you ~15% on this month's bill.",
  "question": "Why is my bill higher this month?",
  "timestamp": "2026-04-21T..."
}
```

**Capabilities**:
- Explain usage patterns
- Provide recommendations
- Answer questions naturally
- Analyze reports
- Compare benchmarks

---

## 🔧 Frontend AI Components

### AIInsights Component
**Location**: `client/src/components/AIInsights.jsx`

Displays all AI insights with tabbed interface:
- Anomalies tab
- Forecast tab  
- Recommendations tab
- Device breakdown tab
- Analytics tab

### AI Dashboard Page
**Location**: `client/src/pages/AIPage.jsx`
**Route**: `/ai`

Full-page AI interface with:
- All insights in one place
- Real-time refresh capability
- Info cards explaining features
- Coming soon section

---

## 📊 API Endpoints Summary

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/ai/detect-anomalies` | GET | Detect unusual patterns | ✅ |
| `/api/ai/predict-next-30-days` | GET | Forecast future usage | ✅ |
| `/api/ai/recommendations` | GET | Get energy-saving tips | ✅ |
| `/api/ai/device-breakdown` | GET | Estimate device usage | ✅ |
| `/api/ai/analytics` | GET | Advanced statistics | ✅ |
| `/api/ai/query` | POST | Natural language Q&A | ✅ |

---

## 🚀 Setup Instructions

### Local Development

```bash
# 1. Install dependencies
cd server
npm install

# 2. Setup Groq API (Optional - for NLP)
# Get key from https://console.groq.com
echo "GROQ_API_KEY=your_key_here" >> .env

# 3. Start server
npm start

# 4. Server will log:
# ✅ Groq AI initialized successfully
# OR
# ⚠️  Groq API key not configured. NLP features disabled.
```

### Production Deployment (Render)

```bash
# 1. Add to Render Environment Variables
GROQ_API_KEY=your_production_key

# 2. Deploy
git push origin main  # Auto-deploys on Render

# 3. Verify
curl https://your-app.onrender.com/api/ai/detect-anomalies
```

---

## 🔑 Groq API Setup

### Get Your Free API Key

1. Visit https://console.groq.com/login
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy the key
6. Add to `.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```
7. Restart server

### Free Tier Limits
- **Requests**: 14,000/day (unlimited for reasonable use)
- **Models**: Mixtral 8x7B, Llama 2, Gemma
- **Cost**: Free with rate limiting

---

## 🧪 Testing AI Features

### Using cURL

```bash
# Get anomalies (last 30 days)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/ai/detect-anomalies

# Get 30-day forecast
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/ai/predict-next-30-days

# Get recommendations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/ai/recommendations

# Ask a question (requires GROQ_API_KEY)
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "How can I save energy?"}' \
  https://api.example.com/api/ai/query
```

### Using Frontend

1. Navigate to `/ai` page
2. Click on tabs to view different insights
3. Click "Refresh Insights" to update
4. (When Groq is configured) Ask questions in chat

---

## 🔮 Advanced Features

### How Anomaly Detection Works

Uses Z-score method:
1. Calculate mean and standard deviation of usage
2. For each data point, calculate: `(value - mean) / std`
3. Flag values where `|z-score| > threshold` (default: 2.5)
4. Return anomalies with severity scores

```javascript
// Example
mean = 100, std = 20, threshold = 2.5
value = 160
z-score = (160 - 100) / 20 = 3.0 ✅ ANOMALY DETECTED
```

### How Forecasting Works

Uses Exponential Smoothing + Seasonal Adjustment:
1. Fit exponential smoothing to historical data
2. Extract 7-day seasonal pattern (weekday habits)
3. For each future day, use day-of-week average
4. Add confidence intervals (±10%)

```javascript
// Forecast next Monday based on:
// - Overall trend from exponential smoothing
// - Historical Monday average
// - Confidence range
```

### How Recommendations Work

Analyzes multiple patterns:
1. **Peak hour detection** - Find high vs low hours
2. **Usage level** - Compare to benchmarks
3. **Stability** - High variance indicates opportunity
4. **Day patterns** - Weekday vs weekend differences
5. **Seasonal** - Time of year effects

Then assigns priority based on savings potential.

---

## 📈 Scaling AI Features

### For High Volume

```javascript
// Current: Real-time analysis
// Recommended upgrades:

// 1. Add caching
const cache = new Map();
if (cache.has(userId)) {
  return cache.get(userId); // 1 sec old = acceptable
}

// 2. Pre-compute batch analysis
cron.schedule('0 * * * *', async () => {
  // Run anomaly detection for all users hourly
  // Store results in database
  // API just returns cached results
});

// 3. Add data warehouse (ClickHouse, BigQuery)
// For historical analysis and complex queries
```

### For Real-Time Features

Coming soon:
- WebSocket live updates
- Real-time anomaly alerts
- Streaming predictions
- Live device monitoring

---

## 🛠️ Troubleshooting

### Groq Integration Not Working

```
Problem: "AI Chat feature not yet configured"

Solutions:
1. Check .env has GROQ_API_KEY=...
2. Restart server: npm start
3. Check server logs for initialization message
4. Verify API key is valid at https://console.groq.com
5. Check rate limits haven't been exceeded
```

### Insufficient Data for Analysis

```
Problem: "Insufficient historical data for accurate forecast"

Solutions:
1. Wait for more usage data (min 7 days for forecast)
2. Start with 30+ days for better accuracy
3. Use shorter analysis period: ?days=7
```

### High Anomaly False Positives

```
Problem: Too many false anomaly alerts

Solutions:
1. Increase threshold: ?threshold=3.0 (default 2.5)
2. Use longer history: ?days=60
3. Adjust for seasonal changes manually
```

---

## 📚 Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Anomaly Detection | Z-score (Statistical) | Real-time outlier detection |
| Forecasting | Exponential Smoothing | Time-series prediction |
| Recommendations | Decision Trees | Pattern-based suggestions |
| Device Breakdown | Heuristics | Appliance estimation |
| NLP | Groq (Mixtral 8x7B) | Natural language Q&A |
| Analytics | Descriptive Statistics | Data insights |

---

## 🎯 Future Enhancements

- [ ] WebSocket real-time alerts
- [ ] Mobile app notifications
- [ ] IoT device tagging (auto-identify appliances)
- [ ] Demand response automation
- [ ] Peer comparison (gamification)
- [ ] Solar/renewable integration
- [ ] AI-powered maintenance predictions
- [ ] Carbon footprint tracking

---

## 📞 Support

For issues with:
- **Groq API**: https://console.groq.com/docs
- **Project**: Check GitHub issues
- **Deployment**: See Render docs

---

**Status**: ✅ All core AI features implemented
**Groq Status**: Ready (awaiting API key)
**Next**: WebSocket implementation for real-time features

**Version**: 1.0.0  
**Last Updated**: April 21, 2026
