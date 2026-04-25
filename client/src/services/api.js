/**
 * API Service Layer
 * Centralized Axios instance for all API calls to the HydroGrid backend
 * Automatically attaches JWT token to requests and handles auth errors
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:5000';

// Create Axios instance with base URL and defaults
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Attach JWT token to every request
 * Reads token from localStorage and adds it to Authorization header
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hydrogrid_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Handle auth errors globally
 * If we get a 401 response, clear the token and redirect to login
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hydrogrid_token');
      localStorage.removeItem('hydrogrid_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  googleAuth: (data) => API.post('/auth/google', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// ==================== USAGE API ====================
export const usageAPI = {
  addUsage: (data) => API.post('/usage', data),
  getUsage: (params) => API.get('/usage', { params }),
  getDashboard: () => API.get('/usage/dashboard'),
  simulateIoT: (data) => API.post('/usage/simulate', data),
  getLeaderboard: () => API.get('/usage/leaderboard'),
  getCarbonFootprint: (params) => API.get('/usage/carbon', { params }),
  getTariffEstimate: (params) => API.get('/usage/tariff-estimate', { params }),
  downloadTariffTemplate: () => API.get('/usage/tariff-template', { responseType: 'blob' }),
  uploadTariffs: (data) => API.post('/usage/upload-tariffs', data),
  getMapData: () => API.get('/usage/map'),
};

export const liveAPI = {
  getStatus: () => API.get('/live/status'),
  getWsUrl: () => `${WS_BASE_URL}/ws/live`,
};

// ==================== ALERTS API ====================
export const alertsAPI = {
  getAlerts: (params) => API.get('/alerts', { params }),
  markRead: (id) => API.put(`/alerts/${id}/read`),
  markAllRead: () => API.put('/alerts/read-all'),
  deleteAlert: (id) => API.delete(`/alerts/${id}`),
};

// ==================== REPORTS API ====================
export const reportsAPI = {
  generateReport: (params) => API.get('/reports', { params }),
  downloadCSV: (params) => API.get('/reports/download/csv', { params, responseType: 'blob' }),
  downloadPDF: (params) => API.get('/reports/download/pdf', { params, responseType: 'blob' }),
};

export default API;
