# 🤖 Groq AI Setup - Quick Guide

## Step 1: Get Your Groq API Key (2 minutes)

1. **Go to**: https://console.groq.com/login
2. **Sign up** (free account, no credit card needed)
3. **Navigate to**: API Keys section
4. **Create new key** (copy the full key)
5. **Keep safe** - this is your secret!

Example key format:
```
gsk_1234567890abcdefghijklmnop1234567890abcdefghij
```

---

## Step 2: Add to Your Environment

### Option A: Local Development

Edit `.env` file in project root:

```env
# Add this line at the end
GROQ_API_KEY=gsk_your_key_here
```

Then restart server:
```bash
npm start
```

You should see:
```
✅ Groq AI initialized successfully
```

### Option B: Production (Render)

1. Go to Render Dashboard → Your Service
2. Click "Environment" tab
3. Add new variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `gsk_your_key_here`
4. Click "Save"
5. Render auto-redeploys (2-3 min)

---

## Step 3: Test the NLP Feature

### Using Frontend
1. Open your app
2. Go to `/ai` page
3. Scroll down to "Coming Soon" section
4. Try asking a question in chat (will be enabled)

### Using cURL
```bash
# First, get your auth token
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hydrogrid.com","password":"AdminPass123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Then ask a question
curl -X POST http://localhost:5001/api/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Why is my electricity usage high?"}'
```

Expected response:
```json
{
  "success": true,
  "answer": "Your electricity usage is high because... [AI response]",
  "question": "Why is my electricity usage high?",
  "timestamp": "2026-04-21T..."
}
```

---

## 🎯 Example Queries to Try

Once Groq is enabled, you can ask:

```
"How can I save energy?"
"Why is my bill higher this month?"
"What's consuming the most electricity?"
"When do I use the most water?"
"Compare my usage to my neighbors"
"What should I do to reduce consumption?"
"Explain my usage trend"
"Is my AC using too much?"
```

---

## ⚡ Available AI Features

**Already Working** (no Groq needed):
- ✅ Anomaly Detection - GET `/api/ai/detect-anomalies`
- ✅ Forecasting - GET `/api/ai/predict-next-30-days`
- ✅ Recommendations - GET `/api/ai/recommendations`
- ✅ Device Breakdown - GET `/api/ai/device-breakdown`
- ✅ Analytics - GET `/api/ai/analytics`

**Enabled with Groq Key**:
- 🤖 Natural Language Q&A - POST `/api/ai/query`

---

## 🆓 Free Tier Limits

| Metric | Limit |
|--------|-------|
| Requests/day | 14,000 |
| Tokens/day | Unlimited (fair use) |
| Models | 5 (Mixtral, Llama, Gemma) |
| Cost | **FREE** ✅ |
| Latency | ~1-2 sec per query |

---

## 🐛 Troubleshooting

### Error: "AI Chat feature not yet configured"
```
Solution:
1. Check GROQ_API_KEY is in .env
2. Restart: npm start
3. Check logs for "✅ Groq AI initialized"
```

### Error: "Invalid API key"
```
Solution:
1. Go to https://console.groq.com/keys
2. Check key is not expired or revoked
3. Copy full key again (sometimes copy error)
4. Re-add to .env and restart
```

### Error: "Rate limit exceeded"
```
Solution:
1. Wait a few seconds and retry
2. Free tier: 14,000 requests/day
3. If exceeded, consider Groq paid plan
```

### Groq gives random answers
```
Solution:
- This is normal for LLMs sometimes
- Add more context to your question
- Try rephrasing the question
- Ask specific yes/no questions
```

---

## 📖 Full Documentation

For more details, see: [AI_FEATURES_GUIDE.md](./AI_FEATURES_GUIDE.md)

---

## ✅ Checklist

- [ ] Created Groq account at console.groq.com
- [ ] Generated API key
- [ ] Added GROQ_API_KEY to .env
- [ ] Restarted server
- [ ] Saw "✅ Groq AI initialized" in logs
- [ ] Tested using cURL
- [ ] All features working!

---

**Status**: 🟢 Ready to use  
**Setup Time**: ~5 minutes  
**Cost**: Free forever! 💰

Got stuck? Check the full guide or GitHub issues.
