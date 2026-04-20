/**
 * Analytics Utility - Client-Side AI/ML Functions
 * Implements lightweight ML algorithms for usage prediction and analysis
 * 
 * Features:
 * - Linear Regression for trend prediction
 * - Z-Score based anomaly detection
 * - Smart suggestions engine
 * - Carbon footprint calculator
 */

/**
 * Simple Linear Regression (Least Squares Method)
 * Fits a line y = mx + b to the data points
 * Used for predicting future consumption trends
 * 
 * @param {Array} data - Array of { x, y } objects
 * @returns {Object} - { slope, intercept, predict(x), r2 }
 */
export function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, predict: () => 0, r2: 0 };

  // Calculate sums needed for the regression formula
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
    sumY2 += point.y * point.y;
  }

  // Calculate slope (m) and intercept (b) using least squares formula
  const denominator = (n * sumX2 - sumX * sumX);
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination) - measures fit quality
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const point of data) {
    const predicted = slope * point.x + intercept;
    ssRes += (point.y - predicted) ** 2;
    ssTot += (point.y - yMean) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

  return {
    slope,
    intercept,
    r2: Math.max(0, r2),
    predict: (x) => Math.max(0, slope * x + intercept), // Never predict negative
  };
}

/**
 * Predict future values based on historical data
 * Uses linear regression to extrapolate trends
 * 
 * @param {Array} historicalData - Array of { date, value } objects
 * @param {number} daysAhead - Number of future days to predict
 * @returns {Array} - Predicted values with dates
 */
export function predictFuture(historicalData, daysAhead = 7) {
  if (!historicalData || historicalData.length < 3) return [];

  // Convert dates to numeric x values (days from start)
  const startDate = new Date(historicalData[0].date);
  const regressionData = historicalData.map(d => ({
    x: (new Date(d.date) - startDate) / (1000 * 60 * 60 * 24),
    y: d.value,
  }));

  const model = linearRegression(regressionData);
  const predictions = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    const x = (futureDate - startDate) / (1000 * 60 * 60 * 24);

    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      value: parseFloat(model.predict(x).toFixed(2)),
      isPrediction: true,
    });
  }

  return predictions;
}

/**
 * Anomaly Detection using Z-Score Method
 * Detects values that are unusually far from the mean
 * Z-score > 2 = anomaly (outside 95% of normal values)
 * 
 * @param {Array} values - Array of numeric values
 * @param {number} threshold - Z-score threshold (default: 2)
 * @returns {Array} - Indices of anomalous values
 */
export function detectAnomalies(values, threshold = 2) {
  if (!values || values.length < 3) return [];

  // Calculate mean (average)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Calculate standard deviation
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return []; // All values are identical

  // Find anomalies (values with z-score above threshold)
  const anomalies = [];
  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push({
        index,
        value,
        zScore: parseFloat(zScore.toFixed(2)),
        deviation: value > mean ? 'high' : 'low',
        percentAboveMean: parseFloat(((value - mean) / mean * 100).toFixed(1)),
      });
    }
  });

  return anomalies;
}

/**
 * Smart Suggestions Engine
 * Generates actionable recommendations based on usage patterns
 * 
 * @param {Object} usageData - { dailyUsage, monthlyUsage, type }
 * @returns {Array} - Array of suggestion objects
 */
