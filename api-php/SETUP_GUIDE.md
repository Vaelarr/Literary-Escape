# 🚀 PHP API Setup & Deployment Guide

## ✅ Migration Complete!

All Node.js/Express.js APIs have been successfully migrated to PHP. This guide will help you get the PHP API up and running.

---

## 📋 Prerequisites

- **PHP 7.4+** (8.0+ recommended)
- **Composer** (PHP dependency manager)
- **SQLite3 extension** enabled in PHP
- **OpenSSL extension** for JWT tokens
- **cURL extension** for external API calls

### Check Your PHP Installation

```powershell
php -v
php -m | Select-String -Pattern "pdo_sqlite|openssl|curl"
```

---

## 🔧 Installation Steps

### 1. Install Composer Dependencies

Navigate to the API directory and install dependencies:

```powershell
cd "e:\Websites\Literary Escape PHP\api-php"
composer install
```

This will install:
- `firebase/php-jwt` - JWT authentication
- `phpmailer/phpmailer` - Email service

### 2. Configure Environment

Create a `.env` file in `api-php/` (optional, for production):

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@literaryescape.com
SMTP_FROM_NAME=Literary Escape

# JWT Secret (change this!)
JWT_SECRET=your-secure-random-secret-key-here

# Database
DB_PATH=../literary_escape.db

# Environment
APP_ENV=production
```

### 3. Initialize Database

The database will auto-initialize on first run, but you can manually trigger it:

```powershell
php -r "require 'config/database.php'; Database::getInstance();"
```

This creates:
- All necessary tables
- Default admin account (username: `admin`, password: `admin123`)

**⚠️ IMPORTANT**: Change the default admin password immediately!

---

## 🏃 Running the API

### Development Server (Local Testing)

```powershell
cd "e:\Websites\Literary Escape PHP\api-php"
php -S localhost:8000
```

The API will be available at: `http://localhost:8000`

### Test the API

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:8000" -Method GET

# Test login
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/admin/login" -Method POST -Body $body -ContentType "application/json"
```

---

## 🔄 Updating Frontend to Use PHP API

### Option 1: Update API Client Base URL

Edit `js/api-client.js`:

```javascript
// Change from Node.js API
// const BASE_URL = 'http://localhost:3000';

// To PHP API
const BASE_URL = 'http://localhost:8000';
```

### Option 2: Keep Both APIs Running (Migration Period)

You can run both APIs simultaneously during migration:
- Node.js API: `http://localhost:3000`
- PHP API: `http://localhost:8000`

Then gradually switch endpoints one by one.

---

## 🗂️ API Structure Overview

