/**
 * Navbar Component - Top navigation bar for the dashboard
 * Features: search bar, notification bell, theme toggle, user menu
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, X, Languages } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { alertsAPI } from '../../services/api';

export default function Navbar({ onMobileMenuToggle, mobileMenuOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const bellRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const toastTimerRef = useRef(null);
  const prevUnreadCountRef = useRef(0);
  const isInitialRenderRef = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [searchFocused, setSearchFocused] = useState(false);

  const playNotificationTone = () => {
    if (user?.settings?.notifications === false || typeof AudioContext === 'undefined') return;

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(560, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (error) {
      console.warn('Notification sound failed:', error);
    }
  };

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ visible: false, message: '' });
      toastTimerRef.current = null;
    }, 4200);
  };

  const refreshNotifications = async () => {
    if (!user) {
      setUnreadCount(0);
      setAlerts([]);
      return;
    }

    const previousCount = prevUnreadCountRef.current;
    setLoadingNotifications(true);
    try {
      const unreadRes = await alertsAPI.getAlerts({ limit: 5, read: false });
      const notifications = unreadRes.data.data || [];
      const currentCount = unreadRes.data.unreadCount ?? notifications.length;
      setAlerts(notifications);
      setUnreadCount(currentCount);
      prevUnreadCountRef.current = currentCount;

      if (!isInitialRenderRef.current && currentCount > previousCount) {
        const newAlerts = currentCount - previousCount;
        showToast(`You have ${newAlerts} new alert${newAlerts === 1 ? '' : 's'}`);
        playNotificationTone();
      }
      isInitialRenderRef.current = false;
    } catch (err) {
      console.warn('Failed to load alert count:', err?.response?.data || err.message);
      setUnreadCount(0);
      setAlerts([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [user]);

  useEffect(() => {
    if (notificationsOpen) {
      refreshNotifications();
    }
  }, [notificationsOpen]);

  useEffect(() => {
    if (!user) return undefined;
    const interval = setInterval(refreshNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleDropdownTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleDropdownTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaY) > 80 && Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
      setNotificationsOpen(false);
    } else if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setNotificationsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!alerts.length || !unreadCount) return;

    try {
      await alertsAPI.markAllRead();
      setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
      setUnreadCount(0);
      showToast('All alerts marked as read');
    } catch (err) {
      console.warn('Could not mark all notifications as read:', err?.message || err);
    }
  };

  const handleNotificationClick = async (alertId) => {
    try {
      await alertsAPI.markRead(alertId);
      setAlerts((prev) => prev.map((alert) => (alert._id === alertId ? { ...alert, read: true } : alert)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast('Opened alert');
    } catch (err) {
      console.warn('Could not mark alert as read:', err?.message || err);
    } finally {
      setNotificationsOpen(false);
      navigate('/alerts');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  return (
    <header
      className="relative sticky top-0 z-30 h-16 flex items-center justify-between px-6 backdrop-blur-xl border-b"
      style={{
        background: 'var(--bg-navbar)',
        borderBottomColor: 'var(--border-sub)',
      }}
    >
      {/* Left: Mobile menu toggle + Search */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Search bar */}
        <div className={`relative hidden sm:flex items-center transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
          <Search className={`absolute left-3 w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={t.searchPlaceholder || 'Search...'}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none transition-all focus:border-[#00E87A]/40 ${
              isDark
                ? 'text-white placeholder-zinc-600 bg-white/[0.04] border-white/[0.07]'
                : 'text-gray-800 placeholder-gray-400 bg-black/[0.04] border-black/[0.08]'
            }`}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all ${
            isDark
              ? 'border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white hover:border-white/20'
              : 'border-black/[0.08] bg-black/[0.03] text-gray-500 hover:text-gray-900 hover:border-black/20'
          }`}
          title="Toggle Theme"
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

        {/* Language Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleLanguage}
          className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 ${
            isDark
              ? 'border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white hover:border-white/20'
              : 'border-black/[0.08] bg-black/[0.03] text-gray-500 hover:text-gray-900 hover:border-black/20'
          }`}
          title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
        >
          <Languages className="w-4 h-4" />
          <span className="text-[10px] font-semibold uppercase">{language}</span>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotificationsOpen((prev) => !prev)}
            title="Open notifications"
            className={`relative p-2.5 rounded-xl border transition-all ${
              isDark
                ? 'border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white hover:border-white/20'
                : 'border-black/[0.08] bg-black/[0.03] text-gray-500 hover:text-gray-900 hover:border-black/20'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full pulse-glow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                onTouchStart={handleDropdownTouchStart}
                onTouchEnd={handleDropdownTouchEnd}
                className="absolute right-0 mt-3 w-80 border shadow-2xl rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-sub)',
                }}
              >
                <div className="px-4 py-3 border-b" style={{
                  background: 'var(--bg-base)',
                  borderBottomColor: 'var(--border-sub)',
                }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.notifications || 'Notifications'}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {loadingNotifications ? 'Refreshing...' : `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-white/[0.05] text-zinc-500">
                      Swipe to dismiss
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={refreshNotifications}
                      className="text-xs py-1 px-2 rounded-lg transition text-zinc-400 hover:text-white bg-white/[0.04]"
                    >
                      {t.refresh || 'Refresh'}
                    </button>
                    <button
                      onClick={handleMarkAllRead}
                      disabled={!unreadCount}
                      className={`text-xs font-semibold py-1 px-2 rounded-lg transition ${unreadCount ? 'text-black' : 'bg-white/[0.04] text-zinc-600 cursor-not-allowed'}`}
                      style={unreadCount ? { background: '#00E87A' } : {}}
                    >
                      {t.markAllRead || 'Mark all read'}
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00E87A', borderTopColor: 'transparent' }} />
                    </div>
                  ) : alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                      <button
                        key={alert._id || index}
                        onClick={() => handleNotificationClick(alert._id)}
                        className={`w-full text-left px-4 py-3 border-b transition-colors ${
                          isDark ? 'border-white/[0.04] hover:bg-white/[0.03]' : 'border-black/[0.04] hover:bg-black/[0.02]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm font-semibold line-clamp-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{alert.message}</p>
                            <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{new Date(alert.timestamp).toLocaleString()}</p>
                          </div>
                          <span className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-full ${
                            alert.severity === 'red' ? 'bg-red-600 text-white' : alert.severity === 'yellow' ? 'bg-amber-600 text-white' : 'bg-secondary-600 text-white'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        {!alert.read && (
                          <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-secondary-300">
                            <span className="inline-block w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
                            New alert
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-zinc-500">{t.noNotifications || 'No new notifications. Great work staying ahead!'}</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t flex items-center justify-between"
                  style={{ background: 'var(--bg-base)', borderTopColor: 'var(--border-sub)' }}>
                  <span className={`text-xs ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{t.latestAlerts || 'Latest alerts are shown here for quick review.'}</span>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/alerts');
                    }}
                    className="text-xs hover:text-white transition-colors"
                    style={{ color: '#00E87A' }}
                  >
                    View all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {toast.visible && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={`absolute right-0 top-full mt-3 w-72 rounded-2xl border shadow-2xl px-4 py-3 text-sm z-50 ${isDark ? 'text-white' : 'text-gray-800'}`}
                style={{ background: isDark ? 'rgba(10,11,18,0.97)' : 'rgba(255,253,247,0.98)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className={`flex items-center gap-3 pl-3 border-l ${isDark ? 'border-white/[0.06]' : 'border-black/[0.08]'}`}>
          <div className="hidden sm:block text-right">
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</p>
            <p className={`text-xs capitalize ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{user?.role || 'user'}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-black" style={{ background: '#00E87A', boxShadow: '0 0 14px rgba(0,232,122,0.25)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
