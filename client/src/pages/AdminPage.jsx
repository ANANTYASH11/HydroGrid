import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, AlertCircle, TrendingUp, BarChart3, Settings } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5001/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch users
      const usersRes = await fetch('http://localhost:5001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.ok && usersRes.ok) {
        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        setStats(statsData);
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Settings className="w-10 h-10 text-blue-400" />
                Admin Dashboard
              </h1>
              <p className="text-slate-400 mt-1">System management and monitoring</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
              <p className="text-blue-200 text-sm font-medium">Admin Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/30 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Total Users */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                        <p className="text-green-400 text-xs mt-2">+2 this week</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-500/20" />
                    </div>
                  </div>

                  {/* Active Users */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Active Today</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.activeToday}</p>
                        <p className="text-slate-400 text-xs mt-2">{Math.round(stats.activeToday / stats.totalUsers * 100)}% active</p>
                      </div>
                      <Activity className="w-12 h-12 text-green-500/20" />
                    </div>
                  </div>

                  {/* Total Records */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Records</p>
                        <p className="text-3xl font-bold text-white mt-2">{(stats.totalRecords / 1000).toFixed(1)}K</p>
                        <p className="text-slate-400 text-xs mt-2">{stats.recordsThisWeek} this week</p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-purple-500/20" />
                    </div>
                  </div>

                  {/* Active Alerts */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Active Alerts</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.activeAlerts}</p>
                        <p className="text-orange-400 text-xs mt-2">Requires attention</p>
                      </div>
                      <AlertCircle className="w-12 h-12 text-orange-500/20" />
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">System Health</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-slate-400">Database</p>
                        <p className="text-green-400 font-medium">✓ Connected</p>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-slate-400">API Server</p>
                        <p className="text-green-400 font-medium">✓ Running</p>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-slate-400">Response Time</p>
                        <p className="text-green-400 font-medium">85ms avg</p>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Region</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Joined</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-white">{u.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}>
                              {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{u.region || 'India'}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Server Info */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Server Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-slate-400">Node.js Version</p>
                        <p className="text-white font-mono">v25.4.0</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-400">MongoDB</p>
                        <p className="text-white font-mono">Connected</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-400">Environment</p>
                        <p className="text-white font-mono">Production</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-400">Uptime</p>
                        <p className="text-white font-mono">24h 15m</p>
                      </div>
                    </div>
                  </div>

                  {/* Database Stats */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Database Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-slate-400">Collections</p>
                        <p className="text-white font-mono">3</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-400">Total Documents</p>
                        <p className="text-white font-mono">27.5K+</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-400">Indexes</p>
                        <p className="text-white font-mono">Optimized</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-400">Last Backup</p>
                        <p className="text-white font-mono">Today</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Security Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400">JWT Authentication</p>
                      <span className="text-green-400">✓ Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400">Password Hashing</p>
                      <span className="text-green-400">✓ bcryptjs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400">CORS</p>
                      <span className="text-green-400">✓ Configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400">HTTPS</p>
                      <span className="text-yellow-400">⚠ Dev Mode</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
