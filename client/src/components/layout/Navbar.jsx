/**
 * Navbar Component - Top navigation bar for the dashboard
 * Features: search bar, notification bell, theme toggle, user menu
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { alertsAPI } from '../../services/api';

export default function Navbar({ onMobileMenuToggle, mobileMenuOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch unread alert count on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await alertsAPI.getAlerts({ limit: 1 });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // Silently fail - alerts are not critical
      }
    };
    fetchAlerts();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      {/* Left: Mobile menu toggle + Search */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Search bar */}
        <div className={`relative hidden sm:flex items-center transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
          <Search className="absolute left-3 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search anything..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800/60 border border-dark-700/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-dark-400 hover:text-white hover:border-dark-600 transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-dark-400 hover:text-white hover:border-dark-600 transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full pulse-glow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-dark-700/50">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-dark-400 capitalize">{user?.role || 'user'}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary-500/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
