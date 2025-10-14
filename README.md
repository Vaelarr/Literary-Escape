# 📚 Literary Escape - Complete Setup Guide

**A Modern Online Bookstore Platform with Vercel Deployment Support**

Literary Escape is a full-featured e-commerce bookstore with dual database support: SQLite for local development and PostgreSQL for production. This guide contains everything you need to set up, develop locally, and deploy to Vercel.

![Literary Escape](./media/icon.png)

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start - Local Development](#quick-start---local-development)
- [Complete Vercel Deployment Guide](#complete-vercel-deployment-guide)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Admin Panel Setup](#admin-panel-setup)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## Features

### For Customers
- **Browse & Search**: Explore books by category, genre, or search by title/author
- **User Accounts**: Secure registration and login with JWT authentication
- **Shopping Cart**: Add books with quantity management
- **Favorites**: Save books to wishlist
- **Order Management**: Place orders and track history
- **Reviews & Ratings**: Rate and review books
- **Responsive Design**: Mobile-friendly interface

### For Administrators
- **Admin Dashboard**: Analytics and comprehensive management panel
- **Inventory Management**: Add, edit, delete books and manage stock
- **User Management**: View and manage user accounts
- **Order Processing**: Track and manage customer orders
- **Security**: Role-based access control

### Design Features
- Fiction: Crime, Magic Realism, Mystery, Science Fiction
- Non-Fiction: Philosophy, Politics, Self-Help, True Crime
- Curated collections and featured titles

---

## Technology Stack

**Backend:**
- Node.js & Express.js
- Dual Database: SQLite3 (local) + PostgreSQL (production)
- JWT Authentication with bcrypt

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5, Font Awesome Icons

**Deployment:**
- Vercel (serverless)
- Automatic database switching
- SSL encryption

---

## Quick Start - Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git

### Step 1: Clone & Install

```bash
git clone https://github.com/Vaelarr/Literary-Escape.git
cd Literary-Escape
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The server starts at **http://localhost:3000**

### Step 3: Create Admin Account (Local)

```powershell
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    username = "admin"
    email = "admin@literaryescape.com"
    password = "Admin123!"
    first_name = "Admin"
    last_name = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/register" -Method POST -Headers $headers -Body $body
```

---

## Complete Vercel Deployment Guide

### What You'll Get

✅ Live website at **your-project.vercel.app**  
✅ Automatic HTTPS/SSL encryption  
✅ PostgreSQL cloud database  
✅ Automatic Git deployments  

### Part 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Part 2: Deploy to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your repository
4. Click **"Deploy"**

### Part 3: Create PostgreSQL Database

1. In Vercel Dashboard → Your Project
2. Click **"Storage"** tab
3. Click **"Create Database"** → Select **"Postgres"**
4. Choose a region close to your users
5. Click **"Create"**
6. Click **"Connect Project"** → Select your project

✅ Database automatically connected!

### Part 4: Set Environment Variables

In Vercel: **Settings** → **Environment Variables**

| Variable | Value |
|----------|-------|
| **JWT_SECRET** | Generate at [randomkeygen.com](https://randomkeygen.com) (32+ chars) |
| **NODE_ENV** | production |

### Part 5: Verify Deployment

Visit: **https://your-project.vercel.app/api/health**

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "version": "PostgreSQL 14.x..."
}
```

### Part 6: Create Admin Account (Production)

```powershell
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    username = "admin"
    email = "your-email@example.com"
    password = "YourSecurePassword123!"
    first_name = "Your"
    last_name = "Name"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-project.vercel.app/api/admin/register" -Method POST -Headers $headers -Body $body
```

### Deployment Checklist

- [ ] Site accessible at vercel.app URL
- [ ] PostgreSQL database created
- [ ] JWT_SECRET environment variable set
- [ ] Database health check returns "healthy"
- [ ] Admin account created
- [ ] Can browse books
- [ ] Can register/login
- [ ] Cart functionality works
- [ ] Admin panel accessible

---

## Database Configuration

### How It Works

The app **automatically** detects which database to use:

- **Local Development**: Uses SQLite (literary_escape.db)
- **Production (Vercel)**: Uses PostgreSQL (Vercel Postgres)

No manual configuration needed!

### Database Tables

Both databases have identical schemas:

- **books** - Book inventory with pricing and stock
- **users** - Customer accounts
- **admins** - Administrator accounts
- **cart** - Shopping cart items
- **favorites** - User wishlists
- **orders** - Order history
- **order_items** - Order line items
- **reviews** - Book reviews and ratings
- **archived_books** - Archived book records

---

## Environment Variables

### Local Development (.env)

```env
JWT_SECRET=your-local-development-secret
PORT=3000
NODE_ENV=development
```

### Production (Vercel Dashboard)

**Manually Set:**

```env
JWT_SECRET=your-super-secure-32-character-random-string
NODE_ENV=production
```

**Auto-Set by Vercel Postgres:**

```env
POSTGRES_URL=postgres://user:pass@host:5432/db
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

⚠️ **Never commit .env files to Git!**

---

## Admin Panel Setup

### Access Admin Panel

- **Local**: http://localhost:3000/admin.html
- **Production**: https://your-project.vercel.app/admin.html

### Admin Features

- Dashboard with analytics
- Book management (CRUD operations)
- Inventory control
- User management
- Order processing
- Archive management

---

## API Endpoints

### Public Endpoints

```
GET    /api/books                    # Get all books
GET    /api/books/:id                # Get single book
GET    /api/books/category/:category # Books by category
GET    /api/books/genre/:genre       # Books by genre
GET    /api/books/search/:term       # Search books
GET    /api/health                   # Database health
```

### User Endpoints (Auth Required)

```
POST   /api/users/register           # Register
POST   /api/users/login              # Login
GET    /api/cart                     # Get cart
POST   /api/cart/add                 # Add to cart
GET    /api/favorites                # Get favorites
POST   /api/orders/create            # Create order
```

### Admin Endpoints (Admin Auth Required)

```
POST   /api/admin/register           # Register admin
POST   /api/admin/login              # Admin login
POST   /api/admin/books              # Create book
PUT    /api/admin/books/:id          # Update book
DELETE /api/admin/books/:id          # Delete book
```

---

## Troubleshooting

### Local Development

**Port in use:**
```powershell
$env:PORT = 3001
npm run dev
```

**Module not found:**
```bash
npm install
```

### Vercel Deployment

**Database connection failed:**
1. Verify Postgres database created
2. Check database connected to project
3. Verify POSTGRES_URL in environment variables

**JWT errors:**
1. Set JWT_SECRET in Vercel environment variables
2. Clear browser cookies and login again

**Tables don't exist:**
- Visit your site to trigger schema creation
- Check Runtime Logs for initialization

### Common Errors

| Error | Solution |
|-------|----------|
| MODULE_NOT_FOUND | Run npm install |
| EADDRINUSE | Change PORT or kill process |
| JWT_SECRET missing | Add to Vercel settings |
| Connection timeout | Use same region for DB |

---

## Project Structure

```
Literary-Escape/
│
├── 📄 Configuration
│   ├── package.json
│   ├── vercel.json
│   ├── .env.example
│   └── .gitignore
│
├── 🗄️ Database
│   ├── database.js              # SQLite (local)
│   ├── database-postgres.js     # PostgreSQL (production)
│   ├── database-config.js       # Auto-switcher
│   └── seed-postgres.js         # Seeding script
│
├── 🚀 Backend
│   └── api.js                   # Express server
│
├── 🌐 Frontend
│   ├── index.html
│   ├── fiction.html
│   ├── non-fiction.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── favorites.html
│   ├── account.html
│   ├── admin.html
│   └── search-results.html
│
├── 🎨 Styles
│   └── css/
│       ├── common.css
│       ├── style.css
│       └── admin_style.css
│
├── 📜 Scripts
│   └── js/
│       ├── api-client.js
│       ├── custom-notifications.js
│       └── navbar-counts.js
│
└── 🖼️ Media
    └── media/books/
```

---

## Available NPM Scripts

```bash
npm run dev              # Start dev server with auto-reload
npm run start            # Start production server
npm run test-database    # Test database configuration
npm run db-health        # Check database health
npm run seed-postgres    # Seed PostgreSQL with sample data
```

---

## Security Features

✅ Password Hashing with bcrypt  
✅ JWT Authentication  
✅ SQL Injection Prevention  
✅ HTTPS on Vercel  
✅ SSL Database Connection  
✅ Environment Variables for Secrets  
✅ Role-Based Access Control  

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## License

MIT License

---

## Author

**Arianne Kaye E. Tupaen**

- GitHub: [@Vaelarr](https://github.com/Vaelarr)
- Project: [Literary-Escape](https://github.com/Vaelarr/Literary-Escape)

---

## Support

Need help?

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Vercel Documentation](https://vercel.com/docs)
3. Open an issue on GitHub

---

**🎉 You're all set! Happy coding!**

*Last updated: October 14, 2025*
