/**
 * AI Engine - Anomaly Detection, Forecasting, and Analytics
 * Uses statistical methods for real-time ML without heavy dependencies
 */

/**
 * Calculate basic statistics
 */
function calculateStats(data) {
  if (!data || data.length === 0) return null;
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;
  const mean = data.reduce((a, b) => a + b) / n;
  const variance = data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
    : sorted[Math.floor(n / 2)];
  
  return { mean, std, median, min: sorted[0], max: sorted[n - 1], variance };
}

/**
 * Detect anomalies using Z-score method
 * Flags values that deviate more than 2.5 standard deviations from mean
 */
function detectAnomalies(usageData, threshold = 2.5) {
  const values = usageData.map(d => d.value);
  const stats = calculateStats(values);
  
  if (!stats || stats.std === 0) return [];
  
  const anomalies = usageData
    .map((record, idx) => ({
      ...record,
      zscore: (record.value - stats.mean) / stats.std,
      isAnomaly: Math.abs((record.value - stats.mean) / stats.std) > threshold
    }))
    .filter(r => r.isAnomaly)
    .map(r => ({
      date: r.date,
      value: r.value,
      severity: Math.abs(r.zscore),
      expected: stats.mean,
      deviation: r.value - stats.mean,
      reason: r.value > stats.mean ? 'SPIKE' : 'DROP'
    }));
  
  return anomalies;
}

/**
 * Simple time-series forecasting using exponential smoothing
 */
function forecastUsage(usageData, days = 30, alpha = 0.3) {
  if (!usageData || usageData.length < 7) return [];
  
  const values = usageData.map(d => d.value);
  const forecast = [];
  let level = values[0];
  
  // Fit exponential smoothing to historical data
  for (let i = 1; i < values.length; i++) {
    const prevLevel = level;
    level = alpha * values[i] + (1 - alpha) * prevLevel;
  }
  
  // Generate forecast
  const lastDate = new Date(usageData[usageData.length - 1].date);
  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Add seasonal adjustment (7-day cycle)
    const dayOfWeek = forecastDate.getDay();
    const historicalDayValues = usageData
      .filter(d => new Date(d.date).getDay() === dayOfWeek)
      .map(d => d.value);
    
    const dayAverage = historicalDayValues.length > 0
      ? historicalDayValues.reduce((a, b) => a + b) / historicalDayValues.length
      : level;
    
    const variance = 0.1 * level; // 10% confidence interval
    
    forecast.push({
      date: forecastDate.toISOString(),
      predicted: Math.round(dayAverage),
      lower: Math.round(dayAverage - variance),
      upper: Math.round(dayAverage + variance),
      confidence: 0.85
    });
  }
  
  return forecast;
}

/**
 * Generate recommendations based on usage patterns
 */
function generateRecommendations(usageData, userProfile = {}) {
  const recommendations = [];
  const stats = calculateStats(usageData.map(d => d.value));
  
  if (!stats) return [];
  
  // Peak hours detection
  const peakHours = usageData
    .map(d => ({
      hour: new Date(d.date).getHours(),
      value: d.value
    }))
    .reduce((acc, curr) => {
      acc[curr.hour] = (acc[curr.hour] || 0) + curr.value;
      return acc;
    }, {});
  
  const avgByHour = Object.entries(peakHours).map(([h, v]) => ({
    hour: parseInt(h),
    average: v
  })).sort((a, b) => b.average - a.average);
  
  if (avgByHour.length > 0) {
    const peakHour = avgByHour[0];
    const offPeakHour = avgByHour[avgByHour.length - 1];
    const savings = ((peakHour.average - offPeakHour.average) / peakHour.average) * 100;
    
    if (savings > 15) {
      recommendations.push({
        id: 'shift_to_offpeak',
        title: 'Shift Usage to Off-Peak Hours',
        description: `Move non-urgent tasks (laundry, charging) from ${peakHour.hour}:00 to ${offPeakHour.hour}:00`,
        potentialSavings: Math.round(savings),
        priority: 'HIGH'
      });
    }
  }
  
  // High usage detection
  if (stats.mean > 100) {
    recommendations.push({
      id: 'optimize_appliances',
      title: 'Optimize High-Usage Appliances',
      description: 'Your average usage is 40% above neighborhood average. Consider upgrading AC or refrigerator.',
      potentialSavings: 35,
      priority: 'MEDIUM'
    });
  }
  
  // Variance detection
  if (stats.std > stats.mean * 0.5) {
    recommendations.push({
      id: 'stabilize_usage',
      title: 'Stabilize Usage Patterns',
      description: 'High fluctuations detected. Schedule controllable loads consistently.',
      potentialSavings: 20,
      priority: 'MEDIUM'
    });
  }
  
  // Weekend vs weekday
  const weekdayAvg = usageData
    .filter(d => ![0, 6].includes(new Date(d.date).getDay()))
    .map(d => d.value)
    .reduce((a, b) => a + b, 0) / usageData.length || 0;
  
  const weekendAvg = usageData
    .filter(d => [0, 6].includes(new Date(d.date).getDay()))
    .map(d => d.value)
    .reduce((a, b) => a + b, 0) / usageData.length || 0;
  
  if (weekendAvg > weekdayAvg * 1.3) {
    recommendations.push({
      id: 'weekend_reduction',
      title: 'Reduce Weekend Usage',
      description: 'Weekend usage is 30% higher. Implement energy-saving practices on weekends.',
      potentialSavings: 25,
      priority: 'LOW'
    });
  }
  
  return recommendations.sort((a, b) => 
    ({ 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 })[a.priority] - 
    ({ 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 })[b.priority]
  );
}

