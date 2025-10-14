const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'literary_escape.db');

// Create database connection with better error handling
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        console.error('Database path:', dbPath);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        
        // Enable foreign keys
        db.run("PRAGMA foreign_keys = ON", (err) => {
            if (err) {
                console.error('Failed to enable foreign keys:', err);
            } else {
                console.log('Foreign keys enabled');
            }
        });
        
        // Test database functionality
        db.run("SELECT 1", (err) => {
            if (err) {
                console.error('Database test query failed:', err);
            } else {
                console.log('Database test query successful');
            }
        });
    }
});

// Initialize database schema with better error handling
function initializeDatabase(callback) {
    console.log('Initializing database schema...');
    
    const createBooksTable = `
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            isbn TEXT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT,
            category TEXT,
            genre TEXT,
            cover TEXT,
            price REAL,
            publisher TEXT,
            publication_date DATE,
            publication_year INTEGER,
            pages INTEGER,
            language TEXT DEFAULT 'English',
            format TEXT DEFAULT 'Paperback',
            weight REAL,
            dimensions TEXT,
            rating REAL DEFAULT 0,
            stock_quantity INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            sku TEXT,
            min_stock INTEGER DEFAULT 5,
            max_stock INTEGER DEFAULT 100,
            reorder_point INTEGER DEFAULT 10,
            reorder_quantity INTEGER DEFAULT 20,
            warehouse_location TEXT,
            cost_price REAL DEFAULT 0,
            discount_percentage REAL DEFAULT 0,
            supplier_name TEXT,
            supplier_contact TEXT,
            notes TEXT,
            archived BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            address TEXT,
            phone TEXT,
            birthdate DATE,
            city TEXT,
            zip_code TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

        const createAdminsTable = `
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createUserAddressesTable = `
        CREATE TABLE IF NOT EXISTS user_addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            full_address TEXT NOT NULL,
            city TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            is_default BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    const createCartTable = `
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            selected_for_checkout BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        )
    `;

    const createFavoritesTable = `
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        )
    `;

    const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;

    const createOrderItemsTable = `
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id)
        )
    `;

    const createReviewsTable = `
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            review_text TEXT NOT NULL,
            reviewer_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        )
    `;

    // Execute table creation in sequence with progress logging
    db.serialize(() => {
        console.log('Creating books table...');
        db.run(createBooksTable, (err) => {
            if (err) console.error('Error creating books table:', err);
            else console.log('Books table created/verified');
        });
        
        console.log('Creating users table...');
        db.run(createUsersTable, (err) => {
            if (err) console.error('Error creating users table:', err);
            else console.log('Users table created/verified');
        });

        console.log('Creating admins table...');
        db.run(createAdminsTable, (err) => {
            if (err) console.error('Error creating admin table:', err);
            else console.log('Admin table created/verified');
        });
        
        console.log('Creating user_addresses table...');
        db.run(createUserAddressesTable, (err) => {
            if (err) console.error('Error creating user_addresses table:', err);
            else console.log('User addresses table created/verified');
        });
        
        console.log('Creating cart table...');
        db.run(createCartTable, (err) => {
            if (err) console.error('Error creating cart table:', err);
            else console.log('Cart table created/verified');
        });
        
        console.log('Creating favorites table...');
        db.run(createFavoritesTable, (err) => {
            if (err) console.error('Error creating favorites table:', err);
            else console.log('Favorites table created/verified');
        });
        
        console.log('Creating orders table...');
        db.run(createOrdersTable, (err) => {
            if (err) console.error('Error creating orders table:', err);
            else console.log('Orders table created/verified');
        });
        
        console.log('Creating order_items table...');
        db.run(createOrderItemsTable, (err) => {
            if (err) console.error('Error creating order_items table:', err);
            else console.log('Order_items table created/verified');
        });
        
        console.log('Creating reviews table...');
        db.run(createReviewsTable, (err) => {
            if (err) {
                console.error('Error creating reviews table:', err.message);
                if (callback) callback(err);
            } else {
                console.log('Reviews table created/verified');
                
                // Run migrations to add new columns
                runMigrations(() => {
                    console.log('All database tables initialized successfully');
                    if (callback) callback(null);
                });
            }
        });
    });
}

// Database migrations for new features
function runMigrations(callback) {
    console.log('Running database migrations...');
    
    // Add selected_for_checkout column if it doesn't exist
    db.run("ALTER TABLE cart ADD COLUMN selected_for_checkout BOOLEAN DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding selected_for_checkout column:', err);
        } else {
            console.log('Cart table migration completed - selected_for_checkout column ready');
        }
    });
    
    // Add role column if it doesn't exist
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding role column:', err);
        } else {
            console.log('Users table migration completed - role column ready');
        }
    });

    // Add archive columns to books table
    db.run("ALTER TABLE books ADD COLUMN archived BOOLEAN DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding archived column to books:', err);
        } else {
            console.log('Books table migration completed - archived column ready');
        }
    });

    // Add new inventory management fields to books table
    const inventoryFields = [
        { name: 'publication_year', type: 'INTEGER', default: 'NULL' },
        { name: 'status', type: 'TEXT', default: "'active'" },
        { name: 'sku', type: 'TEXT', default: 'NULL' },
        { name: 'min_stock', type: 'INTEGER', default: '5' },
        { name: 'max_stock', type: 'INTEGER', default: '100' },
        { name: 'reorder_point', type: 'INTEGER', default: '10' },
        { name: 'reorder_quantity', type: 'INTEGER', default: '20' },
        { name: 'warehouse_location', type: 'TEXT', default: 'NULL' },
        { name: 'cost_price', type: 'REAL', default: '0' },
        { name: 'discount_percentage', type: 'REAL', default: '0' },
        { name: 'supplier_name', type: 'TEXT', default: 'NULL' },
        { name: 'supplier_contact', type: 'TEXT', default: 'NULL' },
        { name: 'notes', type: 'TEXT', default: 'NULL' }
    ];

    inventoryFields.forEach(field => {
        const alterQuery = `ALTER TABLE books ADD COLUMN ${field.name} ${field.type} DEFAULT ${field.default}`;
        db.run(alterQuery, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error(`Error adding ${field.name} column to books:`, err);
            } else if (!err) {
                console.log(`Books table migration completed - ${field.name} column added`);
            }
        });
    });

    // Add archive columns to users table
    db.run("ALTER TABLE users ADD COLUMN archived BOOLEAN DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding archived column to users:', err);
        } else {
            console.log('Users table migration completed - archived column ready');
        }
    });

    // Add archive columns to orders table
    db.run("ALTER TABLE orders ADD COLUMN archived BOOLEAN DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding archived column to orders:', err);
        } else {
            console.log('Orders table migration completed - archived column ready');
        }
        
        // Create admin account after all migrations
        createAdminAccount(() => {
            if (callback) callback(null);
        });
    });
}

// Create default admin account
function createAdminAccount(callback) {
    const bcrypt = require('bcrypt');
    const adminEmail = 'admin@literaryescape.com';
    const adminPassword = 'Admin123!';
    const adminFirstName = 'System';
    const adminLastName = 'Administrator';
    
    // Check if admin already exists
    db.get("SELECT id FROM admins WHERE email = ?", [adminEmail], (err, row) => {
        if (err) {
            console.error('Error checking for existing administrators:', err);
            if (callback) callback(err);
            return;
        }
        
        if (row) {
            console.log('Administrator account already exists');
            if (callback) callback(null);
            return;
        }
        
        // Create admin account
        bcrypt.hash(adminPassword, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing admin password:', err);
                if (callback) callback(err);
                return;
            }
            
            const query = `
                INSERT INTO admins (username, email, password_hash, first_name, last_name, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(query, ['admin', adminEmail, hash, adminFirstName, adminLastName, 'admin'], function(err) {
                if (err) {
                    console.error('Error creating Administrator account:', err);
                } else {
                    console.log('Administrator account created successfully');
                    console.log('Administrator credentials:');
                    console.log('Email:', adminEmail);
                    console.log('Password:', adminPassword);
                }
                if (callback) callback(err);
            });
        });
    });
}

