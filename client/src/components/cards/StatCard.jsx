import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown as TrendDown } from 'lucide-react';

/* Color meta per theme */
const COLOR_META = {
  blue: {
    grad:       'from-blue-500/20 to-blue-600/8',
    border:     'border-blue-500/20',
    iconBg:     'bg-blue-500/15',
    iconText:   'text-blue-400',
    valueText:  'text-blue-300',
    glow:       'stat-card-water',
    iconAnim:   'animate-water-icon',
    ripples:    true,
    textGlow:   'text-glow-blue',
  },
  green: {
    grad:       'from-emerald-500/20 to-emerald-600/8',
    border:     'border-emerald-500/20',
    iconBg:     'bg-emerald-500/15',
    iconText:   'text-emerald-400',
    valueText:  'text-emerald-300',
    glow:       'stat-card-savings',
    iconAnim:   '',
    ripples:    false,
    textGlow:   'text-glow-green',
  },
  amber: {
    grad:       'from-amber-500/20 to-amber-600/8',
    border:     'border-amber-500/20',
    iconBg:     'bg-amber-500/15',
    iconText:   'text-amber-400',
    valueText:  'text-amber-300',
    glow:       'stat-card-electricity',
    iconAnim:   'animate-electricity-icon',
    ripples:    false,
    textGlow:   'text-glow-amber',
  },
  purple: {
    grad:       'from-violet-500/20 to-violet-600/8',
    border:     'border-violet-500/20',
    iconBg:     'bg-violet-500/15',
    iconText:   'text-violet-400',
    valueText:  'text-violet-300',
    glow:       '',
    iconAnim:   '',
    ripples:    false,
    textGlow:   '',
  },
};

export default function StatCard({ title, value, suffix = '', prefix = '', trend, icon: Icon, color = 'blue', decimals = 0, delay = 0 }) {
  const meta = COLOR_META[color] || COLOR_META.blue;
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.25 } }}
      className={`glass-card p-6 bg-gradient-to-br ${meta.grad} border ${meta.border} ${meta.glow} relative overflow-hidden`}
    >
      {/* Subtle shimmer line top */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${color === 'blue' ? 'blue' : color === 'amber' ? 'amber' : color === 'green' ? 'emerald' : 'violet'}-400/40 to-transparent`} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-dark-400 leading-tight max-w-[120px]">{title}</p>

        {/* Icon with optional ripple rings */}
        {Icon && (
          <div className="relative flex-shrink-0">
            <div className={`relative z-10 p-2.5 rounded-xl ${meta.iconBg}`}>
              <Icon className={`w-5 h-5 ${meta.iconText} ${meta.iconAnim}`} />
            </div>
            {meta.ripples && (
              <>
                <div className="ripple-ring-1" style={{ inset: '-8px', borderWidth: '1.5px' }} />
                <div className="ripple-ring-2" style={{ inset: '-8px', borderWidth: '1.5px' }} />
                <div className="ripple-ring-3" style={{ inset: '-8px', borderWidth: '1.5px' }} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Animated value */}
      <div className="mb-3">
        <div className={`stat-value ${meta.valueText} ${meta.textGlow}`}>
          {prefix}
          <CountUp end={value} duration={2.5} decimals={decimals} separator="," delay={delay} enableScrollSpy scrollSpyOnce />
          <span className={`text-base font-medium ml-1 text-dark-400`}>{suffix}</span>
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {trendUp
            ? <TrendingUp  className="w-3.5 h-3.5 text-emerald-400" />
            : <TrendDown   className="w-3.5 h-3.5 text-red-400" />}
          <span className={`text-sm font-semibold ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{(parseFloat(Math.abs(trend)) || 0).toFixed(1)}%
          </span>
          <span className="text-xs text-dark-500">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
