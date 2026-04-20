/**
 * Login Page - Authentication screen for existing users
 * Features: split-screen layout, animated illustration, form validation
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Small delay to ensure auth state updates
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login — works without backend
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Use pure client-side demo (no API call)
      const demoUser = {
        _id: 'demo_user_001',
        name: 'Anant Yash',
        email: 'anant@hydrogrid.com',
        role: 'admin',
        badges: [
          { name: 'Early Adopter', icon: '🌟', description: 'Joined HydroGrid', earnedAt: new Date() },
          { name: 'Water Saver', icon: '💧', description: 'Reduced water usage by 20%', earnedAt: new Date() },
          { name: 'Eco Warrior', icon: '🌿', description: 'Carbon neutral for a month', earnedAt: new Date() },
        ],
        settings: { waterThreshold: 500, electricityThreshold: 50, notifications: true },
        createdAt: '2025-10-15T10:30:00.000Z',
      };
      const demoToken = 'demo_token_' + Date.now();
      localStorage.setItem('hydrogrid_token', demoToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(demoUser));
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animated illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-secondary-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

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
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-2xl shadow-primary-500/30"
          >
            <Droplets className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">Welcome to HydroGrid</h2>
          <p className="text-dark-300 leading-relaxed">
            Your intelligent companion for water and electricity management.
            Track usage, save money, and reduce your environmental impact.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['AI Insights', 'Real-time Monitoring', 'Smart Alerts'].map((feature, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="px-4 py-1.5 rounded-full bg-dark-700/60 border border-dark-600/50 text-dark-300 text-sm"
              >
                {feature}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">HydroGrid</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-dark-400 mb-8">Enter your credentials to access your dashboard</p>

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
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
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
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo login button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-4 px-6 py-3 rounded-xl bg-dark-700/50 border border-dark-600/50 text-dark-300 hover:text-white hover:bg-dark-700 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Quick Demo Login
          </button>

          {/* Sign up link */}
          <p className="text-center text-dark-400 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
