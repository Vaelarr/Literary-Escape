# 🚀 Quick Setup for Vercel - Password Reset Feature

## TL;DR - 5 Steps to Enable Password Reset

### Step 1: Get Gmail App Password (2 minutes)

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Create app password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Enter "Literary Escape"
   - Click **Generate**
5. **Copy the 16-character password** (you'll need this in Step 2)

### Step 2: Add Environment Variables in Vercel (1 minute)

1. Open your **Vercel Dashboard**
2. Go to your project → **Settings** → **Environment Variables**
3. Add these 5 variables (click **Add** for each):

```
Variable Name: EMAIL_HOST
Value: smtp.gmail.com
Environment: Production, Preview, Development
```

```
Variable Name: EMAIL_PORT
Value: 587
Environment: Production, Preview, Development
```

```
Variable Name: EMAIL_USER
Value: your-email@gmail.com
Environment: Production, Preview, Development
```

```
Variable Name: EMAIL_PASSWORD
Value: [paste the 16-char password from Step 1]
Environment: Production, Preview, Development
```

```
Variable Name: BASE_URL
Value: https://your-app.vercel.app
Environment: Production, Preview, Development
```

### Step 3: Redeploy (30 seconds)

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Wait for build to complete

### Step 4: Verify It's Working (30 seconds)

Check the deployment logs for this message:
- ✅ `Email service initialized` ← You're good!
- ⚠️ `Email service not configured` ← Check environment variables

### Step 5: Test It! (1 minute)

1. Go to your live site
2. Click **Login** → **Forgot Password?**
3. Enter your email
4. Check your inbox (and spam folder)
5. Click the reset link
6. Set a new password

**Done! 🎉**

---

## 📧 Alternative Email Providers

### SendGrid (Recommended for Production)

**Why?** More reliable, higher sending limits, better deliverability

1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Create API Key: Settings → API Keys → Create API Key
3. Update Vercel environment variables:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=[your SendGrid API key]
```

### Outlook/Hotmail

```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

### Yahoo

```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-yahoo-app-password
```

---

## ⚠️ Common Issues

### Issue: "Email service not configured"

**Fix**: 
- Check that all 4 email variables are set in Vercel
- Make sure you redeployed after adding them
- Check for typos in variable names (they're case-sensitive)

### Issue: "Invalid login" error in logs

**Fix**:
- For Gmail: Make sure you're using an **App Password**, not your regular password
- Enable 2-Factor Authentication first, then generate App Password
- Don't use spaces in the app password (copy exactly as shown)

### Issue: Email not received

**Fix**:
- Check spam folder
- Wait a few minutes (email can take 1-5 minutes)
- Check Vercel function logs for errors
- Verify `EMAIL_USER` is correct
- Test with a different email provider (like SendGrid)

### Issue: "Authentication failed" 

**Fix**:
- Gmail: Regenerate App Password and update in Vercel
- Make sure 2FA is enabled on Gmail
- Try using a different email provider

---

## 🔍 How to Check Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click on your latest deployment
4. Click **Functions** tab
5. Look for `/api/forgot-password` function
6. Check for error messages

---

## ✅ Testing Checklist

After setup, test these scenarios:

- [ ] Request password reset for existing account → Email received
- [ ] Request password reset for non-existent email → No error shown (security)
- [ ] Click reset link → Opens reset password page
- [ ] Set new password → Success message shown
- [ ] Login with new password → Successfully logged in
- [ ] Try using same reset link again → Shows "expired/invalid" error
- [ ] Wait 1+ hour, try old link → Shows "expired" error

---

## 🛟 Need Help?

**Email not sending?**
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Try regenerating Gmail App Password
4. Consider switching to SendGrid (more reliable)

**Still stuck?**
- Check `PASSWORD_RESET_SETUP.md` for detailed troubleshooting
- Look for error messages in Vercel function logs
- Make sure you redeployed after adding environment variables

---

## 📝 Quick Reference

**Vercel Environment Variables Location:**
Dashboard → Project → Settings → Environment Variables

**Required Variables:**
- `EMAIL_HOST` - SMTP server
- `EMAIL_PORT` - SMTP port (587)
- `EMAIL_USER` - Your email
- `EMAIL_PASSWORD` - App password
- `BASE_URL` - Your site URL (optional)

**After changing variables:**
Always redeploy! (Deployments → ⋯ → Redeploy)

**Gmail App Password:**
https://myaccount.google.com/apppasswords

---

That's it! The password reset feature should now be working on your Vercel deployment. 🚀
