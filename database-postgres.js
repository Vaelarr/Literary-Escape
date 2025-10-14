const { Pool } = require('pg');

// Database connection configuration
// Vercel Postgres automatically injects these environment variables
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Initialize database schema
async function initializeDatabase(callback) {
    console.log('Initializing PostgreSQL database schema...');
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Create books table
        await client.query(`
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                isbn TEXT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT,
                category TEXT,
                genre TEXT,
                cover TEXT,
                price DECIMAL(10, 2),
                publisher TEXT,
                publication_date DATE,
                publication_year INTEGER,
                pages INTEGER,
                language TEXT DEFAULT 'English',
                format TEXT DEFAULT 'Paperback',
                weight DECIMAL(10, 2),
                dimensions TEXT,
                rating DECIMAL(3, 2) DEFAULT 0,
                stock_quantity INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                sku TEXT,
                min_stock INTEGER DEFAULT 5,
                max_stock INTEGER DEFAULT 100,
                reorder_point INTEGER DEFAULT 10,
                reorder_quantity INTEGER DEFAULT 20,
                warehouse_location TEXT,
                cost_price DECIMAL(10, 2) DEFAULT 0,
                discount_percentage DECIMAL(5, 2) DEFAULT 0,
                supplier_name TEXT,
                supplier_contact TEXT,
                notes TEXT,
                archived BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create admins table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                phone TEXT,
                role TEXT DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create cart table
        await client.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, book_id)
            )
        `);

        // Create favorites table
        await client.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, book_id)
            )
        `);

        // Create orders table
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                total_amount DECIMAL(10, 2) NOT NULL,
                status TEXT DEFAULT 'pending',
                shipping_address TEXT,
                payment_method TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create order_items table
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                book_id INTEGER REFERENCES books(id),
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create reviews table
        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(book_id, user_id)
            )
        `);

        // Create archived_books table
        await client.query(`
            CREATE TABLE IF NOT EXISTS archived_books (
                id SERIAL PRIMARY KEY,
                original_id INTEGER,
                isbn TEXT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT,
                category TEXT,
                genre TEXT,
                cover TEXT,
                price DECIMAL(10, 2),
                publisher TEXT,
                publication_date DATE,
                publication_year INTEGER,
                pages INTEGER,
                language TEXT,
                format TEXT,
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                archived_by INTEGER REFERENCES admins(id)
            )
        `);

        // Create indexes for better performance
        await client.query('CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id)');

        await client.query('COMMIT');
        console.log('Database schema initialized successfully');
        
        if (callback) {
            callback(null);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', error);
        if (callback) {
            callback(error);
        }
        throw error;
    } finally {
        client.release();
    }
}

