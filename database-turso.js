// Load environment variables
require('dotenv').config();

const { createClient } = require('@libsql/client');

// Turso Database Configuration
// Uses Turso Cloud for edge-hosted SQLite database

// Validate that Turso credentials are set
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env file for cloud database connection');
}

// Validate that URL points to cloud (not local file)
if (!process.env.TURSO_DATABASE_URL.startsWith('libsql://') && 
    !process.env.TURSO_DATABASE_URL.startsWith('https://')) {
    throw new Error('TURSO_DATABASE_URL must be a cloud URL (libsql:// or https://)');
}

console.log('🌐 Connecting to Turso Cloud Database...');
console.log('   Database:', process.env.TURSO_DATABASE_URL.split('.')[0].replace('libsql://', ''));

// Create Turso client
const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('✅ Connected to Turso Cloud Database (ONLINE)');

// Helper function to execute queries
async function query(sql, params = []) {
    try {
        const result = await turso.execute({
            sql: sql,
            args: params
        });
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Initialize database schema
async function initializeDatabase(callback) {
    console.log('Initializing Turso database schema...');
    
    try {
        // Create books table
        await query(`
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
        `);

        // Create users table
        await query(`
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
        `);

        // Create admins table
        await query(`
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
        `);

        // Create cart table
        await query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                book_id INTEGER,
                quantity INTEGER DEFAULT 1,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            )
        `);

        // Create favorites table
        await query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                book_id INTEGER,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            )
        `);

        // Create orders table
        await query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                shipping_address TEXT,
                payment_method TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create order_items table
        await query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                book_id INTEGER,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        `);

        // Create reviews table
        await query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER,
                user_id INTEGER,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(book_id, user_id)
            )
        `);

        // Create archived_books table
        await query(`
            CREATE TABLE IF NOT EXISTS archived_books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_id INTEGER,
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
                language TEXT,
                format TEXT,
                archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                archived_by INTEGER,
                FOREIGN KEY (archived_by) REFERENCES admins(id)
            )
        `);

        // Create indexes for better performance
        await query('CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)');
        await query('CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre)');
        await query('CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)');
        await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await query('CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id)');

        console.log('Turso database schema initialized successfully');
        
        // Create default admin account
        await createDefaultAdmin();
        
        if (callback) {
            callback(null);
        }
    } catch (error) {
        console.error('Error initializing Turso database:', error);
        if (callback) {
            callback(error);
        }
        throw error;
    }
}