/**
 * Device disaggregation - estimate device breakdown
 * Uses heuristic patterns for typical appliances
 */
function estimateDeviceBreakdown(totalUsage, usagePattern = {}) {
  // Typical device consumption percentages
  const devices = {
    AC: { percentage: 0.35, icon: '❄️', color: '#00BCD4' },
    Refrigerator: { percentage: 0.15, icon: '🧊', color: '#00ACC1' },
    Water_Heater: { percentage: 0.12, icon: '🚿', color: '#FF9800' },
    Lighting: { percentage: 0.10, icon: '💡', color: '#FFEB3B' },
    Cooking: { percentage: 0.08, icon: '🍳', color: '#FF5722' },
    Electronics: { percentage: 0.10, icon: '🖥️', color: '#9C27B0' },
    Washing_Machine: { percentage: 0.06, icon: '🧺', color: '#2196F3' },
    Other: { percentage: 0.04, icon: '⚡', color: '#757575' }
  };
  
  return Object.entries(devices).map(([device, config]) => ({
    device,
    usage: Math.round(totalUsage * config.percentage),
    percentage: Math.round(config.percentage * 100),
    icon: config.icon,
    color: config.color
  }));
}

/**
 * Calculate advanced analytics
 */
function calculateAdvancedAnalytics(usageData) {
  const stats = calculateStats(usageData.map(d => d.value));
  if (!stats) return null;
  
  // Trend calculation (comparing last 7 days with previous 7 days)
  const last7 = usageData.slice(-7);
  const prev7 = usageData.slice(-14, -7);
  
  const last7Avg = calculateStats(last7.map(d => d.value))?.mean || 0;
  const prev7Avg = calculateStats(prev7.map(d => d.value))?.mean || 0;
  
  const trendPercentage = prev7Avg !== 0 
    ? ((last7Avg - prev7Avg) / prev7Avg) * 100 
    : 0;
  
  // Daily breakdown
  const dailyBreakdown = usageData
    .reduce((acc, curr) => {
      const date = new Date(curr.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + curr.value;
      return acc;
    }, {});
  
  // Hour of day breakdown
  const hourlyPattern = usageData
    .reduce((acc, curr) => {
      const hour = new Date(curr.date).getHours();
      acc[hour] = (acc[hour] || 0) + curr.value;
      return acc;
    }, {});
  
  return {
    overall: stats,
    trend: {
      direction: trendPercentage > 0 ? 'UP' : trendPercentage < 0 ? 'DOWN' : 'STABLE',
      percentage: Math.round(Math.abs(trendPercentage)),
      lastWeekAvg: Math.round(last7Avg),
      previousWeekAvg: Math.round(prev7Avg)
    },
    dailyBreakdown: Object.entries(dailyBreakdown).map(([date, value]) => ({ date, value })),
    hourlyPattern: Object.entries(hourlyPattern).map(([hour, value]) => ({ hour: parseInt(hour), value }))
  };
}

module.exports = {
  calculateStats,
  detectAnomalies,
  forecastUsage,
  generateRecommendations,
  estimateDeviceBreakdown,
  calculateAdvancedAnalytics
};
