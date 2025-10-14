// Load environment variables
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { 
    bookOperations, 
    userOperations, 
    cartOperations, 
    favoritesOperations, 
    orderOperations,
    reviewsOperations,
    adminOperations,
    archiveOperations,
    initializeDatabase 
} = require('./database-config');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'; // In production, use environment variable

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        
        console.log('Admin middleware - Token payload:', user);
        
        // Check if this is an admin token
        if (user.role === 'admin' && user.isAdmin === true) {
            console.log('Admin authentication successful');
            
            // Verify admin still exists in database
            adminOperations.getById(user.userId, (err, adminData) => {
                if (err) {
                    console.log('Error getting admin by ID:', err);
                    return res.status(500).json({ error: 'Failed to verify admin' });
                }
                
                if (!adminData) {
                    console.log('Admin not found in database - token invalid');
                    return res.status(403).json({ error: 'Admin access revoked' });
                }
                
                console.log('Database admin verification successful');
                req.user = user;
                req.adminData = adminData;
                next();
            });
        } else {
            console.log('Admin access denied - not an admin token');
            return res.status(403).json({ error: 'Admin access required' });
        }
    });
}

// Book API endpoints - public read, admin write
app.get('/api/books', (req, res) => {
    const { category, genre, search } = req.query;
    
    if (search) {
        bookOperations.search(search, (err, books) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(books);
        });
    } else if (category) {
        bookOperations.getByCategory(category, (err, books) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(books);
        });
    } else if (genre) {
        bookOperations.getByGenre(genre, (err, books) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(books);
        });
    } else {
        bookOperations.getAll((err, books) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(books);
        });
    }
});

app.get('/api/books/:id', (req, res) => {
    bookOperations.getById(req.params.id, (err, book) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    });
});

// Admin book management endpoints (require admin authentication)
app.post('/api/books', authenticateAdmin, (req, res) => {
    const book = req.body;
    
    // Validate required fields
    if (!book.title || !book.author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }
    
    // Set defaults for optional fields
    const bookData = {
        ...book,
        price: book.price || 0,
        stock_quantity: book.stock_quantity || 1,
        category: book.category || 'Fiction',
        genre: book.genre || 'General'
    };
    
    console.log('Creating book:', bookData);
    
    bookOperations.add(bookData, function(err) {
        if (err) {
            console.error('Error creating book:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Book created with ID:', this.lastID);
        res.status(201).json({ id: this.lastID, message: 'Book created' });
    });
});

app.put('/api/books/:id', authenticateAdmin, (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = req.body;
    
    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    console.log('Updating book ID:', bookId, 'with data:', book);
    
    bookOperations.update(bookId, book, function(err) {
        if (err) {
            console.error('Error updating book:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Book updated, changes:', this.changes);
        res.json({ message: 'Book updated', changes: this.changes });
    });
});

app.delete('/api/books/:id', authenticateAdmin, (req, res) => {
    const bookId = parseInt(req.params.id);
    
    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    console.log('Deleting book ID:', bookId);
    
    bookOperations.removeBook(bookId, function(err) {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Book deleted, changes:', this.changes);
        res.json({ message: 'Book deleted', changes: this.changes });
    });
});

// User authentication endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, address, phone } = req.body;
        
        // Enhanced server-side password validation
        const passwordValidation = validatePasswordServer(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                error: `Password requirements not met: ${passwordValidation.errors.join(', ')}`
            });
        }
        
        // Check if user already exists
        userOperations.getByEmail(email, async (err, existingUser) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existingUser) return res.status(400).json({ error: 'User already exists' });
            
            // Hash password with enhanced security
            const saltRounds = 12; // Increased from default 10 for better security
            const password_hash = await bcrypt.hash(password, saltRounds);
            
            const newUser = {
                username, email, password_hash, first_name, last_name, address, phone
            };
            
            userOperations.register(newUser, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // First check if this email belongs to an admin account
    adminOperations.getByEmail(email, (err, admin) => {
        if (err) {
            console.error('Error checking admin table during regular login:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (admin) {
            // This email belongs to an admin account
            return res.status(403).json({ 
                error: 'Admin accounts must use the admin login portal. Please visit the admin panel to login.' 
            });
        }
        
        // Continue with regular user login
        userOperations.getByEmail(email, async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });
            
            // Additional check: Prevent any users with admin role from logging in through regular login
            if (user.role === 'Admin' || user.role === 'admin') {
                return res.status(403).json({ 
                    error: 'Admin accounts must use the admin login portal. Please visit the admin panel to login.' 
                });
            }
            
            try {
                const validPassword = await bcrypt.compare(password, user.password_hash);
                if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
            
                const token = jwt.sign(
                    { userId: user.id, email: user.email }, 
                    JWT_SECRET, 
                    { expiresIn: '24h' }
                );
                
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name
                    } 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    });
});

