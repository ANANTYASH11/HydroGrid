import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Keep console logs for debugging production incidents.
    console.error('HydroGrid UI crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      return (
        <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full glass-card p-8 text-center">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-dark-300 mb-6">The app hit an unexpected error. Please reload and try again.</p>
            <div className="bg-dark-900 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-400 font-mono text-sm break-words">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
