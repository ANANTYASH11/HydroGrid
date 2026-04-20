/**
 * Alerts Page - View and manage threshold-based notifications
 * Features: severity filtering, mark as read, color-coded alerts
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Filter, CheckCheck, Trash2, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { alertsAPI } from '../services/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsAPI.getAlerts({ limit: 50 });
      setAlerts(res.data.data);
    } catch (err) {
      console.log('Using demo alerts');
      setAlerts([
        { _id: '1', type: 'electricity', severity: 'red', message: '🚨 Critical: Electricity usage spike detected! 85 kWh recorded (70% above threshold)', timestamp: new Date().toISOString(), read: false },
        { _id: '2', type: 'water', severity: 'yellow', message: '⚠️ Warning: Water usage (580L) is approaching your daily limit of 500L', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
        { _id: '3', type: 'water', severity: 'red', message: '🚨 Possible leak detected! Unusual water consumption pattern at 3 AM', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
        { _id: '4', type: 'system', severity: 'green', message: '✅ Great job! Your electricity usage was 15% below average this week', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
        { _id: '5', type: 'electricity', severity: 'yellow', message: '⚠️ Peak hour alert: High electricity usage detected between 6-9 PM', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
        { _id: '6', type: 'system', severity: 'green', message: '🏆 You earned the "Water Saver" badge! Congrats on reducing water usage by 20%', timestamp: new Date(Date.now() - 259200000).toISOString(), read: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await alertsAPI.markRead(id);
    } catch (err) {}
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, read: true } : a));
  };

  const handleMarkAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
    } catch (err) {}
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleDelete = async (id) => {
    try {
      await alertsAPI.deleteAlert(id);
    } catch (err) {}
    setAlerts(prev => prev.filter(a => a._id !== id));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter === 'red') return a.severity === 'red';
    if (filter === 'yellow') return a.severity === 'yellow';
    if (filter === 'green') return a.severity === 'green';
    return true;
  });

  const severityIcon = (severity) => {
    switch (severity) {
      case 'red': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'yellow': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'green': return <CheckCircle className="w-5 h-5 text-secondary-400" />;
      default: return <Info className="w-5 h-5 text-dark-400" />;
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary-400" />
            Alerts
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-sm font-medium">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-dark-400 text-sm mt-1">Manage your threshold-based notifications</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700/50 border border-dark-600/50 text-dark-300 hover:text-white transition-all text-sm"
        >
          <CheckCheck className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'red', label: '🔴 Critical' },
          { id: 'yellow', label: '🟡 Warning' },
          { id: 'green', label: '🟢 Info' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAlerts.map((alert, i) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-5 flex items-start gap-4 transition-all ${
                  !alert.read ? 'border-l-4' : ''
                } ${
                  alert.severity === 'red' ? 'border-l-red-500' :
                  alert.severity === 'yellow' ? 'border-l-amber-500' :
                  'border-l-secondary-500'
                }`}
              >
                <div className={`p-2 rounded-xl ${
                  alert.severity === 'red' ? 'bg-red-500/10' :
                  alert.severity === 'yellow' ? 'bg-amber-500/10' :
                  'bg-secondary-500/10'
                }`}>
                  {severityIcon(alert.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${alert.read ? 'text-dark-400' : 'text-white'}`}>
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`${
                      alert.severity === 'red' ? 'badge-red' :
                      alert.severity === 'yellow' ? 'badge-yellow' :
                      'badge-green'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-dark-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-dark-500 capitalize">{alert.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkRead(alert._id)}
                      className="p-2 rounded-lg text-dark-400 hover:text-secondary-400 hover:bg-secondary-500/10 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredAlerts.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Bell className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No alerts to display</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
