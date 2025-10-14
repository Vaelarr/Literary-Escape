# Turso Cloud SQLite Setup Guide

## What is Turso?

Turso is a **distributed edge-hosted SQLite database** powered by libSQL. It provides:

- ✅ **Global edge deployment** - Database replicas at the edge for low latency
- ✅ **SQLite compatibility** - Use familiar SQLite syntax and features
- ✅ **Serverless-friendly** - Perfect for Vercel, Netlify, Cloudflare Workers
- ✅ **Generous free tier** - Great for development and small projects
- ✅ **Automatic backups** - Built-in point-in-time recovery
- ✅ **Multi-region replication** - Replicate data across regions

## Why Use Turso for Literary Escape?

Compared to PostgreSQL on Vercel:
- **Better edge performance** - Database closer to your users worldwide
- **Lower latency** - Reads from the nearest edge location
- **SQLite compatibility** - Easier migration from local SQLite
- **Cost-effective** - More generous free tier than PostgreSQL
- **Simpler setup** - No connection pooling complexity

## Step 1: Create a Turso Account

1. Go to [turso.tech](https://turso.tech/)
2. Click **"Sign Up"**
3. Sign in with GitHub (recommended) or email
4. Verify your email if required

## Step 2: Install Turso CLI

### Windows (PowerShell)
```powershell
irm get.turso.tech/install.ps1 | iex
```

### macOS/Linux
```bash
curl -sSfL https://get.turso.tech/install.sh | bash
```

### Verify Installation
```bash
turso --version
```

## Step 3: Login to Turso

```bash
turso auth login
```

This will open your browser to authenticate. Once done, you're logged in!

## Step 4: Create Your Database

```bash
# Create a database named "literary-escape"
turso db create literary-escape

# List your databases to verify
turso db list
```

**Optional: Create with specific location**
```bash
# Create in a specific region for better performance
turso db create literary-escape --location lax  # Los Angeles
# Available locations: lax, iad, fra, nrt, syd, etc.
```

## Step 5: Get Your Database Credentials

### Get Database URL
```bash
turso db show literary-escape --url
```

This will output something like:
```
libsql://literary-escape-yourname.turso.io
```

### Create an Auth Token
```bash
turso db tokens create literary-escape
```

This will output your auth token (a long string). **Save this securely!**

## Step 6: Configure Your Local Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Turso credentials:
   ```env
   TURSO_DATABASE_URL=libsql://literary-escape-yourname.turso.io
   TURSO_AUTH_TOKEN=your-long-auth-token-here
   JWT_SECRET=your-jwt-secret
   ```

3. Comment out or remove PostgreSQL variables if present:
   ```env
   # POSTGRES_URL=...  # Not needed when using Turso
   ```

## Step 7: Initialize the Database

```bash
# Install dependencies
npm install

# Start the server (it will auto-initialize the schema)
npm start
```

The server will automatically:
1. Detect Turso configuration
2. Connect to your Turso database
3. Create all necessary tables
4. Be ready to use!

## Step 8: Seed Data (Optional)

Create a seed script for Turso (similar to `seed-books.js`):

```bash
node seed-books.js
```

The seeding script will automatically detect and use Turso if configured.

## Step 9: Deploy to Vercel

1. Add Turso credentials to Vercel:
   ```bash
   # Using Vercel CLI
   vercel env add TURSO_DATABASE_URL
   vercel env add TURSO_AUTH_TOKEN
   ```

   Or via Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `TURSO_DATABASE_URL` with your database URL
   - Add `TURSO_AUTH_TOKEN` with your auth token

2. Deploy:
   ```bash
   git add .
   git commit -m "Add Turso database support"
   git push origin main
   ```

Vercel will automatically deploy with Turso!

## Testing Your Connection

### Test Locally
```bash
# The server will show on startup:
# "Using Turso Cloud database (Edge SQLite)"

# Test health endpoint
curl http://localhost:3000/api/health
```

### Test on Vercel
```bash
curl https://your-app.vercel.app/api/health
```

Response should show:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01 12:00:00",
  "version": "SQLite 3.x.x",
  "provider": "Turso Cloud"
}
```

## Managing Your Turso Database

### View Database Shell
```bash
turso db shell literary-escape
```

This opens an interactive SQLite shell. Try:
```sql
-- List all tables
.tables