// CRUD operations for books
const bookOperations = {
    // Get all books (excluding archived)
    getAll: (callback) => {
        const query = `SELECT * FROM books WHERE archived = 0 OR archived IS NULL ORDER BY title`;
        db.all(query, [], callback);
    },

    // Get book by ID (excluding archived)
    getById: (id, callback) => {
        const query = `SELECT * FROM books WHERE id = ? AND (archived = 0 OR archived IS NULL)`;
        db.get(query, [id], callback);
    },
    
    // Get books by category (excluding archived)
    getByCategory: (category, callback) => {
        const query = `SELECT * FROM books WHERE category = ? AND (archived = 0 OR archived IS NULL) ORDER BY title`;
        db.all(query, [category], callback);
    },

    // Get books by genre (excluding archived)
    getByGenre: (genre, callback) => {
        const query = `SELECT * FROM books WHERE genre = ? AND (archived = 0 OR archived IS NULL) ORDER BY title`;
        db.all(query, [genre], callback);
    },

    // Add new book
    add: (book, callback) => {
        const query = `
            INSERT INTO books (isbn, title, author, description, category, genre, cover, price, 
                             publisher, publication_date, pages, language, format, weight, 
                             dimensions, rating, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            book.isbn || `978-0-000-${Math.floor(Math.random() * 90000) + 10000}-0`,
            book.title, book.author, book.description, book.category,
            book.genre, book.cover, book.price, 
            book.publisher || 'Unknown Publisher',
            book.publication_date || '2020-01-01',
            book.pages || 300,
            book.language || 'English',
            book.format || 'Paperback',
            book.weight || 0.3,
            book.dimensions || '5.5 x 8.0 x 1.0 inches',
            book.rating || 4.0,
            book.stock_quantity || book.stock_quantity || 1
        ];
        db.run(query, values, callback);
    },

    // Update book
    update: (id, book, callback) => {
        // First get the existing book to preserve values not being updated
        const getQuery = `SELECT * FROM books WHERE id = ?`;
        db.get(getQuery, [id], (err, existingBook) => {
            if (err) return callback(err);
            if (!existingBook) return callback(new Error('Book not found'));
            
            const query = `
                UPDATE books SET
                    isbn = ?, title = ?, author = ?, description = ?, category = ?,
                    genre = ?, cover = ?, price = ?, publisher = ?, publication_date = ?,
                    pages = ?, language = ?, format = ?, weight = ?, dimensions = ?,
                    rating = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const values = [
                book.isbn || existingBook.isbn,
                book.title || existingBook.title,
                book.author || existingBook.author,
                book.description || existingBook.description,
                book.category || existingBook.category,
                book.genre || existingBook.genre,
                book.cover || existingBook.cover,
                book.price !== undefined ? book.price : existingBook.price,
                book.publisher || existingBook.publisher,
                book.publication_date || existingBook.publication_date,
                book.pages || existingBook.pages,
                book.language || existingBook.language,
                book.format || existingBook.format,
                book.weight || existingBook.weight,
                book.dimensions || existingBook.dimensions,
                book.rating !== undefined ? book.rating : existingBook.rating,
                book.stock_quantity !== undefined ? book.stock_quantity : existingBook.stock_quantity,
                id
            ];
            db.run(query, values, callback);
        });
    },

    // Delete book
    removeBook: (id, callback) => {
        const query = `DELETE FROM books WHERE id = ?`;
        db.run(query, [id], callback);
    },

    // Search books (excluding archived)
    search: (term, callback) => {
        const query = `
            SELECT * FROM books 
            WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?)
            AND (archived = 0 OR archived IS NULL)
            ORDER BY title
        `;
        const searchTerm = `%${term}%`;
        db.all(query, [searchTerm, searchTerm, searchTerm], callback);
    }
};

