# Quick Start: Deploy to Vercel in 5 Minutes

## 🚀 Fast Track Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

That's it! Follow the prompts and your site will be live.

## ⚠️ Critical: Database Issue

**Your SQLite database will NOT work on Vercel!** 

Vercel uses serverless functions which don't support SQLite. You MUST switch to a cloud database:

### Recommended: Vercel Postgres

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database" → Choose "Postgres"
5. Follow the setup wizard

### Alternative: Supabase (Free)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from project settings
4. Add to Vercel environment variables as `DATABASE_URL`

## 🔑 Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `JWT_SECRET` | Random secure string (min 32 chars) | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | Your database connection string | ✅ Yes (after migration) |

**Generate JWT_SECRET**: Use [randomkeygen.com](https://randomkeygen.com) - copy a "CodeIgniter Encryption Keys" value

## 📝 After Deployment Checklist

- [ ] Site is live and accessible
- [ ] Set JWT_SECRET in environment variables
- [ ] Migrate from SQLite to cloud database
- [ ] Test login functionality
- [ ] Test cart and checkout
- [ ] Test admin panel
- [ ] Set up custom domain (optional)

## 🆘 Common Issues

**Problem**: "Internal Server Error" after deployment
- **Fix**: Check environment variables are set correctly

**Problem**: Database errors
- **Fix**: You need to migrate to a cloud database (SQLite doesn't work)

**Problem**: Images not loading
- **Fix**: Check file paths use relative paths (e.g., `./media/` not `/media/`)

## 📚 Full Documentation

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment guide.

---

**Need Help?** Check [Vercel Docs](https://vercel.com/docs) or [Vercel Community](https://github.com/vercel/vercel/discussions)