// Admin login endpoint - uses database authentication
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Admin login attempt for:', email);
    
    try {
        // Check if admin exists in database
        adminOperations.getByEmail(email, async (err, admin) => {
            if (err) {
                console.error('Database error during admin login:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!admin) {
                console.log('Admin not found in database:', email);
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            
            console.log('Admin found in database, verifying password...');
            
            // Verify password
            const passwordMatch = await bcrypt.compare(password, admin.password_hash);
            
            if (!passwordMatch) {
                console.log('Invalid password for admin:', email);
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            
            console.log('Admin credentials validated successfully');
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: admin.id,
                    email: admin.email,
                    role: 'admin',
                    isAdmin: true
                }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );
            
            res.json({ 
                token, 
                user: { 
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                    role: 'admin'
                } 
            });
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Cart endpoints
app.get('/api/cart', authenticateToken, (req, res) => {
    cartOperations.getCartItems(req.user.userId, (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(items);
    });
});

app.post('/api/cart', authenticateToken, (req, res) => {
    const { bookId, quantity } = req.body;
    cartOperations.addItem(req.user.userId, bookId, quantity, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item added to cart' });
    });
});

app.put('/api/cart/:bookId', authenticateToken, (req, res) => {
    const { quantity } = req.body;
    cartOperations.updateQuantity(req.user.userId, req.params.bookId, quantity, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cart updated' });
    });
});

app.delete('/api/cart/:bookId', authenticateToken, (req, res) => {
    cartOperations.removeItem(req.user.userId, req.params.bookId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item removed from cart' });
    });
});

// Cart selection endpoints for checkout
app.put('/api/cart/:bookId/select', authenticateToken, (req, res) => {
    const { selected } = req.body;
    cartOperations.updateSelection(req.user.userId, req.params.bookId, selected, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Selection updated' });
    });
});

app.post('/api/cart/select-all', authenticateToken, (req, res) => {
    cartOperations.selectAllForCheckout(req.user.userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'All items selected for checkout' });
    });
});

app.post('/api/cart/deselect-all', authenticateToken, (req, res) => {
    cartOperations.deselectAllForCheckout(req.user.userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'All items deselected' });
    });
});

app.get('/api/cart/selected', authenticateToken, (req, res) => {
    cartOperations.getSelectedItems(req.user.userId, (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(items);
    });
});

app.get('/api/cart/selected/total', authenticateToken, (req, res) => {
    cartOperations.getSelectedTotal(req.user.userId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Favorites endpoints
app.get('/api/favorites', authenticateToken, (req, res) => {
    favoritesOperations.getFavorites(req.user.userId, (err, favorites) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(favorites);
    });
});

app.post('/api/favorites', authenticateToken, (req, res) => {
    const { bookId } = req.body;
    favoritesOperations.addFavorite(req.user.userId, bookId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Added to favorites' });
    });
});

app.delete('/api/favorites/:bookId', authenticateToken, (req, res) => {
    favoritesOperations.removeFavorite(req.user.userId, req.params.bookId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Removed from favorites' });
    });
});

