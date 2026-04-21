import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIInsights = ({ userId }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('anomalies');

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [
        anomaliesRes,
        forecastRes,
        recommendationsRes,
        devicesRes,
        analyticsRes
      ] = await Promise.all([
        axios.get('/api/ai/detect-anomalies', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/ai/predict-next-30-days', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/ai/recommendations', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/ai/device-breakdown', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/ai/analytics', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setAnomalies(anomaliesRes.data.anomalies || []);
      setForecast(forecastRes.data.forecast || []);
      setRecommendations(recommendationsRes.data.recommendations || []);
      setDevices(devicesRes.data.devices || []);
      setAnalytics(analyticsRes.data.analytics);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading AI Insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['anomalies', 'forecast', 'recommendations', 'devices', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">🚨 Anomaly Detection</h2>
          {anomalies.length === 0 ? (
            <p className="text-gray-600">No anomalies detected. Usage is normal!</p>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded ${
                    anomaly.reason === 'SPIKE' ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {new Date(anomaly.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Usage: {anomaly.value.toFixed(2)} | Expected: {anomaly.expected.toFixed(2)}
                      </p>
                      <p className="text-sm">
                        {anomaly.reason === 'SPIKE' ? '📈 Usage Spike' : '📉 Usage Drop'}
                        {' '}({anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(2)})
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      anomaly.severity > 3 ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      Severity: {anomaly.severity.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📊 30-Day Forecast</h2>
          {forecast.length === 0 ? (
            <p className="text-gray-600">Insufficient data for forecast</p>
          ) : (
            <div className="space-y-2">
              {forecast.slice(0, 10).map((day, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-4">
                    <span className="text-blue-600 font-semibold">{day.predicted}</span>
                    <span className="text-xs text-gray-500">
                      ({day.lower} - {day.upper})
                    </span>
                  </div>
                </div>
              ))}
              <p className="text-sm text-gray-500 mt-4">Showing first 10 days of forecast...</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">💡 Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="text-gray-600">No recommendations at this time</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-l-4 rounded ${
                    rec.priority === 'HIGH'
                      ? 'border-red-500 bg-red-50'
                      : rec.priority === 'MEDIUM'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{rec.title}</p>
                      <p className="text-gray-700 mt-1">{rec.description}</p>
                      <p className="text-sm text-green-600 mt-2">
                        💰 Potential Savings: {rec.potentialSavings}%
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-white text-xs font-bold ${
                      rec.priority === 'HIGH' ? 'bg-red-500' :
                      rec.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">⚡ Device Breakdown</h2>
          <div className="space-y-3">
            {devices.map((device, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-2xl">{device.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{device.device.replace(/_/g, ' ')}</span>
                    <span className="font-bold">{device.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${device.percentage}%`,
                        backgroundColor: device.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{device.usage} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📈 Advanced Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">Average</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.overall.mean.toFixed(0)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-xs text-gray-600">Min</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.overall.min.toFixed(0)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded">
              <p className="text-xs text-gray-600">Max</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics.overall.max.toFixed(0)}
              </p>
            </div>
            <div className={`p-4 rounded ${
              analytics.trend.direction === 'UP' ? 'bg-red-50' :
              analytics.trend.direction === 'DOWN' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <p className="text-xs text-gray-600">Trend</p>
              <p className={`text-2xl font-bold ${
                analytics.trend.direction === 'UP' ? 'text-red-600' :
                analytics.trend.direction === 'DOWN' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {analytics.trend.direction === 'UP' ? '📈' :
                 analytics.trend.direction === 'DOWN' ? '📉' : '➡️'}
                {' '}{analytics.trend.percentage}%
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>Last Week Average: {analytics.trend.lastWeekAvg}</p>
            <p>Previous Week Average: {analytics.trend.previousWeekAvg}</p>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAIInsights}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
      >
        🔄 Refresh Insights
      </button>
    </div>
  );
};

export default AIInsights;