// Enhanced user operations with better error handling
const userOperations = {
    // Register new user with validation logging
    register: (user, callback) => {
        console.log('Attempting to register user:', user.email);
        
        const query = `
            INSERT INTO users (username, email, password_hash, first_name, last_name, address, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [user.username, user.email, user.password_hash, user.first_name, user.last_name, user.address, user.phone];
        
        db.run(query, values, function(err) {
            if (err) {
                console.error('User registration failed:', err.message);
                console.error('Registration data:', { 
                    username: user.username, 
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                });
            } else {
                console.log('User registered successfully with ID:', this.lastID);
            }
            callback(err);
        });
    },

    // Get user by email
    getByEmail: (email, callback) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        db.get(query, [email], callback);
    },

    // Get user by ID
    getById: (id, callback) => {
        const query = `SELECT * FROM users WHERE id = ?`;
        db.get(query, [id], callback);
    },

    // Update user profile
    updateProfile: (id, profileData, callback) => {
        const query = `
            UPDATE users SET 
                first_name = ?, last_name = ?, email = ?, phone = ?, 
                address = ?, birthdate = ?, city = ?, zip_code = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const values = [
            profileData.first_name, profileData.last_name, profileData.email, 
            profileData.phone, profileData.address, profileData.birthdate, 
            profileData.city, profileData.zip_code, id
        ];
        db.run(query, values, callback);
    },

    // Update password
    updatePassword: (userId, passwordHash, callback) => {
        const query = `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(query, [passwordHash, userId], callback);
    },

    // Get user addresses
    getUserAddresses: (userId, callback) => {
        const query = `SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`;
        db.all(query, [userId], callback);
    },

    // Save user address
    saveAddress: (addressData, callback) => {
        // If setting as default, first unset all other defaults for this user
        if (addressData.is_default) {
            const unsetDefaultQuery = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`;
            db.run(unsetDefaultQuery, [addressData.user_id], (err) => {
                if (err) return callback(err);
                
                // Now insert the new address
                insertAddress();
            });
        } else {
            insertAddress();
        }

        function insertAddress() {
            const query = `
                INSERT INTO user_addresses (user_id, label, full_address, city, zip_code, is_default)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [
                addressData.user_id, addressData.label, addressData.full_address,
                addressData.city, addressData.zip_code, addressData.is_default ? 1 : 0
            ];
            db.run(query, values, callback);
        }
    },

    // Set default address
    setDefaultAddress: (userId, addressId, callback) => {
        db.serialize(() => {
            // First unset all defaults for this user
            db.run(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`, [userId]);
            
            // Then set the selected address as default
            db.run(
                `UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?`, 
                [addressId, userId], 
                callback
            );
        });
    },

    // Delete address
    deleteAddress: (userId, addressId, callback) => {
        const query = `DELETE FROM user_addresses WHERE id = ? AND user_id = ?`;
        db.run(query, [addressId, userId], callback);
    }
};

