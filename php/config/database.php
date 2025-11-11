<?php
/**
 * Database Configuration
 * Provides SQLite database connection and initialization
 */

class Database {
    private static $instance = null;
    private $connection;
    private $dbPath;

    private function __construct() {
        $this->dbPath = dirname(__DIR__, 2) . '/literary_escape.db';
        $this->connect();
        $this->initializeDatabase();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        try {
            $this->connection = new PDO('sqlite:' . $this->dbPath);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Enable foreign keys
            $this->connection->exec('PRAGMA foreign_keys = ON');
            
            error_log('Connected to SQLite database at: ' . $this->dbPath);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    private function initializeDatabase() {
        try {
            // Create tables if they don't exist
            $this->createBooksTable();
            $this->createUsersTable();
            $this->createAdminsTable();
            $this->createUserAddressesTable();
            $this->createCartTable();
            $this->createFavoritesTable();
            $this->createOrdersTable();
            $this->createOrderItemsTable();
            $this->createReviewsTable();
            $this->createVouchersTable();
            $this->createAuditTrailTable();
            $this->createPasswordResetTable();
            
            // Run migrations
            $this->runMigrations();
            
            // Create default admin account
            $this->createDefaultAdmin();
            
        } catch (PDOException $e) {
            error_log('Database initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createBooksTable() {
        $sql = "CREATE TABLE IF NOT EXISTS books (
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
            archived INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->connection->exec($sql);
    }

    private function createUsersTable() {
        $sql = "CREATE TABLE IF NOT EXISTS users (
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
            archived INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->connection->exec($sql);
    }

    private function createAdminsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'admin',
            is_super_admin INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->connection->exec($sql);
    }

    private function createUserAddressesTable() {
        $sql = "CREATE TABLE IF NOT EXISTS user_addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            full_address TEXT NOT NULL,
            city TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        $this->connection->exec($sql);
    }

    private function createCartTable() {
        $sql = "CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            selected_for_checkout INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        )";
        $this->connection->exec($sql);
    }

    private function createFavoritesTable() {
        $sql = "CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        )";
        $this->connection->exec($sql);
    }

    private function createOrdersTable() {
        $sql = "CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            archived INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )";
        $this->connection->exec($sql);
    }

    private function createOrderItemsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id)
        )";
        $this->connection->exec($sql);
    }

    private function createReviewsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS reviews (
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
        )";
        $this->connection->exec($sql);
    }

    private function createVouchersTable() {
        $sql = "CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
            discount_value REAL NOT NULL,
            min_purchase REAL DEFAULT 0,
            max_discount REAL,
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            per_user_limit INTEGER DEFAULT 1,
            valid_from DATETIME NOT NULL,
            valid_until DATETIME NOT NULL,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->connection->exec($sql);
    }

    private function createAuditTrailTable() {
        $sql = "CREATE TABLE IF NOT EXISTS audit_trail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            entity_name TEXT,
            old_value TEXT,
            new_value TEXT,
            admin_id INTEGER NOT NULL,
            admin_email TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admins(id)
        )";
        $this->connection->exec($sql);
    }

    private function createPasswordResetTable() {
        $sql = "CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        $this->connection->exec($sql);
    }

    private function runMigrations() {
        // Add columns that might not exist in older schema versions
        $migrations = [
            "ALTER TABLE cart ADD COLUMN selected_for_checkout INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'",
            "ALTER TABLE books ADD COLUMN archived INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN archived INTEGER DEFAULT 0",
            "ALTER TABLE orders ADD COLUMN archived INTEGER DEFAULT 0",
            "ALTER TABLE admins ADD COLUMN is_super_admin INTEGER DEFAULT 0"
        ];

        foreach ($migrations as $migration) {
            try {
                $this->connection->exec($migration);
            } catch (PDOException $e) {
                // Ignore duplicate column errors
                if (!str_contains($e->getMessage(), 'duplicate column name')) {
                    error_log('Migration warning: ' . $e->getMessage());
                }
            }
        }
    }

    private function createDefaultAdmin() {
        try {
            $stmt = $this->connection->prepare("SELECT id FROM admins WHERE email = ?");
            $stmt->execute(['admin@literaryescape.com']);
            
            if (!$stmt->fetch()) {
                $passwordHash = password_hash('Admin123!', PASSWORD_BCRYPT);
                $stmt = $this->connection->prepare(
                    "INSERT INTO admins (username, email, password_hash, first_name, last_name, role, is_super_admin) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)"
                );
                $stmt->execute([
                    'admin',
                    'admin@literaryescape.com',
                    $passwordHash,
                    'System',
                    'Administrator',
                    'admin',
                    1
                ]);
                error_log('Super Administrator account created successfully');
            }
        } catch (PDOException $e) {
            error_log('Error creating default admin: ' . $e->getMessage());
        }
    }
}
