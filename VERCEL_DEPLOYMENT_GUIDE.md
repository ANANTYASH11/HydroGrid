# Vercel Deployment Guide - HydroGrid

## ✅ Completed Improvements
1. **Enhanced Email Debugging**: Added detailed logging to all email functions to track which user's email is being used
2. **Email Validation**: Improved error handling with informative messages showing User ID and recipient email
3. **Vercel Optimization**: Added `.vercelignore` file to exclude unnecessary files from deployment
4. **Code Quality**: Enhanced `checkAndCreateAlert` function with validation

---

## ⚠️ Potential Vercel Deployment Issues & Solutions

### Issue 1: Environment Variables Not Set in Vercel
**Symptoms**: 
- Emails not sending
- SMTP connection errors
- `process.env.SMTP_USER is undefined`

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   ```
   SMTP_USER: anantyashh21@gmail.com
   SMTP_PASS: [Your Gmail App Password - 16 chars]
   SMTP_HOST: smtp.gmail.com
   SMTP_PORT: 587
   DATABASE_URL: [Your Supabase PostgreSQL connection string]
   JWT_SECRET: [Generate a strong secret key for JWT tokens]
   GROQ_API_KEY: [Your Groq AI API key from console.groq.com]
   NODE_ENV: production
   ```
3. Redeploy after adding variables

---

### Issue 2: API Base URL Mismatch
**Symptoms**:
- Client cannot connect to backend API
- CORS errors
- Network errors on API calls

**Solution**:
1. Determine your backend URL (e.g., `https://hydrogrid-api.render.com`)
2. In Vercel project settings, add:
   ```
   VITE_API_BASE_URL: https://your-backend-url/api
   VITE_WS_BASE_URL: wss://your-backend-url
   ```
3. Rebuild and redeploy

---

### Issue 3: CORS Errors
**Symptoms**:
- `Access to XMLHttpRequest blocked by CORS policy`
- API requests fail from browser

**Solution**:
The backend already has CORS configured to accept:
- Localhost (http://localhost:5173, http://localhost:3000)
- Any Vercel deployment (*.vercel.app)

If still getting errors:
1. Check backend is running and accessible
2. Verify VITE_API_BASE_URL is correctly set
3. Check backend CORS configuration allows your Vercel domain

---

### Issue 4: Database Connection Issues
**Symptoms**:
- `Error: ECONNREFUSED` or `connect timeout`
- Database queries failing

**Solution**:
1. Verify DATABASE_URL is correctly set in Vercel
2. Ensure Supabase database is running
3. Check network access in Supabase (should allow all IPs for Vercel)
4. Test connection locally first: `npm run seed` in server directory

---

### Issue 5: Email Not Sending in Production
**Symptoms**:
- Emails sending in dev but not in production
- "Email transporter not initialized" error

**Solution**:
1. Verify SMTP credentials in Vercel environment variables
2. Enable Less Secure Apps in Gmail (if using Gmail)
3. Use Gmail App Password instead of regular password
4. Check server logs for detailed error messages:
   ```
   ❌ Failed to send alert email to [email]: [error message]
   ```

---

## 📊 Email Flow Verification

The system now logs detailed information for each email:

```
📧 Creating alert for User ID: [user-id], Email: [user-email], Type: [water/electricity]
✅ Alert email sent successfully to [email] for user [user-id] | MessageID: [id]
```

If you see emails going to the wrong recipient, check:
1. Is the correct user logged in?
2. Does the user's email match their registration email?
3. Check server logs for the "Creating alert" message showing which user triggered it

---

## 🔍 Debugging Steps

### 1. Check if emails are being sent
- Look for `✅ Alert email sent successfully` or `❌ Failed to send` messages
- Each message includes User ID and recipient email

### 2. Verify correct user email
- When a user logs in, they should see: `Creating alert for User ID: [id], Email: [their-registered-email]`
- If wrong email appears, verify user registration in database

### 3. Test SMTP connection
- Check server startup logs for: `✅ SMTP connection verified successfully`
- If missing, SMTP credentials are incorrect

---

## 🚀 Deployment Checklist

Before pushing to Vercel:
- [ ] All environment variables set in Vercel
- [ ] Backend deployed and running
- [ ] Database connectivity verified
- [ ] Test email sending from local dev environment
- [ ] Git push to main branch (auto-triggers Vercel deployment)

---

## 📝 Key Files Modified
- `server/utils/emailService.js` - Enhanced logging in all email functions
- `server/controllers/usageController.js` - Enhanced checkAndCreateAlert with validation
- `.vercelignore` - Added to optimize deployment

---

## 📞 Support
If deployment issues persist:
1. Check Vercel build logs: Vercel Dashboard → Deployments → [latest] → Build Logs
2. Check function logs: Vercel Dashboard → Deployments → [latest] → Function Logs
3. Verify all environment variables are set correctly
4. Check backend logs on deployment platform (Render, Railway, etc.)

