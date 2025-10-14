# 🚀 Deploy Turso to Vercel - Quick Guide

## Your Turso Credentials

Copy these values to add to Vercel:

### TURSO_DATABASE_URL
```
libsql://literary-escape-database-vercel-icfg-v7b2ukdtnww4uypsykualpnd.aws-ap-northeast-1.turso.io
```

### TURSO_AUTH_TOKEN
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiJhNDMxNTM5ZC1jOTY4LTQ2NmMtYTgyNC1lNzUwYmVmOGQ4MjEiLCJpYXQiOjE3NjA0NTcwMzgsInJpZCI6ImJiMzA1ODQxLTYxOTQtNGM1ZC1iZTg2LTZkZGM0N2ViYzE1MCJ9.BoI3W94gOqPggJq86-WSEi8IebKj755Uo5_0JR-BZ3cWlKKgDVBFdHEfmV3fVUHI5IVz7Ek1p5wL1EVb73Z_BQ
```

### JWT_SECRET
```
exBSGWSw4c
```

---

## Step-by-Step Instructions

### Step 1: Open Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Find and click on your **Literary-Escape** project

### Step 2: Add Environment Variables

1. Click **Settings** (top navigation)
2. Click **Environment Variables** (left sidebar)
3. Add each variable one by one:

#### Variable 1: TURSO_DATABASE_URL
- **Name**: `TURSO_DATABASE_URL`
- **Value**: `libsql://literary-escape-database-vercel-icfg-v7b2ukdtnww4uypsykualpnd.aws-ap-northeast-1.turso.io`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- Click **Save**

#### Variable 2: TURSO_AUTH_TOKEN
- **Name**: `TURSO_AUTH_TOKEN`
- **Value**: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiJhNDMxNTM5ZC1jOTY4LTQ2NmMtYTgyNC1lNzUwYmVmOGQ4MjEiLCJpYXQiOjE3NjA0NTcwMzgsInJpZCI6ImJiMzA1ODQxLTYxOTQtNGM1ZC1iZTg2LTZkZGM0N2ViYzE1MCJ9.BoI3W94gOqPggJq86-WSEi8IebKj755Uo5_0JR-BZ3cWlKKgDVBFdHEfmV3fVUHI5IVz7Ek1p5wL1EVb73Z_BQ`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- Click **Save**

#### Variable 3: JWT_SECRET (if not already set)
- **Name**: `JWT_SECRET`
- **Value**: `exBSGWSw4c`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- Click **Save**

### Step 3: Trigger Redeploy

Since you've already pushed the code changes to GitHub, you have two options:

**Option A: Automatic Redeploy (Recommended)**
1. Vercel automatically detects the new environment variables
2. It will redeploy on the next git push
3. OR go to **Deployments** tab
4. Click **︙** (three dots) on the latest deployment
5. Click **Redeploy**
6. Wait 1-2 minutes for deployment to complete

**Option B: Make a Small Change**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with Turso env vars"
git push origin main
```

### Step 4: Verify Deployment

Once deployment completes:

1. Visit: `https://your-project.vercel.app/api/books`
   - Should return JSON with 5 books from Turso

2. Visit: `https://your-project.vercel.app/index.html`
   - Should display your bookstore with Turso data

3. Check logs in Vercel Dashboard:
   - Should see: "Using Turso Cloud database (Edge SQLite)"
   - Should see: "Connected to Turso database"

---

## ✅ Expected Results

### API Response
```json
[
  {
    "id": 1,
    "title": "The Girl with the Dragon Tattoo",
    "author": "Stieg Larsson",
    "price": 15.99,
    "category": "Fiction",
    "genre": "Crime"
  },
  {
    "id": 2,
    "title": "The Da Vinci Code",
    "author": "Dan Brown",
    "price": 14.99,
    "category": "Fiction",
    "genre": "Mystery"
  },
  ...
]
```

### Vercel Logs
```
Using Turso Cloud database (Edge SQLite)
Connected to Turso database
Initializing Turso database schema...
Turso database schema initialized successfully
Database initialized successfully
API server running on http://localhost:3000
Database connection established and ready
```

---

## 🔍 Troubleshooting

### Books not showing?
1. Check Vercel logs for errors
2. Verify environment variables are saved
3. Make sure you redeployed after adding variables

### Still seeing old data?
1. Clear browser cache
2. Open in incognito/private window
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### "Database connection failed"?
1. Double-check TURSO_AUTH_TOKEN was copied completely
2. Make sure no extra spaces in the values
3. Verify TURSO_DATABASE_URL starts with `libsql://`

---

## 📊 What's Happening

When Vercel deploys with these environment variables:

1. **Detects Turso** - `database-config.js` sees `TURSO_DATABASE_URL` and selects Turso
2. **Connects to Edge** - Your database runs on AWS Tokyo (ap-northeast-1)  
3. **Loads Books** - The 5 seeded books are retrieved from Turso
4. **Displays on Website** - Your bookstore shows live data

---

## 🎉 Success Checklist

- [ ] Added TURSO_DATABASE_URL to Vercel
- [ ] Added TURSO_AUTH_TOKEN to Vercel
- [ ] Added JWT_SECRET to Vercel (if missing)
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Triggered redeploy
- [ ] Verified `/api/books` returns 5 books
- [ ] Verified website displays Turso data

---

## 📚 Additional Resources

- **Your Vercel Project**: https://vercel.com/dashboard
- **Turso Dashboard**: https://turso.tech/app
- **API Endpoint**: `https://your-project.vercel.app/api/books`

---

**Need Help?**
Check the Vercel deployment logs for detailed error messages.