export function generateSmartSuggestions(usageData) {
  const suggestions = [];

  if (!usageData) return suggestions;

  const { waterData, electricityData, savings } = usageData;

  // Analyze water usage patterns
  if (waterData && waterData.length > 0) {
    const avgWater = waterData.reduce((s, d) => s + d.value, 0) / waterData.length;

    if (avgWater > 400) {
      suggestions.push({
        type: 'water',
        icon: '💧',
        priority: 'high',
        title: 'High Water Consumption Detected',
        description: `Your average daily water usage is ${avgWater.toFixed(0)}L, which is above the recommended 300L per household. Consider installing low-flow fixtures.`,
        savingsPotential: '₹' + (avgWater * 0.05 * 30).toFixed(0) + '/month',
      });
    }

    // Check for potential leaks (high night-time usage)
    const nightReadings = waterData.filter(d => {
      const hour = new Date(d.date || d.timestamp).getHours();
      return hour >= 0 && hour <= 5;
    });
    if (nightReadings.length > 0) {
      const avgNight = nightReadings.reduce((s, d) => s + d.value, 0) / nightReadings.length;
      if (avgNight > 20) {
        suggestions.push({
          type: 'water',
          icon: '🔧',
          priority: 'critical',
          title: 'Possible Water Leak Detected',
          description: `Unusual water usage detected during nighttime hours (${avgNight.toFixed(0)}L avg). This could indicate a leak. Check pipes and fixtures.`,
          savingsPotential: 'Up to ₹4,000/month',
        });
      }
    }
  }

  // Analyze electricity usage patterns
  if (electricityData && electricityData.length > 0) {
    const avgElectricity = electricityData.reduce((s, d) => s + d.value, 0) / electricityData.length;

    if (avgElectricity > 30) {
      suggestions.push({
        type: 'electricity',
        icon: '⚡',
        priority: 'high',
        title: 'Optimize Peak Hour Usage',
        description: 'Your electricity consumption spikes during 6-9 PM peak hours. Consider shifting heavy appliance usage to off-peak hours to save on rates.',
        savingsPotential: '₹1,200-2,000/month',
      });
    }

    suggestions.push({
      type: 'electricity',
      icon: '❄️',
      priority: 'medium',
      title: 'AC Temperature Optimization',
      description: 'Setting your AC to 24°C instead of 22°C can reduce cooling costs by up to 20%. Use ceiling fans to supplement cooling.',
      savingsPotential: '₹800-1,600/month',
    });
  }

  // General suggestions
  suggestions.push({
    type: 'general',
    icon: '🌱',
    priority: 'low',
    title: 'Switch to LED Lighting',
    description: 'LED bulbs use 75% less energy than incandescent bulbs and last 25x longer. Switching your entire home can save significantly.',
    savingsPotential: '₹400-650/month',
  });

  if (savings && savings.total > 0) {
    suggestions.push({
      type: 'general',
      icon: '🏆',
      priority: 'info',
      title: 'Great Progress!',
      description: `You've saved ₹${savings.total.toFixed(0)} compared to last month! Keep up the efficient usage patterns.`,
      savingsPotential: 'Already saving!',
    });
  }

  return suggestions;
}

/**
 * Carbon Footprint Calculator
 * Estimates CO₂ emissions and environmental impact
 * 
 * @param {number} kwhUsed - Electricity consumed in kWh
 * @param {number} litersUsed - Water consumed in liters
 * @returns {Object} - Carbon footprint breakdown
 */
export function calculateCarbonFootprint(kwhUsed = 0, litersUsed = 0) {
  // CO₂ emission factors
  const CO2_PER_KWH = 0.42;       // kg CO₂ per kWh (global average)
  const CO2_PER_LITER = 0.0003;   // kg CO₂ per liter (water treatment)

  const electricityCO2 = kwhUsed * CO2_PER_KWH;
  const waterCO2 = litersUsed * CO2_PER_LITER;
  const totalCO2 = electricityCO2 + waterCO2;

  return {
    electricity: parseFloat(electricityCO2.toFixed(2)),
    water: parseFloat(waterCO2.toFixed(2)),
    total: parseFloat(totalCO2.toFixed(2)),
    treesNeeded: Math.ceil(totalCO2 / 22), // 1 tree absorbs ~22 kg CO₂/year
    carMilesEquivalent: parseFloat((totalCO2 / 0.404).toFixed(1)), // EPA factor
    rating: totalCO2 < 50 ? 'Excellent' : totalCO2 < 100 ? 'Good' : totalCO2 < 200 ? 'Average' : 'High',
    color: totalCO2 < 50 ? '#10b981' : totalCO2 < 100 ? '#3b82f6' : totalCO2 < 200 ? '#f59e0b' : '#ef4444',
  };
}
