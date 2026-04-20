# Render Deployment Guide - HydroGrid

## Quick Start (5 minutes)

```bash
# 1. Push your code to GitHub main branch
git push origin main

# 2. Go to https://dashboard.render.com
# 3. Click "New +" → "Web Service"
# 4. Connect GitHub and select HydroGrid repository
# 5. Fill in configuration (see below)
# 6. Deploy!
```

---

## Configuration for Render

### Service Details

| Field | Value |
|-------|-------|
| **Name** | HydroGrid |
| **Environment** | Node |
| **Region** | Oregon (US West) |
| **Branch** | main |
| **Root Directory** | server |

### Build & Start Commands

| Command | Value |
|---------|-------|
| **Build** | `npm install` |
| **Start** | `npm start` |

### Instance Type

For testing: **Free** ($0/month)
- 512 MB RAM
- 0.1 CPU
- Spins down after 15 min inactivity
- Perfect for demos

For production: **Starter** ($7/month)
- Always running
- Better performance
- 512 MB RAM, 0.5 CPU

### Environment Variables

**Copy-paste into Render Dashboard:**

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-generated-secret-here
ADMIN_EMAIL=admin@hydrogrid.com
ADMIN_PASSWORD=AdminPass123!
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**To generate JWT_SECRET, run locally:**

```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))

# Or use OpenSSL if installed
openssl rand -base64 32
```

### Database Configuration

1. **In Render Dashboard**, click "Create Database"
2. **Database Settings**:
   - Name: `hydrogrid-db`
   - Database Name: `hydrogrid`
   - Plan: **Free**
   - Region: Oregon
3. **Render will auto-provide** `MONGODB_URI` environment variable
4. **No need to configure** - it's automatic!

---

## Step-by-Step Setup

### Step 1: Connect GitHub to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** button → **"Web Service"**
3. Select **"Connect GitHub"** (or connect existing repo)
4. Choose repository: `HydroGrid`
5. Click **"Connect"**

### Step 2: Configure Service

```
Name:                HydroGrid
Environment:         Node
Region:              Oregon (US West)
Branch:              main
Root Directory:      server
Runtime:             Node 18+ (auto-detected)
```

### Step 3: Set Build & Start Commands

```
Build Command:  npm install
Start Command:  npm start
```

### Step 4: Add Environment Variables

Click **"Environment"** tab and add:

```
NODE_ENV              production
PORT                  5001
JWT_SECRET            [your-generated-secret]
ADMIN_EMAIL           admin@hydrogrid.com
ADMIN_PASSWORD        AdminPass123!
CORS_ORIGIN           https://hydrogrid.onrender.com
```

### Step 5: Connect Database

1. In same service page, scroll to **"Environment"**
2. Click **"Database"** → **"Create a Database"**
3. Configure:
   ```
   Database Name:  hydrogrid-db
   Plan:           Free
   Region:         Oregon
   ```
4. Render auto-creates `MONGODB_URI` → don't modify!

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Once deployed, you'll get a URL: `https://hydrogrid.onrender.com`

### Step 7: Verify Deployment

```bash
# Test API is running
curl https://hydrogrid.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"2026-04-20T..."}
```

---

## Configuration Files Already Created

### `render.yaml` (in root)
```yaml
services:
  - type: web
    name: HydroGrid
    env: node
    region: oregon
    plan: free
    branch: main
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
```

### `.env.render` (in root)
Template with all required environment variables