// Create default admin account
async function createDefaultAdmin() {
    const bcrypt = require('bcrypt');
    const adminEmail = 'admin@literaryescape.com';
    const adminPassword = 'Admin123!';
    const adminFirstName = 'System';
    const adminLastName = 'Administrator';
    
    try {
        // Check if admin already exists
        const existing = await query('SELECT id FROM admins WHERE email = ?', [adminEmail]);
        
        if (existing.rows && existing.rows.length > 0) {
            console.log('Administrator account already exists');
            return;
        }
        
        // Create admin account
        const hash = await bcrypt.hash(adminPassword, 10);
        
        await query(
            `INSERT INTO admins (username, email, password_hash, first_name, last_name, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['admin', adminEmail, hash, adminFirstName, adminLastName, 'admin']
        );
        
        console.log('Administrator account created successfully');
        console.log('Administrator credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
    } catch (error) {
        console.error('Error creating Administrator account:', error);
    }
}

// Book Operations
const bookOperations = {
    getAll: async (callback) => {
        try {
            const result = await query(
                'SELECT * FROM books WHERE archived = 0 ORDER BY created_at DESC'
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (id, callback) => {
        try {
            const result = await query('SELECT * FROM books WHERE id = ?', [id]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByCategory: async (category, callback) => {
        try {
            const result = await query(
                'SELECT * FROM books WHERE category = ? AND archived = 0',
                [category]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    getByGenre: async (genre, callback) => {
        try {
            const result = await query(
                'SELECT * FROM books WHERE genre = ? AND archived = 0',
                [genre]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    search: async (searchTerm, callback) => {
        try {
            const result = await query(
                `SELECT * FROM books 
                 WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?)
                 AND archived = 0`,
                [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    create: async (bookData, callback) => {
        try {
            const result = await query(
                `INSERT INTO books (
                    isbn, title, author, description, category, genre, cover, price,
                    publisher, publication_date, publication_year, pages, language,
                    format, weight, dimensions, stock_quantity, sku, cost_price
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookData.isbn || null,
                    bookData.title,
                    bookData.author,
                    bookData.description || null,
                    bookData.category || null,
                    bookData.genre || null,
                    bookData.cover || null,
                    bookData.price || null,
                    bookData.publisher || null,
                    bookData.publication_date || null,
                    bookData.publication_year || null,
                    bookData.pages || null,
                    bookData.language || 'English',
                    bookData.format || 'Paperback',
                    bookData.weight || null,
                    bookData.dimensions || null,
                    bookData.stock_quantity || 0,
                    bookData.sku || null,
                    bookData.cost_price || 0
                ]
            );
            const newBook = await query('SELECT * FROM books WHERE id = ?', [result.lastInsertRowid]);
            callback(null, newBook.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    update: async (id, bookData, callback) => {
        try {
            await query(
                `UPDATE books SET
                    isbn = ?, title = ?, author = ?, description = ?,
                    category = ?, genre = ?, cover = ?, price = ?,
                    publisher = ?, publication_date = ?, publication_year = ?,
                    pages = ?, language = ?, format = ?, weight = ?,
                    dimensions = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    bookData.isbn, bookData.title, bookData.author, bookData.description,
                    bookData.category, bookData.genre, bookData.cover, bookData.price,
                    bookData.publisher, bookData.publication_date, bookData.publication_year,
                    bookData.pages, bookData.language, bookData.format, bookData.weight,
                    bookData.dimensions, bookData.stock_quantity, id
                ]
            );
            const updated = await query('SELECT * FROM books WHERE id = ?', [id]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    delete: async (id, callback) => {
        try {
            await query('DELETE FROM books WHERE id = ?', [id]);
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    updateStock: async (id, quantity, callback) => {
        try {
            await query(
                `UPDATE books SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [quantity, id]
            );
            const updated = await query('SELECT * FROM books WHERE id = ?', [id]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    }
};

// User Operations
const userOperations = {
    create: async (userData, callback) => {
        try {
            const result = await query(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, address, phone, city, zip_code)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.username, userData.email, userData.password_hash,
                    userData.first_name, userData.last_name, userData.address,
                    userData.phone, userData.city, userData.zip_code
                ]
            );
            const newUser = await query('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
            callback(null, newUser.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByEmail: async (email, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE email = ?', [email]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByUsername: async (username, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE username = ?', [username]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (id, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE id = ?', [id]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    update: async (id, userData, callback) => {
        try {
            await query(
                `UPDATE users SET
                    first_name = ?, last_name = ?, address = ?, phone = ?,
                    city = ?, zip_code = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    userData.first_name, userData.last_name, userData.address,
                    userData.phone, userData.city, userData.zip_code, id
                ]
            );
            const updated = await query('SELECT * FROM users WHERE id = ?', [id]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    }
};

// Cart Operations
const cartOperations = {
    add: async (userId, bookId, quantity, callback) => {
        try {
            await query(
                `INSERT INTO cart (user_id, book_id, quantity)
                 VALUES (?, ?, ?)
                 ON CONFLICT(user_id, book_id) DO UPDATE SET quantity = quantity + ?`,
                [userId, bookId, quantity, quantity]
            );
            const result = await query(
                'SELECT * FROM cart WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByUser: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT c.*, b.title, b.author, b.price, b.cover
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ?`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    update: async (userId, bookId, quantity, callback) => {
        try {
            await query(
                `UPDATE cart SET quantity = ?
                 WHERE user_id = ? AND book_id = ?`,
                [quantity, userId, bookId]
            );
            const result = await query(
                'SELECT * FROM cart WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    remove: async (userId, bookId, callback) => {
        try {
            await query(
                'DELETE FROM cart WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    clear: async (userId, callback) => {
        try {
            await query('DELETE FROM cart WHERE user_id = ?', [userId]);
            callback(null);
        } catch (error) {
            callback(error);
        }
    }
};

// Favorites Operations
const favoritesOperations = {
    add: async (userId, bookId, callback) => {
        try {
            await query(
                `INSERT OR IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)`,
                [userId, bookId]
            );
            const result = await query(
                'SELECT * FROM favorites WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByUser: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT f.*, b.title, b.author, b.price, b.cover, b.description
                 FROM favorites f
                 JOIN books b ON f.book_id = b.id
                 WHERE f.user_id = ?`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    remove: async (userId, bookId, callback) => {
        try {
            await query(
                'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    }
};

// Order Operations
const orderOperations = {
    create: async (orderData, callback) => {
        try {
            // Begin transaction (Turso supports transactions)
            await query('BEGIN TRANSACTION');

            // Create order
            const orderResult = await query(
                `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
                 VALUES (?, ?, ?, ?)`,
                [orderData.user_id, orderData.total_amount, orderData.shipping_address, orderData.payment_method]
            );

            const orderId = orderResult.lastInsertRowid;

            // Create order items
            for (const item of orderData.items) {
                await query(
                    `INSERT INTO order_items (order_id, book_id, quantity, price)
                     VALUES (?, ?, ?, ?)`,
                    [orderId, item.book_id, item.quantity, item.price]
                );

                // Update stock
                await query(
                    'UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.book_id]
                );
            }

            await query('COMMIT');

            const newOrder = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
            callback(null, newOrder.rows[0]);
        } catch (error) {
            await query('ROLLBACK');
            callback(error);
        }
    },

    getByUser: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (orderId, callback) => {
        try {
            const orderResult = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
            const itemsResult = await query(
                `SELECT oi.*, b.title, b.author
                 FROM order_items oi
                 JOIN books b ON oi.book_id = b.id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            const order = orderResult.rows[0];
            if (order) {
                order.items = itemsResult.rows;
            }

            callback(null, order);
        } catch (error) {
            callback(error);
        }
    }
};

// Reviews Operations
const reviewsOperations = {
    create: async (reviewData, callback) => {
        try {
            await query(
                `INSERT INTO reviews (book_id, user_id, rating, comment)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(book_id, user_id) DO UPDATE SET 
                 rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP`,
                [reviewData.book_id, reviewData.user_id, reviewData.rating, reviewData.comment,
                 reviewData.rating, reviewData.comment]
            );
            const result = await query(
                'SELECT * FROM reviews WHERE book_id = ? AND user_id = ?',
                [reviewData.book_id, reviewData.user_id]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByBook: async (bookId, callback) => {
        try {
            const result = await query(
                `SELECT r.*, u.username, u.first_name, u.last_name
                 FROM reviews r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.book_id = ?
                 ORDER BY r.created_at DESC`,
                [bookId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    }
};

// Admin Operations
const adminOperations = {
    create: async (adminData, callback) => {
        try {
            const result = await query(
                `INSERT INTO admins (username, email, password_hash, first_name, last_name, phone)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    adminData.username, adminData.email, adminData.password_hash,
                    adminData.first_name, adminData.last_name, adminData.phone
                ]
            );
            const newAdmin = await query('SELECT * FROM admins WHERE id = ?', [result.lastInsertRowid]);
            callback(null, newAdmin.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByEmail: async (email, callback) => {
        try {
            const result = await query('SELECT * FROM admins WHERE email = ?', [email]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (id, callback) => {
        try {
            const result = await query('SELECT * FROM admins WHERE id = ?', [id]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    }
};

// Archive Operations
const archiveOperations = {
    archiveBook: async (bookId, adminId, callback) => {
        try {
            await query('BEGIN TRANSACTION');

            // Get book data
            const bookResult = await query('SELECT * FROM books WHERE id = ?', [bookId]);
            const book = bookResult.rows[0];

            if (!book) {
                throw new Error('Book not found');
            }

            // Insert into archived_books
            await query(
                `INSERT INTO archived_books (
                    original_id, isbn, title, author, description, category, genre,
                    cover, price, publisher, publication_date, publication_year,
                    pages, language, format, archived_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    book.id, book.isbn, book.title, book.author, book.description,
                    book.category, book.genre, book.cover, book.price, book.publisher,
                    book.publication_date, book.publication_year, book.pages,
                    book.language, book.format, adminId
                ]
            );

            // Mark book as archived
            await query('UPDATE books SET archived = 1 WHERE id = ?', [bookId]);

            await query('COMMIT');
            callback(null, { message: 'Book archived successfully' });
        } catch (error) {
            await query('ROLLBACK');
            callback(error);
        }
    },

    getArchived: async (callback) => {
        try {
            const result = await query('SELECT * FROM archived_books ORDER BY archived_at DESC');
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    }
};

// Health check function
async function checkDatabaseHealth(callback) {
    try {
        const result = await query('SELECT datetime("now") as current_time, sqlite_version() as version');
        callback(null, {
            status: 'healthy',
            timestamp: result.rows[0].current_time,
            version: 'SQLite ' + result.rows[0].version,
            provider: 'Turso Cloud'
        });
    } catch (error) {
        callback(error, { status: 'unhealthy', error: error.message });
    }
}

module.exports = {
    turso,
    query,
    initializeDatabase,
    bookOperations,
    userOperations,
    cartOperations,
    favoritesOperations,
    orderOperations,
    reviewsOperations,
    adminOperations,
    archiveOperations,
    checkDatabaseHealth
};

// Run initialization if this file is run directly
if (require.main === module) {
    console.log('Running database initialization...');
    initializeDatabase((err) => {
        if (err) {
            console.error('Failed to initialize database:', err);
            process.exit(1);
        } else {
            console.log('Database initialization complete!');
            process.exit(0);
        }
    });
}
