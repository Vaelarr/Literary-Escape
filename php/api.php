<?php
// Main API router for PHP backend
// This handles all API requests similar to the Node.js api.js

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/operations/books.php';
require_once __DIR__ . '/operations/users.php';
require_once __DIR__ . '/operations/cart.php';
require_once __DIR__ . '/operations/favorites.php';
require_once __DIR__ . '/operations/orders.php';
require_once __DIR__ . '/operations/reviews.php';
require_once __DIR__ . '/operations/admin.php';
require_once __DIR__ . '/operations/vouchers.php';

// Set CORS headers
setCORSHeaders();

// Initialize database
initializeDatabase();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove /php/ prefix if present
$path = preg_replace('#^/php#', '', $path);

// Route the request
try {
    // Test endpoint
    if ($path === '/api/test-db' && $method === 'GET') {
        testDatabaseConnection();
    }
    
    // Auth endpoints
    elseif ($path === '/api/register' && $method === 'POST') {
        registerUser();
    }
    elseif ($path === '/api/login' && $method === 'POST') {
        loginUser();
    }
    elseif ($path === '/api/admin/login' && $method === 'POST') {
        adminLogin();
    }
    
    // Book endpoints (public read)
    elseif (preg_match('#^/api/books$#', $path) && $method === 'GET') {
        getBooks();
    }
    elseif (preg_match('#^/api/books/(\d+)$#', $path, $matches) && $method === 'GET') {
        getBookById($matches[1]);
    }
    
    // Admin book endpoints
    elseif ($path === '/api/books' && $method === 'POST') {
        $admin = authenticateAdmin();
        createBook();
    }
    elseif (preg_match('#^/api/books/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $admin = authenticateAdmin();
        updateBook($matches[1]);
    }
    elseif (preg_match('#^/api/books/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $admin = authenticateAdmin();
        deleteBook($matches[1]);
    }
    
    // Cart endpoints
    elseif ($path === '/api/cart' && $method === 'GET') {
        $user = authenticateToken();
        getCart($user['userId']);
    }
    elseif ($path === '/api/cart' && $method === 'POST') {
        $user = authenticateToken();
        addToCart($user['userId']);
    }
    elseif (preg_match('#^/api/cart/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $user = authenticateToken();
        updateCartItem($user['userId'], $matches[1]);
    }
    elseif (preg_match('#^/api/cart/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $user = authenticateToken();
        removeFromCart($user['userId'], $matches[1]);
    }
    elseif (preg_match('#^/api/cart/(\d+)/select$#', $path, $matches) && $method === 'PUT') {
        $user = authenticateToken();
        updateCartSelection($user['userId'], $matches[1]);
    }
    elseif ($path === '/api/cart/select-all' && $method === 'POST') {
        $user = authenticateToken();
        selectAllForCheckout($user['userId']);
    }
    elseif ($path === '/api/cart/deselect-all' && $method === 'POST') {
        $user = authenticateToken();
        deselectAllForCheckout($user['userId']);
    }
    elseif ($path === '/api/cart/selected' && $method === 'GET') {
        $user = authenticateToken();
        getSelectedCartItems($user['userId']);
    }
    elseif ($path === '/api/cart/selected/total' && $method === 'GET') {
        $user = authenticateToken();
        getSelectedCartTotal($user['userId']);
    }
    
    // Favorites endpoints
    elseif ($path === '/api/favorites' && $method === 'GET') {
        $user = authenticateToken();
        getFavorites($user['userId']);
    }
    elseif ($path === '/api/favorites' && $method === 'POST') {
        $user = authenticateToken();
        addToFavorites($user['userId']);
    }
    elseif (preg_match('#^/api/favorites/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $user = authenticateToken();
        removeFromFavorites($user['userId'], $matches[1]);
    }
    
    // Order endpoints
    elseif ($path === '/api/orders' && $method === 'POST') {
        $user = authenticateToken();
        createOrder($user['userId']);
    }
    elseif ($path === '/api/orders' && $method === 'GET') {
        $user = authenticateToken();
        getUserOrders($user['userId']);
    }
    elseif (preg_match('#^/api/orders/(\d+)$#', $path, $matches) && $method === 'GET') {
        $user = authenticateToken();
        getOrderDetails($user['userId'], $matches[1]);
    }
    
    // Review endpoints
    elseif (preg_match('#^/api/reviews/(\d+)$#', $path, $matches) && $method === 'GET') {
        getBookReviews($matches[1]);
    }
    elseif ($path === '/api/reviews' && $method === 'POST') {
        $user = authenticateToken();
        createReview($user['userId']);
    }
    elseif (preg_match('#^/api/reviews/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $user = authenticateToken();
        updateReview($user['userId'], $matches[1]);
    }
    elseif (preg_match('#^/api/reviews/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $user = authenticateToken();
        deleteReview($user['userId'], $matches[1]);
    }
    elseif (preg_match('#^/api/reviews/(\d+)/average$#', $path, $matches) && $method === 'GET') {
        getAverageRating($matches[1]);
    }
    elseif ($path === '/api/user/reviews' && $method === 'GET') {
        $user = authenticateToken();
        getUserReviews($user['userId']);
    }
    
    // User profile endpoints
    elseif ($path === '/api/user/profile' && $method === 'GET') {
        $user = authenticateToken();
        getUserProfile($user['userId']);
    }
    elseif ($path === '/api/user/profile' && $method === 'PUT') {
        $user = authenticateToken();
        updateUserProfile($user['userId']);
    }
    elseif ($path === '/api/user/change-password' && $method === 'POST') {
        $user = authenticateToken();
        changeUserPassword($user['userId']);
    }
    
    // User addresses
    elseif ($path === '/api/user/addresses' && $method === 'GET') {
        $user = authenticateToken();
        getUserAddresses($user['userId']);
    }
    elseif ($path === '/api/user/addresses' && $method === 'POST') {
        $user = authenticateToken();
        saveUserAddress($user['userId']);
    }
    elseif (preg_match('#^/api/user/addresses/(\d+)/default$#', $path, $matches) && $method === 'PUT') {
        $user = authenticateToken();
        setDefaultAddress($user['userId'], $matches[1]);
    }
    elseif (preg_match('#^/api/user/addresses/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $user = authenticateToken();
        deleteUserAddress($user['userId'], $matches[1]);
    }
    
    // Admin endpoints
    elseif ($path === '/api/admin/books' && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetAllBooks();
    }
    elseif ($path === '/api/admin/users' && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetAllUsers();
    }
    elseif ($path === '/api/admin/orders' && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetAllOrders();
    }
    elseif (preg_match('#^/api/admin/orders/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $admin = authenticateAdmin();
        adminUpdateOrder($matches[1]);
    }
    elseif (preg_match('#^/api/admin/orders/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $admin = authenticateAdmin();
        adminDeleteOrder($matches[1]);
    }
    elseif (preg_match('#^/api/admin/orders/(\d+)/details$#', $path, $matches) && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetOrderDetails($matches[1]);
    }
    elseif (preg_match('#^/api/admin/users/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $admin = authenticateAdmin();
        adminDeleteUser($matches[1]);
    }
    elseif (preg_match('#^/api/admin/users/(\d+)/role$#', $path, $matches) && $method === 'PUT') {
        $admin = authenticateAdmin();
        adminUpdateUserRole($matches[1]);
    }
    elseif (preg_match('#^/api/admin/users/(\d+)/orders$#', $path, $matches) && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetUserOrders($matches[1]);
    }
    
    // Archive endpoints
    elseif (preg_match('#^/api/admin/books/(\d+)/archive$#', $path, $matches) && $method === 'POST') {
        $admin = authenticateAdmin();
        archiveBook($matches[1]);
    }
    elseif (preg_match('#^/api/admin/books/(\d+)/unarchive$#', $path, $matches) && $method === 'POST') {
        $admin = authenticateAdmin();
        unarchiveBook($matches[1]);
    }
    elseif (preg_match('#^/api/admin/users/(\d+)/archive$#', $path, $matches) && $method === 'POST') {
        $admin = authenticateAdmin();
        archiveUser($matches[1]);
    }
    elseif (preg_match('#^/api/admin/users/(\d+)/unarchive$#', $path, $matches) && $method === 'POST') {
        $admin = authenticateAdmin();
        unarchiveUser($matches[1]);
    }
    elseif (preg_match('#^/api/admin/orders/(\d+)/archive$#', $path, $matches) && $method === 'POST') {
        $admin = authenticateAdmin();
        archiveOrder($matches[1]);
    }
    elseif (preg_match('#^/api/admin/orders/(\d+)/unarchive$#', $path, $matches) && $method === 'POST') {
        $admin = authenticateAdmin();
        unarchiveOrder($matches[1]);
    }
    elseif ($path === '/api/admin/books/archived' && $method === 'GET') {
        $admin = authenticateAdmin();
        getArchivedBooks();
    }
    elseif ($path === '/api/admin/users/archived' && $method === 'GET') {
        $admin = authenticateAdmin();
        getArchivedUsers();
    }
    elseif ($path === '/api/admin/orders/archived' && $method === 'GET') {
        $admin = authenticateAdmin();
        getArchivedOrders();
    }
    
    // Voucher endpoints
    elseif ($path === '/api/vouchers/validate' && $method === 'POST') {
        validateVoucher();
    }
    elseif ($path === '/api/admin/vouchers' && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetVouchers();
    }
    elseif (preg_match('#^/api/admin/vouchers/(\d+)$#', $path, $matches) && $method === 'GET') {
        $admin = authenticateAdmin();
        adminGetVoucher($matches[1]);
    }
    elseif ($path === '/api/admin/vouchers' && $method === 'POST') {
        $admin = authenticateAdmin();
        adminCreateVoucher();
    }
    elseif (preg_match('#^/api/admin/vouchers/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $admin = authenticateAdmin();
        adminUpdateVoucher($matches[1]);
    }
    elseif (preg_match('#^/api/admin/vouchers/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $admin = authenticateAdmin();
        adminDeleteVoucher($matches[1]);
    }
    
    // Dashboard stats
    elseif ($path === '/api/admin/dashboard/stats' && $method === 'GET') {
        $admin = authenticateAdmin();
        getDashboardStats();
    }
    
    else {
        sendError('Endpoint not found', 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}

// Test database connection
function testDatabaseConnection() {
    try {
        $conn = getDBConnection();
        $stmt = $conn->query("SELECT COUNT(*) as count FROM books");
        $result = $stmt->fetch();
        
        sendSuccess([
            'connection' => 'success',
            'database' => 'MySQL',
            'bookCount' => $result['count']
        ], 'Database connection successful');
        
    } catch (Exception $e) {
        sendError('Database connection failed: ' . $e->getMessage(), 500);
    }
}
