import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, AlertCircle, TrendingUp, BarChart3, 
  Settings, Database, Server, Shield, RefreshCw, 
  Zap, Droplets, CheckCircle, Search, Filter, ArrowUpRight
} from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hydrogrid_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
      
      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers });

      if (statsRes.ok && usersRes.ok) {
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin') return null;

  const cardStyle = "bg-card border border-white/[0.05] rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group";
  const hoverEffect = "hover:border-primary-500/30 transition-all duration-300";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-primary-400 uppercase tracking-widest">Admin Control Center</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-hi tracking-tight"
          >
            System <span className="text-primary-500">Overview</span>
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-medium text-mid hover:bg-white/[0.1] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl w-fit">
        {['overview', 'users', 'system'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-96 flex items-center justify-center bg-card rounded-2xl border border-white/5"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
              <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary-500" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', val: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Active Today', val: stats.activeToday, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Telemetry Points', val: `${(stats.totalRecords / 1000).toFixed(1)}K`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'System Alerts', val: stats.activeAlerts, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' }
                  ].map((kpi, i) => (
                    <div key={i} className={`${cardStyle} ${hoverEffect}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${kpi.bg}`}>
                          <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-zinc-600" />
                      </div>
                      <p className="text-zinc-500 text-sm font-medium mb-1">{kpi.label}</p>
                      <h3 className="text-3xl font-black text-hi">{kpi.val}</h3>
                    </div>
                  ))}
                </div>

                {/* System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className={`${cardStyle} lg:col-span-2`}>
                    <h2 className="text-xl font-bold text-hi mb-6 flex items-center gap-3">
                      <Server className="w-5 h-5 text-primary-500" />
                      Services Health
                    </h2>
                    <div className="space-y-6">
                      {[
                        { name: 'Core API Server', status: 'Healthy', latency: '42ms', load: 12 },
                        { name: 'PostgreSQL Database', status: 'Synchronized', latency: '8ms', load: 5 },
                        { name: 'Supabase Auth', status: 'Operational', latency: '120ms', load: 2 }
                      ].map((svc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-12 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <div>
                              <p className="text-sm font-bold text-hi">{svc.name}</p>
                              <p className="text-xs text-zinc-500 uppercase tracking-tighter">{svc.status} • {svc.latency}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-600 font-medium mb-1">Node Load</p>
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500" style={{ width: `${svc.load}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={cardStyle}>
                    <h2 className="text-xl font-bold text-hi mb-6 flex items-center gap-3">
                      <Shield className="w-5 h-5 text-amber-500" />
                      Security Audit
                    </h2>
                    <div className="space-y-4">
                      {[
                        { label: 'JWT Tokens', status: 'Secure', icon: CheckCircle },
                        { label: 'SSL/TLS', status: 'Development', icon: AlertCircle, color: 'text-amber-400' },
                        { label: 'Bcrypt Hashing', status: 'Active', icon: CheckCircle },
                        { label: 'CORS Isolation', status: 'Restricted', icon: CheckCircle }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-sm text-zinc-400">{item.label}</span>
                          <div className="flex items-center gap-2">
                             <span className={`text-xs font-bold ${item.color || 'text-emerald-400'}`}>{item.status}</span>
                             <item.icon className={`w-4 h-4 ${item.color || 'text-emerald-500'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className={`${cardStyle} !p-0`}>
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm text-hi focus:border-primary-500/50 outline-none transition-all"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm font-medium text-zinc-400 hover:text-white transition-all">
                    <Filter className="w-4 h-4" />
                    Filter Region
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase">User Identity</th>
                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase">Privileges</th>
                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase">Geographic Region</th>
                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase">Data Points</th>
                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase">Registry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((u, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-hi">{u.name}</p>
                                <p className="text-xs text-zinc-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                              u.role === 'admin' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-400">{u.state || 'National'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Activity className="w-3.5 h-3.5 text-zinc-600" />
                              <span className="text-sm font-medium text-hi">{u.recordCount || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={cardStyle}>
                  <h3 className="text-lg font-bold text-hi mb-6 flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-400" />
                    Stack Metadata
                  </h3>
                  <div className="space-y-4">
                    {[
                      { l: 'Orchestrator', v: 'Node.js v25.4.0' },
                      { l: 'Data Store', v: 'PostgreSQL 16.2 (Supabase)' },
                      { l: 'API Framework', v: 'Express 4.21.0' },
                      { l: 'AI Inference', v: 'Groq LPU (Llama 3)' },
                      { l: 'Email Provider', v: 'Nodemailer (Gmail)' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-sm text-zinc-500">{item.l}</span>
                        <span className="text-sm font-mono text-hi">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cardStyle}>
                  <h3 className="text-lg font-bold text-hi mb-6 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Tiered Tariff Config
                  </h3>
                  <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 mb-4">
                    <p className="text-xs text-zinc-500 mb-2 font-mono uppercase">Current Global Multipliers</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-lg font-bold text-hi">₹7.50</p>
                        <p className="text-[10px] text-zinc-500">Electricity (kWh)</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-hi">₹15.00</p>
                        <p className="text-[10px] text-zinc-500">Water (1000L)</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed italic">
                    Tariff overrides for specific Indian states (Delhi, Maharashtra, Karnataka) are currently managed via the backend config. A GUI for granular state-wise tariff adjustment is scheduled for the next release.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
