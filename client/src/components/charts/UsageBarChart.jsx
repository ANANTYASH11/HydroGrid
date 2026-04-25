/**
 * UsageBarChart - Monthly comparison bar chart
 * Side-by-side bars for water vs electricity usage
 * Uses Recharts with custom styling
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 !rounded-lg border border-dark-600/50 shadow-xl">
      <p className="text-xs font-medium text-dark-300 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-400">{entry.name}:</span>
          <span className="font-semibold text-white">₹{(parseFloat(entry.value) || 0).toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

export default function UsageBarChart({ data = [], title = 'Monthly Cost Comparison' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-dark-400">Cost breakdown by month</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sub)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-mid)', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-mid)', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="waterCost" name="Water" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="electricityCost" name="Electricity" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
