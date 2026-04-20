/**
 * Profile Page - User profile management and settings
 * Features: profile editing, badges display, settings with IST timezone & ₹ currency
 * Configured for Indian locale
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Award, Settings, Save, Camera, Clock, Globe, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Settings state - Indian defaults
  const [settings, setSettings] = useState({
    waterThreshold: user?.settings?.waterThreshold || 500,
    electricityThreshold: user?.settings?.electricityThreshold || 50,
    notifications: user?.settings?.notifications !== false,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en-IN',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name });
      updateUser(res.data.data);
      setEditing(false);
    } catch (err) {
      updateUser({ ...user, name });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ settings });
      updateUser(res.data.data);
    } catch (err) {
      updateUser({ ...user, settings });
    } finally {
      setSaving(false);
    }
  };

  // Default badges if user has none
  const badges = user?.badges?.length > 0 ? user.badges : [
    { name: 'Early Adopter', icon: '🌟', description: 'Joined HydroGrid platform', earnedAt: new Date() },
    { name: 'First Reading', icon: '📊', description: 'Logged your first meter reading', earnedAt: new Date() },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <User className="w-7 h-7 text-primary-400" />
          Profile
        </h1>
        <p className="text-dark-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'badges', label: 'Badges', icon: Award },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                ) : (
                  <p className="text-lg font-semibold text-white">{user?.name || 'User'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-dark-400" />
                  <p className="text-white">{user?.email || 'user@example.com'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Role</label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-dark-400" />
                    <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium capitalize">
                      {user?.role || 'user'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Timezone</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-dark-400" />
                    <span className="text-white text-sm">IST (UTC+05:30)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Currency</label>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-dark-400" />
                    <span className="text-white text-sm">₹ INR (Indian Rupee)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Locale</label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-dark-400" />
                    <span className="text-white text-sm">🇮🇳 India (en-IN)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Member Since</label>
                <p className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                {editing ? (
                  <>
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary !py-2 flex items-center gap-2">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setName(user?.name || ''); }} className="btn-secondary !py-2">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-primary !py-2">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 flex items-center gap-4"
              >
                <span className="text-4xl">{badge.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{badge.name}</h3>
                  <p className="text-sm text-dark-400">{badge.description}</p>
                  <p className="text-xs text-dark-500 mt-1">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Locked badges */}
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">🔒 Badges to Earn</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Carbon Neutral', icon: '🌍', description: 'Offset 100% of your carbon footprint' },
              { name: 'Power Saver', icon: '⚡', description: 'Reduce electricity usage by 30%' },
              { name: 'Streak Master', icon: '🔥', description: 'Log data for 90 consecutive days' },
              { name: 'Community Leader', icon: '👑', description: 'Reach #1 on the leaderboard' },
            ].map((badge, i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4 opacity-50">
                <span className="text-4xl grayscale">{badge.icon}</span>
                <div>
                  <h3 className="font-semibold text-dark-400">{badge.name}</h3>
                  <p className="text-sm text-dark-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 space-y-6">
          {/* Locale Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-400" /> Regional Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="input-field"
                >
                  <option value="Asia/Kolkata">🇮🇳 IST — India (UTC+05:30)</option>
                  <option value="Asia/Dubai">🇦🇪 GST — Dubai (UTC+04:00)</option>
                  <option value="Asia/Singapore">🇸🇬 SGT — Singapore (UTC+08:00)</option>
                  <option value="America/New_York">🇺🇸 EST — New York (UTC-05:00)</option>
                  <option value="Europe/London">🇬🇧 GMT — London (UTC+00:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="input-field"
                >
                  <option value="INR">₹ INR — Indian Rupee</option>
                  <option value="USD">$ USD — US Dollar</option>
                  <option value="EUR">€ EUR — Euro</option>
                  <option value="GBP">£ GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="input-field"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Alert Thresholds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Water Threshold (L/day)</label>
                <input
                  type="number"
                  value={settings.waterThreshold}
                  onChange={(e) => setSettings({ ...settings, waterThreshold: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Electricity Threshold (kWh/day)</label>
                <input
                  type="number"
                  value={settings.electricityThreshold}
                  onChange={(e) => setSettings({ ...settings, electricityThreshold: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Utility Rates */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary-400" /> Utility Rates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-4 bg-dark-700/30">
                <p className="text-sm text-dark-400 mb-1">💧 Water Rate</p>
                <p className="text-xl font-bold text-primary-400">₹0.05 <span className="text-sm font-normal text-dark-400">/liter</span></p>
              </div>
              <div className="glass-card p-4 bg-dark-700/30">
                <p className="text-sm text-dark-400 mb-1">⚡ Electricity Rate</p>
                <p className="text-xl font-bold text-secondary-400">₹8.00 <span className="text-sm font-normal text-dark-400">/kWh</span></p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.notifications ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-dark-300">Enable push notifications</span>
            </label>
          </div>

          <button onClick={handleSaveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
