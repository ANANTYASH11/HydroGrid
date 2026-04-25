/**
 * UsagePieChart - Donut chart for cost distribution
 * Shows the proportion of water vs electricity costs
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-card p-3 !rounded-lg border border-dark-600/50">
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <span className="text-dark-400">{payload[0].name}:</span>
        <span className="font-semibold text-white">₹{(parseFloat(payload[0].value) || 0).toFixed(0)}</span>
      </div>
    </div>
  );
}

export default function UsagePieChart({ data = [], title = 'Cost Distribution', centerLabel = '' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-dark-400">Current month breakdown</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">₹{(parseFloat(total) || 0).toFixed(0)}</p>
            <p className="text-xs text-dark-400">Total Cost</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-sm text-dark-300">{entry.name}</span>
            </div>
            <span className="text-sm font-medium text-white">₹{(parseFloat(entry.value) || 0).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
