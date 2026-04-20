/**
 * Theme Context
 * Manages dark/light mode toggle with localStorage persistence
 * Applies the 'dark' or 'light' class to the HTML element
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Wraps the app and provides theme state
 * Defaults to dark mode, persists preference in localStorage
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved preference, default to dark
    const saved = localStorage.getItem('hydrogrid_theme');
    return saved ? saved === 'dark' : true;
  });

  // Apply theme class to HTML element when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.className = 'bg-dark-900 text-white font-sans antialiased';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.className = 'bg-gray-50 text-gray-900 font-sans antialiased';
    }
    localStorage.setItem('hydrogrid_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Toggle between dark and light mode
  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context
 * Usage: const { isDark, toggleTheme } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