// Admin-oriented user operations (list and delete)
userOperations.getAll = (callback) => {
    const query = `
        SELECT id, username, email, first_name, last_name, created_at
        FROM users
        ORDER BY created_at DESC
    `;
    db.all(query, [], callback);
};

userOperations.deleteUser = (id, callback) => {
    const query = `DELETE FROM users WHERE id = ?`;
    db.run(query, [id], callback);
};

userOperations.updateRole = (userId, role, callback) => {
    console.log('Updating user role in database:', { userId, role });
    const query = `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [role, userId], function(err) {
        if (err) {
            console.error('Error updating user role:', err);
            return callback(err);
        }
        
        if (this.changes === 0) {
            console.log('No user found with ID:', userId);
            return callback(null, false);
        }
        
        console.log('User role updated successfully');
        callback(null, true);
    });
};

// Cart operations
const cartOperations = {
    // Add item to cart
    addItem: (userId, bookId, quantity, callback) => {
        const query = `
            INSERT OR REPLACE INTO cart (user_id, book_id, quantity)
            VALUES (?, ?, COALESCE((SELECT quantity FROM cart WHERE user_id = ? AND book_id = ?), 0) + ?)
        `;
        db.run(query, [userId, bookId, userId, bookId, quantity || 1], callback);
    },

    // Get user's cart items
    getCartItems: (userId, callback) => {
        const query = `
            SELECT c.*, b.title, b.author, b.price, b.cover, b.stock_quantity
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        db.all(query, [userId], callback);
    },

    // Update item quantity
    updateQuantity: (userId, bookId, quantity, callback) => {
        const query = `UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?`;
        db.run(query, [quantity, userId, bookId], callback);
    },

    // Remove item from cart
    removeItem: (userId, bookId, callback) => {
        const query = `DELETE FROM cart WHERE user_id = ? AND book_id = ?`;
        db.run(query, [userId, bookId], callback);
    },

    // Clear user's cart
    clearCart: (userId, callback) => {
        const query = `DELETE FROM cart WHERE user_id = ?`;
        db.run(query, [userId], callback);
    },

    // Get cart total
    getCartTotal: (userId, callback) => {
        const query = `
            SELECT SUM(c.quantity * b.price) as total
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ?
        `;
        db.get(query, [userId], callback);
    },

    // Update item selection for checkout
    updateSelection: (userId, bookId, selected, callback) => {
        const query = `UPDATE cart SET selected_for_checkout = ? WHERE user_id = ? AND book_id = ?`;
        db.run(query, [selected ? 1 : 0, userId, bookId], callback);
    },

    // Select all items for checkout
    selectAllForCheckout: (userId, callback) => {
        const query = `UPDATE cart SET selected_for_checkout = 1 WHERE user_id = ?`;
        db.run(query, [userId], callback);
    },

    // Deselect all items for checkout
    deselectAllForCheckout: (userId, callback) => {
        const query = `UPDATE cart SET selected_for_checkout = 0 WHERE user_id = ?`;
        db.run(query, [userId], callback);
    },

    // Get only selected items for checkout
    getSelectedItems: (userId, callback) => {
        const query = `
            SELECT c.*, b.title, b.author, b.price, b.cover, b.stock_quantity
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ? AND c.selected_for_checkout = 1
            ORDER BY c.created_at DESC
        `;
        db.all(query, [userId], callback);
    },

    // Get selected items total
    getSelectedTotal: (userId, callback) => {
        const query = `
            SELECT SUM(c.quantity * b.price) as total, COUNT(c.id) as count
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ? AND c.selected_for_checkout = 1
        `;
        db.get(query, [userId], callback);
    }
};