```
api-php/
├── config/
│   └── database.php          # Database connection & schema
├── middleware/
│   └── auth.php              # JWT authentication
├── services/
│   └── email.php             # Email service
├── controllers/
│   ├── AuthController.php    # Login, register, password reset
│   ├── BookController.php    # Book CRUD operations
│   ├── CartController.php    # Shopping cart
│   ├── FavoritesController.php  # Wishlist
│   ├── OrderController.php   # Order processing
│   ├── ReviewController.php  # Book reviews
│   ├── UserController.php    # User profile
│   ├── AdminController.php   # Admin dashboard
│   ├── VoucherController.php # Discount codes
│   └── AuditController.php   # Audit trail
├── index.php                 # Main router
└── composer.json             # Dependencies
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-token` - Verify reset token
- `POST /api/auth/reset-password` - Reset password

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create book (admin)
- `PUT /api/books/{id}` - Update book (admin)
- `DELETE /api/books/{id}` - Delete book (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item quantity
- `PUT /api/cart/{id}/select` - Toggle item selection
- `PUT /api/cart/select-all` - Select all items
- `GET /api/cart/selected` - Get selected items
- `DELETE /api/cart/{id}` - Remove item from cart

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/{bookId}` - Remove from favorites

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/{id}` - Get order details
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/orders/{id}` - Get order details (admin)
- `PUT /api/admin/orders/{id}` - Update order (admin)
- `DELETE /api/admin/orders/{id}` - Delete order (admin)

### Reviews
- `GET /api/reviews/book/{bookId}` - Get book reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review
- `GET /api/reviews/book/{bookId}/rating` - Get average rating

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `GET /api/user/addresses` - Get addresses
- `POST /api/user/addresses` - Save address
- `PUT /api/user/addresses/{id}/default` - Set default address
- `DELETE /api/user/addresses/{id}` - Delete address
- `GET /api/user/reviews` - Get user's reviews

### Admin
- `GET /api/admin/books` - Get all books
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/books/{id}/archive` - Archive book
- `PUT /api/admin/books/{id}/unarchive` - Unarchive book
- `PUT /api/admin/users/{id}/archive` - Archive user
- `PUT /api/admin/orders/{id}/archive` - Archive order
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/admins` - Get all admins (super admin)
- `POST /api/admin/admins` - Create admin (super admin)
- `PUT /api/admin/admins/{id}` - Update admin (super admin)
- `DELETE /api/admin/admins/{id}` - Delete admin (super admin)

### Vouchers
- `GET /api/admin/vouchers` - Get all vouchers (admin)
- `GET /api/admin/vouchers/{id}` - Get voucher (admin)
- `POST /api/admin/vouchers` - Create voucher (admin)
- `PUT /api/admin/vouchers/{id}` - Update voucher (admin)
- `DELETE /api/admin/vouchers/{id}` - Delete voucher (admin)
- `POST /api/vouchers/validate` - Validate voucher code

### Audit Trail
- `GET /api/admin/audit` - Get audit trail (admin)
- `GET /api/admin/audit/recent` - Get recent entries (admin)
- `GET /api/admin/audit/entity/{type}` - Filter by entity type (admin)
- `GET /api/admin/audit/action/{type}` - Filter by action (admin)
- `GET /api/admin/audit/admin/{id}` - Filter by admin (admin)
- `GET /api/admin/audit/statistics` - Get statistics (admin)

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - BCRYPT with cost 12  
✅ **Role-Based Access** - User, Admin, Super Admin roles  
✅ **SQL Injection Protection** - PDO prepared statements  
✅ **Audit Trail** - All admin actions logged  
✅ **CORS Headers** - Configurable cross-origin support  

---

## 🐛 Troubleshooting

### Issue: "Class 'Firebase\JWT\JWT' not found"
**Solution**: Run `composer install` in the `api-php/` directory

### Issue: "Could not find driver"
**Solution**: Enable SQLite extension in `php.ini`:
```ini
extension=pdo_sqlite
extension=sqlite3
```

### Issue: "Permission denied" for database
**Solution**: Ensure write permissions on the database file and directory

### Issue: Email not sending
**Solution**: 
1. Check SMTP credentials in `services/email.php`
2. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
3. Check firewall/antivirus blocking port 587

---

## 📊 Database Schema

The PHP API uses the same SQLite database structure as the Node.js version:

- `users` - User accounts
- `admins` - Admin accounts
- `books` - Book catalog
- `cart_items` - Shopping cart
- `favorites` - User wishlists
- `orders` - Order records
- `order_items` - Order line items
- `reviews` - Book reviews
- `user_addresses` - Saved addresses
- `vouchers` - Discount codes
- `audit_trail` - Admin action logs
- `password_reset_tokens` - Password reset tokens

---

## 🚀 Production Deployment

### Apache Configuration

Create `.htaccess` in `api-php/`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

### Nginx Configuration

```nginx
location /api {
    try_files $uri $uri/ /api-php/index.php?$query_string;
}
```

### Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure SMTP for emails
- [ ] Enable HTTPS
- [ ] Set proper file permissions
- [ ] Enable error logging
- [ ] Disable display_errors in php.ini
- [ ] Regular database backups

---

## 📝 Next Steps

1. ✅ Install dependencies with `composer install`
2. ✅ Start the development server
3. ✅ Test API endpoints
4. ✅ Update frontend to use new API
5. ✅ Change default admin password
6. ✅ Configure email service
7. ✅ Deploy to production

---

## 💡 Key Differences from Node.js API

| Feature | Node.js | PHP |
|---------|---------|-----|
| **Async** | async/await | Synchronous |
| **Routing** | Express Router | Custom regex router |
| **Database** | Callback-based | PDO with prepared statements |
| **JWT** | jsonwebtoken | firebase/php-jwt |
| **Email** | nodemailer | PHPMailer |
| **Server** | `node api.js` | `php -S localhost:8000` |

---

## 📚 Additional Resources

- [PHP JWT Documentation](https://github.com/firebase/php-jwt)
- [PHPMailer Documentation](https://github.com/PHPMailer/PHPMailer)
- [PDO Documentation](https://www.php.net/manual/en/book.pdo.php)

---

**Migration completed successfully! 🎉**

For questions or issues, refer to the `PHP_MIGRATION_GUIDE.md` for detailed technical information.
