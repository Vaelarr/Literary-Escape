<?php
// Authentication helpers for JWT tokens

require_once __DIR__ . '/config.php';

// Simple JWT implementation (or use a library like firebase/php-jwt)
class JWT {
    public static function encode($payload, $secret) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    public static function decode($jwt, $secret) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            return false;
        }
        
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;
        
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload));
        return json_decode($payload, true);
    }
}

// Get authorization token from header
function getAuthToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}

// Verify authentication token
function authenticateToken() {
    $token = getAuthToken();
    
    if (!$token) {
        sendError('Authentication required', 401);
    }
    
    $payload = JWT::decode($token, JWT_SECRET);
    
    if (!$payload) {
        sendError('Invalid or expired token', 403);
    }
    
    return $payload;
}

// Verify admin authentication
function authenticateAdmin() {
    $payload = authenticateToken();
    
    if (!isset($payload['role']) || !in_array($payload['role'], ['admin', 'superadmin'])) {
        sendError('Admin access required', 403);
    }
    
    return $payload;
}

// Generate JWT token for user
function generateUserToken($user) {
    $payload = [
        'userId' => $user['id'],
        'email' => $user['email'],
        'username' => $user['username'],
        'role' => $user['role'] ?? 'customer',
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    return JWT::encode($payload, JWT_SECRET);
}

// Generate JWT token for admin
function generateAdminToken($admin) {
    $payload = [
        'adminId' => $admin['id'],
        'email' => $admin['email'],
        'username' => $admin['username'],
        'role' => $admin['role'] ?? 'admin',
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    return JWT::encode($payload, JWT_SECRET);
}

// Password validation
function validatePassword($password) {
    $errors = [];
    
    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters long';
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = 'Password must contain at least one number';
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = 'Password must contain at least one special character';
    }
    
    return [
        'valid' => empty($errors),
        'errors' => $errors
    ];
}
