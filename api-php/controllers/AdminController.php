<?php
/**
 * Admin Controller
 * Handles administrative operations
 */

class AdminController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllBooks() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT * FROM books ORDER BY created_at DESC"
            );
            $books = $stmt->fetchAll();
            
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAllUsers() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT id, username, email, first_name, last_name, phone, 
                        address, city, zip_code, birthdate, is_archived, 
                        created_at, updated_at 
                 FROM users 
                 ORDER BY created_at DESC"
            );
            $users = $stmt->fetchAll();
            
            echo json_encode($users);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAllOrders() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT o.*, u.username, u.email 
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC"
            );
            $orders = $stmt->fetchAll();
            
            echo json_encode($orders);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function archiveBook($bookId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "UPDATE books SET is_archived = 1 WHERE id = ?"
            );
            $stmt->execute([$bookId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'books', $bookId, 'archive');

            echo json_encode(['message' => 'Book archived successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function unarchiveBook($bookId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "UPDATE books SET is_archived = 0 WHERE id = ?"
            );
            $stmt->execute([$bookId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'books', $bookId, 'unarchive');

            echo json_encode(['message' => 'Book unarchived successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function archiveUser($userId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "UPDATE users SET is_archived = 1 WHERE id = ?"
            );
            $stmt->execute([$userId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'users', $userId, 'archive');

            echo json_encode(['message' => 'User archived successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function archiveOrder($orderId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "UPDATE orders SET is_archived = 1 WHERE id = ?"
            );
            $stmt->execute([$orderId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'orders', $orderId, 'archive');

            echo json_encode(['message' => 'Order archived successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getDashboardStats() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stats = [];

            // Total books
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM books WHERE is_archived = 0");
            $stats['totalBooks'] = $stmt->fetch()['count'];

            // Total users
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM users WHERE is_archived = 0");
            $stats['totalUsers'] = $stmt->fetch()['count'];

            // Total orders
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM orders WHERE is_archived = 0");
            $stats['totalOrders'] = $stmt->fetch()['count'];

            // Pending orders
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
            $stats['pendingOrders'] = $stmt->fetch()['count'];

            // Total revenue
            $stmt = $this->db->query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'");
            $stats['totalRevenue'] = $stmt->fetch()['total'] ?? 0;

            // Recent orders (last 7 days)
            $stmt = $this->db->query(
                "SELECT COUNT(*) as count FROM orders 
                 WHERE created_at >= datetime('now', '-7 days')"
            );
            $stats['recentOrders'] = $stmt->fetch()['count'];

            // Top genres
            $stmt = $this->db->query(
                "SELECT genre, COUNT(*) as count 
                 FROM books 
                 WHERE is_archived = 0 
                 GROUP BY genre 
                 ORDER BY count DESC 
                 LIMIT 5"
            );
            $stats['topGenres'] = $stmt->fetchAll();

            echo json_encode($stats);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAdmins() {
        AuthMiddleware::authenticateSuperAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT id, username, email, role, created_at, updated_at 
                 FROM admins 
                 ORDER BY created_at DESC"
            );
            $admins = $stmt->fetchAll();
            
            echo json_encode($admins);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createAdmin() {
        $superAdmin = AuthMiddleware::authenticateSuperAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'admin';

        // Validate input
        if (empty($username) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username, email, and password are required']);
            return;
        }

        // Validate role
        if (!in_array($role, ['admin', 'super_admin'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            return;
        }

        try {
            // Check if username already exists
            $stmt = $this->db->prepare("SELECT id FROM admins WHERE username = ?");
            $stmt->execute([$username]);
            
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Username already exists']);
                return;
            }

            // Hash password
            $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

            // Create admin
            $stmt = $this->db->prepare(
                "INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([$username, $email, $passwordHash, $role]);

            $adminId = $this->db->lastInsertId();

            // Log audit trail
            $this->logAuditTrail($superAdmin['userId'], 'admins', $adminId, 'create');

            http_response_code(201);
            echo json_encode([
                'message' => 'Admin created successfully',
                'adminId' => $adminId
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateAdmin($adminId) {
        $superAdmin = AuthMiddleware::authenticateSuperAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $stmt = $this->db->prepare(
                "UPDATE admins SET email = ?, role = ? WHERE id = ?"
            );
            $stmt->execute([
                $data['email'] ?? '',
                $data['role'] ?? 'admin',
                $adminId
            ]);

            // Log audit trail
            $this->logAuditTrail($superAdmin['userId'], 'admins', $adminId, 'update');

            echo json_encode(['message' => 'Admin updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteAdmin($adminId) {
        $superAdmin = AuthMiddleware::authenticateSuperAdmin();

        try {
            // Prevent deleting self
            if ($adminId == $superAdmin['userId']) {
                http_response_code(400);
                echo json_encode(['error' => 'Cannot delete your own account']);
                return;
            }

            $stmt = $this->db->prepare("DELETE FROM admins WHERE id = ?");
            $stmt->execute([$adminId]);

            // Log audit trail
            $this->logAuditTrail($superAdmin['userId'], 'admins', $adminId, 'delete');

            echo json_encode(['message' => 'Admin deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getArchivedBooks() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT * FROM books WHERE is_archived = 1 ORDER BY created_at DESC"
            );
            $books = $stmt->fetchAll();
            
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getArchivedUsers() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT id, username, email, first_name, last_name, phone, 
                        address, city, zip_code, birthdate, is_archived, 
                        created_at, updated_at 
                 FROM users 
                 WHERE is_archived = 1
                 ORDER BY created_at DESC"
            );
            $users = $stmt->fetchAll();
            
            echo json_encode($users);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getArchivedOrders() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT o.*, u.username, u.email 
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 WHERE o.is_archived = 1
                 ORDER BY o.created_at DESC"
            );
            $orders = $stmt->fetchAll();
            
            echo json_encode($orders);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function unarchiveUser($userId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "UPDATE users SET is_archived = 0 WHERE id = ?"
            );
            $stmt->execute([$userId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'users', $userId, 'unarchive');

            echo json_encode(['message' => 'User unarchived successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function unarchiveOrder($orderId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "UPDATE orders SET is_archived = 0 WHERE id = ?"
            );
            $stmt->execute([$orderId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'orders', $orderId, 'unarchive');

            echo json_encode(['message' => 'Order unarchived successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteUser($userId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'users', $userId, 'delete');

            echo json_encode(['message' => 'User deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateUserRole($userId) {
        $admin = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            // Note: This is for future use if you add roles to users table
            // Currently users table doesn't have a role column
            echo json_encode(['message' => 'User role updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function manageAdmins() {
        AuthMiddleware::authenticateSuperAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT id, username, email, role, created_at, updated_at 
                 FROM admins 
                 ORDER BY created_at DESC"
            );
            $admins = $stmt->fetchAll();
            
            echo json_encode($admins);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function resetAdminPassword($adminId) {
        $superAdmin = AuthMiddleware::authenticateSuperAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        $newPassword = $data['password'] ?? '';

        if (empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'New password is required']);
            return;
        }

        try {
            // Hash password
            $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

            $stmt = $this->db->prepare(
                "UPDATE admins SET password_hash = ? WHERE id = ?"
            );
            $stmt->execute([$passwordHash, $adminId]);

            // Log audit trail
            $this->logAuditTrail($superAdmin['userId'], 'admins', $adminId, 'password_reset');

            echo json_encode(['message' => 'Admin password reset successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function changeAdminPassword() {
        $admin = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($currentPassword) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Current password and new password are required']);
            return;
        }

        try {
            // Get current admin
            $stmt = $this->db->prepare("SELECT * FROM admins WHERE id = ?");
            $stmt->execute([$admin['userId']]);
            $adminData = $stmt->fetch();

            if (!$adminData) {
                http_response_code(404);
                echo json_encode(['error' => 'Admin not found']);
                return;
            }

            // Verify current password
            if (!password_verify($currentPassword, $adminData['password_hash'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password is incorrect']);
                return;
            }

            // Hash and update password
            $newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt = $this->db->prepare(
                "UPDATE admins SET password_hash = ? WHERE id = ?"
            );
            $stmt->execute([$newPasswordHash, $admin['userId']]);

            echo json_encode(['message' => 'Password changed successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateAdminProfile() {
        $admin = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $stmt = $this->db->prepare(
                "UPDATE admins SET email = ? WHERE id = ?"
            );
            $stmt->execute([
                $data['email'] ?? '',
                $admin['userId']
            ]);

            echo json_encode(['message' => 'Profile updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function logAuditTrail($adminId, $entityType, $entityId, $action) {
        try {
            $stmt = $this->db->prepare(
                "INSERT INTO audit_trail (admin_id, entity_type, entity_id, action) 
                 VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([$adminId, $entityType, $entityId, $action]);
        } catch (PDOException $e) {
            error_log("Failed to log audit trail: " . $e->getMessage());
        }
    }
}
