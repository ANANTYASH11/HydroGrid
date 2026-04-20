/**
 * App.jsx - Root Application Component
 * Sets up routing, context providers (Auth, Theme), and page layout
 * Routes: Landing, Login, Signup, Dashboard (with nested pages)
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Protected Pages (inside DashboardLayout)
import Dashboard from './pages/Dashboard';
import InsightsPage from './pages/InsightsPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';

/**
 * Main App component
 * Wraps entire app in AuthProvider and ThemeProvider for global state
 * Uses React Router for client-side navigation
 */
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* ============ PUBLIC ROUTES ============ */}
            {/* Landing page - home page for unauthenticated users */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Authentication pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* ============ PROTECTED ROUTES ============ */}
            {/* DashboardLayout handles auth check and redirects to /login if not authenticated */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Catch-all: redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
