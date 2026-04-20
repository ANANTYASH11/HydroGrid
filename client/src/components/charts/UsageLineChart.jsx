/**
 * UsageLineChart - Interactive line chart for daily usage trends
 * Uses Recharts with gradient fills, custom tooltips, and smooth curves
 * Supports both water and electricity data overlaid
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

/**
 * Custom tooltip component for the chart
 * Shows formatted values with icons
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass-card p-3 !rounded-lg border border-dark-600/50 shadow-xl">
      <p className="text-xs font-medium text-dark-300 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-400">{entry.name}:</span>
          <span className="font-semibold text-white">
            {entry.value?.toFixed(1)} {entry.name === 'Water' ? 'L' : 'kWh'}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * @param {Array} data - Chart data with date, water, electricity fields
 * @param {string} title - Chart title
 */
export default function UsageLineChart({ data = [], title = 'Usage Trends' }) {
  // Format data for display
  const chartData = data.map(d => {
    // If the date is a short label (Mon, Tue, etc.) or not a valid date string, use it directly
    const parsed = d.date ? new Date(d.date) : null;
    const isValidDate = parsed && !isNaN(parsed.getTime()) && d.date.length > 3;
    return {
      ...d,
      date: isValidDate
        ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.name || d.date || '',
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-dark-400">Last 7 days overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-xs text-dark-400">Water</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary-500" />
            <span className="text-xs text-dark-400">Electricity</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            {/* Gradient fill for water line */}
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            {/* Gradient fill for electricity line */}
            <linearGradient id="electricityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="water"
            name="Water"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#waterGradient)"
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="electricity"
            name="Electricity"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#electricityGradient)"
            dot={false}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
