/**
 * Groq AI Integration - Natural Language Processing
 * This file enables AI-powered natural language queries
 * 
 * Setup:
 * 1. Get your Groq API key from https://console.groq.com
 * 2. Add GROQ_API_KEY to .env file
 * 3. Restart server
 * 
 * Features:
 * - Natural language queries about usage
 * - Explanations of patterns
 * - Recommendations in conversational format
 * - Historical data analysis
 */

const Groq = require('groq-sdk');

class GroqAI {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️  Groq API key not configured. NLP features disabled.');
      this.enabled = false;
      return;
    }

    try {
      this.client = new Groq({ apiKey });
      this.enabled = true;
      console.log('✅ Groq AI initialized successfully');
    } catch (err) {
      console.error('❌ Error initializing Groq:', err);
      this.enabled = false;
    }
  }

  /**
   * Process natural language query about energy usage
   * @param {string} userQuestion - User's question in natural language
   * @param {object} userData - User's usage data for context
   * @returns {Promise<string>} - AI response
   */
  async processQuery(userQuestion, userData = {}) {
    if (!this.enabled) {
      throw new Error('Groq AI not configured. Please set GROQ_API_KEY');
    }

    try {
      // Prepare context from user data
      const context = this.buildContext(userData);

      const message = await this.client.messages.create({
        model: 'mixtral-8x7b-32768', // Fast and capable model
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are an expert energy management assistant for HydroGrid platform. 
            
User Data Context:
${context}

User Question: ${userQuestion}

Provide a helpful, concise response (2-3 sentences max). Focus on actionable insights.
If the question is about usage patterns, explain the likely causes and suggest solutions.`
          }
        ]
      });

      const response = message.content[0].text;
      return response;
    } catch (err) {
      console.error('Error processing query with Groq:', err);
      throw err;
    }
  }

  /**
   * Build context string from user data
   */
  buildContext(userData) {
    const {
      currentUsage = 0,
      averageUsage = 0,
      peakHour = 'unknown',
      trend = 'stable',
      anomalies = [],
      recommendations = []
    } = userData;

    return `
Current Usage: ${currentUsage} units
Average Daily Usage: ${averageUsage} units
Peak Hour: ${peakHour}:00
Usage Trend: ${trend}
${anomalies.length > 0 ? `Recent Anomalies: ${anomalies.length} detected` : 'No recent anomalies'}
${recommendations.length > 0 ? `Recommendations: ${recommendations.map(r => r.title).join(', ')}` : ''}
    `.trim();
  }

  /**
   * Analyze energy saving opportunities
   */
  async analyzeEnergySavings(usageData) {
    if (!this.enabled) {
      throw new Error('Groq AI not configured');
    }

    try {
      const message = await this.client.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Analyze this energy usage data and provide 3 specific, actionable steps to reduce consumption:

Usage Data (last 30 days):
${JSON.stringify(usageData, null, 2)}

Format response as:
1. [Action]: [Expected Savings]%
2. [Action]: [Expected Savings]%
3. [Action]: [Expected Savings]%`
          }
        ]
      });

      return message.content[0].text;
    } catch (err) {
      console.error('Error analyzing energy savings:', err);
      throw err;
    }
  }

  /**
   * Generate report explanation
   */
  async explainReport(reportData) {
    if (!this.enabled) {
      throw new Error('Groq AI not configured');
    }

    try {
      const message = await this.client.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Explain this energy report in simple terms for a non-technical person (2-3 sentences):

Report Summary:
${JSON.stringify(reportData, null, 2)}

Focus on: What does it mean? Is it good or bad? What should they do?`
          }
        ]
      });

      return message.content[0].text;
    } catch (err) {
      console.error('Error explaining report:', err);
      throw err;
    }
  }

  /**
   * Compare with similar users
   */
  async compareBenchmarks(userUsage, benchmarkData) {
    if (!this.enabled) {
      throw new Error('Groq AI not configured');
    }

    try {
      const message = await this.client.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Compare this user's energy usage to benchmarks:

User Usage: ${userUsage} units/day
Neighborhood Average: ${benchmarkData.neighborhoodAvg} units/day
National Average: ${benchmarkData.nationalAvg} units/day
Similar Homes Average: ${benchmarkData.similarHomesAvg} units/day

Provide a comparison and insights (2-3 sentences).`
          }
        ]
      });

      return message.content[0].text;
    } catch (err) {
      console.error('Error comparing benchmarks:', err);
      throw err;
    }
  }
}

// Singleton instance
let groqInstance = null;

function getGroqAI() {
  if (!groqInstance) {
    groqInstance = new GroqAI();
  }
  return groqInstance;
}

module.exports = {
  getGroqAI,
  GroqAI
};
