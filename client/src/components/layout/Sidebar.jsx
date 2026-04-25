/**
 * Sidebar Component - Main navigation for the dashboard
 * Features collapsible design, animated active states, and user info
 * Responsive: collapses to icons on mobile
 * Supports light/dark theme and i18n translations
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Brain, FileText, Bell, User, Trophy,
  ChevronLeft, ChevronRight, LogOut, Droplets, Lock, Map
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Navigation items - labels resolved via translation keys
const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/insights', icon: Brain, labelKey: 'aiInsights' },
  { path: '/reports', icon: FileText, labelKey: 'reports' },
  { path: '/alerts', icon: Bell, labelKey: 'alerts' },
  { path: '/leaderboard', icon: Trophy, labelKey: 'leaderboard' },
  { path: '/india-map', icon: Map, labelKey: 'indiaMap' },
  { path: '/profile', icon: User, labelKey: 'profile' },
];

// Admin only navigation items
const adminNavItems = [
  { path: '/admin', icon: Lock, labelKey: 'adminPanel' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Obsidian theme — consistent across light/dark
  const cls = {
    aside: 'border-white/[0.06] light:border-black/[0.06]',
    sectionBorder: 'border-white/[0.06] light:border-black/[0.06]',
    subtitle: 'text-zinc-600',
    inactiveLink: 'text-zinc-500 hover:text-primary-500 hover:bg-white/[0.04] light:hover:bg-black/[0.03]',
    adminLabel: 'text-zinc-600',
    userName: 'text-hi',
    userEmail: 'text-mid',
    logoutBtn: 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10',
    toggleBtn: 'border-white/10 hover:bg-white/[0.05] light:border-black/10 light:hover:bg-black/[0.02]',
    toggleIcon: 'text-zinc-500',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`h-screen sticky top-0 flex flex-col border-r ${cls.aside} z-40`}
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo Section */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b ${cls.sectionBorder}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#00E87A', boxShadow: '0 0 16px rgba(0,232,122,0.3)' }}>
          <Droplets className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-black tracking-[-0.03em] text-hi whitespace-nowrap">HydroGrid</h1>
              <p className={`text-[10px] ${cls.subtitle} -mt-0.5`}>{t.intelligence || 'Intelligence Platform'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
               ${isActive
                 ? 'text-white bg-primary-500 shadow-lg shadow-primary-500/20'
                 : cls.inactiveLink
               }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex-shrink-0">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ background: '#00E87A', boxShadow: '0 0 8px rgba(0,232,122,0.5)' }}
                    />
                  )}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : ''}`}
                    >
                      {t[item.labelKey] || item.labelKey}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Section - Only show if user is admin */}
        {user?.role === 'admin' && (
          <>
            <div className={`my-4 border-t ${cls.sectionBorder}`}></div>
            <div className="px-4 py-2">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p className={`text-xs font-semibold ${cls.adminLabel} uppercase tracking-wider`}>
                    {t.administration || 'Administration'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                   ${isActive
                     ? 'text-red-400 bg-red-500/10'
                     : isDark ? 'text-dark-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex-shrink-0">
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : ''}`} />
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicatorAdmin"
                          className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full"
                        />
                      )}
                    </div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-red-400' : ''}`}
                        >
                          {t[item.labelKey] || item.labelKey}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className={`px-3 py-4 border-t ${cls.sectionBorder} space-y-2`}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0" style={{ background: '#00E87A' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${cls.userName} truncate`}>{user?.name || 'User'}</p>
                <p className={`text-xs ${cls.userEmail} truncate`}>{user?.email || ''}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl ${cls.logoutBtn} transition-all duration-200`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">{t.logout || 'Logout'}</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-20 w-6 h-6 rounded-full ${cls.toggleBtn} border border-white/10 flex items-center justify-center transition-colors`}
        style={{ background: 'var(--bg-elevated)' }}
      >
        {collapsed ? (
          <ChevronRight className={`w-3 h-3 ${cls.toggleIcon}`} />
        ) : (
          <ChevronLeft className={`w-3 h-3 ${cls.toggleIcon}`} />
        )}
      </button>
    </motion.aside>
  );
}
