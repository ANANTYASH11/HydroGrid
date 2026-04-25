/**
 * Main Entry Point - React Application Bootstrap
 * Renders the App component into the DOM and initializes providers
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// GLOBAL CONSOLE CLEANUP: Silence errors from noisy browser extensions (like QuestionAI, AdBlock, etc.)
// These errors are not coming from our app and just clutter the developer console.
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.join(' ');
    // Filter out known third-party tracking or extension errors
    if (
      msg.includes('ERR_BLOCKED_BY_CLIENT') || 
      msg.includes('studyquicks') || 
      msg.includes('chrome-extension') ||
      msg.includes('QuestionAI')
    ) {
      return; 
    }
    originalError(...args);
  };

  window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('chrome-extension')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

// Create React root and render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
