const Groq = require('groq-sdk');

class GroqAI {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️  Groq API key not configured. AI features disabled.');
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

  _extractJSON(text) {
    try {
      // Clean markdown code blocks if present
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]);
      }
      return JSON.parse(text);
    } catch (err) {
      console.error('Failed to extract JSON. Raw AI response:', text);
      throw new Error('Failed to parse AI response into JSON');
    }
  }

  async generateJSONResponse(prompt, schemaExample) {
    if (!this.enabled) {
      throw new Error('Groq AI not configured. Please set GROQ_API_KEY');
    }

    try {
      const message = await this.client.messages.create({
        model: 'llama3-8b-8192',
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are an advanced energy and utility analytics AI for the HydroGrid platform. You must exclusively return valid, well-formed JSON without any conversational text or markdown. DO NOT wrap your response in ```json. Just output the raw JSON object/array directly.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nYou MUST return the data exactly in this JSON format. Respond with ONLY JSON:\n${schemaExample}`
          }
        ]
      });
      return this._extractJSON(message.content[0].text);
    } catch (err) {
      console.error('Error in generateJSONResponse:', err);
      throw err;
    }
  }
}

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