-- Count books
SELECT COUNT(*) FROM books;

-- View recent users
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- Exit
.quit
```

### View Database Locations
```bash
turso db show literary-escape
```

### Create Database Replicas
```bash
# Add a replica in another region for multi-region support
turso db replicate literary-escape fra  # Frankfurt, Germany
```

### Backup and Restore
```bash
# Turso automatically backs up your database
# To restore to a specific point in time:
turso db restore literary-escape --timestamp "2024-01-01T12:00:00Z"
```

## Turso CLI Cheat Sheet

```bash
# Database Management
turso db create <name>              # Create new database
turso db list                       # List all databases
turso db show <name>                # Show database details
turso db destroy <name>             # Delete database (careful!)

# Access & Tokens
turso db tokens create <name>       # Create auth token
turso db tokens list <name>         # List all tokens
turso db tokens revoke <name> <id>  # Revoke a token

# Replicas
turso db replicate <name> <location>  # Add replica
turso db locations                    # List available locations

# Interactive Shell
turso db shell <name>               # Open SQL shell
```

## Troubleshooting

### "Connection refused" error
- Check your `TURSO_DATABASE_URL` is correct (should start with `libsql://`)
- Verify your `TURSO_AUTH_TOKEN` is valid
- Ensure you're logged in: `turso auth login`

### "Database not found" error
- Verify database exists: `turso db list`
- Check database name matches in URL

### "Unauthorized" error
- Auth token may be expired - create a new one:
  ```bash
  turso db tokens create literary-escape
  ```

### Tables not created
- Delete `.env` cache and restart server
- Manually initialize: The server calls `initializeDatabase()` on startup
- Check server logs for errors

### Performance issues
- Consider adding replicas in regions closer to your users
- Use connection pooling (already implemented in code)

## Pricing

**Free Tier:**
- 9 GB total storage
- 1 billion row reads/month
- 25 million row writes/month
- Up to 3 databases
- Up to 3 locations per database

**Paid Plans:**
- Start at $29/month
- More storage and operations
- Additional locations
- Priority support

Perfect for development and small-to-medium production apps!

## Comparison: Turso vs PostgreSQL

| Feature | Turso | Vercel PostgreSQL |
|---------|-------|-------------------|
| **Type** | Edge SQLite (libSQL) | Traditional PostgreSQL |
| **Latency** | Ultra-low (edge) | Depends on region |
| **Free Tier** | 9 GB storage | 256 MB storage |
| **Reads/month** | 1 billion | Limited by compute |
| **Global Replication** | ✅ Built-in | ❌ Manual setup |
| **SQLite Compatible** | ✅ Yes | ❌ No |
| **Connection Pooling** | ✅ Automatic | Manual setup needed |
| **Best For** | Edge apps, global users | Complex queries, single region |

## Next Steps

1. ✅ Create Turso account
2. ✅ Install Turso CLI
3. ✅ Create database
4. ✅ Get credentials
5. ✅ Configure `.env`
6. ✅ Test locally
7. ✅ Deploy to Vercel
8. 🎉 Enjoy edge-powered SQLite!

## Additional Resources

- [Turso Documentation](https://docs.turso.tech/)
- [Turso Discord Community](https://discord.gg/turso)
- [libSQL GitHub](https://github.com/tursodatabase/libsql)
- [Turso Dashboard](https://turso.tech/app)
- [Turso Pricing](https://turso.tech/pricing)

---

**Need Help?**
- Check [Turso Docs](https://docs.turso.tech/)
- Join [Turso Discord](https://discord.gg/turso)
- Open an issue on GitHub
