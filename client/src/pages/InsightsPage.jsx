/**
 * Insights Page - AI-powered analytics and predictions
 * Features: linear regression predictions, anomaly detection,
 * smart suggestions, carbon footprint estimation
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Leaf, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { usageAPI } from '../services/api';
import { predictFuture, detectAnomalies, generateSmartSuggestions, calculateCarbonFootprint } from '../utils/analytics';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [carbon, setCarbon] = useState(null);
  const [activeTab, setActiveTab] = useState('predictions');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Fetch usage data for the last 30 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [waterRes, elecRes, carbonRes] = await Promise.all([
        usageAPI.getUsage({ type: 'water', startDate, endDate, limit: 500 }),
        usageAPI.getUsage({ type: 'electricity', startDate, endDate, limit: 500 }),
        usageAPI.getCarbonFootprint({ period: 'month' }),
      ]);

      // Aggregate daily totals for water
      const dailyWater = aggregateDaily(waterRes.data.data, 'water');
      const dailyElec = aggregateDaily(elecRes.data.data, 'electricity');

      setUsageData(dailyWater);

      // Run ML predictions - predict next 7 days
      const waterPredictions = predictFuture(dailyWater, 7);
      setPredictions(waterPredictions);

      // Detect anomalies in water usage
      const waterValues = dailyWater.map(d => d.value);
      const detectedAnomalies = detectAnomalies(waterValues);
      setAnomalies(detectedAnomalies.map(a => ({
        ...a,
        date: dailyWater[a.index]?.date,
      })));

      // Generate smart suggestions
      const allSuggestions = generateSmartSuggestions({
        waterData: dailyWater,
        electricityData: dailyElec,
        savings: { total: 10 },
      });
      setSuggestions(allSuggestions);

      // Carbon footprint
      setCarbon(carbonRes.data.data);
    } catch (err) {
      console.log('Using demo insights:', err.message);
      // Generate demo data
      const demoWater = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: 200 + Math.sin(i / 3) * 80 + Math.random() * 60 + (i === 15 ? 200 : 0),
        };
      });
      setUsageData(demoWater);

      const demoPredictions = predictFuture(demoWater, 7);
      setPredictions(demoPredictions);

      const demoAnomalies = detectAnomalies(demoWater.map(d => d.value));
      setAnomalies(demoAnomalies.map(a => ({ ...a, date: demoWater[a.index]?.date })));

      setSuggestions(generateSmartSuggestions({
        waterData: demoWater,
        electricityData: demoWater.map(d => ({ ...d, value: d.value / 10 })),
        savings: { total: 15 },
      }));

      setCarbon({
        totalKwh: 620,
        carbonKg: 260.4,
        treesNeeded: 12,
        period: 'month',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper: aggregate usage data into daily totals
  function aggregateDaily(data, type) {
    const dailyMap = {};
    data.forEach(d => {
      const day = new Date(d.timestamp).toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { date: day, value: 0 };
      dailyMap[day].value += d.value;
    });
    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Combine historical + predicted data for chart
  const chartData = [
    ...usageData.slice(-14).map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: parseFloat(d.value.toFixed(1)),
      fullDate: d.date,
    })),
    ...predictions.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predicted: parseFloat(d.value.toFixed(1)),
      fullDate: d.date,
    })),
  ];

  // Identify anomaly dates for chart markers
  const anomalyDates = new Set(anomalies.map(a => a.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'carbon', label: 'Carbon', icon: Leaf },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain className="w-7 h-7 text-primary-400" />
          AI-Powered Insights
        </h1>
        <p className="text-dark-400 text-sm mt-1">Machine learning analysis of your consumption patterns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Water Usage Prediction</h3>
            <p className="text-dark-400 text-sm mb-6">
              Linear regression model predicting next 7 days based on 30-day historical data
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2} fill="url(#actualGrad)" dot={false} />
                <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fill="url(#predGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-primary-500" />
                <span className="text-xs text-dark-400">Historical Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500 border-dashed" style={{ borderTop: '2px dashed #f59e0b', height: 0 }} />
                <span className="text-xs text-dark-400">AI Prediction</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Anomaly Detection</h3>
            <p className="text-dark-400 text-sm mb-4">
              Z-score analysis identifies usage spikes that deviate more than 2 standard deviations from the mean
            </p>
            {anomalies.length > 0 ? (
              <div className="space-y-3">
                {anomalies.map((anomaly, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
                  >
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Spike detected on {anomaly.date ? new Date(anomaly.date).toLocaleDateString() : 'Unknown'}
                      </p>
                      <p className="text-xs text-dark-400 mt-1">
                        Value: {anomaly.value?.toFixed(1)} | Z-Score: {anomaly.zScore} | {anomaly.percentAboveMean}% above mean
                      </p>
                    </div>
                    <span className="badge-red ml-auto">{anomaly.deviation}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-secondary-500/50 mx-auto mb-3" />
                <p className="text-dark-400">No anomalies detected — your usage patterns look normal!</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {suggestions.map((suggestion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{suggestion.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white">{suggestion.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suggestion.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      suggestion.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      suggestion.priority === 'medium' ? 'bg-primary-500/20 text-primary-400' :
                      suggestion.priority === 'info' ? 'bg-secondary-500/20 text-secondary-400' :
                      'bg-dark-600/50 text-dark-300'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-sm text-dark-400 leading-relaxed">{suggestion.description}</p>
                  <p className="text-sm font-medium text-secondary-400 mt-2">
                    💰 Potential Savings: {suggestion.savingsPotential}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Carbon Tab */}
      {activeTab === 'carbon' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6 text-center">
              <Leaf className="w-10 h-10 text-secondary-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">{carbon?.carbonKg || 0}</p>
              <p className="text-dark-400 text-sm">kg CO₂ this {carbon?.period || 'month'}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <span className="text-4xl block mb-3">🌳</span>
              <p className="text-3xl font-bold text-white">{carbon?.treesNeeded || 0}</p>
              <p className="text-dark-400 text-sm">Trees needed to offset</p>
            </div>
            <div className="glass-card p-6 text-center">
              <span className="text-4xl block mb-3">⚡</span>
              <p className="text-3xl font-bold text-white">{carbon?.totalKwh || 0}</p>
              <p className="text-dark-400 text-sm">kWh consumed</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Carbon Footprint Rating</h3>
            <div className="relative h-4 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (carbon?.carbonKg || 0) / 3)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-secondary-500 via-amber-500 to-red-500"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-dark-400">
              <span>Excellent</span>
              <span>Good</span>
              <span>Average</span>
              <span>High</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
