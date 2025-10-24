<?php
/**
 * PHP Backend Setup Script for Literary Escape
 * 
 * This script initializes the MySQL database for XAMPP
 * Run this once to set up your database: php setup.php
 */

require_once __DIR__ . '/config.php';

echo "=================================================\n";
echo "LITERARY ESCAPE - PHP BACKEND SETUP\n";
echo "=================================================\n\n";

// Step 1: Test database connection
echo "Step 1: Testing database connection...\n";
try {
    $conn = getDBConnection();
    echo "✅ Successfully connected to MySQL\n\n";
} catch (Exception $e) {
    echo "❌ Failed to connect to MySQL\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "Please make sure:\n";
    echo "1. XAMPP is installed and running\n";
    echo "2. MySQL/Apache services are started\n";
    echo "3. Database 'literary_escape' exists\n\n";
    echo "To create the database, run this in phpMyAdmin or MySQL CLI:\n";
    echo "CREATE DATABASE literary_escape CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n\n";
    exit(1);
}

// Step 2: Initialize database tables
echo "Step 2: Creating database tables...\n";
try {
    require_once __DIR__ . '/init-db.php';
    createDatabaseTables($conn);
    echo "\n";
} catch (Exception $e) {
    echo "❌ Error creating tables: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Step 3: Verify setup
echo "Step 3: Verifying setup...\n";
try {
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredTables = [
        'books', 'users', 'admins', 'cart', 'favorites',
        'orders', 'order_items', 'reviews', 'user_addresses', 'vouchers'
    ];
    
    $missingTables = array_diff($requiredTables, $tables);
    
    if (empty($missingTables)) {
        echo "✅ All required tables created successfully\n";
        echo "   Tables: " . implode(', ', $tables) . "\n\n";
    } else {
        echo "⚠️  Some tables are missing: " . implode(', ', $missingTables) . "\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error verifying setup: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Step 4: Display configuration info
echo "=================================================\n";
echo "SETUP COMPLETE!\n";
echo "=================================================\n\n";

echo "📋 Configuration:\n";
echo "   Database Host: " . DB_HOST . "\n";
echo "   Database Name: " . DB_NAME . "\n";
echo "   Database User: " . DB_USER . "\n\n";

echo "🔐 Default Admin Account:\n";
echo "   Email: admin@literaryescape.com\n";
echo "   Password: Admin123!\n\n";

echo "🌐 API Endpoint:\n";
echo "   Local: http://localhost/php/api.php\n";
echo "   Or: http://localhost:80/php/api.php\n\n";

echo "📝 Next Steps:\n";
echo "1. Start XAMPP (Apache + MySQL)\n";
echo "2. Make sure port 80 is available\n";
echo "3. Access your API at http://localhost/php/api/\n";
echo "4. Test the connection: http://localhost/php/api/test-db\n\n";

echo "💡 Tips:\n";
echo "- Your Node.js/Turso backend remains unchanged\n";
echo "- Both backends can run simultaneously\n";
echo "- PHP uses MySQL, Node.js uses Turso\n";
echo "- Update frontend to use PHP: change baseURL in api-client.js\n\n";

echo "=================================================\n";
echo "Setup completed successfully! 🎉\n";
echo "=================================================\n";
