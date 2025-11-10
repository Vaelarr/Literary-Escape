<?php
/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
    private static $jwtSecret;

    public static function init() {
        // Load JWT secret from environment or use default
        self::$jwtSecret = getenv('JWT_SECRET') ?: 'your-secret-key-here';
    }

    /**
     * Authenticate regular user token
     */
    public static function authenticateToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(['error' => 'Access token required']);
            exit;
        }

        $token = str_replace('Bearer ', '', $authHeader);

        try {
            $decoded = JWT::decode($token, new Key(self::$jwtSecret, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
    }

    /**
     * Authenticate admin token
     */
    public static function authenticateAdmin() {
        $user = self::authenticateToken();

        // Check if this is an admin token
        if (($user['role'] ?? '') !== 'admin' || !($user['isAdmin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit;
        }

        // Verify admin still exists in database
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$user['userId']]);
        $adminData = $stmt->fetch();

        if (!$adminData) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access revoked']);
            exit;
        }

        $user['adminData'] = $adminData;
        return $user;
    }

    /**
     * Authenticate super admin token
     */
    public static function authenticateSuperAdmin() {
        $user = self::authenticateAdmin();

        // Check if this is a super admin token
        if (!($user['isSuperAdmin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['error' => 'Super admin access required']);
            exit;
        }

        // Verify super admin status in database
        if (!($user['adminData']['is_super_admin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['error' => 'Super admin access required']);
            exit;
        }

        return $user;
    }

    /**
     * Generate JWT token
     */
    public static function generateToken($payload, $expiresIn = 86400) {
        $issuedAt = time();
        $expire = $issuedAt + $expiresIn; // Token expires in 24 hours by default

        $tokenPayload = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $expire
        ]);

        return JWT::encode($tokenPayload, self::$jwtSecret, 'HS256');
    }

    /**
     * Validate password against security requirements
     */
    public static function validatePassword($password) {
        $errors = [];

        if (empty($password)) {
            $errors[] = 'password is required';
            return ['isValid' => false, 'errors' => $errors];
        }

        if (strlen($password) < 8) {
            $errors[] = 'minimum 8 characters required';
        }

        if (strlen($password) > 128) {
            $errors[] = 'maximum 128 characters allowed';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'at least one uppercase letter required';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'at least one lowercase letter required';
        }

        if (!preg_match('/\d/', $password)) {
            $errors[] = 'at least one number required';
        }

        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) {
            $errors[] = 'at least one special character required (!@#$%^&*()_+-=[]{}|;:,.<>?)';
        }

        $commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'password123'];
        if (in_array(strtolower($password), $commonPasswords)) {
            $errors[] = 'password is too common';
        }

        return [
            'isValid' => empty($errors),
            'errors' => $errors
        ];
    }
}

// Initialize the middleware
AuthMiddleware::init();
