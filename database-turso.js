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
                archived BOOLEAN DEFAULT 0,
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

        // Create user_addresses table
        await query(`
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
        `);

        // Create cart table
        await query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                book_id INTEGER,
                quantity INTEGER DEFAULT 1,
                selected_for_checkout INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
                archived BOOLEAN DEFAULT 0,
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
                review_text TEXT,
                reviewer_name TEXT,
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

        // Migration: Add missing columns to existing tables
        try {
            // Try to add selected_for_checkout column - will fail silently if already exists
            console.log('Checking cart table for selected_for_checkout column...');
            try {
                await query(`ALTER TABLE cart ADD COLUMN selected_for_checkout INTEGER DEFAULT 1`);
                console.log('✅ Added selected_for_checkout column to cart table');
            } catch (alterError) {
                // Column likely already exists - this is fine
                if (alterError.message.includes('duplicate column') || 
                    alterError.message.includes('already exists') ||
                    alterError.message.includes('Duplicate column name')) {
                    console.log('✅ selected_for_checkout column already exists');
                } else {
                    console.warn('Note: Could not add selected_for_checkout column:', alterError.message);
                }
            }
        } catch (error) {
            console.warn('Migration warning:', error.message);
            // Continue - these are non-critical migrations
        }

        console.log('Turso database schema initialized successfully');
        
        // Run migrations to add archived column if it doesn't exist
        await runMigrations();
        
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

