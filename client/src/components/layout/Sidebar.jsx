/**
 * Sidebar Component - Main navigation for the dashboard
 * Features collapsible design, animated active states, and user info
 * Responsive: collapses to icons on mobile
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Brain, FileText, Bell, User, Trophy,
  ChevronLeft, ChevronRight, LogOut, Droplets, Zap, Settings, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Navigation items configuration
const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/insights', icon: Brain, label: 'AI Insights' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/profile', icon: User, label: 'Profile' },
];

// Admin only navigation items
const adminNavItems = [
  { path: '/admin', icon: Lock, label: 'Admin Panel' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 z-40"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-dark-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold gradient-text whitespace-nowrap">HydroGrid</h1>
              <p className="text-[10px] text-dark-400 -mt-0.5">Intelligence Platform</p>
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
                 ? 'text-primary-400 bg-primary-500/10'
                 : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
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
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                    />
                  )}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-primary-400' : ''}`}
                    >
                      {item.label}
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
            <div className="my-4 border-t border-dark-700/50"></div>
            <div className="px-4 py-2">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Administration
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
                     : 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
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
                          {item.label}
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
      <div className="px-3 py-4 border-t border-dark-700/50 space-y-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-dark-400 truncate">{user?.email || ''}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center hover:bg-dark-600 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-dark-300" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-dark-300" />
        )}
      </button>
    </motion.aside>
  );
}
