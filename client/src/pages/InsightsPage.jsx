/**
 * Insights Page - AI-powered analytics and predictions
 * Features: linear regression predictions, anomaly detection,
 * smart suggestions, carbon footprint estimation, AI-powered insights
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Leaf, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { usageAPI } from '../services/api';
import { predictFuture, detectAnomalies, generateSmartSuggestions, calculateCarbonFootprint } from '../utils/analytics';
import AIInsights from '../components/AIInsights';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [carbon, setCarbon] = useState(null);
  const [activeTab, setActiveTab] = useState('suggestions');

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
      actual: parseFloat((parseFloat(d.value) || 0).toFixed(1)),
      fullDate: d.date,
    })),
    ...predictions.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predicted: parseFloat((parseFloat(d.value) || 0).toFixed(1)),
      fullDate: d.date,
    })),
  ];

  // Identify anomaly dates for chart markers
  const anomalyDates = new Set(anomalies.map(a => a.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00E87A", borderTopColor: "transparent" }} />
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain className="w-7 h-7 text-white" style={{ color: "#00E87A" }} />
          AI-Powered Insights
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Machine learning analysis of your consumption patterns</p>
      </div>



      {/* AI Insights Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">🤖 AI-Powered Insights</h2>
        </div>
        <AIInsights />
      </motion.div>
    </div>
  );
}



