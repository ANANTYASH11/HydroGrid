/**
 * HydroGrid Server - Main Entry Point
 * Express.js server with MongoDB connection, REST API routes,
 * CORS configuration, and global error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./routes/auth');
const usageRoutes = require('./routes/usage');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON request bodies (with 10mb limit for bulk data)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ==================== API ROUTES ====================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HydroGrid Smart Water & Electricity Intelligence Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      usage: '/api/usage',
      alerts: '/api/alerts',
      reports: '/api/reports',
      admin: '/api/admin',
      ai: {
        anomalies: '/api/ai/detect-anomalies',
        forecast: '/api/ai/predict-next-30-days',
        recommendations: '/api/ai/recommendations',
        devices: '/api/ai/device-breakdown',
        analytics: '/api/ai/analytics',
        chat: '/api/ai/query'
      }
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HydroGrid API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);      // Authentication routes
app.use('/api/usage', usageRoutes);    // Usage data routes
app.use('/api/alerts', alertRoutes);   // Alert routes
app.use('/api/reports', reportRoutes); // Report routes
app.use('/api/admin', adminRoutes);    // Admin routes
app.use('/api/ai', aiRoutes);          // AI/ML routes (anomalies, forecasting, recommendations)

// ==================== ERROR HANDLING ====================

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🌊⚡ HydroGrid API Server                   ║
  ║   Running on http://localhost:${PORT}            ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
