<?php
// PHP Database Configuration
// This file handles MySQL connection via XAMPP
// Keeps the Node.js/Turso connection completely separate

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration for XAMPP MySQL
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '20Bradford&'); // Default XAMPP MySQL password is empty
define('DB_NAME', 'literary_escape');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret for authentication
define('JWT_SECRET', 'your-secret-key-here'); // Should match your Node.js JWT_SECRET
define('JWT_ALGORITHM', 'HS256');

// CORS Settings
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
]);

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS

// Timezone
date_default_timezone_set('UTC');

// Create database connection
function getDBConnection() {
    static $conn = null;
    
    if ($conn === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            echo "✅ Connected to MySQL Database\n";
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            die(json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]));
        }
    }
    
    return $conn;
}

// CORS Headers
function setCORSHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Send error response
function sendError($message, $statusCode = 400) {
    sendResponse(['success' => false, 'message' => $message], $statusCode);
}

// Send success response
function sendSuccess($data = [], $message = 'Success') {
    sendResponse(['success' => true, 'message' => $message, 'data' => $data]);
}

// Get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

// Initialize database on first run
function initializeDatabase() {
    $conn = getDBConnection();
    
    // Check if database exists, if not create it
    try {
        $conn->query("SELECT 1 FROM books LIMIT 1");
        echo "✅ Database tables already exist\n";
    } catch (PDOException $e) {
        echo "📊 Creating database tables...\n";
        require_once __DIR__ . '/init-db.php';
        createDatabaseTables($conn);
    }
}