// Migration function to add archived column to existing tables
async function runMigrations() {
    try {
        console.log('🔧 Running database migrations...');
        
        // Try to add archived column to users table
        try {
            console.log('  → Attempting to add archived column to users table...');
            await query('ALTER TABLE users ADD COLUMN archived INTEGER DEFAULT 0');
            console.log('  ✅ Added archived column to users table');
        } catch (error) {
            const errorMsg = error.message ? error.message.toLowerCase() : '';
            if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
                console.log('  ℹ️  Users table already has archived column');
            } else {
                console.warn('  ⚠️  Users table migration error:', error.message);
                // Try to verify if column exists by querying it
                try {
                    await query('SELECT archived FROM users LIMIT 1');
                    console.log('  ✅ Users.archived column verified (already exists)');
                } catch (verifyError) {
                    console.error('  ❌ Users.archived column does not exist and could not be added:', verifyError.message);
                }
            }
        }
        
        // Try to add archived column to orders table
        try {
            console.log('  → Attempting to add archived column to orders table...');
            await query('ALTER TABLE orders ADD COLUMN archived INTEGER DEFAULT 0');
            console.log('  ✅ Added archived column to orders table');
        } catch (error) {
            const errorMsg = error.message ? error.message.toLowerCase() : '';
            if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
                console.log('  ℹ️  Orders table already has archived column');
            } else {
                console.warn('  ⚠️  Orders table migration error:', error.message);
                // Try to verify if column exists by querying it
                try {
                    await query('SELECT archived FROM orders LIMIT 1');
                    console.log('  ✅ Orders.archived column verified (already exists)');
                } catch (verifyError) {
                    console.error('  ❌ Orders.archived column does not exist and could not be added:', verifyError.message);
                }
            }
        }
        
        console.log('🎉 Database migrations completed');
    } catch (error) {
        console.error('❌ Error running migrations:', error);
        // Don't throw - migrations are optional updates
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

    // Alias for create - matches API endpoint expectations
    add: async (book, callback) => {
        try {
            const result = await query(
                `INSERT INTO books (
                    isbn, title, author, description, category, genre, cover, price,
                    publisher, publication_date, publication_year, pages, language,
                    format, weight, dimensions, stock_quantity, sku, cost_price,
                    status, min_stock, max_stock, reorder_point, reorder_quantity,
                    warehouse_location, discount_percentage, supplier_name, supplier_contact, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    book.isbn || null,  // 1
                    book.title,  // 2
                    book.author,  // 3
                    book.description || null,  // 4
                    book.category || 'Fiction',  // 5
                    book.genre || 'General',  // 6
                    book.cover || null,  // 7
                    book.price || 0,  // 8
                    book.publisher || null,  // 9
                    book.publication_date || null,  // 10
                    book.publication_year || null,  // 11
                    book.pages || null,  // 12
                    book.language || 'English',  // 13
                    book.format || 'Paperback',  // 14
                    book.weight || null,  // 15
                    book.dimensions || null,  // 16
                    book.stock_quantity !== undefined ? book.stock_quantity : 0,  // 17
                    book.sku || null,  // 18
                    book.cost_price || 0,  // 19
                    book.status || 'active',  // 20
                    book.min_stock || 5,  // 21
                    book.max_stock || 100,  // 22
                    book.reorder_point || 10,  // 23
                    book.reorder_quantity || 20,  // 24
                    book.warehouse_location || null,  // 25
                    book.discount_percentage || 0,  // 26
                    book.supplier_name || null,  // 27
                    book.supplier_contact || null,  // 28
                    book.notes || null  // 29
                ]
            );
            
            // Call callback with context that has lastID property (matches SQLite interface)
            const context = { lastID: Number(result.lastInsertRowid) };
            callback.call(context, null);
        } catch (error) {
            callback(error);
        }
    },

    update: async (id, bookData, callback) => {
        try {
            // First get the existing book to preserve values not being updated
            const existingResult = await query('SELECT * FROM books WHERE id = ?', [id]);
            const existingBook = existingResult.rows[0];
            
            if (!existingBook) {
                return callback(new Error('Book not found'));
            }
            
            await query(
                `UPDATE books SET
                    isbn = ?, title = ?, author = ?, description = ?,
                    category = ?, genre = ?, cover = ?, price = ?,
                    publisher = ?, publication_date = ?, publication_year = ?,
                    pages = ?, language = ?, format = ?, weight = ?,
                    dimensions = ?, stock_quantity = ?, 
                    status = ?, sku = ?, min_stock = ?, max_stock = ?,
                    reorder_point = ?, reorder_quantity = ?, warehouse_location = ?,
                    cost_price = ?, discount_percentage = ?, 
                    supplier_name = ?, supplier_contact = ?, notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    bookData.isbn !== undefined ? bookData.isbn : existingBook.isbn,
                    bookData.title !== undefined ? bookData.title : existingBook.title,
                    bookData.author !== undefined ? bookData.author : existingBook.author,
                    bookData.description !== undefined ? bookData.description : existingBook.description,
                    bookData.category !== undefined ? bookData.category : existingBook.category,
                    bookData.genre !== undefined ? bookData.genre : existingBook.genre,
                    bookData.cover !== undefined ? bookData.cover : existingBook.cover,
                    bookData.price !== undefined ? bookData.price : existingBook.price,
                    bookData.publisher !== undefined ? bookData.publisher : existingBook.publisher,
                    bookData.publication_date !== undefined ? bookData.publication_date : existingBook.publication_date,
                    bookData.publication_year !== undefined ? bookData.publication_year : existingBook.publication_year,
                    bookData.pages !== undefined ? bookData.pages : existingBook.pages,
                    bookData.language !== undefined ? bookData.language : existingBook.language,
                    bookData.format !== undefined ? bookData.format : existingBook.format,
                    bookData.weight !== undefined ? bookData.weight : existingBook.weight,
                    bookData.dimensions !== undefined ? bookData.dimensions : existingBook.dimensions,
                    bookData.stock_quantity !== undefined ? bookData.stock_quantity : existingBook.stock_quantity,
                    bookData.status !== undefined ? bookData.status : existingBook.status,
                    bookData.sku !== undefined ? bookData.sku : existingBook.sku,
                    bookData.min_stock !== undefined ? bookData.min_stock : existingBook.min_stock,
                    bookData.max_stock !== undefined ? bookData.max_stock : existingBook.max_stock,
                    bookData.reorder_point !== undefined ? bookData.reorder_point : existingBook.reorder_point,
                    bookData.reorder_quantity !== undefined ? bookData.reorder_quantity : existingBook.reorder_quantity,
                    bookData.warehouse_location !== undefined ? bookData.warehouse_location : existingBook.warehouse_location,
                    bookData.cost_price !== undefined ? bookData.cost_price : existingBook.cost_price,
                    bookData.discount_percentage !== undefined ? bookData.discount_percentage : existingBook.discount_percentage,
                    bookData.supplier_name !== undefined ? bookData.supplier_name : existingBook.supplier_name,
                    bookData.supplier_contact !== undefined ? bookData.supplier_contact : existingBook.supplier_contact,
                    bookData.notes !== undefined ? bookData.notes : existingBook.notes,
                    id
                ]
            );
            
            // Call callback with context that has changes property
            const context = { changes: 1 };
            callback.call(context, null);
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

    // Alias for create - used by registration endpoint
    register: async (userData, callback) => {
        try {
            const result = await query(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, address, phone, city, zip_code)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.username, userData.email, userData.password_hash,
                    userData.first_name || null, userData.last_name || null, 
                    userData.address || null, userData.phone || null, 
                    userData.city || null, userData.zip_code || null
                ]
            );
            callback(null, { id: result.lastInsertRowid, message: 'User registered successfully' });
        } catch (error) {
            callback(error);
        }
    },

    getByEmail: async (email, callback) => {
        try {
            const result = await query('SELECT * FROM users WHERE email = ? AND archived = 0', [email]);
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
    },

    // Update user password
    updatePassword: async (userId, newPasswordHash, callback) => {
        try {
            await query(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newPasswordHash, userId]
            );
            callback(null, { message: 'Password updated successfully' });
        } catch (error) {
            callback(error);
        }
    },

    // Update user role (admin function)
    updateRole: async (userId, role, callback) => {
        try {
            await query(
                'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [role, userId]
            );
            const updated = await query('SELECT * FROM users WHERE id = ?', [userId]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    // Delete user (admin function)
    deleteUser: async (userId, callback) => {
        try {
            await query('DELETE FROM users WHERE id = ?', [userId]);
            callback(null, { message: 'User deleted successfully' });
        } catch (error) {
            callback(error);
        }
    },

    // Update user profile
    updateProfile: async (id, profileData, callback) => {
        try {
            await query(
                `UPDATE users SET
                    first_name = ?, last_name = ?, email = ?, phone = ?,
                    address = ?, birthdate = ?, city = ?, zip_code = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    profileData.first_name, profileData.last_name, profileData.email,
                    profileData.phone, profileData.address, profileData.birthdate,
                    profileData.city, profileData.zip_code, id
                ]
            );
            const updated = await query('SELECT * FROM users WHERE id = ?', [id]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    // Get user addresses
    getUserAddresses: async (userId, callback) => {
        try {
            const result = await query(
                'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    // Save user address
    saveAddress: async (addressData, callback) => {
        try {
            // If setting as default, first unset all other defaults for this user
            if (addressData.is_default) {
                await query(
                    'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
                    [addressData.user_id]
                );
            }

            await query(
                `INSERT INTO user_addresses (user_id, label, full_address, city, zip_code, is_default)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    addressData.user_id, addressData.label, addressData.full_address,
                    addressData.city, addressData.zip_code, addressData.is_default ? 1 : 0
                ]
            );
            
            const newAddress = await query(
                'SELECT * FROM user_addresses WHERE id = last_insert_rowid()'
            );
            callback(null, newAddress.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    // Set default address
    setDefaultAddress: async (userId, addressId, callback) => {
        try {
            // First unset all defaults
            await query(
                'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
                [userId]
            );
            
            // Then set the selected address as default
            await query(
                'UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );
            
            callback(null, { message: 'Default address updated' });
        } catch (error) {
            callback(error);
        }
    },

    // Delete address
    deleteAddress: async (userId, addressId, callback) => {
        try {
            await query(
                'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );
            callback(null, { message: 'Address deleted successfully' });
        } catch (error) {
            callback(error);
        }
    }
};

// Cart Operations
const cartOperations = {
    // Add item to cart (matches API expectation)
    addItem: async (userId, bookId, quantity, callback) => {
        try {
            await query(
                `INSERT INTO cart (user_id, book_id, quantity)
                 VALUES (?, ?, ?)
                 ON CONFLICT(user_id, book_id) DO UPDATE SET quantity = quantity + ?`,
                [userId, bookId, quantity || 1, quantity || 1]
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

    // Get user's cart items (matches API expectation)
    getCartItems: async (userId, callback) => {
        try {
            console.log(`[Turso] Getting cart items for user ${userId}`);
            const result = await query(
                `SELECT c.id, c.user_id, c.book_id, c.quantity, 
                        COALESCE(c.selected_for_checkout, 1) as selected_for_checkout,
                        b.title, b.author, b.price, b.cover, b.stock_quantity
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ?
                 ORDER BY c.id DESC`,
                [userId]
            );
            console.log(`[Turso] Found ${result.rows.length} cart items`);
            callback(null, result.rows);
        } catch (error) {
            console.error(`[Turso] Error getting cart items:`, error);
            callback(error);
        }
    },

    // Update item quantity (matches API expectation)
    updateQuantity: async (userId, bookId, quantity, callback) => {
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

    // Remove item from cart (matches API expectation)
    removeItem: async (userId, bookId, callback) => {
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

    // Clear user's cart (matches API expectation)
    clearCart: async (userId, callback) => {
        try {
            await query('DELETE FROM cart WHERE user_id = ?', [userId]);
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    // Get cart total
    getCartTotal: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT SUM(c.quantity * b.price) as total
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ?`,
                [userId]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    // Update item selection for checkout
    updateSelection: async (userId, bookId, selected, callback) => {
        try {
            await query(
                `UPDATE cart SET selected_for_checkout = ?
                 WHERE user_id = ? AND book_id = ?`,
                [selected ? 1 : 0, userId, bookId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    // Select all items for checkout
    selectAllForCheckout: async (userId, callback) => {
        try {
            await query(
                `UPDATE cart SET selected_for_checkout = 1
                 WHERE user_id = ?`,
                [userId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    // Deselect all items for checkout
    deselectAllForCheckout: async (userId, callback) => {
        try {
            await query(
                `UPDATE cart SET selected_for_checkout = 0
                 WHERE user_id = ?`,
                [userId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    // Get only selected items for checkout
    getSelectedItems: async (userId, callback) => {
        try {
            console.log(`[Turso] Getting selected cart items for user ${userId}`);
            const result = await query(
                `SELECT c.id, c.user_id, c.book_id, c.quantity,
                        COALESCE(c.selected_for_checkout, 1) as selected_for_checkout,
                        b.title, b.author, b.price, b.cover, b.stock_quantity
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ? AND COALESCE(c.selected_for_checkout, 1) = 1
                 ORDER BY c.id DESC`,
                [userId]
            );
            console.log(`[Turso] Found ${result.rows.length} selected cart items`);
            callback(null, result.rows);
        } catch (error) {
            console.error(`[Turso] Error getting selected items:`, error);
            callback(error);
        }
    },

    // Get selected items total
    getSelectedTotal: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT SUM(c.quantity * b.price) as total, COUNT(c.id) as count
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ? AND COALESCE(c.selected_for_checkout, 1) = 1`,
                [userId]
            );
            callback(null, result.rows[0]);
        } catch (error) {
            callback(error);
        }
    }
};

// Favorites Operations
const favoritesOperations = {
    // Add to favorites (matches API expectation)
    addFavorite: async (userId, bookId, callback) => {
        try {
            console.log(`[Turso] Adding book ${bookId} to favorites for user ${userId}`);
            await query(
                `INSERT OR IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)`,
                [userId, bookId]
            );
            const result = await query(
                'SELECT * FROM favorites WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            console.log(`[Turso] Favorite added successfully:`, result.rows[0]);
            callback(null, result.rows[0]);
        } catch (error) {
            console.error(`[Turso] Error adding favorite:`, error);
            callback(error);
        }
    },

    // Get user's favorites (matches API expectation)
    getFavorites: async (userId, callback) => {
        try {
            console.log(`[Turso] Getting favorites for user ${userId}`);
            const result = await query(
                `SELECT 
                    b.id,
                    b.isbn,
                    b.title, 
                    b.author, 
                    b.price, 
                    b.cover, 
                    b.description, 
                    b.rating,
                    b.category,
                    b.genre,
                    b.publisher,
                    b.publication_date,
                    b.pages,
                    b.language,
                    b.format,
                    f.added_at
                 FROM favorites f
                 JOIN books b ON f.book_id = b.id
                 WHERE f.user_id = ?
                 ORDER BY f.added_at DESC`,
                [userId]
            );
            console.log(`[Turso] Found ${result.rows.length} favorites`);
            callback(null, result.rows);
        } catch (error) {
            console.error(`[Turso] Error getting favorites:`, error);
            callback(error);
        }
    },

    // Remove from favorites (matches API expectation)
    removeFavorite: async (userId, bookId, callback) => {
        try {
            console.log(`[Turso] Removing book ${bookId} from favorites for user ${userId}`);
            const deleteResult = await query(
                'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            console.log(`[Turso] Favorite removed successfully, rows affected:`, deleteResult.rowsAffected);
            callback(null);
        } catch (error) {
            console.error(`[Turso] Error removing favorite:`, error);
            callback(error);
        }
    },

    // Check if book is in favorites
    isFavorite: async (userId, bookId, callback) => {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND book_id = ?`,
                [userId, bookId]
            );
            callback(null, result.rows[0].count > 0);
        } catch (error) {
            callback(error);
        }
    }
};

// Order Operations
const orderOperations = {
    // Create new order (simplified signature to match database.js)
    createOrder: async (userId, totalAmount, shippingAddress, callback) => {
        try {
            const orderResult = await query(
                `INSERT INTO orders (user_id, total_amount, shipping_address)
                 VALUES (?, ?, ?)`,
                [userId, totalAmount, shippingAddress]
            );

            // Call callback with context that has lastID property
            const context = { lastID: Number(orderResult.lastInsertRowid) };
            callback.call(context, null);
        } catch (error) {
            callback(error);
        }
    },

    // Add order items
    addOrderItems: async (orderId, items, callback) => {
        try {
            for (const item of items) {
                await query(
                    `INSERT INTO order_items (order_id, book_id, quantity, price)
                     VALUES (?, ?, ?, ?)`,
                    [orderId, item.book_id, item.quantity, item.price]
                );
            }
            callback(null);
        } catch (error) {
            callback(error);
        }
    },

    // Get user's orders
    getUserOrders: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT * FROM orders 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    // Get order details with items
    getOrderDetails: async (orderId, callback) => {
        try {
            const orderResult = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
            const order = orderResult.rows[0];
            
            if (!order) {
                return callback(null, null);
            }

            const itemsResult = await query(
                `SELECT oi.*, b.title, b.author, b.cover
                 FROM order_items oi
                 JOIN books b ON oi.book_id = b.id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            callback(null, { ...order, items: itemsResult.rows });
        } catch (error) {
            callback(error);
        }
    },

    // Get all orders (for admin)
    getAllOrders: async (callback) => {
        try {
            const result = await query(
                `SELECT o.*, u.username, u.email, u.first_name, u.last_name
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC`
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    // Legacy create method (kept for backwards compatibility)
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
    },

    // Get detailed order information for admin (includes customer details and ordered books)
    getAdminOrderDetails: async (orderId, callback) => {
        try {
            const orderResult = await query(
                `SELECT o.*, u.username, u.email, u.first_name, u.last_name, u.phone, u.address
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 WHERE o.id = ?`,
                [orderId]
            );

            const itemsResult = await query(
                `SELECT oi.*, b.title, b.author, b.cover, b.category, b.genre
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
    },

    // Update order
    updateOrder: async (orderId, fields, callback) => {
        try {
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
            
            if (updates.length === 0) {
                return callback(null, { message: 'No fields to update' });
            }
            
            values.push(orderId);
            
            await query(
                `UPDATE orders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );
            
            const updated = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    // Delete order
    deleteOrder: async (orderId, callback) => {
        try {
            // Delete order items first
            await query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
            // Then delete the order
            await query('DELETE FROM orders WHERE id = ?', [orderId]);
            callback(null, { message: 'Order deleted successfully' });
        } catch (error) {
            callback(error);
        }
    }
};

// Reviews Operations
const reviewsOperations = {
    create: async (userId, bookId, rating, reviewText, reviewerName, callback) => {
        try {
            await query(
                `INSERT INTO reviews (book_id, user_id, rating, review_text)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(book_id, user_id) DO UPDATE SET 
                 rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP`,
                [bookId, userId, rating, reviewText, rating, reviewText]
            );
            const result = await query(
                'SELECT * FROM reviews WHERE book_id = ? AND user_id = ?',
                [bookId, userId]
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
    },

    getByBookId: async (bookId, callback) => {
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
    },

    getByUserId: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT r.*, b.title, b.author, b.cover, b.genre, b.category
                 FROM reviews r
                 JOIN books b ON r.book_id = b.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    getUserReviewHistory: async (userId, callback) => {
        try {
            const result = await query(
                `SELECT r.*, b.title, b.author, b.cover, b.genre, b.category
                 FROM reviews r
                 JOIN books b ON r.book_id = b.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC`,
                [userId]
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    hasUserReviewed: async (userId, bookId, callback) => {
        try {
            const result = await query(
                'SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            callback(null, result.rows[0].count > 0);
        } catch (error) {
            callback(error);
        }
    },

    update: async (reviewId, userId, rating, reviewText, callback) => {
        try {
            const result = await query(
                `UPDATE reviews 
                 SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND user_id = ?`,
                [rating, reviewText, reviewId, userId]
            );
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    delete: async (reviewId, userId, callback) => {
        try {
            const result = await query(
                'DELETE FROM reviews WHERE id = ? AND user_id = ?',
                [reviewId, userId]
            );
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    getAverageRating: async (bookId, callback) => {
        try {
            const result = await query(
                `SELECT AVG(rating) as average, COUNT(*) as count
                 FROM reviews
                 WHERE book_id = ?`,
                [bookId]
            );
            callback(null, result.rows[0]);
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

    // Register new admin (alias for create)
    register: async (adminData, callback) => {
        try {
            const result = await query(
                `INSERT INTO admins (username, email, password_hash, first_name, last_name, phone)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    adminData.username, adminData.email, adminData.password_hash,
                    adminData.first_name, adminData.last_name, adminData.phone
                ]
            );
            callback(null, { id: result.lastInsertRowid, message: 'Admin registered successfully' });
        } catch (error) {
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                callback(new Error('Admin with this email or username already exists'));
            } else {
                callback(error);
            }
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
    },

    // Update admin profile
    updateProfile: async (id, profileData, callback) => {
        try {
            await query(
                `UPDATE admins SET
                    first_name = ?, last_name = ?, email = ?, phone = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    profileData.first_name, profileData.last_name, profileData.email,
                    profileData.phone, id
                ]
            );
            const updated = await query('SELECT * FROM admins WHERE id = ?', [id]);
            callback(null, updated.rows[0]);
        } catch (error) {
            callback(error);
        }
    },

    // Update admin password
    updatePassword: async (adminId, passwordHash, callback) => {
        try {
            await query(
                'UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [passwordHash, adminId]
            );
            callback(null, { message: 'Admin password updated successfully' });
        } catch (error) {
            callback(error);
        }
    },

    // Get all admins
    getAll: async (callback) => {
        try {
            const result = await query(
                `SELECT id, username, email, first_name, last_name, created_at
                 FROM admins
                 ORDER BY created_at DESC`
            );
            callback(null, result.rows);
        } catch (error) {
            callback(error);
        }
    },

    // Delete admin
    deleteAdmin: async (id, callback) => {
        try {
            await query('DELETE FROM admins WHERE id = ?', [id]);
            callback(null, { message: 'Admin deleted successfully' });
        } catch (error) {
            callback(error);
        }
    },

    // Get all books with pagination (non-archived)
    getAllBooks: async (page = 1, limit = 10, category = null, search = null, callback) => {
        try {
            const offset = (page - 1) * limit;
            
            let countQuery = 'SELECT COUNT(*) as total FROM books WHERE archived = 0';
            let dataQuery = 'SELECT * FROM books WHERE archived = 0';
            let params = [];
            
            if (category && category !== 'all') {
                countQuery += ' AND category = ?';
                dataQuery += ' AND category = ?';
                params.push(category);
            }
            
            if (search) {
                const searchPattern = `%${search}%`;
                countQuery += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
                dataQuery += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
                params.push(searchPattern, searchPattern, searchPattern);
            }
            
            dataQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?';
            const dataParams = [...params, limit, offset];
            
            const [countResult, booksResult] = await Promise.all([
                query(countQuery, params),
                query(dataQuery, dataParams)
            ]);
            
            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);
            
            callback(null, {
                books: booksResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    // Get all users with pagination (non-archived)
    getAllUsers: async (page = 1, limit = 10, callback) => {
        try {
            const offset = (page - 1) * limit;
            
            const countQuery = 'SELECT COUNT(*) as total FROM users WHERE archived = 0';
            const dataQuery = 'SELECT * FROM users WHERE archived = 0 ORDER BY id DESC LIMIT ? OFFSET ?';
            
            const [countResult, usersResult] = await Promise.all([
                query(countQuery),
                query(dataQuery, [limit, offset])
            ]);
            
            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);
            
            // Remove password hashes from response
            const safeUsers = usersResult.rows.map(u => {
                const { password_hash, ...user } = u;
                return user;
            });
            
            callback(null, {
                users: safeUsers,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    // Get all orders with pagination and filters (non-archived)
    getAllOrders: async (page = 1, limit = 10, filters = {}, callback) => {
        try {
            const offset = (page - 1) * limit;
            
            let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE archived = 0';
            let dataQuery = `
                SELECT o.*, u.email, u.first_name, u.last_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.archived = 0
            `;
            let params = [];
            
            // Apply status filter
            if (filters.status && filters.status !== 'all') {
                countQuery += ' AND status = ?';
                dataQuery += ' AND o.status = ?';
                params.push(filters.status);
            }
            
            // Apply search filter (search by order ID or customer email)
            if (filters.search) {
                countQuery += ' AND (id LIKE ? OR user_id IN (SELECT id FROM users WHERE email LIKE ?))';
                dataQuery += ' AND (o.id LIKE ? OR u.email LIKE ?)';
                const searchPattern = `%${filters.search}%`;
                params.push(searchPattern, searchPattern);
            }
            
            dataQuery += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
            const dataParams = [...params, limit, offset];
            
            const [countResult, ordersResult] = await Promise.all([
                query(countQuery, params),
                query(dataQuery, dataParams)
            ]);
            
            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);
            
            callback(null, {
                orders: ordersResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            callback(error);
        }
    }
};

// Archive Operations
const archiveOperations = {
    // Archive a book
    archiveBook: async (bookId, callback) => {
        try {
            const result = await query('UPDATE books SET archived = 1 WHERE id = ?', [bookId]);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    // Unarchive a book
    unarchiveBook: async (bookId, callback) => {
        try {
            const result = await query('UPDATE books SET archived = 0 WHERE id = ?', [bookId]);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    // Archive a user
    archiveUser: async (userId, callback) => {
        try {
            const result = await query('UPDATE users SET archived = 1 WHERE id = ?', [userId]);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    // Unarchive a user
    unarchiveUser: async (userId, callback) => {
        try {
            const result = await query('UPDATE users SET archived = 0 WHERE id = ?', [userId]);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    // Archive an order
    archiveOrder: async (orderId, callback) => {
        try {
            const result = await query('UPDATE orders SET archived = 1 WHERE id = ?', [orderId]);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    // Unarchive an order
    unarchiveOrder: async (orderId, callback) => {
        try {
            const result = await query('UPDATE orders SET archived = 0 WHERE id = ?', [orderId]);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    // Get archived books with pagination
    getArchivedBooks: async (page = 1, limit = 10, callback) => {
        try {
            const offset = (page - 1) * limit;
            
            const countQuery = 'SELECT COUNT(*) as total FROM books WHERE archived = 1';
            const dataQuery = 'SELECT * FROM books WHERE archived = 1 ORDER BY updated_at DESC LIMIT ? OFFSET ?';
            
            const [countResult, booksResult] = await Promise.all([
                query(countQuery),
                query(dataQuery, [limit, offset])
            ]);
            
            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);
            
            callback(null, {
                books: booksResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    // Get archived users with pagination
    getArchivedUsers: async (page = 1, limit = 10, callback) => {
        try {
            const offset = (page - 1) * limit;
            
            const countQuery = 'SELECT COUNT(*) as total FROM users WHERE archived = 1';
            const dataQuery = 'SELECT * FROM users WHERE archived = 1 ORDER BY id DESC LIMIT ? OFFSET ?';
            
            const [countResult, usersResult] = await Promise.all([
                query(countQuery),
                query(dataQuery, [limit, offset])
            ]);
            
            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);
            
            // Remove password hashes
            const safeUsers = usersResult.rows.map(u => {
                const { password_hash, ...user } = u;
                return user;
            });
            
            callback(null, {
                users: safeUsers,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    // Get archived orders with pagination
    getArchivedOrders: async (page = 1, limit = 10, callback) => {
        try {
            const offset = (page - 1) * limit;
            
            const countQuery = 'SELECT COUNT(*) as total FROM orders WHERE archived = 1';
            const dataQuery = `
                SELECT o.*, u.email, u.first_name, u.last_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.archived = 1
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const [countResult, ordersResult] = await Promise.all([
                query(countQuery),
                query(dataQuery, [limit, offset])
            ]);
            
            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);
            
            callback(null, {
                orders: ordersResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
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
