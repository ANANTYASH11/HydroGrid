/**
 * Reports Page - Generate and download usage reports
 * Features: date range picker, report preview, CSV/PDF download
 * Configured for Indian locale (₹ INR, IST timezone)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, Table, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function ReportsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('');
  const [lastFetchParams, setLastFetchParams] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, filterType]);

  const fetchReport = async () => {
    const currentParams = { startDate, endDate, filterType };
    
    // Skip if parameters haven't changed
    if (lastFetchParams && 
        lastFetchParams.startDate === currentParams.startDate &&
        lastFetchParams.endDate === currentParams.endDate &&
        lastFetchParams.filterType === currentParams.filterType) {
      return;
    }
    
    setLastFetchParams(currentParams);
    setLoading(true);
    try {
      const params = { startDate, endDate };
      if (filterType) params.type = filterType;
      const res = await reportsAPI.generateReport(params);
      setReport(res.data.data);
    } catch (err) {
      console.error('API failed to generate report:', err.message);
      setReport({
        period: { start: startDate, end: endDate, days: 1 },
        summary: {
          water: { totalValue: 0, totalCost: 0, avgDaily: 0 },
          electricity: { totalValue: 0, totalCost: 0, avgDaily: 0 },
        },
        totalCost: 0,
        dailyData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await reportsAPI.downloadCSV({ startDate, endDate, type: filterType });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hydrogrid-report-${startDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Generate client-side CSV fallback
      if (report?.dailyData) {
        const headers = 'Date,Water (L),Electricity (kWh),Water Cost (₹),Electricity Cost (₹),Total Cost (₹)\n';
        const rows = report.dailyData.map(d =>
          `${d.date},${d.water?.toFixed(1)},${d.electricity?.toFixed(2)},${d.waterCost?.toFixed(2)},${d.electricityCost?.toFixed(2)},${d.totalCost?.toFixed(2)}`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hydrogrid-report-${startDate}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-white" style={{ color: "#00E87A" }} />
            {t.reportsTitle}
            {loading && (
              <div className="flex items-center gap-2 text-primary-400 text-sm">
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                {t.generatingReport}
              </div>
            )}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{t.reportsSubtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/[0.06] p-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-dark-300 mb-2">{t.startDate}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                className="input-field !pl-10 !py-2.5 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">{t.endDate}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                className="input-field !pl-10 !py-2.5 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">{t.typeLabel}</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              disabled={loading}
              className="input-field !py-2.5 disabled:opacity-50"
            >
              <option value="">{t.allTypes}</option>
              <option value="water">{t.water}</option>
              <option value="electricity">{t.electricity}</option>
            </select>
          </div>
          <button onClick={fetchReport} disabled={loading} className="btn-primary !py-2.5 flex items-center gap-2 disabled:opacity-50">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
            {loading ? t.generatingBtn : t.generateBtn}
          </button>
          <button onClick={handleDownloadCSV} className="btn-secondary !py-2.5 flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00E87A", borderTopColor: "transparent" }} />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t.waterUsedLabel, value: `${report.summary.water.totalValue.toFixed(0)} L`, sub: `${t.avgPrefix}: ${report.summary.water.avgDaily.toFixed(0)} L/day` },
              { label: t.electricityUsedLabel, value: `${report.summary.electricity.totalValue.toFixed(0)} kWh`, sub: `${t.avgPrefix}: ${report.summary.electricity.avgDaily.toFixed(1)} kWh/day` },
              { label: t.waterCostLabel, value: `₹${report.summary.water.totalCost.toFixed(2)}`, sub: `₹${(report.summary.water.totalCost / report.period.days).toFixed(2)}/day` },
              { label: t.totalCostLabel, value: `₹${report.totalCost.toFixed(2)}`, sub: `${t.overDays} ${report.period.days} ${t.days}` },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "var(--bg-card)" }}
              >
                <p className="text-sm text-dark-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-xs text-dark-500 mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Daily Cost Chart */}
          <div className="rounded-2xl border border-white/[0.06] p-6" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-semibold text-white mb-4">{t.dailyCostBreakdown}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.dailyData.slice(-14)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sub)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-mid)', fontSize: 11 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-mid)', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-sub)', borderRadius: '12px' }}
                  labelStyle={{ color: 'var(--text-mid)' }}
                />
                <Bar dataKey="waterCost" name="Water (₹)" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="cost" />
                <Bar dataKey="electricityCost" name="Electricity (₹)" fill="#10b981" radius={[3, 3, 0, 0]} stackId="cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-dark-400" /> {t.detailedData}
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 text-dark-400 font-medium">{t.dateCol}</th>
                  <th className="text-right py-3 text-dark-400 font-medium">{t.waterLCol}</th>
                  <th className="text-right py-3 text-dark-400 font-medium">{t.electricityKwhCol}</th>
                  <th className="text-right py-3 text-dark-400 font-medium">{t.waterCostCol}</th>
                  <th className="text-right py-3 text-dark-400 font-medium">{t.elecCostCol}</th>
                  <th className="text-right py-3 text-dark-400 font-medium">{t.totalCol}</th>
                </tr>
              </thead>
              <tbody>
                {report.dailyData.slice(-10).map((row, i) => (
                  <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 text-white">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-right text-white" style={{ color: "#00E87A" }}>{row.water?.toFixed(1)}</td>
                    <td className="py-3 text-right text-secondary-400">{row.electricity?.toFixed(2)}</td>
                    <td className="py-3 text-right text-dark-300">₹{row.waterCost?.toFixed(2)}</td>
                    <td className="py-3 text-right text-dark-300">₹{row.electricityCost?.toFixed(2)}</td>
                    <td className="py-3 text-right text-white font-medium">₹{row.totalCost?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}


