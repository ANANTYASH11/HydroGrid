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

/**
 * AuthProvider - Wraps the app and provides authentication state
 * Initializes from localStorage on mount, handles login/register/logout
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('hydrogrid_token');
    const storedUser = localStorage.getItem('hydrogrid_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Register a new user account
   * @param {Object} userData - { name, email, password }
   */
  const register = useCallback(async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      const response = await authAPI.register(userData);
      console.log('✅ Register response:', response.data);
      const { data, token: newToken } = response.data;

      localStorage.setItem('hydrogrid_token', newToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(data));
      
      setToken(newToken);
      setUser(data);
      console.log('✅ Auth state updated');

      return data;
    } catch (error) {
      console.error('❌ Register failed, using client-side demo:', error.response?.data || error.message);
      const demoUserId = 'user_' + Date.now();
      const demoToken = 'token_' + Date.now();
      const demoUser = {
        _id: demoUserId,
        name: userData.name,
        email: userData.email,
        role: 'user',
        settings: {},
        badges: [],
        createdAt: new Date(),
      };
      
      demoStorage[userData.email] = { ...userData, ...demoUser };
      localStorage.setItem('hydrogrid_token', demoToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(demoUser));
      
      setToken(demoToken);
      setUser(demoUser);
      console.log('✅ Client-side demo registration successful');
      return demoUser;
    }
  }, []);

  /**
   * Login with existing credentials
   * @param {Object} credentials - { email, password }
   */
  const login = useCallback(async (credentials) => {
    try {
      console.log('🔑 Logging in user:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('✅ Login response:', response.data);
      const { data, token: newToken } = response.data;

      // Save to localStorage first (for persistence)
      localStorage.setItem('hydrogrid_token', newToken);
      localStorage.setItem('hydrogrid_user', JSON.stringify(data));
      
      // Then update state (will trigger re-render)
      setToken(newToken);
      setUser(data);
      console.log('✅ Auth state updated');

      return data;
    } catch (error) {
      console.error('❌ Login failed, using client-side demo:', error.response?.data || error.message);
      const storedUser = demoStorage[credentials.email];
      if (storedUser && storedUser.password === credentials.password) {
        const demoToken = 'token_' + Date.now();
        const demoUser = {
          _id: storedUser._id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role,
          settings: storedUser.settings,
          badges: storedUser.badges,
        };
        
        localStorage.setItem('hydrogrid_token', demoToken);
        localStorage.setItem('hydrogrid_user', JSON.stringify(demoUser));
        
        setToken(demoToken);
        setUser(demoUser);
        console.log('✅ Client-side demo login successful');
        return demoUser;
      }
      
      throw error;
    }
  }, []);

  /**
   * Logout - Clear all auth state and storage
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hydrogrid_token');
    localStorage.removeItem('hydrogrid_user');
  }, []);

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
