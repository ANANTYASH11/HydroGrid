/**
 * Landing Page - The first impression of HydroGrid
 * Features: Hero with animated gradient, feature cards with glassmorphism,
 * animated counters, and a CTA section
 * This page is publicly accessible (no auth required)
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  Droplets, Zap, Brain, BarChart3, Shield, Bell,
  ArrowRight, CheckCircle, Globe, Leaf, TrendingDown, Sparkles
} from 'lucide-react';

// Feature cards data
const features = [
  {
    icon: BarChart3,
    title: 'Smart Dashboard',
    description: 'Real-time interactive charts with daily, weekly, and monthly comparisons.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Predict future consumption and detect anomalies using ML algorithms.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Threshold-based alerts with color-coded severity for instant awareness.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'JWT authentication with role-based access control for data security.',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    icon: TrendingDown,
    title: 'Cost Savings',
    description: 'Track and optimize your resource consumption to reduce monthly bills.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Leaf,
    title: 'Carbon Footprint',
    description: 'Estimate your environmental impact and earn sustainability badges.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

// Stats data
const stats = [
  { value: 10000, suffix: '+', label: 'Active Users' },
  { value: 2.5, suffix: 'M', label: 'Readings Tracked', decimals: 1 },
  { value: 28, suffix: 'L', label: 'Saved in Costs (₹)', prefix: '₹' },
  { value: 99.9, suffix: '%', label: 'Uptime', decimals: 1 },
];

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      {/* ==================== NAVIGATION ==================== */}
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HydroGrid</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-dark-300 hover:text-white transition-colors">Features</a>
            <a href="#stats" className="text-sm text-dark-300 hover:text-white transition-colors">Stats</a>
            <a href="#how-it-works" className="text-sm text-dark-300 hover:text-white transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary !py-2 !px-5 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-20 px-6 grid-pattern">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Resource Intelligence
            </motion.div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Smart </span>
              <span className="gradient-text">Water & Energy</span>
              <br />
              <span className="text-white">Intelligence</span>
            </h1>

            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track, analyze, and optimize your water and electricity consumption with 
              AI-powered insights, predictive analytics, and real-time monitoring.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg !px-8 !py-4">
                View Demo Dashboard
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-12 text-dark-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary-500" />
                <span className="text-sm">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary-500" />
                <span className="text-sm">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary-500" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="glass-card p-4 gradient-border">
              <div className="bg-dark-800 rounded-xl p-6 space-y-4">
                {/* Mock dashboard header */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="flex-1 bg-dark-700 h-6 rounded-lg ml-4" />
                </div>
                {/* Mock stat cards */}
                <div className="grid grid-cols-4 gap-3">
                  {['💧 Water', '⚡ Energy', '💰 Savings', '🌱 Carbon'].map((label, i) => (
                    <div key={i} className="bg-dark-700/60 rounded-lg p-4">
                      <p className="text-xs text-dark-400">{label}</p>
                      <div className="h-2 bg-dark-600 rounded mt-2 w-3/4" />
                      <div className="h-1.5 bg-dark-600 rounded mt-1.5 w-1/2" />
                    </div>
                  ))}
                </div>
                {/* Mock chart */}
                <div className="bg-dark-700/60 rounded-lg p-4 h-48 flex items-end gap-1">
                  {Array.from({ length: 24 }, (_, i) => {
                    const height = 20 + Math.sin(i / 3) * 30 + Math.random() * 40;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-600 to-primary-400"
                        style={{ height: `${height}%`, opacity: 0.5 + Math.random() * 0.5 }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Everything you need to monitor, analyze, and optimize your resource consumption
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section id="stats" className="py-20 px-6 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.prefix}
                  <CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} enableScrollSpy scrollSpyOnce />
                  {stat.suffix}
                </div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Sign up and connect your meters or use our IoT simulator to start tracking.', icon: Globe },
              { step: '02', title: 'Analyze', desc: 'Our AI analyzes your consumption patterns and detects anomalies automatically.', icon: Brain },
              { step: '03', title: 'Optimize', desc: 'Get personalized recommendations to reduce costs and carbon footprint.', icon: Leaf },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-dark-400 text-sm max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get <span className="gradient-text">Started?</span>
              </h2>
              <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users who are already saving money and reducing their environmental impact.
              </p>
              <Link to="/signup" className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-dark-700/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Team Credits */}
          <div className="text-center mb-8">
            <p className="text-dark-400 text-sm mb-3">Built by</p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { name: 'Anant Yash', role: 'Project Lead' },
                { name: 'Adarsh Verma', role: 'Backend Developer' },
                { name: 'Ashish Shankar', role: 'Frontend Developer' },
              ].map((member, i) => (
                <div key={i} className="text-center">
                  <p className="text-white font-medium text-sm">{member.name}</p>
                  <p className="text-dark-500 text-xs">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-dark-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">HydroGrid</span>
            </div>
            <p className="text-dark-400 text-sm">
              © {new Date().getFullYear()} HydroGrid. Built with ♥ in India for a sustainable future.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-dark-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-dark-400 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-dark-400 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
