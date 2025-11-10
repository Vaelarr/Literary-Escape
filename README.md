# 📚 Literary Escape

A modern online bookstore with user accounts, shopping cart, admin dashboard, and automatic database switching.

![Literary Escape](./media/icon.png)

## ✨ Features

- **Book Browsing**: Browse by category/genre with advanced search, reviews & ratings
- **User Management**: Complete authentication system with registration, login, and password reset
- **Shopping Features**: Shopping cart, favorites/wishlist, and order history tracking
- **Admin Dashboard**: Comprehensive admin panel for inventory, user management, and order processing
- **Audit Trail**: Complete activity logging for admin actions
- **Email Notifications**: Automated email notifications for orders and account actions
- **Responsive Design**: Mobile-first design with Bootstrap 5

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, SQLite (local) / PostgreSQL (production)
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Bootstrap 5
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email Service**: Nodemailer for transactional emails
- **Deployment**: Vercel with automatic HTTPS and serverless functions


## 🚀 Local Development

### Prerequisites
- Node.js v14+ or higher
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/Vaelarr/Literary-Escape.git
cd Literary-Escape

# Install dependencies
npm install

# Create environment file
# Copy .env.example to .env and configure your settings

# Start development server
npm run dev
```

Visit **http://localhost:3000**

### Environment Variables for Local Development
Create a `.env` file in the root directory:
```env
JWT_SECRET=your-development-secret-key-here
PORT=3000
NODE_ENV=development
```

### Create Your First Admin Account
Use PowerShell to create an admin account:
```powershell
$body = @{
    username = "admin"
    email = "admin@literaryescape.com"
    password = "Admin123!"
    first_name = "Admin"
    last_name = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/register" -Method POST `
    -Headers @{"Content-Type"="application/json"} -Body $body
```



## 📦 Vercel Deployment

### 1. Prepare Your Repository
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Click **Deploy** (Vercel will auto-detect settings)

### 3. Add PostgreSQL Database
1. Go to your project on Vercel
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose your preferred region
6. Click **Create** and then **Connect to Project**

### 4. Configure Environment Variables
In Vercel Dashboard: **Settings** → **Environment Variables**

Add the following:
- `JWT_SECRET`: Generate a secure random string (32+ characters) at [randomkeygen.com](https://randomkeygen.com)
- `NODE_ENV`: `production`

> **Note**: `POSTGRES_URL` and related variables are automatically set when you connect Vercel Postgres

### 5. Create Your Production Admin Account
```powershell
$body = @{
    username = "admin"
    email = "your-email@example.com"
    password = "SecurePassword123!"
    first_name = "Your"
    last_name = "Name"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-project.vercel.app/api/admin/register" -Method POST `
    -Headers @{"Content-Type"="application/json"} -Body $body
```



## 🗄 Database Configuration

The application automatically detects and configures the appropriate database based on your environment:

### SQLite (Local Development)
- **Zero Configuration**: Automatically creates `literary_escape.db` on first run
- **Perfect for**: Local development and testing
- **Location**: Root directory of the project

### PostgreSQL (Production - Vercel)
- **Auto-configured**: Environment variables are set automatically when you add Vercel Postgres
- **Managed Service**: Vercel handles backups, scaling, and maintenance
- **Connection**: Uses `POSTGRES_URL` environment variable

### Database Schema
The following tables are automatically created on first run:
- `books` - Book inventory and details
- `users` - Customer accounts
- `admins` - Admin users with role-based access
- `cart` - Shopping cart items
- `favorites` - User wishlists
- `orders` - Order headers
- `order_items` - Order line items
- `reviews` - Book reviews and ratings
- `archived_books` - Soft-deleted books
- `admin_notifications` - Admin notification system
- `audit_trail` - Admin activity logs



## 🔐 Environment Variables

### Local Development (.env)
```env
# Required
JWT_SECRET=your-development-secret-key
PORT=3000
NODE_ENV=development

# Optional - Email Configuration (for password reset, order notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Literary Escape <noreply@literaryescape.com>
```

### Production (Vercel Settings)
Set in **Settings** → **Environment Variables**:
- `JWT_SECRET`: Secure random string (32+ characters)
- `NODE_ENV`: `production`
- `POSTGRES_URL`: ✅ Auto-set by Vercel Postgres
- Email variables (optional, same as local)

> ⚠️ **Security Warning**: Never commit `.env` to version control! It's already in `.gitignore`.


## 👨‍💼 Admin Panel Features

Access the admin panel at:
- **Local**: http://localhost:3000/admin.html
- **Production**: https://your-project.vercel.app/admin.html

### Admin Capabilities
- **Book Management**: Add, edit, archive, and restore books
- **User Management**: View and manage customer accounts
- **Order Processing**: View and fulfill customer orders
- **Analytics Dashboard**: Sales statistics and inventory insights
- **Audit Trail**: Complete logging of all admin actions
- **Notifications**: Real-time alerts for new orders and user registrations
- **Role-Based Access**: Moderator and Super Admin roles

### Admin Roles
- **Moderator**: Can manage books and view orders
- **Super Admin**: Full access including user management and system settings

## 📡 API Endpoints

### Public Endpoints (No Authentication)
```
GET  /api/books              # Get all books
GET  /api/books/:id          # Get single book by ID
GET  /api/books/category/:category  # Get books by category
GET  /api/books/search/:term # Search books
POST /api/users/register     # Register new user
POST /api/users/login        # User login
POST /api/password/request-reset  # Request password reset
POST /api/password/reset     # Reset password with token
```

### Authenticated User Endpoints (Requires JWT)
```
GET  /api/cart               # Get user's cart
POST /api/cart/add           # Add item to cart
PUT  /api/cart/update/:id    # Update cart item quantity
DELETE /api/cart/remove/:id  # Remove item from cart
POST /api/orders/create      # Create new order
GET  /api/orders/history     # Get user's order history
GET  /api/favorites          # Get user's favorites
POST /api/favorites/add      # Add book to favorites
DELETE /api/favorites/remove/:id  # Remove from favorites
POST /api/reviews            # Submit book review
```

### Admin Endpoints (Requires Admin JWT)
```
POST /api/admin/register     # Create admin account (restricted)
POST /api/admin/login        # Admin login
GET  /api/admin/books        # Get all books (including archived)
POST /api/admin/books        # Create new book
PUT  /api/admin/books/:id    # Update book
DELETE /api/admin/books/:id  # Archive book
POST /api/admin/books/:id/restore  # Restore archived book
GET  /api/admin/users        # Get all users
GET  /api/admin/orders       # Get all orders
PUT  /api/admin/orders/:id/status  # Update order status
GET  /api/admin/audit-trail  # Get audit log
GET  /api/admin/notifications  # Get admin notifications
PUT  /api/admin/notifications/:id/read  # Mark notification as read
```



## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** | Change port: `$env:PORT = 3001; npm run dev` |
| **Module not found** | Reinstall dependencies: `npm install` |
| **Database connection failed** | Verify Postgres is created and connected in Vercel |
| **JWT authentication errors** | Ensure `JWT_SECRET` is set in environment variables |
| **Tables don't exist** | Visit the site to trigger automatic table creation |
| **Email not sending** | Check email configuration in environment variables |
| **Admin login fails** | Ensure admin account exists via `/api/admin/register` |
| **CORS errors** | Check that requests are being made to the correct domain |

### Common Development Issues

**Database locked error (SQLite)**:
```bash
# Stop all node processes
taskkill /F /IM node.exe

# Remove the database file and restart
Remove-Item literary_escape.db
npm run dev
```

**Node modules issues**:
```bash
# Clean install
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

## 🧪 NPM Scripts

```bash
npm run dev              # Start development server with auto-reload (nodemon)
npm start                # Start production server
npm run test-database    # Test database connection
npm run db-health        # Check database health and schema
```

## 📁 Project Structure

```
Literary-Escape/
├── api/                    # Serverless API functions
│   └── index.js           # Vercel serverless entry point
├── css/                    # Stylesheets
│   ├── style.css          # Main styles
│   ├── admin_style.css    # Admin panel styles
│   └── common.css         # Shared styles
├── js/                     # Frontend JavaScript
│   ├── api-client.js      # API communication layer
│   ├── navbar-counts.js   # Dynamic cart/favorites counts
│   ├── navbar-profile.js  # User profile dropdown
│   └── database-book-display.js  # Book display logic
├── media/                  # Static assets
│   ├── books/             # Book cover images
│   └── Genres/            # Genre icons
├── docs/                   # Documentation
├── *.html                  # Frontend pages
├── api.js                  # Local development server
├── database.js            # Database abstraction layer
├── database-config.js     # Database configuration
├── email-service.js       # Email notification service
├── package.json           # Dependencies and scripts
└── vercel.json            # Vercel deployment config
```


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Arianne Kaye E. Tupaen**
- GitHub: [@Vaelarr](https://github.com/Vaelarr)
- Project Link: [https://github.com/Vaelarr/Literary-Escape](https://github.com/Vaelarr/Literary-Escape)

## 🙏 Acknowledgments

- Bootstrap team for the excellent CSS framework
- Font Awesome for icons
- Vercel for hosting and deployment platform
- All contributors who help improve this project

---

*Last updated: November 10, 2025*
