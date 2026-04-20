/**
 * Leaderboard Page - Most efficient users ranking
 * Features: ranked list, medal icons, efficiency scores
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Droplets, Zap } from 'lucide-react';
import { usageAPI } from '../services/api';

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await usageAPI.getLeaderboard();
      setLeaderboard(res.data.data);
    } catch (err) {
      console.log('Using demo leaderboard');
      setLeaderboard([
        { _id: '1', name: 'Adarsh Verma', efficiencyScore: 0.0312, totalCost: 4250, totalWaterValue: 6200, totalElectricityValue: 420, badges: [{ icon: '🏆' }, { icon: '💧' }], readingCount: 2867 },
        { _id: '2', name: 'Ashish Shankar', efficiencyScore: 0.0398, totalCost: 5120, totalWaterValue: 7100, totalElectricityValue: 510, badges: [{ icon: '⚡' }], readingCount: 2571 },
        { _id: '3', name: 'Priya Sharma', efficiencyScore: 0.0423, totalCost: 5780, totalWaterValue: 7800, totalElectricityValue: 580, badges: [{ icon: '📊' }], readingCount: 2734 },
        { _id: '4', name: 'Anant Yash', efficiencyScore: 0.0456, totalCost: 6450, totalWaterValue: 8450, totalElectricityValue: 620, badges: [{ icon: '🌟' }, { icon: '💧' }, { icon: '🌿' }], readingCount: 2826 },
        { _id: '5', name: 'Demo User', efficiencyScore: 0.0512, totalCost: 7260, totalWaterValue: 9200, totalElectricityValue: 690, badges: [], readingCount: 2836 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-400" />
          Efficiency Leaderboard
        </h1>
        <p className="text-dark-400 text-sm mt-1">Most resource-efficient users ranked by cost per reading</p>
      </div>

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
                className={`glass-card p-6 text-center ${isFirst ? 'lg:-mt-4 border-amber-500/30' : ''}`}
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
                <p className="text-sm text-dark-400 mt-1">Score: {user.efficiencyScore?.toFixed(4)}</p>
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
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-700/50">
          <h3 className="font-semibold text-white">Full Rankings</h3>
        </div>
        <div className="divide-y divide-dark-700/30">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-dark-700/20 transition-colors"
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                index < 3
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400'
                  : 'bg-dark-700/50 text-dark-400'
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
                  <p className="text-xs text-dark-400">{user.readingCount} readings</p>
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
                <p className="text-xs text-dark-400">₹/reading</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
