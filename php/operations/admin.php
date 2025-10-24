<?php
// Admin operations for MySQL database

require_once __DIR__ . '/../config.php';

// Get all books for admin with pagination
function adminGetAllBooks() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT * FROM books WHERE archived = 0";
    $params = [];
    
    if ($search) {
        $sql .= " AND (title LIKE ? OR author LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    } elseif ($category && $category !== 'all') {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    // Get total count
    try {
        $countStmt = $conn->prepare(str_replace("SELECT *", "SELECT COUNT(*) as total", $sql));
        $countStmt->execute($params);
        $totalCount = $countStmt->fetch()['total'];
        
        // Get paginated results
        $sql .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $books = $stmt->fetchAll();
        
        sendSuccess([
            'books' => $books,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching books: ' . $e->getMessage());
    }
}

// Get all users for admin with pagination
function adminGetAllUsers() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $offset = ($page - 1) * $limit;
    
    try {
        // Get total count
        $stmt = $conn->query("SELECT COUNT(*) as total FROM users WHERE archived = 0");
        $totalCount = $stmt->fetch()['total'];
        
        // Get paginated results
        $stmt = $conn->prepare("
            SELECT id, username, email, first_name, last_name, phone, role, created_at
            FROM users
            WHERE archived = 0
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $users = $stmt->fetchAll();
        
        sendSuccess([
            'users' => $users,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching users: ' . $e->getMessage());
    }
}

// Get all orders for admin with pagination and filters
function adminGetAllOrders() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $status = $_GET['status'] ?? null;
    $search = $_GET['search'] ?? null;
    $offset = ($page - 1) * $limit;
    
    $sql = "
        SELECT o.*, u.username, u.email, u.first_name, u.last_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.archived = 0
    ";
    $params = [];
    
    if ($status && $status !== 'all') {
        $sql .= " AND o.status = ?";
        $params[] = $status;
    }
    
    if ($search) {
        $sql .= " AND (u.username LIKE ? OR u.email LIKE ? OR o.id = ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $search;
    }
    
    try {
        // Get total count
        $countStmt = $conn->prepare(str_replace("SELECT o.*, u.username, u.email, u.first_name, u.last_name", "SELECT COUNT(*) as total", $sql));
        $countStmt->execute($params);
        $totalCount = $countStmt->fetch()['total'];
        
        // Get paginated results
        $sql .= " ORDER BY o.created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();
        
        sendSuccess([
            'orders' => $orders,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching orders: ' . $e->getMessage());
    }
}

// Update order
function adminUpdateOrder($orderId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    try {
        $fields = [];
        $params = [];
        
        $allowedFields = ['status', 'tracking_number'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            sendError('No fields to update');
        }
        
        $params[] = $orderId;
        $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() === 0) {
            sendError('Order not found', 404);
        }
        
        sendSuccess([], 'Order updated successfully');
    } catch (PDOException $e) {
        sendError('Error updating order: ' . $e->getMessage());
    }
}

// Delete order
function adminDeleteOrder($orderId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Order not found', 404);
        }
        
        sendSuccess([], 'Order deleted successfully');
    } catch (PDOException $e) {
        sendError('Error deleting order: ' . $e->getMessage());
    }
}

// Get order details for admin
function adminGetOrderDetails($orderId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT o.*, u.username, u.email, u.first_name, u.last_name, u.phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        ");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendError('Order not found', 404);
        }
        
        // Get order items
        $stmt = $conn->prepare("
            SELECT oi.*, b.title, b.author, b.cover
            FROM order_items oi
            JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$orderId]);
        $order['items'] = $stmt->fetchAll();
        
        sendSuccess($order);
    } catch (PDOException $e) {
        sendError('Error fetching order details: ' . $e->getMessage());
    }
}

// Delete user
function adminDeleteUser($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('User not found', 404);
        }
        
        sendSuccess([], 'User deleted successfully');
    } catch (PDOException $e) {
        sendError('Error deleting user: ' . $e->getMessage());
    }
}

// Update user role
function adminUpdateUserRole($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['role'])) {
        sendError('Role is required');
    }
    
    $role = $input['role'];
    $allowedRoles = ['customer', 'admin'];
    
    if (!in_array($role, $allowedRoles)) {
        sendError('Invalid role');
    }
    
    try {
        $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
        $stmt->execute([$role, $userId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('User not found', 404);
        }
        
        sendSuccess([], 'User role updated successfully');
    } catch (PDOException $e) {
        sendError('Error updating user role: ' . $e->getMessage());
    }
}

// Get orders for a specific user
function adminGetUserOrders($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        sendSuccess($orders);
    } catch (PDOException $e) {
        sendError('Error fetching user orders: ' . $e->getMessage());
    }
}

