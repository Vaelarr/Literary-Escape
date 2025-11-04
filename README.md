# 📚 Literary Escape

A modern online bookstore with user accounts, shopping cart, admin dashboard, and automatic database switching.

![Literary Escape](./media/icon.png)

## Features

- Browse books by category/genre, search, reviews & ratings
- User authentication, shopping cart, favorites, order history
- Admin dashboard for inventory, users, and order management
- Responsive design with Bootstrap 5

## Tech Stack

- **Backend**: Node.js, Express, SQLite (dev) / PostgreSQL (prod)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Deployment**: Vercel with automatic HTTPS


## Local Development

### Prerequisites
- Node.js v14+
- npm

### Setup
```bash
git clone https://github.com/Vaelarr/Literary-Escape.git
cd Literary-Escape
npm install
npm run dev
```

Visit **http://localhost:3000**

### Create Admin Account
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


## Vercel Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Deploy
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your repository → Click **Deploy**

### 3. Add Database
1. Project → **Storage** → **Create Database** → **Postgres**
2. Choose region → **Create** → **Connect Project**

### 4. Environment Variables
In Vercel: **Settings** → **Environment Variables**

- `JWT_SECRET`: Generate at [randomkeygen.com](https://randomkeygen.com)
- `NODE_ENV`: `production`

### 5. Create Admin
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


## Database Options

The app auto-detects database based on environment:

### SQLite (Local Development)
- Zero config, creates `literary_escape.db` automatically
- Perfect for local testing

### PostgreSQL (Vercel)
- Auto-configured when you add Vercel Postgres
- Environment variables set automatically

### Turso Cloud (Optional)
- Edge SQLite with global deployment
- See separate setup docs if needed

**Tables**: books, users, admins, cart, favorites, orders, order_items, reviews, archived_books


## Environment Variables

### Local (.env)
```env
JWT_SECRET=your-development-secret
PORT=3000
NODE_ENV=development
```

### Production (Vercel)
Set in **Settings** → **Environment Variables**:
- `JWT_SECRET`: Random 32+ character string
- `NODE_ENV`: `production`
- `POSTGRES_URL`: Auto-set by Vercel Postgres

⚠️ Never commit `.env` to Git!

## Admin Panel

- Local: http://localhost:3000/admin.html
- Production: https://your-project.vercel.app/admin.html

## API Endpoints

### Public
- `GET /api/books` - All books
- `GET /api/books/:id` - Single book
- `GET /api/books/category/:category` - By category
- `GET /api/books/search/:term` - Search

### Auth Required
- `POST /api/users/register` - Register
- `POST /api/users/login` - Login
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `POST /api/orders/create` - Create order

### Admin Only
- `POST /api/admin/register` - Create admin
- `POST /api/admin/books` - Create book
- `PUT /api/admin/books/:id` - Update book
- `DELETE /api/admin/books/:id` - Delete book


## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `$env:PORT = 3001; npm run dev` |
| Module not found | `npm install` |
| Database connection failed | Verify Postgres created & connected |
| JWT errors | Set JWT_SECRET in Vercel settings |
| Tables don't exist | Visit site to trigger auto-creation |

## NPM Scripts

```bash
npm run dev              # Dev server with auto-reload
npm run start            # Production server
npm run test-database    # Test database config
npm run db-health        # Check database health
```

## License

MIT License

## Author

**Arianne Kaye E. Tupaen**
- GitHub: [@Vaelarr](https://github.com/Vaelarr)

---

*Last updated: November 4, 2025*