// Reviews endpoints
// Get reviews for a specific book
app.get('/api/reviews/:bookId', (req, res) => {
    const bookId = parseInt(req.params.bookId);
    reviewsOperations.getByBookId(bookId, (err, reviews) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(reviews);
    });
});

// Create a new review (requires authentication)
app.post('/api/reviews', authenticateToken, (req, res) => {
    const { bookId, rating, reviewText, reviewerName } = req.body;
    
    // Validate input
    if (!bookId || !rating || !reviewText || !reviewerName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if user has already reviewed this book
    reviewsOperations.hasUserReviewed(req.user.userId, bookId, (err, hasReviewed) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (hasReviewed) {
            return res.status(400).json({ error: 'You have already reviewed this book' });
        }
        
        // Create the review
        reviewsOperations.create(req.user.userId, bookId, rating, reviewText, reviewerName, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ 
                message: 'Review created successfully', 
                reviewId: result.id 
            });
        });
    });
});

// Get user's reviews
app.get('/api/user/reviews', authenticateToken, (req, res) => {
    reviewsOperations.getByUserId(req.user.userId, (err, reviews) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(reviews);
    });
});

// Update a review
app.put('/api/reviews/:reviewId', authenticateToken, (req, res) => {
    const { rating, reviewText } = req.body;
    const reviewId = parseInt(req.params.reviewId);
    
    if (!rating || !reviewText) {
        return res.status(400).json({ error: 'Rating and review text are required' });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    reviewsOperations.update(reviewId, req.user.userId, rating, reviewText, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }
        
        res.json({ message: 'Review updated successfully' });
    });
});

// Delete a review
app.delete('/api/reviews/:reviewId', authenticateToken, (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    
    reviewsOperations.delete(reviewId, req.user.userId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }
        
        res.json({ message: 'Review deleted successfully' });
    });
});

