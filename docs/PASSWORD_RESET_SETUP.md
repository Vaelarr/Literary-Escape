# Password Reset Feature - Setup Guide

This guide explains how to set up the email-based password reset feature for Literary Escape.

## Overview

The password reset feature allows users to securely reset their passwords via email. When a user requests a password reset:

1. They enter their email address on the login page
2. The system generates a secure, time-limited reset token
3. An email is sent with a password reset link
4. The link expires after 1 hour for security
5. User clicks the link and sets a new password
6. The token is marked as used and cannot be reused

## Setup Instructions

### For Vercel Deployment (Production)

Since you're using Vercel, you don't need a local `.env` file. Instead, add environment variables directly in your Vercel dashboard:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Add Email Configuration Variables**

   Add these environment variables:

   | Variable Name | Value | Description |
   |---------------|-------|-------------|
   | `EMAIL_HOST` | `smtp.gmail.com` | SMTP server (Gmail example) |
   | `EMAIL_PORT` | `587` | SMTP port |
   | `EMAIL_USER` | `your-email@gmail.com` | Your email address |
   | `EMAIL_PASSWORD` | `your-app-password` | Gmail App Password |
   | `BASE_URL` | `https://your-app.vercel.app` | Your production URL |

3. **For Gmail App Password**:
   - Enable 2-Factor Authentication: https://myaccount.google.com/security
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` (not your regular Gmail password)

4. **Important**: After adding/changing environment variables in Vercel:
   - Click **Save**
   - **Redeploy** your application for changes to take effect
   - Go to **Deployments** → Click ⋯ on latest deployment → **Redeploy**

### For Local Development (Optional)

If you want to test locally, create a `.env` file:

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   copy .env.example .env
   ```

2. **Update .env file**:

2. **Update .env file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   BASE_URL=http://localhost:3000
   ```

> **Note**: Local `.env` file is optional and only for testing. Production uses Vercel environment variables.

### Alternative Email Providers

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to Vercel** (or local .env):
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

#### Option B: Other Email Providers

For other providers, update the environment variables with the appropriate SMTP settings:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

**SendGrid (Production):**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

**SendGrid (Recommended for Production):**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

> **Important**: Add these as environment variables in **Vercel Dashboard**, not in a `.env` file.

### Vercel-Specific Notes

1. **Automatic BASE_URL Detection**:
   - The app auto-detects Vercel URLs using `VERCEL_URL` environment variable
   - You can override by setting `BASE_URL` explicitly

2. **Environment Variable Scope**:
   - Set variables for **Production**, **Preview**, and **Development** as needed
   - Production: Used for main branch deployments
   - Preview: Used for pull request previews
   - Development: Used for local development with `vercel dev`

3. **Redeployment**:
   - Always redeploy after changing environment variables
   - Changes don't take effect until redeployment

### Quick Setup Checklist for Vercel

- [ ] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Add `EMAIL_HOST` (e.g., `smtp.gmail.com`)
- [ ] Add `EMAIL_PORT` (e.g., `587`)
- [ ] Add `EMAIL_USER` (your email address)
- [ ] Add `EMAIL_PASSWORD` (Gmail App Password or SMTP password)
- [ ] Add `BASE_URL` (optional - your production URL like `https://literary-escape.vercel.app`)
- [ ] Click Save
- [ ] Go to Deployments → Redeploy latest deployment
- [ ] Test password reset feature

### Database Initialization

### Database Initialization

The password reset feature requires a new table. The table will be created automatically when you deploy:

```bash
# If testing locally
npm start
```

The `password_reset_tokens` table will be created automatically on first run.

For Vercel deployments, the table is created automatically when the application initializes.

## Database Schema

The password reset feature adds a new table:

```sql
CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## How to Use

### For Users

1. **Navigate to Login Page**: Go to `account.html`
2. **Click "Forgot Password?"**: Link below the login button
3. **Enter Email**: Type the email associated with your account
4. **Check Email**: Look for an email from Literary Escape (check spam folder)
5. **Click Reset Link**: Opens a password reset page
6. **Set New Password**: Must meet security requirements:
   - At least 8 characters
   - One uppercase letter
   - One lowercase letter
   - One number
   - One special character
7. **Login**: Use your new password to login

### Security Features

- **Token Expiration**: Reset links expire after 1 hour
- **One-Time Use**: Each token can only be used once
- **Secure Tokens**: 256-bit cryptographically secure random tokens
- **Email Enumeration Prevention**: Same response whether email exists or not
- **Password Validation**: Strong password requirements enforced
- **Old Tokens Cleanup**: Previous tokens are deleted when new ones are created

## API Endpoints

### 1. Request Password Reset
```http
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link has been sent to your email address."
}
```

### 2. Verify Reset Token
```http
POST /api/verify-reset-token
Content-Type: application/json

