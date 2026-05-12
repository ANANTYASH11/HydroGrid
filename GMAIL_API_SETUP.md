# 📧 Setup Gmail API for Render (Works Perfectly!)

## ✅ Why Gmail API?
- ✅ **Works on Render** - No firewall blocking
- ✅ **Uses Gmail Only** - Just like you want
- ✅ **More Reliable** - API is more stable than SMTP
- ✅ **No Port Issues** - Uses HTTPS (port 443)

---

## 🚀 Step 1: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a **new project**: Name it "HydroGrid"
3. Click **Create**
4. Wait for it to be created

---

## 🔑 Step 2: Create Service Account

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **Service Account**
3. Fill in:
   - Service account name: `hydrogrid-email`
   - Description: "HydroGrid Email Service"
   - Click **Create**
4. Skip optional steps, click **Done**

---

## 📝 Step 3: Create Service Account Key

1. In the service account list, click on the account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON**
5. Click **Create**
6. **Save the JSON file** - you'll need this!

The file will look like:
```json
{
  "type": "service_account",
  "project_id": "hydrogrid-...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "hydrogrid-email@hydrogrid-....iam.gserviceaccount.com",
  "client_id": "1234567890...",
  ...
}
```

---

## 🔓 Step 4: Enable Gmail API

1. Go to **APIs & Services** → **Library**
2. Search for **"Gmail API"**
3. Click on it
4. Click **Enable**

---

## 🤝 Step 5: Give Service Account Gmail Permission

1. Go to **Gmail Settings** → **Forwarding and POP/IMAP** (on gmail.com)
2. OR configure delegation (optional, only if you want it to send from your account directly)
3. For this setup, the service account will send as itself

---

## 🎯 Step 6: Set Render Environment Variables

Go to Render Dashboard → Your HydroGrid Backend → **Environment**

**Add these variables:**

```
GMAIL_SERVICE_ACCOUNT=[Paste entire JSON file content]
GMAIL_CLIENT_EMAIL=hydrogrid-email@hydrogrid-xxxx.iam.gserviceaccount.com
GMAIL_CLIENT_ID=123456789...
SENDER_EMAIL=anantyashh21@gmail.com
```

### How to set GMAIL_SERVICE_ACCOUNT:
1. Open the JSON key file you downloaded
2. Copy **everything** (Ctrl+A)
3. In Render, paste it as the value for `GMAIL_SERVICE_ACCOUNT`
4. It should be a single line JSON string

---

## ✨ After Setup

Your logs should show:
```
✅ SMTP connection verified successfully
   Using Gmail API authentication (service account)
```

And emails will send from your Gmail account!

---

## 🆘 Troubleshooting

**Q: "Invalid JSON in GMAIL_SERVICE_ACCOUNT"**
- Make sure you copied the entire JSON file content
- Check there are no line breaks in the middle
- It should be ONE long line

**Q: "Gmail API not enabled"**
- Go back to APIs & Services → Library
- Search "Gmail API"
- Click Enable

**Q: "Service account doesn't have permission"**
- This is normal - the service account just needs the JSON key
- Permission is automatic once Gmail API is enabled

---

## 📞 Need Help?
Contact Google Cloud support or check:
- https://developers.google.com/gmail/api/guides
- https://nodemailer.com/smtp/gmail/