// Get average rating for a book
app.get('/api/reviews/:bookId/average', (req, res) => {
    const bookId = parseInt(req.params.bookId);
    reviewsOperations.getAverageRating(bookId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get user's review history with book information
app.get('/api/user/reviews', authenticateToken, (req, res) => {
    reviewsOperations.getUserReviewHistory(req.user.userId, (err, reviews) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(reviews);
    });
});

// Order endpoints
app.post('/api/orders', authenticateToken, (req, res) => {
    const { shippingAddress, paymentMethod, courier, discounts, totals } = req.body;
    
    console.log('📦 Order creation request received for user:', req.user.userId);
    console.log('📄 Order payload:', { shippingAddress, paymentMethod, courier, discounts, totals });

    // Get SELECTED cart items first
    cartOperations.getSelectedItems(req.user.userId, (err, cartItems) => {
        if (err) {
            console.error('❌ Error getting selected cart items:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log('🛒 Selected cart items found:', cartItems.length, 'items');
        console.log('📋 Cart items details:', cartItems);
        
        if (cartItems.length === 0) {
            console.log('⚠️ No selected cart items found for user:', req.user.userId);
            return res.status(400).json({ error: 'Cart is empty or no items selected for checkout' });
        }
        
        // Calculate total
        const itemsSubtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const totalAmount = totals && typeof totals.total === 'number' ? totals.total : itemsSubtotal;
        
        console.log('💰 Order totals - Items subtotal:', itemsSubtotal, 'Final total:', totalAmount);
        
        // Create order
        orderOperations.createOrder(req.user.userId, totalAmount, JSON.stringify({ shippingAddress, paymentMethod, courier, discounts, itemsSubtotal }), function(err) {
            if (err) {
                console.error('❌ Error creating order:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const orderId = this.lastID;
            console.log('✅ Order created with ID:', orderId);
            
            const orderItems = cartItems.map(item => ({
                book_id: item.book_id,
                quantity: item.quantity,
                price: item.price
            }));
            
            console.log('📚 Adding order items:', orderItems);
            
            // Add order items
            orderOperations.addOrderItems(orderId, orderItems, (err) => {
                if (err) {
                    console.error('❌ Error adding order items:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                console.log('✅ Order items added successfully');
                
                // Clear cart (remove selected items)
                cartOperations.clearCart(req.user.userId, (err) => {
                    if (err) {
                        console.error('❌ Error clearing cart:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    console.log('✅ Cart cleared successfully');
                    res.json({ message: 'Order created successfully', orderId });
                });
            });
        });
    });
});

app.get('/api/orders', authenticateToken, (req, res) => {
    orderOperations.getUserOrders(req.user.userId, (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(orders);
    });
});

// Admin: get orders for a specific user
app.get('/api/admin/users/:userId/orders', authenticateAdmin, (req, res) => {
    const userId = parseInt(req.params.userId);
    orderOperations.getUserOrders(userId, (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(orders);
    });
});

// Admin orders endpoints - UPDATED ENDPOINTS ARE BELOW WITH ARCHIVE FUNCTIONALITY

app.put('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status, shipping_address } = req.body;
    
    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    console.log('Admin updating order ID:', orderId, 'with:', { status, shipping_address });
    
    orderOperations.updateOrder(orderId, { status, shipping_address }, (err, result) => {
        if (err) {
            console.error('Error updating order:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Order updated, changes:', result.changes);
        res.json({ message: 'Order updated', changes: result.changes });
    });
});

app.delete('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    console.log('Admin deleting order ID:', orderId);
    
    orderOperations.deleteOrder(orderId, (err) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Order deleted successfully');
        res.json({ message: 'Order deleted' });
    });
});

// Get detailed order information for admin (includes customer info and items)
app.get('/api/admin/orders/:id/details', authenticateAdmin, (req, res) => {
    const orderId = parseInt(req.params.id);
    orderOperations.getAdminOrderDetails(orderId, (err, orderDetails) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!orderDetails) return res.status(404).json({ error: 'Order not found' });
        res.json(orderDetails);
    });
});

// ARCHIVE ENDPOINTS

// Archive a book
app.post('/api/admin/books/:id/archive', authenticateAdmin, (req, res) => {
    const bookId = parseInt(req.params.id);
    
    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    console.log('Admin archiving book ID:', bookId);
    
    archiveOperations.archiveBook(bookId, (err, result) => {
        if (err) {
            console.error('Error archiving book:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        console.log('Book archived successfully');
        res.json({ message: 'Book archived successfully' });
    });
});

// Unarchive a book
app.post('/api/admin/books/:id/unarchive', authenticateAdmin, (req, res) => {
    const bookId = parseInt(req.params.id);
    
    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    console.log('Admin unarchiving book ID:', bookId);
    
    archiveOperations.unarchiveBook(bookId, (err, result) => {
        if (err) {
            console.error('Error unarchiving book:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        console.log('Book unarchived successfully');
        res.json({ message: 'Book unarchived successfully' });
    });
});

// Archive a user
app.post('/api/admin/users/:id/archive', authenticateAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('Admin archiving user ID:', userId);
    
    archiveOperations.archiveUser(userId, (err, result) => {
        if (err) {
            console.error('Error archiving user:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User archived successfully');
        res.json({ message: 'User archived successfully' });
    });
});

// Unarchive a user
app.post('/api/admin/users/:id/unarchive', authenticateAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('Admin unarchiving user ID:', userId);
    
    archiveOperations.unarchiveUser(userId, (err, result) => {
        if (err) {
            console.error('Error unarchiving user:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User unarchived successfully');
        res.json({ message: 'User unarchived successfully' });
    });
});

// Archive an order
app.post('/api/admin/orders/:id/archive', authenticateAdmin, (req, res) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    console.log('Admin archiving order ID:', orderId);
    
    archiveOperations.archiveOrder(orderId, (err, result) => {
        if (err) {
            console.error('Error archiving order:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        console.log('Order archived successfully');
        res.json({ message: 'Order archived successfully' });
    });
});

// Unarchive an order
app.post('/api/admin/orders/:id/unarchive', authenticateAdmin, (req, res) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    console.log('Admin unarchiving order ID:', orderId);
    
    archiveOperations.unarchiveOrder(orderId, (err, result) => {
        if (err) {
            console.error('Error unarchiving order:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        console.log('Order unarchived successfully');
        res.json({ message: 'Order unarchived successfully' });
    });
});

// Get archived books
app.get('/api/admin/books/archived', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('Admin fetching archived books, page:', page, 'limit:', limit);
    
    archiveOperations.getArchivedBooks(page, limit, (err, result) => {
        if (err) {
            console.error('Error fetching archived books:', err);
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
});

// Get archived users
app.get('/api/admin/users/archived', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('Admin fetching archived users, page:', page, 'limit:', limit);
    
    archiveOperations.getArchivedUsers(page, limit, (err, result) => {
        if (err) {
            console.error('Error fetching archived users:', err);
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
});

// Get archived orders
app.get('/api/admin/orders/archived', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('Admin fetching archived orders, page:', page, 'limit:', limit);
    
    archiveOperations.getArchivedOrders(page, limit, (err, result) => {
        if (err) {
            console.error('Error fetching archived orders:', err);
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
});

// Get all books for admin (non-archived)
app.get('/api/admin/books', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || null;
    
    console.log('Admin fetching books, page:', page, 'limit:', limit, 'category:', category);
    
    adminOperations.getAllBooks(page, limit, category, (err, result) => {
        if (err) {
            console.error('Error fetching books for admin:', err);
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
});

// Get all users for admin (non-archived)
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('Admin fetching users, page:', page, 'limit:', limit);
    
    adminOperations.getAllUsers(page, limit, (err, result) => {
        if (err) {
            console.error('Error fetching users for admin:', err);
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', authenticateAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    console.log('Admin updating user role:', { userId, role });
    
    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }
    
    userOperations.updateRole(userId, role, (err, result) => {
        if (err) {
            console.error('Error updating user role:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User role updated successfully');
        res.json({ success: true, message: 'User role updated successfully' });
    });
});

// Update existing orders endpoint to use new admin method
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    
    if (req.query.status) {
        filters.status = req.query.status;
    }
    
    if (req.query.search) {
        filters.search = req.query.search;
    }
    
    console.log('Admin fetching orders, page:', page, 'limit:', limit, 'filters:', filters);
    
    adminOperations.getAllOrders(page, limit, filters, (err, result) => {
        if (err) {
            console.error('Error fetching orders for admin:', err);
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
});

// END ARCHIVE ENDPOINTS

// User profile endpoints
app.get('/api/user/profile', authenticateToken, (req, res) => {
    // Check if this is an admin token
    if (req.user.role === 'admin' && req.user.isAdmin === true) {
        // For admin users, get admin profile from database
        adminOperations.getById(req.user.userId, (err, admin) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!admin) return res.status(404).json({ error: 'Admin not found' });
            
            // Remove password hash from response
            const { password_hash, ...adminProfile } = admin;
            res.json(adminProfile);
        });
    } else {
        // Handle regular database users
        userOperations.getById(req.user.userId, (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });
            
            // Remove password hash from response
            const { password_hash, ...userProfile } = user;
            res.json(userProfile);
        });
    }
});

// Admin user management endpoints (require admin authentication)
app.get('/api/users', authenticateAdmin, (req, res) => {
    console.log('Admin requesting all users');
    
    // Use the admin operations method with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    adminOperations.getAllUsers(page, limit, (err, result) => {
        if (err) {
            console.error('Error getting users:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log('Returning users:', result);
        res.json(result);
    });
});

app.delete('/api/users/:id', authenticateAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('Admin deleting user ID:', userId);
    
    userOperations.deleteUser(userId, (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('User deleted successfully');
        res.json({ message: 'User deleted' });
    });
});

app.put('/api/user/profile', authenticateToken, (req, res) => {
    const { first_name, last_name, email, phone, address, birthdate, city, zip_code } = req.body;
    
    const profileData = {
        first_name,
        last_name,
        email,
        phone,
        address,
        birthdate,
        city,
        zip_code
    };

    userOperations.updateProfile(req.user.userId, profileData, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated successfully' });
    });
});

app.post('/api/user/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get current user
        userOperations.getById(req.user.userId, async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });
            
            // Verify current password
            const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!validPassword) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            
            // Validate new password
            const passwordValidation = validatePasswordServer(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({ 
                    error: `Password requirements not met: ${passwordValidation.errors.join(', ')}`
                });
            }
            
            // Hash new password
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            
            // Update password
            userOperations.updatePassword(req.user.userId, newPasswordHash, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Password changed successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User addresses endpoints
app.get('/api/user/addresses', authenticateToken, (req, res) => {
    userOperations.getUserAddresses(req.user.userId, (err, addresses) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(addresses);
    });
});

app.post('/api/user/addresses', authenticateToken, (req, res) => {
    const { label, full_address, city, zip_code, is_default } = req.body;
    
    const addressData = {
        user_id: req.user.userId,
        label,
        full_address,
        city,
        zip_code,
        is_default: is_default || false
    };

    userOperations.saveAddress(addressData, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Address saved successfully' });
    });
});

app.put('/api/user/addresses/:id/default', authenticateToken, (req, res) => {
    userOperations.setDefaultAddress(req.user.userId, req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Default address updated' });
    });
});

app.delete('/api/user/addresses/:id', authenticateToken, (req, res) => {
    userOperations.deleteAddress(req.user.userId, req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Address deleted successfully' });
    });
});

// Enhanced order details endpoint
app.get('/api/orders/:id', authenticateToken, (req, res) => {
    orderOperations.getOrderDetails(req.params.id, (err, orderDetails) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!orderDetails) return res.status(404).json({ error: 'Order not found' });
        
        // Verify order belongs to user
        if (orderDetails.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json(orderDetails);
    });
});

// Initialize database and start server
initializeDatabase((err) => {
    if (err) {
        console.error('Failed to initialize database:', err);
        return;
    }
    
    console.log('Database initialized successfully');
    
    // Only start the server if not running on Vercel (serverless environment)
    // Vercel handles the server startup automatically
    if (!process.env.VERCEL && require.main === module) {
        app.listen(PORT, () => {
            console.log(`API server running on http://localhost:${PORT}`);
            console.log('Database connection established and ready');
        });
    } else {
        console.log('Running in serverless environment (Vercel)');
    }
});

// Enhanced server-side password validation function with database logging
function validatePasswordServer(password) {
    console.log('Validating password on server side...');
    
    const errors = [];
    
    // Check if password exists
    if (!password) {
        errors.push('password is required');
        return { isValid: false, errors };
    }
    
    // Length check (minimum 8 characters)
    if (password.length < 8) {
        errors.push('minimum 8 characters required');
    }
    
    // Maximum length check (for security)
    if (password.length > 128) {
        errors.push('maximum 128 characters allowed');
    }
    
    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push('at least one uppercase letter required');
    }
    
    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push('at least one lowercase letter required');
    }
    
    // Number check
    if (!/\d/.test(password)) {
        errors.push('at least one number required');
    }
    
    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('at least one special character required (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('password is too common');
    }
    
    const result = {
        isValid: errors.length === 0,
        errors: errors
    };
    
    console.log('Password validation result:', result);
    return result;
}

// Add a test endpoint to verify database connectivity (public)
app.get('/api/test-db', async (req, res) => {
    try {
        // Test with a simple query that works across all database types
        const testResult = await new Promise((resolve, reject) => {
            bookOperations.getAll((err, books) => {
                if (err) reject(err);
                else resolve(books);
            });
        });
        
        res.json({ 
            success: true, 
            message: 'Database connection successful', 
            bookCount: testResult ? testResult.length : 0,
            databaseType: process.env.TURSO_DATABASE_URL ? 'Turso' : 
                         (process.env.POSTGRES_URL || process.env.DATABASE_URL) ? 'PostgreSQL' : 
                         'SQLite'
        });
    } catch (err) {
        console.error('Database test failed:', err);
        res.status(500).json({ 
            error: 'Database connection failed', 
            details: err.message 
        });
    }
});

// Voucher validation endpoint
app.post('/api/vouchers/validate', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Voucher code is required' });
    }
    
    // Mock voucher system - in production, this would query a vouchers table
    const validVouchers = {
        'SAVE10': { 
            valid: true, 
            discountAmount: 10, 
            description: '₱10 off your order',
            type: 'fixed',
            minOrder: 0
        },
        'SAVE50': { 
            valid: true, 
            discountAmount: 50, 
            description: '₱50 off your order',
            type: 'fixed',
            minOrder: 200
        },
        'NEWUSER': { 
            valid: true, 
            discountAmount: 25, 
            description: '₱25 off for new users',
            type: 'fixed',
            minOrder: 100
        },
        'PERCENT10': { 
            valid: true, 
            discountAmount: 10, 
            description: '10% off your order',
            type: 'percentage',
            minOrder: 150
        },
        'FREESHIP': { 
            valid: true, 
            discountAmount: 0, 
            description: 'Free shipping',
            type: 'freeshipping',
            minOrder: 0
        }
    };
    
    const voucher = validVouchers[code.toUpperCase()];
    if (voucher) {
        res.json(voucher);
    } else {
        res.json({ valid: false, message: 'Invalid voucher code' });
    }
});

// Debug endpoint to check current authentication state
app.get('/api/debug/auth', authenticateToken, (req, res) => {
    res.json({
        authenticated: true,
        tokenPayload: req.user,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']
    });
});

// Debug endpoint (public) to check if admin accounts exist
app.get('/api/debug/admin-status', (req, res) => {
    adminOperations.getByEmail('admin@literaryescape.com', (err, admin) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            adminAccountExists: !!admin,
            adminId: admin ? admin.id : null,
            timestamp: new Date().toISOString()
        });
    });
});

// Migration endpoint (admin only) to manually trigger database migrations
app.post('/api/admin/run-migrations', authenticateAdmin, async (req, res) => {
    try {
        console.log('🔧 Manual migration triggered by admin');
        
        // Import the database module to access query function
        const database = require('./database-config');
        
        // Check if we're using Turso
        if (database.query && typeof database.query === 'function') {
            const results = {
                users: { attempted: false, success: false, message: '' },
                orders: { attempted: false, success: false, message: '' }
            };
            
            // Migrate users table
            try {
                results.users.attempted = true;
                await database.query('ALTER TABLE users ADD COLUMN archived INTEGER DEFAULT 0');
                results.users.success = true;
                results.users.message = 'Column added successfully';
            } catch (error) {
                const errorMsg = error.message ? error.message.toLowerCase() : '';
                if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
                    results.users.success = true;
                    results.users.message = 'Column already exists';
                } else {
                    results.users.message = error.message;
                    // Try to verify column exists
                    try {
                        await database.query('SELECT archived FROM users LIMIT 1');
                        results.users.success = true;
                        results.users.message = 'Column verified (already exists)';
                    } catch (e) {
                        results.users.message = `Failed: ${error.message}`;
                    }
                }
            }
            
            // Migrate orders table
            try {
                results.orders.attempted = true;
                await database.query('ALTER TABLE orders ADD COLUMN archived INTEGER DEFAULT 0');
                results.orders.success = true;
                results.orders.message = 'Column added successfully';
            } catch (error) {
                const errorMsg = error.message ? error.message.toLowerCase() : '';
                if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
                    results.orders.success = true;
                    results.orders.message = 'Column already exists';
                } else {
                    results.orders.message = error.message;
                    // Try to verify column exists
                    try {
                        await database.query('SELECT archived FROM orders LIMIT 1');
                        results.orders.success = true;
                        results.orders.message = 'Column verified (already exists)';
                    } catch (e) {
                        results.orders.message = `Failed: ${error.message}`;
                    }
                }
            }
            
            res.json({
                success: results.users.success && results.orders.success,
                results,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({ error: 'Database query function not available' });
        }
    } catch (error) {
        console.error('❌ Migration endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export the app for Vercel
module.exports = app;
