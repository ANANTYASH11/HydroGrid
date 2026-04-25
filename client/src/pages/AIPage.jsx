import React from 'react';
import AIInsights from '../components/AIInsights';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const AIPage = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          � {t.aiAnalytics || 'AI & Smart Analytics'}
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
          {t.aiSubtitle || 'Intelligent insights, anomaly detection, forecasting, and personalized recommendations'}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="glass-card p-5">
            <p className={`text-xs uppercase tracking-[0.3em] ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{t.forecastConfidence || 'Forecast confidence'}</p>
            <p className={`mt-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>92%</p>
          </div>
          <div className="glass-card p-5">
            <p className={`text-xs uppercase tracking-[0.3em] ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{t.anomalyAlerts || 'Anomaly alerts'}</p>
            <p className={`mt-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Real-time ready</p>
          </div>
          <div className="glass-card p-5">
            <p className={`text-xs uppercase tracking-[0.3em] ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{t.savingsGuidance || 'Savings guidance'}</p>
            <p className={`mt-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Top 5 actions</p>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <AIInsights />

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>🔍 {t.anomalyDetectionTitle}</h3>
          <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
            {t.anomalyDetectionDesc}
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📈 {t.forecastingTitle}</h3>
          <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
            {t.forecastingDesc}
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>💡 {t.smartRecommTitle}</h3>
          <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
            {t.smartRecommDesc}
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="glass-card border-primary-500/30 p-6">
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>� {t.comingSoon || 'Coming Soon'}</h3>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
          {(t.comingSoonItems || []).map((item, i) => (
            <li key={i}>✨ {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AIPage;
