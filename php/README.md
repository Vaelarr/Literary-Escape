# Literary Escape - PHP Backend

This folder contains the PHP version of the Literary Escape backend, designed to work with MySQL via XAMPP.

## 📁 Structure

```
php/
├── config.php              # Database configuration & helper functions
├── auth.php               # JWT authentication & password validation
├── api.php                # Main API router (handles all endpoints)
├── init-db.php            # Database initialization & table creation
├── setup.php              # Setup script to initialize everything
├── .htaccess              # Apache URL rewriting rules
├── operations/            # Business logic organized by feature
│   ├── books.php         # Book CRUD operations
│   ├── users.php         # User authentication & profile
│   ├── cart.php          # Shopping cart operations
│   ├── favorites.php     # Favorites management
│   ├── orders.php        # Order processing
│   ├── reviews.php       # Review system
│   ├── admin.php         # Admin operations & dashboard
│   └── vouchers.php      # Voucher system
└── README.md             # This file
```

## 🚀 Setup Instructions

### Prerequisites
- XAMPP installed (with Apache & MySQL)
- PHP 7.4 or higher
- MySQL 5.7 or higher

### Step 1: Install XAMPP
Download and install XAMPP from https://www.apachefriends.org/

### Step 2: Create Database
1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create a new database:
```sql
CREATE DATABASE literary_escape CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Run Setup Script
Open terminal/command prompt in the project root directory:

```bash
cd d:\Development\Websites\Literary-Escape\php
php setup.php
```

This will:
- Test database connection
- Create all required tables
- Create default admin account
- Verify the setup

### Step 4: Configure Apache (Optional)
If you want cleaner URLs, ensure mod_rewrite is enabled in httpd.conf:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

## 🔧 Configuration

### Database Settings
Edit `config.php` to change database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Default XAMPP password is empty
define('DB_NAME', 'literary_escape');
```

### JWT Secret
Update the JWT secret in `config.php` (should match Node.js backend):

```php
define('JWT_SECRET', 'your-secret-key-here');
```

## 🌐 API Endpoints

The PHP backend provides the same endpoints as the Node.js version:

### Public Endpoints
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `GET /api/reviews/:bookId` - Get book reviews
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/vouchers/validate` - Validate voucher

### Protected Endpoints (Require Authentication)
- Cart: `/api/cart/*`
- Favorites: `/api/favorites/*`
- Orders: `/api/orders/*`
- Reviews: `/api/reviews` (POST, PUT, DELETE)
- User Profile: `/api/user/*`

### Admin Endpoints (Require Admin Role)
- Books: `/api/admin/books/*`
- Users: `/api/admin/users/*`
- Orders: `/api/admin/orders/*`
- Vouchers: `/api/admin/vouchers/*`
- Archive: `/api/admin/*/archive`, `/api/admin/*/unarchive`
- Dashboard: `/api/admin/dashboard/stats`

## 🔐 Default Admin Account

After setup, you can login with:
- **Email:** admin@literaryescape.com
- **Password:** Admin123!

## 🧪 Testing the API

### Test Database Connection
Visit: http://localhost/php/api/test-db

### Test with cURL
```bash
# Get all books
curl http://localhost/php/api/books

# Login
curl -X POST http://localhost/php/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@literaryescape.com","password":"Admin123!"}'
```

## 🔄 Using with Frontend

### Option 1: Switch Completely to PHP
Update `js/api-client.js`:

```javascript
this.baseURL = isLocalhost 
    ? 'http://localhost/php/api'  // Changed from :3000/api
    : '/api';
```

### Option 2: Run Both Backends
Keep both Node.js (port 3000) and PHP (port 80) running:

```javascript
// For Node.js/Turso
const apiNode = new APIClient('http://localhost:3000/api');

// For PHP/MySQL  
const apiPHP = new APIClient('http://localhost/php/api');
```

## 🆚 Differences from Node.js Backend

### What's the Same
- All API endpoints and functionality
- JWT authentication system
- Database schema (same tables, same fields)
- Response formats

### What's Different
- **Database:** MySQL instead of Turso (SQLite)
- **Server:** Apache/PHP instead of Node.js/Express
- **Port:** 80 (Apache) instead of 3000 (Node.js)
- **Language:** PHP instead of JavaScript
- **ORM:** PDO instead of direct SQL queries

## 🛠️ Troubleshooting

### "Database connection failed"
- Ensure XAMPP MySQL is running
- Check database credentials in config.php
- Verify database 'literary_escape' exists

### "Port 80 already in use"
- Stop IIS or other services using port 80
- Or change Apache port in XAMPP config

### "Class 'PDO' not found"
- Enable PDO extension in php.ini
- Uncomment: `extension=pdo_mysql`

### ".htaccess not working"
- Enable mod_rewrite in Apache
- Check AllowOverride in httpd.conf

## 📊 Database Schema

All tables match the Node.js/Turso schema:
- books (with archived column)
- users (with archived column)
- admins
- cart (with selected_for_checkout)
- favorites
- orders (with archived column)
- order_items
- reviews
- user_addresses
- vouchers

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention (PDO prepared statements)
- CORS headers configuration
- Input validation
- Error handling

## 📝 Development Notes

### Adding New Endpoints
1. Create function in appropriate operations file
2. Add route in `api.php`
3. Add authentication if needed

### Modifying Database
1. Update schema in `init-db.php`
2. Run setup.php again or manually alter tables
3. Update operations files if needed

## 🌟 Features

✅ Complete CRUD operations for all entities
✅ User authentication & authorization
✅ Admin panel support
✅ Shopping cart with selection
✅ Order processing
✅ Review system
✅ Voucher/discount system
✅ Archive functionality
✅ Dashboard statistics
✅ Pagination support
✅ Search & filtering

## 📧 Support

If you encounter issues:
1. Check XAMPP error logs
2. Enable error_reporting in config.php
3. Check Apache error.log
4. Verify database tables were created correctly

## ⚡ Performance Tips

- Use XAMPP's MySQL query cache
- Enable OPcache for PHP
- Add indexes to frequently queried columns
- Consider connection pooling for high traffic

---

**Note:** This PHP backend runs independently from your Node.js/Turso backend. Both can coexist without conflicts.