// Favorites operations
const favoritesOperations = {
    // Add to favorites
    addFavorite: (userId, bookId, callback) => {
        const query = `INSERT OR IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)`;
        db.run(query, [userId, bookId], callback);
    },

    // Remove from favorites
    removeFavorite: (userId, bookId, callback) => {
        const query = `DELETE FROM favorites WHERE user_id = ? AND book_id = ?`;
        db.run(query, [userId, bookId], callback);
    },

    // Get user's favorites
    getFavorites: (userId, callback) => {
        const query = `
            SELECT f.*, b.title, b.author, b.price, b.cover, b.rating
            FROM favorites f
            JOIN books b ON f.book_id = b.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;
        db.all(query, [userId], callback);
    },

    // Check if book is in favorites
    isFavorite: (userId, bookId, callback) => {
        const query = `SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND book_id = ?`;
        db.get(query, [userId, bookId], (err, row) => {
            if (err) return callback(err);
            callback(null, row.count > 0);
        });
    }
};

// Order operations
const orderOperations = {
    // Create new order
    createOrder: (userId, totalAmount, shippingAddress, callback) => {
        const query = `
            INSERT INTO orders (user_id, total_amount, shipping_address)
            VALUES (?, ?, ?)
        `;
        db.run(query, [userId, totalAmount, shippingAddress], callback);
    },

    // Add order items
    addOrderItems: (orderId, items, callback) => {
        const query = `
            INSERT INTO order_items (order_id, book_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `;
        
        db.serialize(() => {
            const stmt = db.prepare(query);
            items.forEach(item => {
                stmt.run([orderId, item.book_id, item.quantity, item.price]);
            });
            stmt.finalize(callback);
        });
    },

    // Get user's orders
    getUserOrders: (userId, callback) => {
        const query = `
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        db.all(query, [userId], callback);
    },

    // Get order details with items
    getOrderDetails: (orderId, callback) => {
        const orderQuery = `SELECT * FROM orders WHERE id = ?`;
        const itemsQuery = `
            SELECT oi.*, b.title, b.author, b.cover
            FROM order_items oi
            JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        `;
        
        db.get(orderQuery, [orderId], (err, order) => {
            if (err) return callback(err);
            if (!order) return callback(null, null);
            
            db.all(itemsQuery, [orderId], (err, items) => {
                if (err) return callback(err);
                callback(null, { ...order, items });
            });
        });
    }
};

// Admin order operations
orderOperations.getAllOrders = (callback) => {
    const query = `
        SELECT o.*, u.username, u.email, u.first_name, u.last_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    `;
    db.all(query, [], callback);
};

// Get detailed order information for admin (includes customer details and ordered books)
orderOperations.getAdminOrderDetails = (orderId, callback) => {
    const orderQuery = `
        SELECT 
            o.*,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            u.address
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    `;
    
    const itemsQuery = `
        SELECT 
            oi.*,
            b.title,
            b.author,
            b.cover,
            b.category,
            b.genre
        FROM order_items oi
        JOIN books b ON oi.book_id = b.id
        WHERE oi.order_id = ?
    `;
    
    db.get(orderQuery, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(null, null);
        
        db.all(itemsQuery, [orderId], (err, items) => {
            if (err) return callback(err);
            
            // Parse shipping address if it's JSON
            let shippingInfo = {};
            if (order.shipping_address) {
                try {
                    shippingInfo = JSON.parse(order.shipping_address);
                } catch (e) {
                    shippingInfo = { address: order.shipping_address };
                }
            }
            
            callback(null, { 
                ...order, 
                items,
                shippingInfo 
            });
        });
    });
};

orderOperations.updateOrder = (orderId, fields, callback) => {
    // Only allow updating status and shipping_address for now
    const updates = [];
    const values = [];
    if (typeof fields.status !== 'undefined') {
        updates.push('status = ?');
        values.push(fields.status);
    }
    if (typeof fields.shipping_address !== 'undefined') {
        updates.push('shipping_address = ?');
        values.push(fields.shipping_address);
    }
    if (updates.length === 0) return callback(null, { changes: 0 });
    values.push(orderId);
    const query = `UPDATE orders SET ${updates.join(', ')}, created_at = created_at WHERE id = ?`;
    db.run(query, values, function(err){
        if (err) return callback(err);
        callback(null, { changes: this.changes });
    });
};

orderOperations.deleteOrder = (orderId, callback) => {
    db.serialize(() => {
        db.run(`DELETE FROM order_items WHERE order_id = ?`, [orderId], (err) => {
            if (err) return callback(err);
            db.run(`DELETE FROM orders WHERE id = ?`, [orderId], callback);
        });
    });
};

