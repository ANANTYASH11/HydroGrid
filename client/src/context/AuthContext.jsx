/**
 * Authentication Context
 * Provides auth state (user, token, loading) and methods (login, register, logout)
 * to all components via React Context API
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// Create the auth context
const AuthContext = createContext(null);

// Client-side demo storage (when backend is unavailable)
const demoStorage = {};
const DEMO_USERS_KEY = 'hydrogrid_demo_users';

function loadDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function upsertDemoUser(email, payload) {
  const users = loadDemoUsers();
  users[email] = {
    ...(users[email] || {}),
    ...payload,
    email,
  };
  saveDemoUsers(users);
  demoStorage[email] = users[email];
}

/**
 * AuthProvider - Wraps the app and provides authentication state
 * Initializes from localStorage on mount, handles login/register/logout
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hydrogrid_token');
    localStorage.removeItem('hydrogrid_user');
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('hydrogrid_token');
    const storedUser = localStorage.getItem('hydrogrid_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('hydrogrid_token');
        localStorage.removeItem('hydrogrid_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Register a new user account
   * @param {Object} userData - { name, email, password }
   */
  const register = useCallback(async (userData) => {
    const normalizedEmail = userData.email.trim().toLowerCase();

    try {
      console.log('� Registering user:', normalizedEmail);
      const response = await authAPI.register({
        ...userData,
        email: normalizedEmail,
        state: userData.state || 'Unknown',
      });
      console.log('✅ Register response:', response.data);
      const { data, token: newToken } = response.data;

      localStorage.setItem('hydrogrid_token', newToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(data));
      localStorage.setItem('hydrogrid_last_email', normalizedEmail);
      
      setToken(newToken);
      setUser(data);
      console.log('✅ Auth state updated');

      return data;
    } catch (error) {
      console.error('❌ Register failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);

      // For registration, also don't fall back to demo storage
      // If the backend is unavailable, registration should fail properly
      throw error;
    }
  }, []);

  /**
   * Login with existing credentials
   * @param {Object} credentials - { email, password }
   */
  const login = useCallback(async (credentials) => {
    console.log('� LOGIN FUNCTION CALLED with credentials:', { email: credentials.email, hasPassword: !!credentials.password });
    const normalizedEmail = credentials.email.trim().toLowerCase();

    try {
      console.log('� Logging in user:', normalizedEmail);
      console.log('� API URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
      console.log('� Making API call to authAPI.login...');
      const response = await authAPI.login({ ...credentials, email: normalizedEmail });
      console.log('✅ Login API call successful, response:', response.data);
      const { data, token: newToken } = response.data;

      // Save to localStorage FIRST (important for persistence)
      localStorage.setItem('hydrogrid_token', newToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(data));
      localStorage.setItem('hydrogrid_last_email', normalizedEmail);

      // Keep a local credential mirror for "remembered" login behavior.
      upsertDemoUser(normalizedEmail, {
        _id: data._id,
        name: data.name,
        role: data.role || 'user',
        settings: data.settings || {},
        badges: data.badges || [],
        createdAt: data.createdAt || new Date(),
        password: credentials.password,
      });
      
      // Update state (will trigger re-render and cause redirect via useEffect)
      setToken(newToken);
      setUser(data);
      console.log('✅ Auth state updated with token:', newToken);

      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);

      // Clear auth state on failed login
      clearSession();

      // For login, we should NOT fall back to demo storage
      // If the backend is unavailable, the user should know about it
      throw error;
    }
  }, [clearSession]);

  /**
   * Login with Google OAuth
   * @param {Object} googleData - { token, state }
   */
  const googleLogin = useCallback(async (googleData) => {
    try {
      console.log('� Google authentication:', googleData.state);
      const response = await authAPI.googleAuth({
        token: googleData.token,
        state: googleData.state || 'Unknown',
      });
      console.log('✅ Google auth response:', response.data);
      const { data, token: newToken } = response.data;

      // Save to localStorage
      localStorage.setItem('hydrogrid_token', newToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(data));
      localStorage.setItem('hydrogrid_last_email', data.email);
      if (googleData.state) {
        localStorage.setItem('hydrogrid_last_state', googleData.state);
      }

      // Update state
      setToken(newToken);
      setUser(data);
      console.log('✅ Google auth successful');

      return data;
    } catch (error) {
      console.error('❌ Google auth failed:', error.response?.data || error.message);
      throw error;
    }
  }, [clearSession]);

  /**
   * Logout - Clear all auth state and storage
   */
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /**
   * Update the user profile data in state and localStorage
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hydrogrid_user', JSON.stringify(updatedUser));
  }, []);

  // The context value exposed to consuming components
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    googleLogin,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
