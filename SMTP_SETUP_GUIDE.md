# SMTP Configuration Guide - Fixed & Updated

## Issues Fixed

The SMTP configuration had several critical issues that prevented email delivery:

### 1. **Hardcoded Credentials with Invalid Format**
- ❌ BEFORE: Password had spaces (`ddfn mlrb wvfj cvmx`) - Invalid for SMTP
- ✅ AFTER: Environment variables with proper validation

### 2. **Missing SMTP Connection Pool Settings**
- ❌ BEFORE: No connection pooling, timeouts, or connection verification
- ✅ AFTER: Added proper pool configuration, timeout settings, and connection verification

### 3. **No Error Handling or Validation**
- ❌ BEFORE: Transporter created without error handling
- ✅ AFTER: Transporter initialization with async verification and detailed error logging

### 4. **Insufficient Function Error Handling**
- ❌ BEFORE: No check for transporter initialization before sending emails
- ✅ AFTER: All functions validate transporter and input parameters with detailed errors

---

## What Was Changed

### Files Modified:
1. **server/utils/emailService.js** - Enhanced SMTP configuration and error handling
2. **server/.env** - Replaced invalid password with proper setup instructions
3. **server/.env.example** - Added comprehensive documentation for all SMTP options

### Key Improvements:

#### In `emailService.js`:
```javascript
// ✅ NEW: Connection pooling configuration
pool: {
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
}

// ✅ NEW: Timeout settings (prevent hanging)
connectionTimeout: 10000, // 10 seconds
socketTimeout: 10000,     // 10 seconds

// ✅ NEW: SMTP connection verification on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message);
  } else {
    console.log('✅ SMTP connection verified successfully');
  }
});

// ✅ NEW: Input validation and error handling in all email functions
if (!transporter) {
  throw new Error('Email transporter not initialized. Check SMTP credentials.');
}
```

---

## Setup Instructions

### Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - **Important:** Copy ALL characters (no spaces between groups)

3. **Update `.env` file:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd1234efgh5678
   SMTP_SECURE=false
   ```

### Option 2: Mailtrap (For Testing/Staging)

1. **Create Account**
   - Go to: https://mailtrap.io
   - Sign up for free account

2. **Get Credentials**
   - Click on your inbox
   - Go to "Integrations" → "Nodemailer"
   - Copy the credentials

3. **Update `.env` file:**
   ```
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_username
   SMTP_PASS=your_password
   SMTP_SECURE=false
   ```

### Option 3: SendGrid

1. **Create Account**
   - Go to: https://sendgrid.com
   - Sign up for free account

2. **Generate API Key**
   - Go to: Settings → API Keys
   - Create a new API key

3. **Update `.env` file:**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_SECURE=false
   ```

---

## Testing Email Configuration

### 1. Check Server Startup Logs
When the server starts, it will automatically verify the SMTP connection:
```
✅ SMTP connection verified successfully
   Host: smtp.gmail.com
   Port: 587
```

If you see an error:
```
❌ SMTP connection failed: [error details]
```

The configuration is incorrect. Check:
- SMTP_USER and SMTP_PASS are correct and have no extra spaces
- SMTP_HOST and SMTP_PORT match your provider
- If using Gmail: App Password is 16 characters (not your regular password)

### 2. Test Email Endpoint (if available)
```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

### 3. Monitor Logs
Watch server logs for email delivery messages:
- ✅ Success: `Alert email sent successfully to user@example.com MessageID: ...`
- ❌ Failure: `Failed to send alert email: [error details]`

---

## Troubleshooting

### Error: "SMTP credentials are missing"
- **Cause:** SMTP_USER or SMTP_PASS not set in .env
- **Solution:** Add both environment variables and restart server

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- **Cause:** Wrong credentials
- **For Gmail:** You're using your regular password instead of App Password
  - Solution: Go to https://myaccount.google.com/apppasswords and generate new password
  
### Error: "421 4.7.0 Service Unavailable"
- **Cause:** Port blocked or SMTP server unreachable
- **Solution:** Check if port 587 is open, verify SMTP_HOST is correct

### Error: "Timeout"
- **Cause:** SMTP server taking too long to respond (10+ seconds)
- **Solution:** 
  - Check internet connection
  - Try a different SMTP provider
  - Increase timeout values in emailService.js if needed

### Emails sent but not received
- **Cause:** Often goes to spam folder
- **Solution:** 
  - Check spam/junk folder
  - For Gmail with Gmail SMTP: Mark as "Not Spam" to improve delivery
  - For testing: Use Mailtrap to verify emails are being sent

---

## Email Functions Available

### 1. `sendWelcomeEmail(user)`
Sent when a new user registers.
- **Required:** user.email, user.name
- **Returns:** { success: boolean, messageId: string, error?: string }

### 2. `sendAlertEmail(user, alert)`
Sent when a threshold alert is triggered.
- **Required:** user.email, user.name, alert object with type, severity, message
- **Returns:** { success: boolean, messageId: string, error?: string }

### 3. `sendPasswordResetEmail(user, resetToken)`
Sent for password reset requests.
- **Required:** user.email, user.name, resetToken
- **Returns:** { success: boolean, messageId: string, error?: string }

### 4. `testEmailConnection()`
Tests if SMTP connection is working.
- **Returns:** { success: boolean, message: string, error?: string }

---

## Best Practices

1. **Never commit real credentials** - Always use environment variables
2. **Use App Passwords** for Gmail instead of your main password
3. **Test before deployment** - Use Mailtrap for staging environments
4. **Monitor email delivery** - Check server logs and email provider dashboards
5. **Handle errors gracefully** - Don't show raw SMTP errors to users
6. **Rate limit emails** - Don't send too many emails quickly (configured in pool settings)

---

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Mailtrap.io Documentation](https://mailtrap.io/)
- [SendGrid Documentation](https://docs.sendgrid.com/)

---

## Summary

✅ **What's Fixed:**
- Removed hardcoded invalid credentials
- Added proper SMTP connection pool and timeout configuration
- Implemented connection verification on startup
- Enhanced error handling and input validation in all email functions
- Added comprehensive documentation

✅ **Next Steps:**
1. Update `.env` with your real SMTP credentials
2. Restart the server
3. Check logs for "SMTP connection verified successfully"
4. Test email delivery with your application
