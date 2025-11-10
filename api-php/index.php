<?php
/**
 * Main API Router
 * Routes all API requests to appropriate controllers
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/BookController.php';
require_once __DIR__ . '/controllers/CartController.php';
require_once __DIR__ . '/controllers/FavoritesController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/ReviewController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/VoucherController.php';
require_once __DIR__ . '/controllers/AuditController.php';
require_once __DIR__ . '/controllers/AdminNotificationController.php';

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove /api prefix if present
$uri = preg_replace('#^/api#', '', $uri);

// Remove trailing slash
$uri = rtrim($uri, '/');

// Parse the URI into segments
$segments = explode('/', trim($uri, '/'));

// Initialize database
try {
    Database::getInstance();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Route the request
try {
    // Test endpoint
    if ($uri === '/test-db' || $uri === 'test-db') {
        $bookController = new BookController();
        $bookController->testDatabase();
        exit;
    }

    // Authentication routes
    if ($uri === '/register' || $uri === 'register') {
        $authController = new AuthController();
        $authController->register();
        exit;
    }

    if ($uri === '/login' || $uri === 'login') {
        $authController = new AuthController();
        $authController->login();
        exit;
    }

    if ($uri === '/admin/login' || $uri === 'admin/login') {
        $authController = new AuthController();
        $authController->adminLogin();
        exit;
    }

    // Password reset routes
    if ($uri === '/forgot-password' || $uri === 'forgot-password') {
        $authController = new AuthController();
        $authController->forgotPassword();
        exit;
    }

    if ($uri === '/verify-reset-token' || $uri === 'verify-reset-token') {
        $authController = new AuthController();
        $authController->verifyResetToken();
        exit;
    }

    if ($uri === '/reset-password' || $uri === 'reset-password') {
        $authController = new AuthController();
        $authController->resetPassword();
        exit;
    }

    // Book routes
    if (preg_match('#^/?books/?(\d+)?$#', $uri, $matches)) {
        $bookController = new BookController();
        $bookId = $matches[1] ?? null;

        if ($method === 'GET' && $bookId) {
            $bookController->getById($bookId);
        } elseif ($method === 'GET') {
            $bookController->getAll();
        } elseif ($method === 'POST') {
            $bookController->create();
        } elseif ($method === 'PUT' && $bookId) {
            $bookController->update($bookId);
        } elseif ($method === 'DELETE' && $bookId) {
            $bookController->delete($bookId);
        }
        exit;
    }

    // Cart routes
    if (preg_match('#^/?cart(/(.+))?$#', $uri, $matches)) {
        $cartController = new CartController();
        $action = $matches[2] ?? null;

        if ($method === 'GET' && !$action) {
            $cartController->getCart();
        } elseif ($method === 'POST' && !$action) {
            $cartController->addItem();
        } elseif ($method === 'GET' && $action === 'selected') {
            $cartController->getSelected();
        } elseif ($method === 'GET' && $action === 'selected/total') {
            $cartController->getSelectedTotal();
        } elseif ($method === 'POST' && $action === 'select-all') {
            $cartController->selectAll();
        } elseif ($method === 'POST' && $action === 'deselect-all') {
            $cartController->deselectAll();
        } elseif ($method === 'PUT' && preg_match('#^(\d+)$#', $action, $idMatch)) {
            $cartController->updateQuantity($idMatch[1]);
        } elseif ($method === 'PUT' && preg_match('#^(\d+)/select$#', $action, $idMatch)) {
            $cartController->updateSelection($idMatch[1]);
        } elseif ($method === 'DELETE' && preg_match('#^(\d+)$#', $action, $idMatch)) {
            $cartController->removeItem($idMatch[1]);
        }
        exit;
    }

    // Favorites routes
    if (preg_match('#^/?favorites/?(\d+)?$#', $uri, $matches)) {
        $favoritesController = new FavoritesController();
        $bookId = $matches[1] ?? null;

        if ($method === 'GET') {
            $favoritesController->getAll();
        } elseif ($method === 'POST') {
            $favoritesController->add();
        } elseif ($method === 'DELETE' && $bookId) {
            $favoritesController->remove($bookId);
        }
        exit;
    }

    // Order routes
    if (preg_match('#^/?orders/?(\d+)?(/(.+))?$#', $uri, $matches)) {
        $orderController = new OrderController();
        $orderId = $matches[1] ?? null;
        $action = $matches[3] ?? null;

        if ($method === 'GET' && $orderId && !$action) {
            $orderController->getById($orderId);
        } elseif ($method === 'GET' && !$orderId) {
            $orderController->getAll();
        } elseif ($method === 'POST' && !$orderId) {
            $orderController->create();
        } elseif ($method === 'PUT' && $orderId && $action === 'receive') {
            // Mark order as received (parity with Node API)
            $orderController->receiveOrder($orderId);
        }
        exit;
    }

    // Review routes
    if (preg_match('#^/?reviews/?(\d+)?(/(.+))?$#', $uri, $matches)) {
        $reviewController = new ReviewController();
        $id = $matches[1] ?? null;
        $action = $matches[3] ?? null;

        if ($method === 'GET' && $id && $action === 'average') {
            $reviewController->getAverageRating($id);
        } elseif ($method === 'GET' && $id) {
            $reviewController->getByBookId($id);
        } elseif ($method === 'POST') {
            $reviewController->create();
        } elseif ($method === 'PUT' && $id) {
            $reviewController->update($id);
        } elseif ($method === 'DELETE' && $id) {
            $reviewController->delete($id);
        }
        exit;
    }

    // User routes
    if (preg_match('#^/?user/(.+)$#', $uri, $matches)) {
        $userController = new UserController();
        $action = $matches[1];

        if ($method === 'GET' && $action === 'profile') {
            $userController->getProfile();
        } elseif ($method === 'PUT' && $action === 'profile') {
            $userController->updateProfile();
        } elseif ($method === 'POST' && $action === 'change-password') {
            $userController->changePassword();
        } elseif ($method === 'GET' && $action === 'addresses') {
            $userController->getAddresses();
        } elseif ($method === 'POST' && $action === 'addresses') {
            $userController->saveAddress();
        } elseif ($method === 'GET' && $action === 'reviews') {
            $userController->getReviews();
        } elseif (preg_match('#^addresses/(\d+)/default$#', $action, $idMatch)) {
            $userController->setDefaultAddress($idMatch[1]);
        } elseif (preg_match('#^addresses/(\d+)$#', $action, $idMatch)) {
            if ($method === 'DELETE') {
                $userController->deleteAddress($idMatch[1]);
            }
        }
        exit;
    }

    // Admin routes
    if (preg_match('#^/?admin/(.+)$#', $uri, $matches)) {
        $action = $matches[1];
        
        // Admin authentication routes
        if ($action === 'login') {
            $authController = new AuthController();
            $authController->adminLogin();
            exit;
        }

        $adminController = new AdminController();

        // Books management
        if (preg_match('#^books(/(.+))?$#', $action, $bookMatches)) {
            $subAction = $bookMatches[2] ?? null;
            
            if ($method === 'GET' && $subAction === 'archived') {
                $adminController->getArchivedBooks();
            } elseif ($method === 'GET') {
                $adminController->getAllBooks();
            } elseif (preg_match('#^(\d+)/archive$#', $subAction, $idMatch)) {
                $adminController->archiveBook($idMatch[1]);
            } elseif (preg_match('#^(\d+)/unarchive$#', $subAction, $idMatch)) {
                $adminController->unarchiveBook($idMatch[1]);
            }
            exit;
        }

        // Users management
        if (preg_match('#^users(/(.+))?$#', $action, $userMatches)) {
            $subAction = $userMatches[2] ?? null;
            
            if ($method === 'GET' && $subAction === 'archived') {
                $adminController->getArchivedUsers();
            } elseif ($method === 'GET') {
                $adminController->getAllUsers();
            } elseif ($method === 'DELETE' && preg_match('#^(\d+)$#', $subAction, $idMatch)) {
                $adminController->deleteUser($idMatch[1]);
            } elseif (preg_match('#^(\d+)/archive$#', $subAction, $idMatch)) {
                $adminController->archiveUser($idMatch[1]);
            } elseif (preg_match('#^(\d+)/unarchive$#', $subAction, $idMatch)) {
                $adminController->unarchiveUser($idMatch[1]);
            } elseif (preg_match('#^(\d+)/role$#', $subAction, $idMatch)) {
                $adminController->updateUserRole($idMatch[1]);
            } elseif (preg_match('#^(\d+)/orders$#', $subAction, $idMatch)) {
                $orderController = new OrderController();
                $orderController->getUserOrders($idMatch[1]);
            }
            exit;
        }

        // Orders management
        if (preg_match('#^orders(/(.+))?$#', $action, $orderMatches)) {
            $subAction = $orderMatches[2] ?? null;
            
            if ($method === 'GET' && $subAction === 'archived') {
                $adminController->getArchivedOrders();
            } elseif ($method === 'GET' && preg_match('#^(\d+)/details$#', $subAction, $idMatch)) {
                $orderController = new OrderController();
                $orderController->getAdminOrderDetails($idMatch[1]);
            } elseif ($method === 'GET') {
                $adminController->getAllOrders();
            } elseif ($method === 'PUT' && preg_match('#^(\d+)$#', $subAction, $idMatch)) {
                $orderController = new OrderController();
                $orderController->updateOrder($idMatch[1]);
            } elseif ($method === 'DELETE' && preg_match('#^(\d+)$#', $subAction, $idMatch)) {
                $orderController = new OrderController();
                $orderController->deleteOrder($idMatch[1]);
            } elseif (preg_match('#^(\d+)/archive$#', $subAction, $idMatch)) {
                $adminController->archiveOrder($idMatch[1]);
            } elseif (preg_match('#^(\d+)/unarchive$#', $subAction, $idMatch)) {
                $adminController->unarchiveOrder($idMatch[1]);
            }
            exit;
        }

        // Vouchers management
        if (preg_match('#^vouchers(/(.+))?$#', $action, $voucherMatches)) {
            $voucherController = new VoucherController();
            $subAction = $voucherMatches[2] ?? null;
            
            if ($method === 'GET' && preg_match('#^(\d+)$#', $subAction, $idMatch)) {
                $voucherController->getById($idMatch[1]);
            } elseif ($method === 'GET') {
                $voucherController->getAll();
            } elseif ($method === 'POST') {
                $voucherController->create();
            } elseif ($method === 'PUT' && preg_match('#^(\d+)$#', $subAction, $idMatch)) {
                $voucherController->update($idMatch[1]);
            } elseif ($method === 'DELETE' && preg_match('#^(\d+)$#', $subAction, $idMatch)) {
                $voucherController->delete($idMatch[1]);
            }
            exit;
        }

        // Dashboard stats
        if ($action === 'dashboard/stats') {
            $adminController->getDashboardStats();
            exit;
        }

        // Dashboard top-selling books (parity with Node API)
        if ($action === 'dashboard/top-selling-books') {
            // Fallback: derive top-selling from order_items
            $stmt = Database::getInstance()->getConnection()->query(
                "SELECT b.id, b.title, b.author, b.cover, b.category, b.genre,
                        SUM(oi.quantity) as total_sold
                 FROM order_items oi
                 JOIN books b ON oi.book_id = b.id
                 GROUP BY b.id
                 ORDER BY total_sold DESC
                 LIMIT 10"
            );
            $rows = $stmt->fetchAll();
            echo json_encode($rows);
            exit;
        }

        // Audit trail
        if (preg_match('#^audit-trail(/(.+))?$#', $action, $auditMatches)) {
            $auditController = new AuditController();
            $subAction = $auditMatches[2] ?? null;
            
            if ($subAction === 'recent') {
                $auditController->getRecent();
            } elseif (preg_match('#^entity/(.+)$#', $subAction, $typeMatch)) {
                $auditController->getByEntityType($typeMatch[1]);
            } elseif (preg_match('#^action/(.+)$#', $subAction, $typeMatch)) {
                $auditController->getByActionType($typeMatch[1]);
            } elseif (preg_match('#^admin/(\d+)$#', $subAction, $idMatch)) {
                $auditController->getByAdmin($idMatch[1]);
            } else {
                $auditController->getAll();
            }
            exit;
        }

        // Admin notifications
        if (preg_match('#^notifications(/(.+))?$#', $action, $notifMatches)) {
            $notifController = new AdminNotificationController();
            $subAction = $notifMatches[2] ?? null;

            if ($method === 'GET' && $subAction === 'unread') {
                $notifController->getUnread();
            } elseif ($method === 'GET' && $subAction === 'unread/count') {
                $notifController->getUnreadCount();
            } elseif ($method === 'GET' && $subAction === 'recent') {
                $notifController->getRecent();
            } elseif ($method === 'PUT' && preg_match('#^(\d+)/read$#', $subAction, $idMatch)) {
                $notifController->markRead($idMatch[1]);
            } elseif ($method === 'PUT' && $subAction === 'read-all') {
                $notifController->markAllRead();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Notifications endpoint not found']);
            }
            exit;
        }

        // Super admin routes
        if ($action === 'super-admin/admins') {
            $adminController->manageAdmins();
            exit;
        }

        if (preg_match('#^super-admin/admins/(\d+)(/(.+))?$#', $action, $saMatches)) {
            $adminId = $saMatches[1];
            $subAction = $saMatches[3] ?? null;
            
            if ($method === 'PUT' && $subAction === 'password') {
                $adminController->resetAdminPassword($adminId);
            } elseif ($method === 'PUT') {
                $adminController->updateAdmin($adminId);
            } elseif ($method === 'DELETE') {
                $adminController->deleteAdmin($adminId);
            }
            exit;
        }

        // Admin profile management
        if ($action === 'profile/change-password') {
            $adminController->changeAdminPassword();
            exit;
        }

        if ($action === 'profile/update') {
            $adminController->updateAdminProfile();
            exit;
        }
    }

    // Voucher validation (authenticated users)
    if ($uri === '/vouchers/validate' || $uri === 'vouchers/validate') {
        $voucherController = new VoucherController();
        $voucherController->validate();
        exit;
    }

    // 404 Not Found
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);

} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
