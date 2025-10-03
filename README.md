# 📚 Literary Escape

**A Modern Online Bookstore Platform**

Literary Escape is a full-featured e-commerce bookstore application built with Node.js, Express, and SQLite. It offers a seamless shopping experience for book lovers with user authentication, shopping cart functionality, favorites management, and a comprehensive admin panel.

![Literary Escape Logo](./media/icon.png)

## 🚀 Features

### 📖 **For Customers**
- **Browse Books**: Explore books by category (Fiction, Non-Fiction) and genre
- **Advanced Search**: Search books by title, author, or description
- **User Accounts**: Secure registration and login with JWT authentication
- **Shopping Cart**: Add books to cart with quantity management
- **Favorites**: Save books to your wishlist
- **Order Management**: Place orders and track order history
- **Reviews & Ratings**: Rate and review books
- **Responsive Design**: Mobile-friendly interface with Bootstrap

### 🛠️ **For Administrators**
- **Admin Dashboard**: Comprehensive admin panel with analytics
- **Book Management**: Add, edit, delete, and manage book inventory
- **User Management**: View and manage user accounts
- **Order Management**: Process and track customer orders
- **Security Controls**: Secure admin authentication and role-based access

### 🎨 **Design & Categories**
- **Fiction Categories**: Crime, Magic Realism, Mystery, Science Fiction
- **Non-Fiction Categories**: Philosophy, Politics, Self-Help, True Crime
- **Curated Collections**: Discover new books and featured titles
- **Rich Media**: Book covers, audio previews, and engaging visuals

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3 with foreign key constraints
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 5, Font Awesome icons
- **Development**: Nodemon for development server

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vaelarr/Literary-Escape.git
   cd Literary-Escape
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Test database connection**
   ```bash
   npm run test-db
   ```

5. **Start the application**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin.html`

## 🗂️ Project Structure

```
Literary-Escape/
├── 📁 css/                    # Stylesheets
│   ├── style.css             # Main application styles
│   ├── admin_style.css       # Admin panel styles
│   └── common.css            # Shared styles
├── 📁 js/                     # Client-side JavaScript
│   ├── api-client.js         # API interaction layer
│   ├── database-book-display.js  # Book display logic
│   └── navbar-counts.js      # Navigation counters
├── 📁 media/                  # Static assets
│   ├── books/                # Book cover images
│   ├── Genres/               # Genre category images
│   └── [various media files]
├── 📄 *.html                  # Application pages
├── 📄 api.js                  # Express server & API routes
├── 📄 database.js             # Database operations & schema
├── 📄 package.json            # Project configuration
└── 📄 literary_escape.db      # SQLite database file
```

## 🔧 API Endpoints

### 📚 Books
- `GET /api/books` - Get all books (with optional filters)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### 👤 Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login

### 🛒 Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### ❤️ Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:bookId` - Remove from favorites

### 📦 Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Place new order
- `GET /api/admin/orders` - Get all orders (admin only)

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **books**: Book catalog with details, pricing, and inventory
- **users**: Customer accounts and profiles
- **admins**: Administrator accounts
- **cart**: Shopping cart items
- **favorites**: User wishlist
- **orders**: Order records
- **order_items**: Individual items in orders
- **reviews**: Book reviews and ratings

## 🔐 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication with tokens
- **Role-Based Access**: Separate user and admin roles
- **SQL Injection Protection**: Parameterized queries
- **Input Validation**: Server-side validation for all inputs

## 🎨 User Interface

- **Responsive Design**: Mobile-first approach with Bootstrap
- **Modern Aesthetics**: Clean, book-focused design
- **Intuitive Navigation**: Easy browsing by category and genre
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: Screen reader friendly and keyboard navigation

## 🧪 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run init-db` - Initialize database schema
- `npm run test-db` - Test database connectivity

### Environment Variables
Create a `.env` file for production deployment:
```env
JWT_SECRET=your-super-secure-secret-key
PORT=3000
NODE_ENV=production
```

## 📱 Usage Examples

### Customer Workflow
1. **Browse Books**: Visit homepage and explore by categories
2. **Search**: Use the search bar to find specific books
3. **Account**: Register/login to access personalized features
4. **Shopping**: Add books to cart and manage quantities
5. **Checkout**: Place orders and view order history

### Admin Workflow
1. **Login**: Access admin panel with admin credentials
2. **Manage Books**: Add new books, update inventory, set prices
3. **Monitor Orders**: View and process customer orders
4. **User Management**: View registered users and their activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Future Enhancements

### Known Issues
- None reported at this time

### Planned Features
- Payment gateway integration
- Email notifications
- Advanced analytics dashboard
- Book recommendations system
- Social features (sharing, reviews)


## 🙏 Acknowledgments

- Bootstrap team for the excellent CSS framework
- Font Awesome for beautiful icons
- The open-source community for inspiration and tools

---

**Built with ❤️ for book lovers everywhere**

*Literary Escape - Where every page is an adventure*