// Book Operations
const bookOperations = {
    getAll: async (callback) => {
        try {
            const result = await query(
                'SELECT * FROM books WHERE archived = FALSE ORDER BY created_at DESC'
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (id, callback) => {
        try {
            const result = await query('SELECT * FROM books WHERE id = $1', [id]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByCategory: async (category, callback) => {
        try {
            const result = await query(
                'SELECT * FROM books WHERE category = $1 AND archived = FALSE',
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
                'SELECT * FROM books WHERE genre = $1 AND archived = FALSE',
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
                 WHERE (title ILIKE $1 OR author ILIKE $1 OR description ILIKE $1)
                 AND archived = FALSE`,
                [`%${searchTerm}%`]
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
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                RETURNING *`,
                [
                    bookData.isbn, bookData.title, bookData.author, bookData.description,
                    bookData.category, bookData.genre, bookData.cover, bookData.price,
                    bookData.publisher, bookData.publication_date, bookData.publication_year,
                    bookData.pages, bookData.language, bookData.format, bookData.weight,
                    bookData.dimensions, bookData.stock_quantity, bookData.sku, bookData.cost_price
                ]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    update: async (id, bookData, callback) => {
        try {
            const result = await query(
                `UPDATE books SET
                    isbn = $1, title = $2, author = $3, description = $4,
                    category = $5, genre = $6, cover = $7, price = $8,
                    publisher = $9, publication_date = $10, publication_year = $11,
                    pages = $12, language = $13, format = $14, weight = $15,
                    dimensions = $16, stock_quantity = $17, updated_at = CURRENT_TIMESTAMP
                WHERE id = $18
                RETURNING *`,
                [
                    bookData.isbn, bookData.title, bookData.author, bookData.description,
                    bookData.category, bookData.genre, bookData.cover, bookData.price,
                    bookData.publisher, bookData.publication_date, bookData.publication_year,
                    bookData.pages, bookData.language, bookData.format, bookData.weight,
                    bookData.dimensions, bookData.stock_quantity, id
                ]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    delete: async (id, callback) => {
        try {
            await query('DELETE FROM books WHERE id = $1', [id]);
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    updateStock: async (id, quantity, callback) => {
        try {
            const result = await query(
                `UPDATE books SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [quantity, id]
            );
            callback(null, result.rows[0]);
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
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [
                    userData.username, userData.email, userData.password_hash,
                    userData.first_name, userData.last_name, userData.address,
                    userData.phone, userData.city, userData.zip_code
                ]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByEmail: async (email, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE email = $1', [email]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByUsername: async (username, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE username = $1', [username]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (id, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE id = $1', [id]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    update: async (id, userData, callback) => {
        try {
            const result = await query(
                `UPDATE users SET
                    first_name = $1, last_name = $2, address = $3, phone = $4,
                    city = $5, zip_code = $6, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7
                 RETURNING *`,
                [
                    userData.first_name, userData.last_name, userData.address,
                    userData.phone, userData.city, userData.zip_code, id
                ]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    }
};

// Cart Operations
const cartOperations = {
    add: async (userId, bookId, quantity, callback) => {
        try {
            const result = await query(
                `INSERT INTO cart (user_id, book_id, quantity)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, book_id)
                 DO UPDATE SET quantity = cart.quantity + $3
                 RETURNING *`,
                [userId, bookId, quantity]
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
                 WHERE c.user_id = $1`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    update: async (userId, bookId, quantity, callback) => {
        try {
            const result = await query(
                `UPDATE cart SET quantity = $1
                 WHERE user_id = $2 AND book_id = $3
                 RETURNING *`,
                [quantity, userId, bookId]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    remove: async (userId, bookId, callback) => {
        try {
            await query(
                'DELETE FROM cart WHERE user_id = $1 AND book_id = $2',
                [userId, bookId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    clear: async (userId, callback) => {
        try {
            await query('DELETE FROM cart WHERE user_id = $1', [userId]);
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
            const result = await query(
                `INSERT INTO favorites (user_id, book_id)
                 VALUES ($1, $2)
                 ON CONFLICT (user_id, book_id) DO NOTHING
                 RETURNING *`,
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
                 WHERE f.user_id = $1`,
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
                'DELETE FROM favorites WHERE user_id = $1 AND book_id = $2',
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [orderData.user_id, orderData.total_amount, orderData.shipping_address, orderData.payment_method]
            );

            const orderId = orderResult.rows[0].id;

            // Create order items
            for (const item of orderData.items) {
                await client.query(
                    `INSERT INTO order_items (order_id, book_id, quantity, price)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, item.book_id, item.quantity, item.price]
                );

                // Update stock
                await client.query(
                    'UPDATE books SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                    [item.quantity, item.book_id]
                );
            }

            await client.query('COMMIT');
            callback(null, orderResult.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            callback(error);
        } finally {
            client.release();
        }
    },

    getByUser: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (orderId, callback) => {
        try {
            const orderResult = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
            const itemsResult = await query(
                `SELECT oi.*, b.title, b.author
                 FROM order_items oi
                 JOIN books b ON oi.book_id = b.id
                 WHERE oi.order_id = $1`,
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
            const result = await query(
                `INSERT INTO reviews (book_id, user_id, rating, comment)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (book_id, user_id)
                 DO UPDATE SET rating = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [reviewData.book_id, reviewData.user_id, reviewData.rating, reviewData.comment]
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
                 WHERE r.book_id = $1
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
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    adminData.username, adminData.email, adminData.password_hash,
                    adminData.first_name, adminData.last_name, adminData.phone
                ]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getByEmail: async (email, callback) => {
        try {
            const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    getById: async (id, callback) => {
        try {
            const result = await query('SELECT * FROM admins WHERE id = $1', [id]);
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    }
};

// Archive Operations
const archiveOperations = {
    archiveBook: async (bookId, adminId, callback) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get book data
            const bookResult = await client.query('SELECT * FROM books WHERE id = $1', [bookId]);
            const book = bookResult.rows[0];

            if (!book) {
                throw new Error('Book not found');
            }

            // Insert into archived_books
            await client.query(
                `INSERT INTO archived_books (
                    original_id, isbn, title, author, description, category, genre,
                    cover, price, publisher, publication_date, publication_year,
                    pages, language, format, archived_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                [
                    book.id, book.isbn, book.title, book.author, book.description,
                    book.category, book.genre, book.cover, book.price, book.publisher,
                    book.publication_date, book.publication_year, book.pages,
                    book.language, book.format, adminId
                ]
            );

            // Mark book as archived
            await client.query('UPDATE books SET archived = TRUE WHERE id = $1', [bookId]);

            await client.query('COMMIT');
            callback(null, { message: 'Book archived successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            callback(error);
        } finally {
            client.release();
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
        const result = await query('SELECT NOW() as current_time, version() as pg_version');
        callback(null, {
            status: 'healthy',
            timestamp: result.rows[0].current_time,
            version: result.rows[0].pg_version
        });
    } catch (error) {
        callback(error, { status: 'unhealthy', error: error.message });
    }
}

module.exports = {
    pool,
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