// Archive book
function archiveBook($bookId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE books SET archived = 1 WHERE id = ?");
        $stmt->execute([$bookId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Book not found', 404);
        }
        
        sendSuccess([], 'Book archived successfully');
    } catch (PDOException $e) {
        sendError('Error archiving book: ' . $e->getMessage());
    }
}

// Unarchive book
function unarchiveBook($bookId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE books SET archived = 0 WHERE id = ?");
        $stmt->execute([$bookId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Book not found', 404);
        }
        
        sendSuccess([], 'Book unarchived successfully');
    } catch (PDOException $e) {
        sendError('Error unarchiving book: ' . $e->getMessage());
    }
}

// Archive user
function archiveUser($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE users SET archived = 1 WHERE id = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('User not found', 404);
        }
        
        sendSuccess([], 'User archived successfully');
    } catch (PDOException $e) {
        sendError('Error archiving user: ' . $e->getMessage());
    }
}

// Unarchive user
function unarchiveUser($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE users SET archived = 0 WHERE id = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('User not found', 404);
        }
        
        sendSuccess([], 'User unarchived successfully');
    } catch (PDOException $e) {
        sendError('Error unarchiving user: ' . $e->getMessage());
    }
}

// Archive order
function archiveOrder($orderId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE orders SET archived = 1 WHERE id = ?");
        $stmt->execute([$orderId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Order not found', 404);
        }
        
        sendSuccess([], 'Order archived successfully');
    } catch (PDOException $e) {
        sendError('Error archiving order: ' . $e->getMessage());
    }
}

// Unarchive order
function unarchiveOrder($orderId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE orders SET archived = 0 WHERE id = ?");
        $stmt->execute([$orderId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Order not found', 404);
        }
        
        sendSuccess([], 'Order unarchived successfully');
    } catch (PDOException $e) {
        sendError('Error unarchiving order: ' . $e->getMessage());
    }
}

// Get archived books
function getArchivedBooks() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $offset = ($page - 1) * $limit;
    
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM books WHERE archived = 1");
        $totalCount = $stmt->fetch()['total'];
        
        $stmt = $conn->prepare("SELECT * FROM books WHERE archived = 1 ORDER BY updated_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$limit, $offset]);
        $books = $stmt->fetchAll();
        
        sendSuccess([
            'books' => $books,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching archived books: ' . $e->getMessage());
    }
}

// Get archived users
function getArchivedUsers() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $offset = ($page - 1) * $limit;
    
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM users WHERE archived = 1");
        $totalCount = $stmt->fetch()['total'];
        
        $stmt = $conn->prepare("
            SELECT id, username, email, first_name, last_name, role, updated_at
            FROM users
            WHERE archived = 1
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $users = $stmt->fetchAll();
        
        sendSuccess([
            'users' => $users,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching archived users: ' . $e->getMessage());
    }
}

// Get archived orders
function getArchivedOrders() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $offset = ($page - 1) * $limit;
    
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM orders WHERE archived = 1");
        $totalCount = $stmt->fetch()['total'];
        
        $stmt = $conn->prepare("
            SELECT o.*, u.username, u.email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.archived = 1
            ORDER BY o.updated_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $orders = $stmt->fetchAll();
        
        sendSuccess([
            'orders' => $orders,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching archived orders: ' . $e->getMessage());
    }
}

// Get dashboard statistics
function getDashboardStats() {
    $conn = getDBConnection();
    
    try {
        // Total books
        $stmt = $conn->query("SELECT COUNT(*) as count FROM books WHERE archived = 0");
        $totalBooks = $stmt->fetch()['count'];
        
        // Total users
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users WHERE archived = 0");
        $totalUsers = $stmt->fetch()['count'];
        
        // Total orders
        $stmt = $conn->query("SELECT COUNT(*) as count FROM orders WHERE archived = 0");
        $totalOrders = $stmt->fetch()['count'];
        
        // Total revenue
        $stmt = $conn->query("SELECT SUM(total_amount) as total FROM orders WHERE archived = 0 AND status != 'cancelled'");
        $totalRevenue = $stmt->fetch()['total'] ?? 0;
        
        // Recent orders
        $stmt = $conn->query("SELECT * FROM orders WHERE archived = 0 ORDER BY created_at DESC LIMIT 5");
        $recentOrders = $stmt->fetchAll();
        
        // Orders by status
        $stmt = $conn->query("SELECT status, COUNT(*) as count FROM orders WHERE archived = 0 GROUP BY status");
        $ordersByStatus = $stmt->fetchAll();
        
        sendSuccess([
            'totalBooks' => (int)$totalBooks,
            'totalUsers' => (int)$totalUsers,
            'totalOrders' => (int)$totalOrders,
            'totalRevenue' => (float)$totalRevenue,
            'recentOrders' => $recentOrders,
            'ordersByStatus' => $ordersByStatus
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching dashboard stats: ' . $e->getMessage());
    }
}