{
  "token": "abc123..."
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

### 3. Reset Password
```http
POST /api/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password has been successfully reset. You can now login with your new password."
}
```

## Troubleshooting

### Email Not Sending

1. **Check Email Credentials**:
   ```bash
   # Test email configuration
   node -e "require('./email-service').verifyEmailConfig()"
   ```

2. **Common Issues**:
   - Gmail: Use App Password, not regular password
   - Firewall: Ensure port 587 is not blocked
   - Antivirus: May block SMTP connections
   - Check server logs for detailed error messages

### Token Errors

**"Invalid or expired reset token"**
- Link may have expired (1 hour limit)
- Token may have already been used
- Request a new password reset

**"No account found with this email"**
- User silently - returns success to prevent email enumeration
- Check email spelling
- Ensure account exists in database

### Production Deployment on Vercel

**Step 1: Add Environment Variables**

Go to your Vercel dashboard and add these environment variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
BASE_URL=https://your-app.vercel.app
```

**Step 2: Redeploy**

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Step 3: Verify Email Service**

Check deployment logs for:
- `✅ Email service initialized` - Email is configured correctly
- `⚠️ Email service not configured` - Environment variables missing

**Step 4: Test**

1. Go to your production site
2. Navigate to login page
3. Click "Forgot Password?"
4. Enter a test email
5. Check email inbox (and spam folder)

### Environment Variables Reference

All environment variables should be set in **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `EMAIL_HOST` | ✅ Yes | `smtp.gmail.com` | SMTP server hostname |
| `EMAIL_PORT` | ✅ Yes | `587` | SMTP port number |
| `EMAIL_USER` | ✅ Yes | `noreply@yourdomain.com` | Email address to send from |
| `EMAIL_PASSWORD` | ✅ Yes | `abcd efgh ijkl mnop` | Email password or App Password |
| `BASE_URL` | ⚠️ Optional | `https://yoursite.vercel.app` | Production URL (auto-detected if not set) |
| `JWT_SECRET` | ✅ Yes | Random string | Already configured for auth |
| `TURSO_DATABASE_URL` | ✅ Yes | Your DB URL | Already configured for database |
| `TURSO_AUTH_TOKEN` | ✅ Yes | Your token | Already configured for database |

## Email Template Customization

The email template is in `email-service.js`. You can customize:

- Email subject
- HTML styling
- Company information
- Logo (currently using emoji 📚)
- Support contact information

## Testing

### Manual Testing

1. **Request Reset**: Use forgot password form
2. **Check Logs**: Look for "Password reset email sent"
3. **Check Email**: Verify email received
4. **Test Link**: Click link and reset password
5. **Verify Login**: Login with new password

### Test Email Service

```javascript
// Test email configuration
const { verifyEmailConfig } = require('./email-service');
verifyEmailConfig();
```

## Security Best Practices

1. **Never log tokens** in production
2. **Use HTTPS** in production for reset links
3. **Regular cleanup** of expired tokens
4. **Monitor** for unusual reset request patterns
5. **Rate limit** password reset requests
6. **Use strong email passwords** (or API keys)

## Files Modified/Created

- ✅ `account.html` - Added forgot password UI
- ✅ `reset-password.html` - Password reset page
- ✅ `email-service.js` - Email sending functionality
- ✅ `api.js` - Password reset API endpoints
- ✅ `database-turso.js` - Password reset database operations
- ✅ `js/api-client.js` - Frontend API methods
- ✅ `package.json` - Added nodemailer dependency
- ✅ `.env.example` - Email configuration template

## Support

If you encounter any issues:

1. Check server logs for detailed error messages
2. Verify email configuration in `.env`
3. Test email service connectivity
4. Ensure database is initialized
5. Check that all dependencies are installed

For production issues, ensure environment variables are properly set in your hosting platform.
