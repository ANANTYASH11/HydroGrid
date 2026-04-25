/**
 * Dashboard Page - Main analytics view after login
 * Displays: stat cards, usage trends, monthly comparison, cost distribution
 * Features animated counters, real-time data, quick actions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Zap, IndianRupee, TrendingDown, Plus, Cpu, RefreshCw, Wifi, WifiOff, Download, UploadCloud, Database } from 'lucide-react';
import StatCard from '../components/cards/StatCard';
import UsageLineChart from '../components/charts/UsageLineChart';
import UsageBarChart from '../components/charts/UsageBarChart';
import UsagePieChart from '../components/charts/UsagePieChart';
import { usageAPI, liveAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const INDIA_REGIONS = [
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal_pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'andaman_and_nicobar_islands', label: 'Andaman and Nicobar Islands (UT)' },
  { value: 'chandigarh', label: 'Chandigarh (UT)' },
  { value: 'dadra_and_nagar_haveli_and_daman_and_diu', label: 'Dadra and Nagar Haveli and Daman and Diu (UT)' },
  { value: 'delhi', label: 'Delhi (NCT)' },
  { value: 'jammu_and_kashmir', label: 'Jammu and Kashmir (UT)' },
  { value: 'ladakh', label: 'Ladakh (UT)' },
  { value: 'lakshadweep', label: 'Lakshadweep (UT)' },
  { value: 'puducherry', label: 'Puducherry (UT)' },
];

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
      { _id: '1', type: 'electricity', severity: 'red', message: '� High electricity usage detected', read: false },
      { _id: '2', type: 'water', severity: 'yellow', message: '⚠️ Water usage nearing threshold', read: false },
      { _id: '3', type: 'system', severity: 'green', message: '✅ Great savings this week!', read: true },
    ],
  };
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ type: 'water', value: '' });
  const [simulating, setSimulating] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [tariffForm, setTariffForm] = useState({
    state: 'delhi',
    electricityUnits: 320,
    waterLiters: 18000,
  });
  const [tariffEstimate, setTariffEstimate] = useState(null);
  const [tariffLoading, setTariffLoading] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(liveAPI.getWsUrl());

    ws.onopen = () => {
      setLiveConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'live_metrics') {
          setLiveMetrics(payload);
        }
      } catch (error) {
        // Ignore malformed websocket messages.
      }
    };

    ws.onclose = () => {
      setLiveConnected(false);
    };

    ws.onerror = () => {
      setLiveConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchTariffEstimate = async () => {
    setTariffLoading(true);
    try {
      const response = await usageAPI.getTariffEstimate(tariffForm);
      setTariffEstimate(response.data.data);
    } catch (error) {
      setTariffEstimate(null);
    } finally {
      setTariffLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffEstimate();
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const response = await usageAPI.downloadTariffTemplate();
      const blob = response.data; // axios already resolves blob because responseType: 'blob'
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tariff-template.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download err', err);
    }
  };

  const handleUploadTariffs = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      
      const res = await usageAPI.uploadTariffs(payload);
      
      alert(res.data.message || 'Tariffs successfully dynamically trained! Reloading estimate.');
      setAdminOpen(false);
      fetchTariffEstimate();
    } catch (err) {
      console.error(err);
      alert('Failed to train tariffs. Please make sure it is valid JSON matching the template.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const fetchDashboard = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
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
      console.error('Failed to fetch dashboard data:', err.message);
      // setData(null) is fine, the UI will handle nulls via optional chaining
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  // Simulate IoT data
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await usageAPI.simulateIoT({ days: 7 });
      await fetchDashboard(true); // Show refresh indicator
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Add manual reading - OPTIMIZED: Fast response with instant data refresh
  const handleAddReading = async (e) => {
    e.preventDefault();
    const loadingBtn = e.target.querySelector('button[type="submit"]');
    const originalText = loadingBtn?.textContent;

    try {
      // Show loading state
      if (loadingBtn) {
        loadingBtn.textContent = 'Adding...';
        loadingBtn.disabled = true;
      }

      await usageAPI.addUsage({
        type: addForm.type,
        value: parseFloat(addForm.value),
        source: 'manual',
      });

      // Close modal immediately
      setShowAddModal(false);
      setAddForm({ type: 'water', value: '' });

      // INSTANTLY refresh dashboard data to show new reading
      console.log('✅ Reading added successfully! Refreshing dashboard...');
      await fetchDashboard(true); // Show refresh indicator

    } catch (err) {
      console.error('Failed to add reading:', err);
      // Could show error toast here
    } finally {
      // Reset button state
      if (loadingBtn) {
        loadingBtn.textContent = originalText;
        loadingBtn.disabled = false;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00E87A", borderTopColor: "transparent" }} />
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
      {/* ── Premium Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          {/* Animated icons cluster */}
          <div className="relative flex-shrink-0">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,232,122,0.1)", boxShadow: "0 0 20px rgba(0,232,122,0.15)" }}>
              <Droplets className="w-6 h-6" style={{ color: "#00E87A" }} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,149,0,0.12)", boxShadow: "0 0 10px rgba(255,149,0,0.2)" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "#FF9500" }} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white">{t.dashboard}</h1>
              {/* Live dot */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Live</span>
              </div>
              {refreshing && (
                <div className="flex items-center gap-1.5 text-primary-400 text-xs">
                  <div className="w-3.5 h-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </div>
              )}
            </div>
            <p className="text-zinc-500 text-sm mt-0.5">{t.overview}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <Cpu className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? t.simulating : t.simulateIoT}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:-translate-y-0.5" style={{ background: "#00E87A", boxShadow: "0 4px 16px rgba(0,232,122,0.25)" }}
          >
            <Plus className="w-4 h-4" /> {t.addReading}
          </motion.button>
        </div>
      </motion.div>

      {/* Live Feed + India Tariff */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-sub p-6" style={{ background: "var(--bg-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-black text-hi tracking-tight flex items-center gap-2">
              {liveConnected ? <Wifi className="w-5 h-5 text-secondary-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
              {t.liveFeed}
            </h2>
            <span className={`text-xs px-2 py-1 rounded-full ${liveConnected ? 'badge-green' : 'badge-red'}`}>
              {liveConnected ? t.connected : t.disconnected}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl p-3 border border-sub">
              <p className="text-xs text-mid mb-1">{t.waterFlow}</p>
              <p className="text-lg font-bold text-hi">{liveMetrics?.waterLpm ?? '--'} L/min</p>
            </div>
            <div className="rounded-xl p-3 border border-sub">
              <p className="text-xs text-mid mb-1">{t.electricLoad}</p>
              <p className="text-lg font-bold text-hi">{liveMetrics?.electricityKw ?? '--'} kW</p>
            </div>
            <div className="rounded-xl p-3 border border-sub">
              <p className="text-xs text-mid mb-1">{t.liveAlerts}</p>
              <p className="text-lg font-bold text-hi">{liveMetrics?.alerts ?? 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border-sub p-6" style={{ background: "var(--bg-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-hi">{t.tariffEstimate}</h3>
            <button
              type="button"
              onClick={fetchTariffEstimate}
              className="p-2 rounded-lg border border-sub bg-muted/5 text-muted-foreground hover:text-hi"
              title="Refresh estimate"
            >
              <RefreshCw className={`w-4 h-4 ${tariffLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-mid mb-1">{t.state}</label>
              <select
                value={tariffForm.state}
                onChange={(e) => setTariffForm((prev) => ({ ...prev, state: e.target.value }))}
                className="input-field !py-2"
              >
                {INDIA_REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-mid mb-1">{t.electricityUnits}</label>
              <input
                type="number"
                min="0"
                value={tariffForm.electricityUnits}
                onChange={(e) => setTariffForm((prev) => ({ ...prev, electricityUnits: Number(e.target.value) }))}
                className="input-field !py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-mid mb-1">{t.waterLiters}</label>
              <input
                type="number"
                min="0"
                value={tariffForm.waterLiters}
                onChange={(e) => setTariffForm((prev) => ({ ...prev, waterLiters: Number(e.target.value) }))}
                className="input-field !py-2"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={fetchTariffEstimate}
            className="w-full py-2 mb-4 rounded-xl text-sm font-semibold text-muted-foreground border border-sub bg-white/[0.03] hover:bg-white/[0.05] light:bg-black/[0.03] light:hover:bg-black/[0.05] text-mid hover:text-hi"
          >
            {t.estimateBill}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl p-3 border border-sub">
              <p className="text-xs text-mid mb-1">{t.electricity}</p>
              <p className="text-lg font-bold text-hi">₹{tariffEstimate?.electricity?.total ?? '--'}</p>
            </div>
            <div className="rounded-xl p-3 border border-sub">
              <p className="text-xs text-mid mb-1">{t.water}</p>
              <p className="text-lg font-bold text-hi">₹{tariffEstimate?.water?.total ?? '--'}</p>
            </div>
            <div className="rounded-xl p-3 border border-sub flex flex-col justify-center relative">
              <p className="text-xs text-mid mb-1">{t.total}</p>
              <p className="text-lg font-bold text-secondary-400">₹{tariffEstimate?.totalEstimatedBill ?? '--'}</p>
              <span className="absolute top-2 right-2 text-[10px] text-muted-foreground uppercase tracking-widest">{tariffEstimate?.source}</span>
            </div>
          </div>

          {/* Settings / Admin Section */}
          <div className="mt-4 pt-4 border-t border-muted/20">
            <button 
              onClick={() => setAdminOpen(!adminOpen)}
              className="text-xs font-semibold text-muted-foreground hover:text-hi flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              Train Tariff Calculator (Admin)
            </button>
            
            <AnimatePresence>
              {adminOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-3 rounded-xl bg-muted/10 border border-sub flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={handleDownloadTemplate}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-medium text-muted-foreground bg-muted/10 hover:bg-muted/20 hover:text-hi transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Download `.json` Template
                    </button>
                    <label className="flex-1 py-2 px-3 rounded-lg text-xs font-medium text-black bg-secondary-500 hover:bg-secondary-400 cursor-pointer transition flex items-center justify-center gap-2">
                      <UploadCloud className="w-3.5 h-3.5" /> {uploading ? 'Training...' : 'Upload Data (JSON)'}
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={handleUploadTariffs} 
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.waterUsage}
          value={data?.current?.water?.totalValue || 0}
          suffix="L"
          trend={waterTrend}
          icon={Droplets}
          color="blue"
          delay={0}
        />
        <StatCard
          title={t.electricityUsage}
          value={data?.current?.electricity?.totalValue || 0}
          suffix="kWh"
          trend={electricityTrend}
          icon={Zap}
          color="green"
          decimals={1}
          delay={0.1}
        />
        <StatCard
          title={t.totalCost}
          value={(data?.current?.water?.totalCost || 0) + (data?.current?.electricity?.totalCost || 0)}
          prefix="₹"
          icon={IndianRupee}
          color="amber"
          decimals={0}
          delay={0.2}
        />
        <StatCard
          title={t.monthlySavings}
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
          <UsageLineChart data={data?.dailyUsage || []} title={t.usageTrends} />
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
          className="rounded-2xl border-sub p-6" style={{ background: "var(--bg-card)" }}
        >
          <h3 className="text-lg font-semibold text-hi mb-4">{t.recentAlerts}</h3>
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
                <p className="text-sm text-hi">{alert.message}</p>
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
              <p className="text-zinc-500 text-sm text-center py-4">{t.noRecentAlerts}</p>
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
            className="rounded-2xl border border-white/[0.06] p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)" }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">{t.addMeterReading}</h3>
            <form onSubmit={handleAddReading} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">{t.type}</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                  className="input-field"
                >
                  <option value="water">{t.waterLitersLabel}</option>
                  <option value="electricity">{t.electricityKwhLabel}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">{t.value}</label>
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
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-black transition-all" style={{ background: "#00E87A" }}>{t.save} {t.addReading}</button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-zinc-400 border border-white/[0.08] bg-white/[0.03] hover:text-white transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}




