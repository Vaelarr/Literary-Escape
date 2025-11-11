<?php
/**
 * Authentication Controller
 * Handles user registration, login, and password reset
 */

require_once __DIR__ . '/../services/email.php';

class AuthController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $first_name = $data['first_name'] ?? '';
        $last_name = $data['last_name'] ?? '';
        $address = $data['address'] ?? '';
        $phone = $data['phone'] ?? '';

        // Validate password
        $passwordValidation = AuthMiddleware::validatePassword($password);
        if (!$passwordValidation['isValid']) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Password requirements not met: ' . implode(', ', $passwordValidation['errors'])
            ]);
            return;
        }

        // Check if email already exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'error' => "An account already exists with the email: $email. Please use a different email or try logging in."
            ]);
            return;
        }

        // Check if username already exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'error' => "The username \"$username\" is already taken. Please choose a different username."
            ]);
            return;
        }

        // Hash password
        $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        // Insert user
        try {
            $stmt = $this->db->prepare(
                "INSERT INTO users (username, email, password_hash, first_name, last_name, address, phone) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$username, $email, $password_hash, $first_name, $last_name, $address, $phone]);

            echo json_encode(['message' => 'User registered successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed']);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        // Check if this email belongs to an admin account
        $stmt = $this->db->prepare("SELECT id FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Admin accounts must use the admin login portal. Please visit the admin panel to login.'
            ]);
            return;
        }

        // Get user
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        // Additional check: Prevent any users with admin role from logging in through regular login
        if (($user['role'] ?? 'user') === 'admin') {
            http_response_code(403);
            echo json_encode([
                'error' => 'Admin accounts must use the admin login portal. Please visit the admin panel to login.'
            ]);
            return;
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        // Generate token
        $token = AuthMiddleware::generateToken([
            'userId' => $user['id'],
            'email' => $user['email']
        ]);

        echo json_encode([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name']
            ]
        ]);
    }

    public function adminLogin() {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        // Get admin
        $stmt = $this->db->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        // Verify password
        if (!password_verify($password, $admin['password_hash'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        // Generate token
        $token = AuthMiddleware::generateToken([
            'userId' => $admin['id'],
            'username' => $admin['username'],
            'email' => $admin['email'],
            'role' => 'admin',
            'isAdmin' => true,
            'isSuperAdmin' => (bool)$admin['is_super_admin']
        ]);

        // Log audit trail
        $this->logAuditTrail(
            'LOGIN',
            'admin',
            $admin['id'],
            $admin['username'] ?? $admin['email'],
            null,
            null,
            "Admin {$admin['username']} logged in.",
            $admin['id'],
            $admin['email']
        );

        echo json_encode([
            'token' => $token,
            'user' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'email' => $admin['email'],
                'first_name' => $admin['first_name'],
                'last_name' => $admin['last_name'],
                'role' => 'admin',
                'isAdmin' => true,
                'isSuperAdmin' => (bool)$admin['is_super_admin']
            ]
        ]);
    }

    public function forgotPassword() {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }

        // Get user
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // For security, don't reveal if email exists
            echo json_encode([
                'message' => 'If an account exists with this email, a password reset link has been sent.'
            ]);
            return;
        }

        // Generate secure random token
        $resetToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour from now

        // Delete any existing tokens for this user
        $stmt = $this->db->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$user['id']]);

        // Save reset token
        $stmt = $this->db->prepare(
            "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)"
        );
        $stmt->execute([$user['id'], $resetToken, $expiresAt]);

        // Send email
        try {
            $emailService = new EmailService();
            $emailService->sendPasswordResetEmail($user['email'], $resetToken, $user['username']);
            
            echo json_encode([
                'message' => 'Password reset link has been sent to your email address.'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Failed to send reset email. Please try again later.'
            ]);
        }
    }

    public function verifyResetToken() {
        $data = json_decode(file_get_contents('php://input'), true);
        $token = $data['token'] ?? '';

        if (empty($token)) {
            http_response_code(400);
            echo json_encode(['error' => 'Token is required']);
            return;
        }

        $stmt = $this->db->prepare(
            "SELECT * FROM password_resets 
             WHERE token = ? AND expires_at > datetime('now') AND used = 0"
        );
        $stmt->execute([$token]);
        $tokenData = $stmt->fetch();

        if (!$tokenData) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired reset token']);
            return;
        }

        echo json_encode(['valid' => true, 'message' => 'Token is valid']);
    }

    public function resetPassword() {
        $data = json_decode(file_get_contents('php://input'), true);
        $token = $data['token'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($token) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Token and new password are required']);
            return;
        }

        // Validate password
        $passwordValidation = AuthMiddleware::validatePassword($newPassword);
        if (!$passwordValidation['isValid']) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Password requirements not met: ' . implode(', ', $passwordValidation['errors'])
            ]);
            return;
        }

        // Verify token
        $stmt = $this->db->prepare(
            "SELECT * FROM password_resets 
             WHERE token = ? AND expires_at > datetime('now') AND used = 0"
        );
        $stmt->execute([$token]);
        $tokenData = $stmt->fetch();

        if (!$tokenData) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired reset token']);
            return;
        }

        // Hash new password
        $password_hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        // Update user password
        $stmt = $this->db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$password_hash, $tokenData['user_id']]);

        // Mark token as used
        $stmt = $this->db->prepare("UPDATE password_resets SET used = 1 WHERE token = ?");
        $stmt->execute([$token]);

        echo json_encode([
            'message' => 'Password has been successfully reset. You can now login with your new password.'
        ]);
    }

    private function logAuditTrail($actionType, $entityType, $entityId, $entityName, $oldValue, $newValue, $description, $adminId, $adminEmail) {
        try {
            $stmt = $this->db->prepare(
                "INSERT INTO audit_trail 
                (action_type, entity_type, entity_id, entity_name, old_value, new_value, admin_id, admin_email, ip_address, user_agent, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            
            $stmt->execute([
                $actionType,
                $entityType,
                $entityId,
                $entityName,
                $oldValue ? json_encode($oldValue) : null,
                $newValue ? json_encode($newValue) : null,
                $adminId,
                $adminEmail,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $description
            ]);
        } catch (PDOException $e) {
            error_log('Error logging audit trail: ' . $e->getMessage());
        }
    }
}
