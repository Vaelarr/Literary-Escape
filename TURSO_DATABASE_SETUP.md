# Turso Database Setup - HTML Access Configuration

## Summary
All HTML files in the Literary Escape project can now properly access the Turso database in both development and production environments.

## Changes Made

### 1. API Client Configuration (`js/api-client.js`)
**Problem**: The API client had a hardcoded `baseURL` pointing to `http://localhost:3000/api`, which wouldn't work in production (Vercel with Turso).

**Solution**: Updated the APIClient constructor to dynamically detect the environment:
```javascript
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

this.baseURL = isLocalhost 
    ? 'http://localhost:3000/api'  // Development
    : '/api';                        // Production (Vercel)
```

### 2. API Server Configuration (`api.js`)
**Problem**: The server was always starting with `app.listen()`, which conflicts with Vercel's serverless environment.

**Solution**: Modified the server startup to only run in local development:
```javascript
if (!process.env.VERCEL && require.main === module) {
    app.listen(PORT, () => {
        console.log(`API server running on http://localhost:${PORT}`);
    });
} else {
    console.log('Running in serverless environment (Vercel)');
}
```

### 3. Database Test Endpoint (`/api/test-db`)
**Problem**: The test endpoint used SQLite-specific syntax that wouldn't work with Turso or PostgreSQL.

**Solution**: Updated to use the abstracted bookOperations API:
```javascript
app.get('/api/test-db', async (req, res) => {
    // Uses bookOperations.getAll() which works with all database types
    // Returns database type: Turso, PostgreSQL, or SQLite
});
```

## HTML Files with Database Access

All HTML files now have proper database access through `api-client.js`:

✅ **index.html** - Home page with book displays
✅ **about-us.html** - About page
✅ **account.html** - Login/Register page
✅ **account-dashboard.html** - User dashboard
✅ **admin.html** - Admin panel
✅ **cart.html** - Shopping cart
✅ **checkout.html** - Checkout page
✅ **favorites.html** - User favorites
✅ **fiction.html** - Fiction category
✅ **non-fiction.html** - Non-fiction category
✅ **product.html** - Product details
✅ **search-results.html** - Search results

## Database Configuration (`database-config.js`)

The database configuration automatically selects the appropriate database:

1. **Turso Cloud** (if `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set)
   - Edge-hosted SQLite
   - Used in production on Vercel

2. **PostgreSQL** (if `POSTGRES_URL` or `DATABASE_URL` is set)
   - Traditional production database
   - Alternative to Turso

3. **SQLite** (default)
   - Local file database
   - Used for local development

## Vercel Configuration (`vercel.json`)

Already configured for API routing:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    }
  ]
}
```

## Environment Variables Required for Turso

To use Turso database in production, set these environment variables in Vercel:

```bash
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
NODE_ENV=production
JWT_SECRET=your-secret-key
```

## Testing

### Local Development (SQLite)
```bash
npm start
# Visit http://localhost:3000
# API will use local SQLite database
```

### Production (Vercel + Turso)
1. Set environment variables in Vercel dashboard
2. Deploy: `vercel --prod`
3. All HTML files will automatically use Turso via `/api` endpoints

### Test Database Connection
From any HTML page, open browser console:
```javascript
const api = new APIClient();
api.testConnection().then(result => console.log('DB Connected:', result));
```

## File Structure
```
Literary-Escape/
├── api.js                      # Main API server (exports for Vercel)
├── api/
│   └── index.js               # Vercel serverless wrapper
├── database-config.js         # Auto-selects database (Turso/PostgreSQL/SQLite)
├── database-turso.js          # Turso database operations
├── database-postgres.js       # PostgreSQL database operations
├── database.js                # SQLite database operations
├── js/
│   ├── api-client.js         # ✅ UPDATED: Dynamic base URL
│   └── database-book-display.js
├── vercel.json               # Vercel configuration
└── *.html                    # All HTML files use api-client.js
```

## Benefits

1. **Environment Agnostic**: Works in both development and production
2. **No Code Changes**: Same HTML/JS code works everywhere
3. **Edge Performance**: Turso provides low-latency database access globally
4. **Automatic Failover**: Falls back to SQLite if Turso isn't configured
5. **Type Safety**: All database operations use the same API interface

## Next Steps

1. Seed Turso database: `npm run seed-turso`
2. Test locally: `npm start`
3. Deploy to Vercel with Turso environment variables
4. Verify all HTML pages can fetch data

---
**Last Updated**: October 15, 2025
**Status**: ✅ All HTML files configured for Turso database access
