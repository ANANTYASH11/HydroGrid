/**
 * StatCard Component - Animated stat display card
 * Features: glassmorphism, animated counter, trend indicator, icon
 * Used on the Dashboard page for key metrics
 */

import { motion } from 'framer-motion';
import CountUp from 'react-countup';

/**
 * @param {string} title - Card title (e.g., "Water Usage")
 * @param {number} value - Numeric value to display
 * @param {string} suffix - Unit suffix (e.g., "L", "kWh", "$")
 * @param {string} prefix - Value prefix (e.g., "$")
 * @param {number} trend - Percentage change (positive = up, negative = down)
 * @param {React.Component} icon - Lucide icon component
 * @param {string} color - Color theme: 'blue', 'green', 'amber', 'purple'
 * @param {number} decimals - Decimal places for counter
 */
export default function StatCard({ title, value, suffix = '', prefix = '', trend, icon: Icon, color = 'blue', decimals = 0, delay = 0 }) {
  // Color theme mapping
  const colors = {
    blue: {
      bg: 'from-primary-500/20 to-primary-600/10',
      icon: 'bg-primary-500/20 text-primary-400',
      text: 'text-primary-400',
      border: 'border-primary-500/20',
    },
    green: {
      bg: 'from-secondary-500/20 to-secondary-600/10',
      icon: 'bg-secondary-500/20 text-secondary-400',
      text: 'text-secondary-400',
      border: 'border-secondary-500/20',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-600/10',
      icon: 'bg-amber-500/20 text-amber-400',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/10',
      icon: 'bg-purple-500/20 text-purple-400',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
    },
  };

  const theme = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`glass-card p-6 bg-gradient-to-br ${theme.bg} border ${theme.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Card Title */}
        <div>
          <p className="text-sm text-dark-400 font-medium">{title}</p>
        </div>
        {/* Icon */}
        {Icon && (
          <div className={`p-2.5 rounded-xl ${theme.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Animated Value */}
      <div className="mb-2">
        <span className="stat-value text-white">
          {prefix}
          <CountUp
            end={value}
            duration={2}
            decimals={decimals}
            separator=","
            delay={delay}
          />
          <span className="text-lg font-medium text-dark-400 ml-1">{suffix}</span>
        </span>
      </div>

      {/* Trend Indicator */}
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-secondary-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-dark-400">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
