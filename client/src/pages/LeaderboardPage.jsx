/**
 * Leaderboard Page - Most efficient users ranking
 * Features: ranked list, medal icons, efficiency scores
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Droplets, Zap, RefreshCw } from 'lucide-react';
import { usageAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usageAPI.getLeaderboard();
      if (res.data.data && Array.isArray(res.data.data)) {
        setLeaderboard(res.data.data);
      } else {
        throw new Error('Invalid leaderboard data format');
      }
    } catch (err) {
      console.error('Fetch live leaderboard failed:', err.message);
      setError('Could not fetch live leaderboard data.');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00E87A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" />
            {t.efficiencyLeaderboard}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{t.leaderboardSubtitle}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchLeaderboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t.refreshBtn}
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm"
        >
          ℹ️ {error}
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((rank, displayIndex) => {
            const user = leaderboard[rank];
            if (!user) return null;
            const isFirst = rank === 0;
            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayIndex * 0.15 }}
                className={`rounded-2xl border border-white/[0.06] p-6 text-center ${isFirst ? 'lg:-mt-4 border-amber-500/30' : ''}`}
                style={{ background: "var(--bg-card)" }}
              >
                <span className="text-4xl">{medals[rank]}</span>
                <div className={`w-16 h-16 rounded-full mx-auto mt-3 mb-2 flex items-center justify-center text-xl font-bold text-white ${
                  isFirst ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30'
                  : rank === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                  : 'bg-gradient-to-br from-amber-600 to-amber-800'
                }`}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                <p className="text-sm text-dark-400 mt-1">{t.scoreLabel}: {user.efficiencyScore?.toFixed(4)}</p>
                <p className="text-xs text-secondary-400 mt-0.5">₹{user.totalCost?.toFixed(0)} total</p>
                {user.badges?.length > 0 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {user.badges.map((b, i) => (
                      <span key={i} className="text-lg">{b.icon}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "var(--bg-card)" }}>
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="font-semibold text-white">{t.fullRankings}</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors"
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                index < 3
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400'
                  : 'bg-white/[0.05] text-zinc-500'
              }`}>
                {index < 3 ? medals[index] : `#${index + 1}`}
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/50 to-secondary-500/50 flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-dark-400">{user.readingCount} {t.readingsLabel}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary-400 text-sm">
                    <Droplets className="w-3 h-3" />
                    {user.totalWaterValue?.toFixed(0)} L
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-secondary-400 text-sm">
                    <Zap className="w-3 h-3" />
                    {user.totalElectricityValue?.toFixed(0)} kWh
                  </div>
                </div>
              </div>

              {/* Efficiency Score */}
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user.efficiencyScore?.toFixed(4)}</p>
                <p className="text-xs text-dark-400">{t.rupeePerReading}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


