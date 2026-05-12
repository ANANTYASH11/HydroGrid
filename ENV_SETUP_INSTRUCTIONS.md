# Environment Variables Setup Guide

## 🔧 Backend - Render.com

### Step 1: Go to Your Render Backend Project
1. Log in to [Render.com](https://render.com)
2. Select your HydroGrid backend service
3. Go to **Environment** tab

### Step 2: Add Backend Environment Variables

Click **"Add Environment Variable"** for each of these:

```
SMTP_USER: anantyashh21@gmail.com
SMTP_PASS: [Your Gmail App Password - 16 character string]
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
DATABASE_URL: [Your Supabase PostgreSQL connection string]
JWT_SECRET: [Your JWT secret key]
GROQ_API_KEY: [Your Groq AI API key]
NODE_ENV: production
```

### Step 3: Deploy
1. After adding all variables, click **"Save"**
2. Render will automatically redeploy with new variables
3. Wait for deployment to complete (check logs)

---

## 🎨 Frontend - Vercel

### Step 1: Go to Your Vercel Project
1. Log in to [Vercel.com](https://vercel.com)
2. Select your HydroGrid frontend project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Frontend Environment Variables

Click **"Add New"** for each of these:

```
VITE_API_BASE_URL: https://your-render-backend-url/api
VITE_WS_BASE_URL: wss://your-render-backend-url
```

**Important:** Replace `your-render-backend-url` with your actual Render backend URL
- Example: `https://hydrogrid-api.onrender.com`
- You can find this in your Render service URL

### Step 3: Deploy
1. After adding variables, click **"Save"**
2. Go to **Deployments** → Click on latest deployment → **Redeploy**
3. Select **"Use existing builds"** or **"Rebuild from source"**
4. Wait for redeployment to complete

---

## 🔗 Finding Your Backend URL

To get your Render backend URL:
1. Go to Render.com → Your HydroGrid Backend Service
2. Copy the URL from the top of the page
3. It should look like: `https://hydrogrid-api.onrender.com`

---

## ✅ Verification Steps

### Test Backend (Render)
1. Open your Render backend URL in browser
2. You should see HydroGrid API response with version info
3. Check server logs for: `✅ SMTP connection verified successfully`

### Test Frontend (Vercel)
1. Visit your Vercel frontend URL
2. Try logging in to trigger email
3. Check that emails arrive at the correct user's registered email

### Test Email Flow
1. Log in with a test account
2. Check for login alert email
3. Verify email was sent to the user's registered email
4. Check Render logs for: `✅ Login alert email sent successfully to [email]`

---

## 🐛 Troubleshooting

### Emails not sending?
- ✅ Verify SMTP variables are set in Render
- ✅ Check Render logs for SMTP errors
- ✅ Confirm Gmail app password is correct
- ✅ Test with a known user

### Frontend can't connect to backend?
- ✅ Verify VITE_API_BASE_URL is set in Vercel
- ✅ Check that URL matches your Render backend
- ✅ Open browser dev tools → Network tab → check API calls
- ✅ Ensure Render backend is running

### Getting 401/403 errors?
- ✅ Verify JWT_SECRET is set in Render
- ✅ Check that token is being sent correctly from frontend
- ✅ Verify DATABASE_URL is correct in Render

---

## 📋 Quick Reference

### Backend URL Examples
```
Development:    http://localhost:5000
Render:         https://hydrogrid-api.onrender.com
```

### Frontend URL Examples
```
Development:    http://localhost:5173
Vercel:         https://hydrogrid.vercel.app
```

### CORS Verification
Backend is configured to accept:
- ✅ localhost:5173 (local React dev)
- ✅ localhost:3000 (local alternative)
- ✅ *.vercel.app (any Vercel deployment)

