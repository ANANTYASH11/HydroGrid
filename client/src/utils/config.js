/**
 * App Configuration - Indian Locale Settings
 * Centralizes currency, timezone, and locale preferences
 */

// Currency configuration (Indian Rupee)
export const CURRENCY = {
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN',
  name: 'Indian Rupee',
};

// Timezone configuration
export const TIMEZONE = {
  name: 'Asia/Kolkata',
  abbreviation: 'IST',
  offset: '+05:30',
};

// Utility rates (Indian rates)
export const RATES = {
  water: 0.05,          // ₹0.05 per liter
  electricity: 8,       // ₹8 per kWh
  waterUnit: 'liters',
  electricityUnit: 'kWh',
};

// Team / Creator info
export const TEAM = {
  projectName: 'HydroGrid',
  tagline: 'Smart Water & Electricity Intelligence Platform',
  creators: [
    { name: 'Anant Yash', role: 'Project Lead & Full Stack Developer' },
    { name: 'Adarsh Verma', role: 'Backend Developer & Database Architect' },
    { name: 'Ashish Shankar', role: 'Frontend Developer & UI/UX Designer' },
  ],
};

/**
 * Format a number as Indian Rupees
 * Uses the Indian numbering system (lakhs, crores)
 * @param {number} amount - The amount to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} - Formatted string like "₹1,23,456.00"
 */
export function formatCurrency(amount, decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) return `${CURRENCY.symbol}0`;
  return `${CURRENCY.symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format a date in Indian locale with IST timezone
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    timeZone: TIMEZONE.name,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Format a date with time in IST
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: TIMEZONE.name,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
