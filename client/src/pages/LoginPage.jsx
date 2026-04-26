/**
 * Login Page - Authentication screen for existing users
 * Features: split-screen layout, animated illustration, form validation, Google OAuth
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, token, navigate]);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    // Clear any stale fake tokens created by the old demo-login fallback
    const storedToken = localStorage.getItem('hydrogrid_token');
    const storedEmail = localStorage.getItem('hydrogrid_last_email');
    if (storedToken && storedToken.startsWith('demo_token_')) {
      localStorage.removeItem('hydrogrid_token');
      localStorage.removeItem('hydrogrid_user');
    }
    // Clear fake auto-generated emails (contain @hydrogrid.local)
    if (storedEmail && storedEmail.includes('@hydrogrid.local')) {
      localStorage.removeItem('hydrogrid_last_email');
    } else if (storedEmail) {
      setEmail(storedEmail);
    }
    const lastState = localStorage.getItem('hydrogrid_last_state');
    if (lastState) {
      setState(lastState);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Starting login process...');
      const result = await login({ email, password });
      console.log('✅ Login result:', result);
      
        setTimeout(() => {
          if (result.role === 'admin') {
            console.log('🛡️ Admin logged in, redirecting to admin panel');
            navigate('/admin');
          } else {
            console.log('✅ User logged in, redirecting to dashboard');
            navigate('/dashboard');
          }
        }, 100);
      } else {
        throw new Error('No user returned from login');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  // Quick demo login — fills the form with real credentials and submits
  const handleQuickFill = (type) => {
    if (type === 'admin') {
      setEmail('anantyash21@gmail.com');
      setPassword('Anant@123');
      setState('Maharashtra');
    } else {
      setEmail('demo@hydrogrid.com');
      setPassword('demo123');
      setState('Delhi');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left side - Animated illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #07070C, #0A0B10, #07070C)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(0,232,122,0.08)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(255,149,0,0.06)', animationDelay: '1.5s' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center max-w-md"
        >
          {/* Floating icons */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: '#00E87A' }}
          >
            <Droplets className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">{t.welcomeToHydrogrid}</h2>
          <p className="text-zinc-400 leading-relaxed">
            {t.intelligentCompanion}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['AI Insights', 'Real-time Monitoring', 'Smart Alerts'].map((feature, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="px-4 py-1.5 rounded-full border text-zinc-400 text-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: "var(--border-sub)" }}
              >
                {feature}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg-base)' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-\[#00E87A\] flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-black text-white">HydroGrid</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-hi)' }}>{t.signIn}</h1>
          <p className="mb-8" style={{ color: 'var(--text-mid)' }}>{t.enterCredentials}</p>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field !pl-11 !pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">State (for data training)</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-field w-full text-white"
              >
                <option value="">Select your state</option>
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5" style={{ background: "#00E87A", boxShadow: "0 6px 24px rgba(0,232,122,0.22)" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{t.signIn} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Quick-fill credential buttons */}
          <div className="space-y-2">
            <p className="text-center text-zinc-600 text-xs uppercase tracking-widest">Quick Fill</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ color: '#00E87A', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.25)' }}
              >
                <Zap className="w-3.5 h-3.5" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('user')}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-secondary-600/20 hover:bg-secondary-600/30 border border-secondary-500/30 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ color: "#FF9500", background: "rgba(255,149,0,0.08)", borderColor: "rgba(255,149,0,0.2)" }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                User Demo
              </button>
            </div>
            <p className="text-center text-zinc-600 text-xs">Click to fill credentials, then press Sign In</p>
          </div>

          {/* Sign up link */}
          <p className="text-center text-zinc-500 text-sm mt-8">
            {t.dontHaveAccount}{' '}
            <Link to="/signup" className="font-medium transition-colors hover:opacity-80" style={{ color: '#00E87A' }}>
              {t.createOne}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

