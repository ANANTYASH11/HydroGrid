/**
 * Reports Page - Generate and download usage reports
 * Features: date range picker, report preview, CSV/PDF download
 * Configured for Indian locale (₹ INR, IST timezone)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, Table, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsAPI } from '../services/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };
      if (filterType) params.type = filterType;
      const res = await reportsAPI.generateReport(params);
      setReport(res.data.data);
    } catch (err) {
      console.log('Using demo report data');
      // Generate demo report with Indian Rupee costs
      const demoDaily = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const water = 150 + Math.random() * 200;
        const electricity = 12 + Math.random() * 20;
        return {
          date: date.toISOString().split('T')[0],
          water,
          electricity,
          waterCost: water * 0.05,
          electricityCost: electricity * 8,
          totalCost: water * 0.05 + electricity * 8,
        };
      });
      setReport({
        period: { start: startDate, end: endDate, days: 30 },
        summary: {
          water: { totalValue: 8450, totalCost: 422.50, avgDaily: 281.67 },
          electricity: { totalValue: 620, totalCost: 4960, avgDaily: 20.67 },
        },
        totalCost: 5382.50,
        dailyData: demoDaily,
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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary-400" />
          Reports & Analytics
        </h1>
        <p className="text-dark-400 text-sm mt-1">Generate detailed usage reports and cost analysis</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-dark-300 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field !pl-10 !py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field !pl-10 !py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field !py-2.5"
            >
              <option value="">All</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
            </select>
          </div>
          <button onClick={fetchReport} className="btn-primary !py-2.5 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Generate
          </button>
          <button onClick={handleDownloadCSV} className="btn-secondary !py-2.5 flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Water Used', value: `${report.summary.water.totalValue.toFixed(0)} L`, sub: `Avg: ${report.summary.water.avgDaily.toFixed(0)} L/day` },
              { label: 'Electricity Used', value: `${report.summary.electricity.totalValue.toFixed(0)} kWh`, sub: `Avg: ${report.summary.electricity.avgDaily.toFixed(1)} kWh/day` },
              { label: 'Water Cost', value: `₹${report.summary.water.totalCost.toFixed(2)}`, sub: `₹${(report.summary.water.totalCost / report.period.days).toFixed(2)}/day` },
              { label: 'Total Cost', value: `₹${report.totalCost.toFixed(2)}`, sub: `Over ${report.period.days} days` },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <p className="text-sm text-dark-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-xs text-dark-500 mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Daily Cost Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.dailyData.slice(-14)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="waterCost" name="Water (₹)" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="cost" />
                <Bar dataKey="electricityCost" name="Electricity (₹)" fill="#10b981" radius={[3, 3, 0, 0]} stackId="cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-dark-400" /> Detailed Data
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 text-dark-400 font-medium">Date</th>
                  <th className="text-right py-3 text-dark-400 font-medium">Water (L)</th>
                  <th className="text-right py-3 text-dark-400 font-medium">Electricity (kWh)</th>
                  <th className="text-right py-3 text-dark-400 font-medium">Water Cost</th>
                  <th className="text-right py-3 text-dark-400 font-medium">Elec. Cost</th>
                  <th className="text-right py-3 text-dark-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.dailyData.slice(-10).map((row, i) => (
                  <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 text-white">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-right text-primary-400">{row.water?.toFixed(1)}</td>
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
