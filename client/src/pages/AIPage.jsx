import React from 'react';
import AIInsights from '../components/AIInsights';

const AIPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🤖 AI & Smart Analytics</h1>
          <p className="text-gray-300">
            Intelligent insights, anomaly detection, forecasting, and personalized recommendations
          </p>
        </div>

        {/* AI Insights Section */}
        <AIInsights />

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">🚨 Anomaly Detection</h3>
            <p className="text-gray-600 text-sm">
              Detects unusual usage patterns using statistical analysis. Get alerted to potential leaks or equipment failures before they become expensive problems.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">📊 Forecasting</h3>
            <p className="text-gray-600 text-sm">
              Predicts your usage for the next 30 days using time-series analysis. Plan your budget and identify seasonal patterns accurately.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">💡 Smart Recommendations</h3>
            <p className="text-gray-600 text-sm">
              Personalized suggestions to reduce consumption. Learn which appliances use the most energy and optimal times to use them.
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🚀 Coming Soon</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✨ Natural Language AI Chat - Ask questions naturally like "Why is my bill higher?"</li>
            <li>✨ IoT Device Tagging - Automatically identify individual appliances</li>
            <li>✨ Real-time Alerts - Instant notifications for anomalies</li>
            <li>✨ Demand Response - Automatically optimize based on peak pricing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
