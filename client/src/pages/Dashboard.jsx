/**
 * Dashboard Page - Main analytics view after login
 * Displays: stat cards, usage trends, monthly comparison, cost distribution
 * Features animated counters, real-time data, quick actions
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Zap, IndianRupee, TrendingDown, Plus, Cpu, RefreshCw } from 'lucide-react';
import StatCard from '../components/cards/StatCard';
import UsageLineChart from '../components/charts/UsageLineChart';
import UsageBarChart from '../components/charts/UsageBarChart';
import UsagePieChart from '../components/charts/UsagePieChart';
import { usageAPI } from '../services/api';

// Generate realistic demo data when backend is unavailable
function generateDemoData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyUsage = days.map(day => ({
    date: day,
    name: day,
    water: 150 + Math.random() * 200,
    electricity: 15 + Math.random() * 25,
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyUsage = months.map(month => ({
    month,
    waterCost: 300 + Math.random() * 400,
    electricityCost: 800 + Math.random() * 1200,
  }));

  return {
    current: {
      water: { totalValue: 8450, totalCost: 422.50, avgValue: 280 },
      electricity: { totalValue: 620, totalCost: 4960, avgValue: 20.67 },
    },
    previous: {
      water: { totalValue: 9200, totalCost: 460.00 },
      electricity: { totalValue: 680, totalCost: 5440 },
    },
    savings: { water: 37.50, electricity: 480, total: 517.50 },
    dailyUsage,
    monthlyUsage,
    recentAlerts: [
      { _id: '1', type: 'electricity', severity: 'red', message: '🚨 High electricity usage detected', read: false },
      { _id: '2', type: 'water', severity: 'yellow', message: '⚠️ Water usage nearing threshold', read: false },
      { _id: '3', type: 'system', severity: 'green', message: '✅ Great savings this week!', read: true },
    ],
  };
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ type: 'water', value: '' });
  const [simulating, setSimulating] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await usageAPI.getDashboard();
      // Transform API data for charts
      const apiData = res.data.data;

      // Transform daily usage for line chart
      const dailyMap = {};
      apiData.dailyUsage.forEach(d => {
        const date = d._id.date;
        if (!dailyMap[date]) dailyMap[date] = { date, water: 0, electricity: 0 };
        dailyMap[date][d._id.type] = d.totalValue;
      });
      apiData.dailyUsage = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      // Transform monthly usage for bar chart
      const monthlyMap = {};
      apiData.monthlyUsage.forEach(d => {
        const month = d._id.month;
        if (!monthlyMap[month]) monthlyMap[month] = { month, waterCost: 0, electricityCost: 0 };
        monthlyMap[month][`${d._id.type}Cost`] = d.totalCost;
      });
      apiData.monthlyUsage = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

      setData(apiData);
    } catch (err) {
      console.log('Using demo data:', err.message);
      setData(generateDemoData());
    } finally {
      setLoading(false);
    }
  };

  // Simulate IoT data
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await usageAPI.simulateIoT({ days: 7 });
      await fetchDashboard();
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Add manual reading
  const handleAddReading = async (e) => {
    e.preventDefault();
    try {
      await usageAPI.addUsage({
        type: addForm.type,
        value: parseFloat(addForm.value),
        source: 'manual',
      });
      setShowAddModal(false);
      setAddForm({ type: 'water', value: '' });
      fetchDashboard();
    } catch (err) {
      console.error('Failed to add reading:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate trend percentages
  const waterTrend = data?.previous?.water?.totalCost > 0
    ? ((data.current.water.totalCost - data.previous.water.totalCost) / data.previous.water.totalCost * 100)
    : 0;
  const electricityTrend = data?.previous?.electricity?.totalCost > 0
    ? ((data.current.electricity.totalCost - data.previous.electricity.totalCost) / data.previous.electricity.totalCost * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Your resource consumption overview</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700/50 border border-dark-600/50 text-dark-300 hover:text-white hover:bg-dark-700 transition-all text-sm"
          >
            <Cpu className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? 'Simulating...' : 'Simulate IoT'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="btn-primary !py-2.5 !px-4 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Reading
          </motion.button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Water Usage"
          value={data?.current?.water?.totalValue || 0}
          suffix="L"
          trend={waterTrend}
          icon={Droplets}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Electricity Usage"
          value={data?.current?.electricity?.totalValue || 0}
          suffix="kWh"
          trend={electricityTrend}
          icon={Zap}
          color="green"
          decimals={1}
          delay={0.1}
        />
        <StatCard
          title="Total Cost"
          value={(data?.current?.water?.totalCost || 0) + (data?.current?.electricity?.totalCost || 0)}
          prefix="₹"
          icon={IndianRupee}
          color="amber"
          decimals={0}
          delay={0.2}
        />
        <StatCard
          title="Monthly Savings"
          value={Math.max(0, data?.savings?.total || 0)}
          prefix="₹"
          icon={TrendingDown}
          color="purple"
          decimals={2}
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsageLineChart data={data?.dailyUsage || []} title="Usage Trends" />
        </div>
        <UsagePieChart
          data={[
            { name: 'Water', value: data?.current?.water?.totalCost || 0 },
            { name: 'Electricity', value: data?.current?.electricity?.totalCost || 0 },
          ]}
        />
      </div>

      {/* Monthly Comparison + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsageBarChart data={data?.monthlyUsage || []} />
        </div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {(data?.recentAlerts || []).slice(0, 5).map((alert, index) => (
              <div
                key={alert._id || index}
                className={`p-3 rounded-xl border ${
                  alert.severity === 'red' ? 'bg-red-500/5 border-red-500/20' :
                  alert.severity === 'yellow' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-secondary-500/5 border-secondary-500/20'
                }`}
              >
                <p className="text-sm text-white">{alert.message}</p>
                <span className={`inline-block mt-1.5 ${
                  alert.severity === 'red' ? 'badge-red' :
                  alert.severity === 'yellow' ? 'badge-yellow' :
                  'badge-green'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
            {(!data?.recentAlerts || data.recentAlerts.length === 0) && (
              <p className="text-dark-400 text-sm text-center py-4">No recent alerts</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Reading Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Add Meter Reading</h3>
            <form onSubmit={handleAddReading} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">Type</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                  className="input-field"
                >
                  <option value="water">💧 Water (liters)</option>
                  <option value="electricity">⚡ Electricity (kWh)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Value</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={addForm.value}
                  onChange={(e) => setAddForm({ ...addForm, value: e.target.value })}
                  placeholder="Enter reading value"
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Save Reading</button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
