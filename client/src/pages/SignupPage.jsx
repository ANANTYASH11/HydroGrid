/**
 * Signup Page - Registration screen for new users
 * Features: form validation, password strength indicator, animated layout, Google OAuth, state selection
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SignupPage() {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Calculate password strength and validation
  const passwordValidation = pas
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password, state });
      if (state) localStorage.setItem('hydrogrid_last_state', state);
      // Small delay to ensure auth state updates
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(
        serverMessage.includes('Email already registered')
          ? 'That email is already registered. Please sign in instead.'
          : serverMessage
      );atch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      const serverErrors = err.response?.data?.errors || [];
      
      // Display first error from server, or full message
      if (serverErrors.length > 0) {
        setError(serverErrors[0]);
      } else if (serverMessage.includes('Email already registered')) {
        setError('That email is already registered. Please sign in instead.');
      } else {
        setError(serverMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-\[#07070C\]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-\[#00E87A\] flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-black text-white">HydroGrid</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-zinc-500 mb-8">Start your journey to smarter resource management</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="signup-email"
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
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength >= level ? strengthColors[strength] : 'bg-white/\[0.05\]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Password strength: <span className="font-medium">{strengthLabels[strength]}</span>
                  </p>
                </className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-xs font-medium text-green-400">Strong password!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">State (for data training)</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-field w-full bg-white/\[0.05\] text-white"
                required
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
              disabled={loading || !name || !email || !isPasswordValid || !state}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>



          <p className="text-center text-zinc-500 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="\text-\[#00E87A\] hover:\text-\[#00E87A\] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-\[#07070C\] via-\[#0A0B10\] to-\[#07070C\] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-\[rgba\(255,149,0,0\.06\)\] rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-\[rgba\(0,232,122,0\.08\)\] rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-md"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Why HydroGrid?</h2>
          <div className="space-y-4">
            {[
              'AI-powered consumption predictions',
              'Real-time anomaly detection',
              'Detailed cost analysis & reports',
              'Carbon footprint tracking',
              'Gamification wit}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                <span className="text-zinc-400">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

