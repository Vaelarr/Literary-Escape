# 🐘 PHP Backend Migration Guide

Complete guide for migrating from Node.js/Turso to PHP/MySQL backend while keeping both systems operational.

## 📋 Table of Contents
1. [Overview](#overview)
2. [What Was Created](#what-was-created)
3. [Installation Steps](#installation-steps)
4. [Testing the Backend](#testing-the-backend)
5. [Switching Frontend to PHP](#switching-frontend-to-php)
6. [Running Both Backends](#running-both-backends)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What This Does
- Creates a complete PHP version of your Node.js backend
- Uses MySQL (via XAMPP) instead of Turso
- Maintains all existing functionality
- Keeps your Node.js/Turso backend completely intact
- Both backends can run simultaneously

### Technology Stack
- **Backend:** PHP 7.4+ (Apache)
- **Database:** MySQL 5.7+ (XAMPP)
- **Authentication:** JWT (same as Node.js)
- **Port:** 80 (Apache default)

---

## 📦 What Was Created

### Directory Structure
```
php/
├── config.php                  # Database config & helpers
├── auth.php                    # JWT authentication
├── api.php                     # Main API router
├── init-db.php                 # Database initialization
├── setup.php                   # Setup script
├── setup.bat                   # Windows quick setup
├── test.php                    # Test page
├── .htaccess                   # URL rewriting
├── api-client-config.js        # Frontend config examples
├── README.md                   # PHP backend docs
├── MIGRATION-GUIDE.md          # This file
└── operations/                 # Business logic
    ├── books.php              # Book operations
    ├── users.php              # User management
    ├── cart.php               # Shopping cart
    ├── favorites.php          # Favorites
    ├── orders.php             # Order processing
    ├── reviews.php            # Reviews
    ├── admin.php              # Admin operations
    └── vouchers.php           # Voucher system
```

### Key Features
✅ All API endpoints from Node.js version
✅ JWT authentication (compatible tokens)
✅ Same database schema
✅ Same response formats
✅ Archive functionality
✅ Admin panel support
✅ Pagination
✅ Search & filtering
✅ CORS support

---

## 🚀 Installation Steps

### Step 1: Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install with Apache and MySQL components
3. Start XAMPP Control Panel

### Step 2: Start Services
In XAMPP Control Panel:
1. Click "Start" for Apache
2. Click "Start" for MySQL

### Step 3: Create Database
**Option A - Using phpMyAdmin:**
1. Open http://localhost/phpmyadmin
2. Click "New" in sidebar
3. Database name: `literary_escape`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option B - Using MySQL Command:**
```sql
CREATE DATABASE literary_escape 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Setup
**Option A - Windows Quick Setup (Recommended):**
```bash
# Double-click this file in Windows Explorer:
d:\Development\Websites\Literary-Escape\php\setup.bat
```

**Option B - Manual Setup:**
```bash
# Open PowerShell/CMD in php directory:
cd d:\Development\Websites\Literary-Escape\php
php setup.php
```

### Step 5: Verify Installation
Setup should show:
```
✅ Successfully connected to MySQL
✅ All database tables created successfully
✅ Default admin account created
   Email: admin@literaryescape.com
   Password: Admin123!
```

---

## 🧪 Testing the Backend

### Test Page
Open in browser:
```
http://localhost/php/test.php
```

This interactive page shows:
- System information
- Database connection status
- Table counts
- Test buttons for API endpoints
- List of available endpoints

### Manual API Tests

**Test Database Connection:**
```
http://localhost/php/api/test-db
```

**Get All Books:**
```
http://localhost/php/api/books
```

**Admin Login:**
```powershell
# PowerShell
$body = @{
    email = "admin@literaryescape.com"
    password = "Admin123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost/php/api/admin/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 🔄 Switching Frontend to PHP

### Option 1: Complete Switch (Simplest)

Edit `js/api-client.js` around line 11:

**BEFORE:**
```javascript
this.baseURL = isLocalhost 
    ? 'http://localhost:3000/api'
    : '/api';
```

**AFTER:**
```javascript
this.baseURL = isLocalhost 
    ? 'http://localhost/php/api'
    : '/php/api';
```

### Option 2: URL Parameter Switching (Best for Development)

Replace the APIClient constructor in `js/api-client.js`:

```javascript
constructor() {
    // Check URL parameter for backend selection
    const urlParams = new URLSearchParams(window.location.search);
    const backendParam = urlParams.get('backend');
    
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    let usePhp = false;
    
    // Check URL parameter first, then localStorage
    if (backendParam === 'php') {
        usePhp = true;
        localStorage.setItem('preferredBackend', 'php');
    } else if (backendParam === 'node') {
        usePhp = false;
        localStorage.setItem('preferredBackend', 'node');
    } else {
        // Use saved preference
        usePhp = localStorage.getItem('preferredBackend') === 'php';
    }
    
    this.baseURL = isLocalhost 
        ? (usePhp ? 'http://localhost/php/api' : 'http://localhost:3000/api')
        : (usePhp ? '/php/api' : '/api');
    
    console.log(`🔧 Backend: ${usePhp ? 'PHP/MySQL' : 'Node.js/Turso'}`);
    console.log('📍 Base URL:', this.baseURL);
    
    this.token = localStorage.getItem('authToken');
    this.connectionTested = false;
    this.checkAndClearAdminToken();
}
```

**Usage:**
```
http://localhost/index.html?backend=php   # Use PHP backend
http://localhost/index.html?backend=node  # Use Node.js backend
http://localhost/index.html               # Use last selected
```

### Option 3: Environment Variable

Add before loading `api-client.js` in your HTML:

```html
<script>
    // Set to true for PHP, false for Node.js
    window.USE_PHP_BACKEND = true;
</script>
<script src="js/api-client.js"></script>
```

Then modify constructor:
```javascript
constructor() {
    const usePhp = window.USE_PHP_BACKEND || false;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    this.baseURL = isLocalhost 
        ? (usePhp ? 'http://localhost/php/api' : 'http://localhost:3000/api')
        : (usePhp ? '/php/api' : '/api');
    
    // ... rest of constructor
}
```

---

## 🔀 Running Both Backends

### Why Run Both?
- Compare performance
- Gradual migration
- A/B testing
- Backup/redundancy
- Development vs Production

### Configuration

**Node.js Backend:**
- Port: 3000
- Database: Turso (Cloud SQLite)
- URL: http://localhost:3000/api

**PHP Backend:**
- Port: 80
- Database: MySQL (Local)
- URL: http://localhost/php/api

### Switching Between Backends

**Method 1: URL Parameters (Recommended)**
```
http://localhost/index.html?backend=php
http://localhost/index.html?backend=node
```

**Method 2: Browser Console**
```javascript
// Switch to PHP
localStorage.setItem('preferredBackend', 'php');
location.reload();

// Switch to Node.js
localStorage.setItem('preferredBackend', 'node');
location.reload();
```

**Method 3: Separate Instances**
```javascript
// Create two API clients
const apiNode = new APIClient(); // Default Node.js
const apiPHP = {
    baseURL: 'http://localhost/php/api',
    async getBooks() {
        const res = await fetch(`${this.baseURL}/books`);
        return res.json();
    }
    // ... other methods
};

// Use them separately
const booksFromNode = await apiNode.getBooks();
const booksFromPHP = await apiPHP.getBooks();
```

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"

**Cause:** MySQL not running or database doesn't exist

**Solution:**
```bash
# 1. Start MySQL in XAMPP
# 2. Create database in phpMyAdmin
# 3. Check credentials in php/config.php
```

### Issue: "Port 80 already in use"

**Cause:** Another service (IIS, Skype) using port 80

**Solution:**
```bash
# Option 1: Stop conflicting service
# For IIS: Stop IIS in Services (services.msc)

# Option 2: Change Apache port in XAMPP
# Edit: xampp/apache/conf/httpd.conf
# Change: Listen 80 -> Listen 8080
# Then use: http://localhost:8080/php/api
```

### Issue: ".htaccess not working"

**Cause:** mod_rewrite not enabled

**Solution:**
```apache
# Edit xampp/apache/conf/httpd.conf
# Find and uncomment:
LoadModule rewrite_module modules/mod_rewrite.so

# Also ensure:
<Directory />
    AllowOverride All
</Directory>

# Restart Apache
```

### Issue: "Class 'PDO' not found"

**Cause:** PDO extension not enabled

**Solution:**
```ini
# Edit xampp/php/php.ini
# Uncomment these lines:
extension=pdo_mysql
extension=mysqli

# Restart Apache
```

### Issue: "404 Not Found" for API endpoints

**Cause:** Apache document root configuration

**Solution:**
```apache
# Check DocumentRoot in httpd.conf:
DocumentRoot "C:/xampp/htdocs"

# Your files should be in:
# C:/xampp/htdocs/php/
# Not: d:/Development/Websites/Literary-Escape/php/

# Option 1: Copy php folder to htdocs
# Option 2: Change DocumentRoot to your project
# Option 3: Create symlink
```

### Issue: "CORS errors in browser"

**Cause:** CORS headers not sent

**Solution:**
```php
# Already in config.php, but verify .htaccess:
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### Issue: "Token authentication fails"

**Cause:** JWT_SECRET mismatch

**Solution:**
```php
# In php/config.php, ensure JWT_SECRET matches Node.js:
define('JWT_SECRET', 'your-secret-key-here');

# Should match JWT_SECRET in api.js
```

### Issue: "Slow queries"

**Solution:**
```sql
# Add indexes to frequently queried columns:
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_archived ON books(archived);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_cart_user_id ON cart(user_id);
```

---

## 📊 Comparison: Node.js vs PHP

| Feature | Node.js (Current) | PHP (New) |
|---------|------------------|-----------|
| **Database** | Turso (Cloud SQLite) | MySQL (Local) |
| **Port** | 3000 | 80 |
| **Server** | Express.js | Apache |
| **Language** | JavaScript | PHP |
| **Deployment** | Vercel | Any PHP host |
| **Scalability** | Excellent (serverless) | Good (traditional) |
| **Cost** | Free (Turso limits) | Free (self-hosted) |
| **Speed** | Very fast | Fast |
| **Setup** | npm install | XAMPP install |

### When to Use Each:

**Use Node.js/Turso when:**
- Deploying to Vercel/serverless
- Need edge computing
- Want global distribution
- Prefer JavaScript everywhere
- Need real-time features

**Use PHP/MySQL when:**
- Have existing PHP hosting
- Need traditional database
- Prefer SQL flexibility
- Want local development
- Need complex transactions

---

## 🎓 Learning Resources

### PHP Resources
- [PHP Official Docs](https://www.php.net/docs.php)
- [PDO Tutorial](https://www.php.net/manual/en/book.pdo.php)
- [PHP: The Right Way](https://phptherightway.com/)

### MySQL Resources
- [MySQL Docs](https://dev.mysql.com/doc/)
- [phpMyAdmin Guide](https://docs.phpmyadmin.net/)

### XAMPP Resources
- [XAMPP Tutorial](https://www.apachefriends.org/faq.html)

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] XAMPP Apache is running
- [ ] XAMPP MySQL is running  
- [ ] Database `literary_escape` exists
- [ ] All 10 tables are created
- [ ] Default admin account works
- [ ] Test page loads: http://localhost/php/test.php
- [ ] API responds: http://localhost/php/api/test-db
- [ ] Can login with admin credentials
- [ ] Frontend connects to PHP backend
- [ ] Books display correctly
- [ ] Cart functionality works
- [ ] Orders can be created

---

## 🚀 Next Steps

1. **Test thoroughly** - Use test.php to verify all endpoints
2. **Migrate data** - If you have data in Turso, export and import to MySQL
3. **Update frontend** - Choose your preferred switching method
4. **Configure production** - Update for your hosting environment
5. **Monitor performance** - Compare both backends
6. **Choose one** - Decide which backend to use long-term

---

## 💡 Tips

- Keep both backends running during development
- Use URL parameters to switch between them
- Test all features with both backends
- PHP is easier to debug with var_dump()
- MySQL has better GUI tools (phpMyAdmin)
- Node.js is faster for concurrent requests
- PHP is simpler for traditional hosting

---

## 🆘 Need Help?

1. Check error logs:
   - Apache: xampp/apache/logs/error.log
   - PHP: php_error.log
   
2. Enable error display (development only):
   ```php
   // In config.php
   error_reporting(E_ALL);
   ini_set('display_errors', 1);
   ```

3. Test each component separately:
   - Database connection
   - Apache configuration
   - PHP syntax
   - API endpoints

---

**Remember:** Your Node.js/Turso backend is completely untouched and still working! This PHP backend is a separate, parallel implementation that can coexist peacefully. 🤝
