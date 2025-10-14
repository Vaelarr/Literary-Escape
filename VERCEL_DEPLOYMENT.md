# Literary Escape - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **Node.js**: Ensure you have Node.js installed locally for testing

## Important Database Note

⚠️ **SQLite Limitation on Vercel**: Vercel's serverless architecture doesn't support SQLite databases in production because serverless functions are stateless and ephemeral.

### Database Solutions for Production

You have several options:

1. **Vercel Postgres** (Recommended)
   - Built-in integration with Vercel
   - Easy to set up
   - [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)

2. **PlanetScale** (MySQL-compatible)
   - Serverless MySQL platform
   - Free tier available
   - [PlanetScale](https://planetscale.com)

3. **Supabase** (PostgreSQL)
   - Open-source Firebase alternative
   - PostgreSQL database with built-in authentication
   - [Supabase](https://supabase.com)

4. **MongoDB Atlas**
   - NoSQL database (requires code refactoring)
   - Free tier available
   - [MongoDB Atlas](https://www.mongodb.com/atlas)

## Deployment Steps

### Step 1: Prepare Your Repository

1. Create a `.env` file locally (don't commit this):
```bash
cp .env.example .env
```

2. Update your `.env` file with a strong JWT secret:
```
JWT_SECRET=your-very-secure-random-string-here
PORT=3000
NODE_ENV=development
```

3. Initialize Git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
```

4. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/literary-escape.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add: `JWT_SECRET` = `your-very-secure-random-string`
   - Add: `NODE_ENV` = `production`

6. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts and set environment variables when asked

### Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:
   - `JWT_SECRET`: A strong random string (generate one at [randomkeygen.com](https://randomkeygen.com))
   - `NODE_ENV`: `production`

### Step 4: Update Database Configuration (Required)

Since SQLite won't work on Vercel, you need to:

1. Choose a cloud database solution (see options above)
2. Update `database.js` to use your chosen database
3. Update connection strings in environment variables
4. Redeploy

## Local Development

To run locally:

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Project Structure

```
Literary-Escape/
├── api.js              # Express API server
├── database.js         # Database operations
├── vercel.json         # Vercel configuration
├── package.json        # Node dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── *.html              # Frontend pages
├── css/                # Stylesheets
├── js/                 # Frontend JavaScript
└── media/              # Images and assets
```

## Vercel Configuration

The `vercel.json` file is configured to:
- Build the Node.js API using `@vercel/node`
- Route API calls to `/api/*` endpoints
- Serve static files (HTML, CSS, JS, images)
- Redirect all other routes to `index.html` for SPA routing

## Troubleshooting

### Database Errors
- **Issue**: SQLite not working on Vercel
- **Solution**: Migrate to a cloud database (see Database Solutions above)

### 500 Internal Server Error
- **Issue**: Missing environment variables
- **Solution**: Check that `JWT_SECRET` is set in Vercel dashboard

### Static Files Not Loading
- **Issue**: Incorrect paths in HTML files
- **Solution**: Use relative paths (e.g., `./css/style.css` instead of `/css/style.css`)

### API Routes Not Working
- **Issue**: Incorrect API endpoint URLs
- **Solution**: Update fetch calls to use `/api/` prefix (e.g., `/api/books`)

## Next Steps After Deployment

1. ✅ Migrate from SQLite to a cloud database
2. ✅ Test all functionality on the deployed site
3. ✅ Set up custom domain (optional)
4. ✅ Enable analytics in Vercel dashboard
5. ✅ Set up automatic deployments from Git

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## License

MIT

---

**Created by**: Arianne Kaye E. Tupaen