// Reviews operations
const reviewsOperations = {
    // Create a new review
    create: (userId, bookId, rating, reviewText, reviewerName, callback) => {
        const query = `
            INSERT INTO reviews (user_id, book_id, rating, review_text, reviewer_name)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(query, [userId, bookId, rating, reviewText, reviewerName], function(err) {
            if (err) {
                console.error('Error creating review:', err);
                return callback(err);
            }
            callback(null, { id: this.lastID });
        });
    },

    // Get all reviews for a specific book
    getByBookId: (bookId, callback) => {
        const query = `
            SELECT r.*, u.username
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.book_id = ?
            ORDER BY r.created_at DESC
        `;
        db.all(query, [bookId], (err, rows) => {
            if (err) {
                console.error('Error fetching reviews:', err);
                return callback(err);
            }
            callback(null, rows);
        });
    },

    // Get all reviews by a specific user
    getByUserId: (userId, callback) => {
        const query = `
            SELECT r.*, b.title, b.author, b.cover
            FROM reviews r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching user reviews:', err);
                return callback(err);
            }
            callback(null, rows);
        });
    },

    // Update a review
    update: (reviewId, userId, rating, reviewText, callback) => {
        const query = `
            UPDATE reviews 
            SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `;
        db.run(query, [rating, reviewText, reviewId, userId], function(err) {
            if (err) {
                console.error('Error updating review:', err);
                return callback(err);
            }
            callback(null, { changes: this.changes });
        });
    },

    // Delete a review
    delete: (reviewId, userId, callback) => {
        const query = `DELETE FROM reviews WHERE id = ? AND user_id = ?`;
        db.run(query, [reviewId, userId], function(err) {
            if (err) {
                console.error('Error deleting review:', err);
                return callback(err);
            }
            callback(null, { changes: this.changes });
        });
    },

    // Check if user has already reviewed a book
    hasUserReviewed: (userId, bookId, callback) => {
        const query = `SELECT id FROM reviews WHERE user_id = ? AND book_id = ?`;
        db.get(query, [userId, bookId], (err, row) => {
            if (err) {
                console.error('Error checking user review:', err);
                return callback(err);
            }
            callback(null, !!row);
        });
    },

    // Get average rating for a book
    getAverageRating: (bookId, callback) => {
        const query = `
            SELECT 
                AVG(rating) as average_rating,
                COUNT(*) as review_count
            FROM reviews 
            WHERE book_id = ?
        `;
        db.get(query, [bookId], (err, row) => {
            if (err) {
                console.error('Error calculating average rating:', err);
                return callback(err);
            }
            callback(null, {
                averageRating: row.average_rating || 0,
                reviewCount: row.review_count || 0
            });
        });
    },

    // Get user's review history with detailed book information
    getUserReviewHistory: (userId, callback) => {
        const query = `
            SELECT 
                r.id,
                r.rating,
                r.review_text,
                r.reviewer_name,
                r.created_at,
                r.updated_at,
                b.id as book_id,
                b.title,
                b.author,
                b.cover,
                b.price,
                b.genre,
                b.category
            FROM reviews r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching user review history:', err);
                return callback(err);
            }
            callback(null, rows);
        });
    }
};

// Add database health check function
function checkDatabaseHealth(callback) {
    const healthChecks = [
        { name: 'books', query: 'SELECT COUNT(*) as count FROM books' },
        { name: 'users', query: 'SELECT COUNT(*) as count FROM users' },
        { name: 'cart', query: 'SELECT COUNT(*) as count FROM cart' },
        { name: 'favorites', query: 'SELECT COUNT(*) as count FROM favorites' },
        { name: 'reviews', query: 'SELECT COUNT(*) as count FROM reviews' }
    ];
    
    let completed = 0;
    const results = {};
    
    healthChecks.forEach(check => {
        db.get(check.query, (err, row) => {
            completed++;
            
            if (err) {
                results[check.name] = { error: err.message };
                console.error(`Health check failed for ${check.name}:`, err.message);
            } else {
                results[check.name] = { count: row.count };
                console.log(`Health check passed for ${check.name}: ${row.count} records`);
            }
            
            if (completed === healthChecks.length) {
                callback(null, results);
            }
        });
    });
}

// Bulk insert books function
function bulkInsertBooks(books, callback) {
    console.log(`Starting bulk insert of ${books.length} books...`);
    
    let completed = 0;
    let errors = [];
    let successCount = 0;
    
    const insertBook = (book, cb) => {
        bookOperations.add(book, (err, result) => {
            if (err) {
                errors.push({ book: book.title, error: err.message });
                console.error(`Failed to insert "${book.title}":`, err.message);
            } else {
                successCount++;
                console.log(`✓ Inserted: ${book.title}`);
            }
            cb();
        });
    };
    
    // Process books one by one to avoid overwhelming the database
    const processNext = () => {
        if (completed >= books.length) {
            console.log(`\nBulk insert completed:`);
            console.log(`- Successfully inserted: ${successCount} books`);
            console.log(`- Failed to insert: ${errors.length} books`);
            
            if (errors.length > 0) {
                console.log(`Errors:`, errors);
            }
            
            return callback(errors.length > 0 ? new Error(`${errors.length} books failed to insert`) : null, {
                success: successCount,
                errors: errors.length,
                details: errors
            });
        }
        
        insertBook(books[completed], () => {
            completed++;
            // Add small delay to prevent overwhelming the database
            setTimeout(processNext, 10);
        });
    };
    
    processNext();
}

// Admin operations
const adminOperations = {
    // Get admin by email for login
    getByEmail: (email, callback) => {
        const query = `SELECT * FROM admins WHERE email = ?`;
        db.get(query, [email], callback);
    },

    // Get admin by ID
    getById: (id, callback) => {
        const query = `SELECT * FROM admins WHERE id = ?`;
        db.get(query, [id], callback);
    },

    // Register new admin (should be restricted to super admins)
    register: (admin, callback) => {
        console.log('Attempting to register admin:', admin.email);
        
        const query = `
            INSERT INTO admins (username, email, password_hash, first_name, last_name, phone)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [admin.username, admin.email, admin.password_hash, admin.first_name, admin.last_name, admin.phone];
        
        db.run(query, values, function(err) {
            if (err) {
                console.error('Error registering admin:', err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    callback(new Error('Admin with this email or username already exists'));
                } else {
                    callback(err);
                }
            } else {
                console.log('Admin registered successfully with ID:', this.lastID);
            }
            callback(err);
        });
    },

    // Update admin profile
    updateProfile: (id, profileData, callback) => {
        const query = `
            UPDATE admins SET 
                first_name = ?, last_name = ?, email = ?, phone = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const values = [
            profileData.first_name, profileData.last_name, profileData.email, 
            profileData.phone, id
        ];
        db.run(query, values, callback);
    },

    // Update password
    updatePassword: (adminId, passwordHash, callback) => {
        const query = `UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(query, [passwordHash, adminId], callback);
    },

    // Get all admins (for super admin use)
    getAll: (callback) => {
        const query = `
            SELECT id, username, email, first_name, last_name, created_at
            FROM admins
            ORDER BY created_at DESC
        `;
        db.all(query, [], callback);
    },

    // Delete admin (should be restricted to super admins)
    deleteAdmin: (id, callback) => {
        const query = `DELETE FROM admins WHERE id = ?`;
        db.run(query, [id], callback);
    },

    // Admin methods to get all items (including archived)
    getAllBooks: (page = 1, limit = 10, category = null, callback) => {
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT * FROM books 
            WHERE (archived = 0 OR archived IS NULL)
        `;
        let params = [];
        
        if (category) {
            query += ` AND category = ?`;
            params.push(category);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        db.all(query, params, (err, books) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM books WHERE archived = 0 OR archived IS NULL';
            let countParams = [];
            
            if (category) {
                countQuery += ' AND category = ?';
                countParams.push(category);
            }
            
            db.get(countQuery, countParams, (countErr, countResult) => {
                if (countErr) {
                    callback(countErr);
                    return;
                }
                
                callback(null, {
                    books: books,
                    pagination: {
                        currentPage: page,
                        totalItems: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit),
                        itemsPerPage: limit
                    }
                });
            });
        });
    },

    getAllUsers: (page = 1, limit = 10, callback) => {
        const offset = (page - 1) * limit;
        const query = `
            SELECT id, username, email, first_name, last_name, address, phone, created_at
            FROM users 
            WHERE archived = 0 OR archived IS NULL
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.all(query, [limit, offset], (err, users) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Get total count for pagination
            db.get('SELECT COUNT(*) as total FROM users WHERE archived = 0 OR archived IS NULL', [], (countErr, countResult) => {
                if (countErr) {
                    callback(countErr);
                    return;
                }
                
                callback(null, {
                    users: users,
                    pagination: {
                        currentPage: page,
                        totalItems: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit),
                        itemsPerPage: limit
                    }
                });
            });
        });
    },

    getAllOrders: (page = 1, limit = 10, filters = {}, callback) => {
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT o.*, u.username, u.email, u.first_name, u.last_name, u.phone, u.address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE (o.archived = 0 OR o.archived IS NULL)
        `;
        let params = [];
        
        // Add status filter
        if (filters.status) {
            query += ` AND o.status = ?`;
            params.push(filters.status);
        }
        
        // Add search filter (search in customer name, email, or order ID)
        if (filters.search) {
            query += ` AND (
                u.username LIKE ? OR 
                u.email LIKE ? OR 
                u.first_name LIKE ? OR 
                u.last_name LIKE ? OR 
                CAST(o.id AS TEXT) LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        db.all(query, params, (err, orders) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Get total count for pagination with same filters
            let countQuery = 'SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id WHERE (o.archived = 0 OR o.archived IS NULL)';
            let countParams = [];
            
            if (filters.status) {
                countQuery += ' AND o.status = ?';
                countParams.push(filters.status);
            }
            
            if (filters.search) {
                countQuery += ` AND (
                    u.username LIKE ? OR 
                    u.email LIKE ? OR 
                    u.first_name LIKE ? OR 
                    u.last_name LIKE ? OR 
                    CAST(o.id AS TEXT) LIKE ?
                )`;
                const searchTerm = `%${filters.search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            db.get(countQuery, countParams, (countErr, countResult) => {
                if (countErr) {
                    callback(countErr);
                    return;
                }
                
                callback(null, {
                    orders: orders,
                    pagination: {
                        currentPage: page,
                        totalItems: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit),
                        itemsPerPage: limit
                    }
                });
            });
        });
    }
};

// Archive operations for admin functionality
const archiveOperations = {
    // Archive a book
    archiveBook: (id, callback) => {
        const query = `UPDATE books SET archived = 1 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error archiving book:', err);
            } else {
                console.log(`Book ${id} archived successfully`);
            }
            callback(err, { changes: this.changes });
        });
    },

    // Unarchive a book
    unarchiveBook: (id, callback) => {
        const query = `UPDATE books SET archived = 0 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error unarchiving book:', err);
            } else {
                console.log(`Book ${id} unarchived successfully`);
            }
            callback(err, { changes: this.changes });
        });
    },

    // Archive a user
    archiveUser: (id, callback) => {
        const query = `UPDATE users SET archived = 1 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error archiving user:', err);
            } else {
                console.log(`User ${id} archived successfully`);
            }
            callback(err, { changes: this.changes });
        });
    },

    // Unarchive a user
    unarchiveUser: (id, callback) => {
        const query = `UPDATE users SET archived = 0 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error unarchiving user:', err);
            } else {
                console.log(`User ${id} unarchived successfully`);
            }
            callback(err, { changes: this.changes });
        });
    },

    // Archive an order
    archiveOrder: (id, callback) => {
        const query = `UPDATE orders SET archived = 1 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error archiving order:', err);
            } else {
                console.log(`Order ${id} archived successfully`);
            }
            callback(err, { changes: this.changes });
        });
    },

    // Unarchive an order
    unarchiveOrder: (id, callback) => {
        const query = `UPDATE orders SET archived = 0 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error unarchiving order:', err);
            } else {
                console.log(`Order ${id} unarchived successfully`);
            }
            callback(err, { changes: this.changes });
        });
    },

    // Get archived books with pagination
    getArchivedBooks: (page = 1, limit = 10, callback) => {
        const offset = (page - 1) * limit;
        const query = `
            SELECT * FROM books 
            WHERE archived = 1
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.all(query, [limit, offset], (err, books) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Get total count for pagination
            db.get('SELECT COUNT(*) as total FROM books WHERE archived = 1', [], (countErr, countResult) => {
                if (countErr) {
                    callback(countErr);
                    return;
                }
                
                callback(null, {
                    books: books,
                    pagination: {
                        currentPage: page,
                        totalItems: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit),
                        itemsPerPage: limit
                    }
                });
            });
        });
    },

    // Get archived users with pagination
    getArchivedUsers: (page = 1, limit = 10, callback) => {
        const offset = (page - 1) * limit;
        const query = `
            SELECT id, username, email, first_name, last_name, address, phone, created_at
            FROM users 
            WHERE archived = 1
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.all(query, [limit, offset], (err, users) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Get total count for pagination
            db.get('SELECT COUNT(*) as total FROM users WHERE archived = 1', [], (countErr, countResult) => {
                if (countErr) {
                    callback(countErr);
                    return;
                }
                
                callback(null, {
                    users: users,
                    pagination: {
                        currentPage: page,
                        totalItems: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit),
                        itemsPerPage: limit
                    }
                });
            });
        });
    },

    // Get archived orders with pagination
    getArchivedOrders: (page = 1, limit = 10, callback) => {
        const offset = (page - 1) * limit;
        const query = `
            SELECT o.*, u.username, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.archived = 1
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.all(query, [limit, offset], (err, orders) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Get total count for pagination
            db.get('SELECT COUNT(*) as total FROM orders WHERE archived = 1', [], (countErr, countResult) => {
                if (countErr) {
                    callback(countErr);
                    return;
                }
                
                callback(null, {
                    orders: orders,
                    pagination: {
                        currentPage: page,
                        totalItems: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit),
                        itemsPerPage: limit
                    }
                });
            });
        });
    }
};

module.exports = {
    db,
    initializeDatabase,
    bookOperations,
    userOperations,
    cartOperations,
    favoritesOperations,
    orderOperations,
    reviewsOperations,
    adminOperations,
    archiveOperations,
    checkDatabaseHealth,
    bulkInsertBooks
};