### `server/package.json`
Already has correct start script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js",
  "seed": "node utils/seedData.js"
}
```

---

## Your Deployment URL

Once deployed, your services will be at:

```
API:       https://hydrogrid.onrender.com
Mongo:     mongodb+srv://[user]:[pass]@[cluster].mongodb.net/hydrogrid
```

---

## Troubleshooting

### Service won't start
```
1. Check Logs in Render dashboard
2. Look for error message
3. Verify all env vars are set
4. Ensure MongoDB connection string is correct
```

### "Cannot find module"
```
Solution: Your build command (npm install) should run automatically
If not: Add more time to build (Settings → Build Timeout)
```

### Cold starts are slow
```
Free tier spins down after 15 min inactivity
Solution: Upgrade to Starter tier ($7/month) for always-on
```

### Database connection fails
```
1. Verify MONGODB_URI in environment
2. Check MongoDB allows Render's IP range
3. If using Atlas: Whitelist 0.0.0.0/0 (all IPs)
```

### CORS errors
```
1. Check CORS_ORIGIN matches your frontend URL
2. Update in Render environment variables
3. Restart service
```

### Deployment stuck
```
1. Check logs for errors
2. Try manual deploy: Settings → Manual Deploy → Deploy
3. If still stuck: Delete service and redeploy
```

---

## Post-Deployment Setup

### 1. Seed Database with Test Data

```bash
# SSH into Render service (from dashboard)
npm run seed

# This creates:
# - 100 demo users
# - 27,520+ usage records
# - 500+ alerts
# - Ready-to-test dashboard
```

### 2. Login to Dashboard

Go to: `https://hydrogrid.onrender.com`

```
Email:    admin@hydrogrid.com
Password: AdminPass123! (or your set value)
```

### 3. Monitor Logs

- Render Dashboard → Logs
- Shows real-time application logs
- Errors will appear here

### 4. Auto-Deploy Setup

Render auto-deploys when:
- You push to `main` branch
- All tests pass
- No build errors

To disable:
- Service Settings → Deploy → Uncheck "Auto-Deploy"

---

## Performance Tips

### Reduce Cold Start Time
```
1. Minimize dependencies
2. Use production flag: NODE_ENV=production
3. Upgrade to Starter tier for persistent RAM
```

### Database Optimization
```
1. Add MongoDB indexes (done in models)
2. Use connection pooling (Mongoose handles it)
3. Archive old usage data periodically
```

### Scale Strategy
```
Free tier:    Good for 10-50 concurrent users
Starter:      Good for 100-500 concurrent users
Standard:     Good for 500-5000 concurrent users
Pro:          Good for 5000+ concurrent users
```

---

## Monitoring & Logs

### View Logs
1. Render Dashboard → Logs
2. Filter by level: Info, Error, Warning
3. Search by keyword

### Key Metrics
```
- Response time
- Error rate
- Uptime percentage
- Disk usage
- CPU/Memory usage
```

### Alerts (Paid Plans)
1. Settings → Alerting
2. Set thresholds for:
   - High error rate
   - High response time
   - Memory/CPU overuse
   - Disk space low

---

## Upgrading Later

When you're ready to upgrade:

1. Go to Render Dashboard
2. Select service → Settings
3. Change Plan → Select new tier
4. Update (2-5 min downtime during switch)

Pricing:
- **Free**: $0 (demo/learning)
- **Starter**: $7/mo (small production)
- **Standard**: $25/mo (medium production)
- **Pro**: $85/mo (high traffic)

---

## Next Steps

✅ All configuration files created  
✅ GitHub repo ready to deploy  
✅ Environment variables documented  

**Ready to deploy?**

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Create Web Service with config above
4. Wait 2-5 minutes
5. Your app is live! 🚀

**Need help?**
- Render Docs: https://render.com/docs
- Discord: https://discord.gg/render
- Email: support@render.com

---

## Architecture on Render

```
┌─────────────────────────────────────┐
│        Render.com Platform          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Node.js Web Service         │   │
│  │  HydroGrid API               │   │
│  │  - Express.js                │   │
│  │  - 512 MB RAM                │   │
│  │  - Oregon Region             │   │
│  └──────────────────────────────┘   │
│              ↓                       │
│  ┌──────────────────────────────┐   │
│  │  MongoDB Database            │   │
│  │  - Free tier                 │   │
│  │  - 512 MB storage            │   │
│  │  - Automatic backups         │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
         ↓
    Public Internet
    https://hydrogrid.onrender.com
```

---

**Configuration Date**: April 20, 2026  
**Platform**: Render.com  
**Status**: ✅ Ready to Deploy
