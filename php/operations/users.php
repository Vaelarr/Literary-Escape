<?php
// User operations for MySQL database

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth.php';

// Register new user
function registerUser() {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    $required = ['username', 'email', 'password', 'first_name', 'last_name'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            sendError("Field '$field' is required");
        }
    }
    
    // Validate password
    $passwordValidation = validatePassword($input['password']);
    if (!$passwordValidation['valid']) {
        sendError(implode(', ', $passwordValidation['errors']));
    }
    
    try {
        // Check if user already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$input['email'], $input['username']]);
        if ($stmt->fetch()) {
            sendError('User with this email or username already exists');
        }
        
        // Hash password
        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
        
        // Create user
        $stmt = $conn->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['username'],
            $input['email'],
            $passwordHash,
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? null
        ]);
        
        $userId = $conn->lastInsertId();
        
        // Get the created user
        $stmt = $conn->prepare("SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        // Generate token
        $token = generateUserToken($user);
        
        sendSuccess([
            'token' => $token,
            'user' => $user
        ], 'Registration successful');
        
    } catch (PDOException $e) {
        sendError('Error registering user: ' . $e->getMessage());
    }
}

// Login user
function loginUser() {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['email']) || !isset($input['password'])) {
        sendError('Email and password are required');
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND archived = 0");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            sendError('Invalid email or password', 401);
        }
        
        // Remove password from response
        unset($user['password_hash']);
        
        // Generate token
        $token = generateUserToken($user);
        
        sendSuccess([
            'token' => $token,
            'user' => $user
        ], 'Login successful');
        
    } catch (PDOException $e) {
        sendError('Error logging in: ' . $e->getMessage());
    }
}

// Admin login
function adminLogin() {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['email']) || !isset($input['password'])) {
        sendError('Email and password are required');
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->execute([$input['email']]);
        $admin = $stmt->fetch();
        
        if (!$admin || !password_verify($input['password'], $admin['password_hash'])) {
            sendError('Invalid admin credentials', 401);
        }
        
        // Remove password from response
        unset($admin['password_hash']);
        
        // Generate token
        $token = generateAdminToken($admin);
        
        sendSuccess([
            'token' => $token,
            'admin' => $admin
        ], 'Admin login successful');
        
    } catch (PDOException $e) {
        sendError('Error logging in: ' . $e->getMessage());
    }
}

// Get user profile
function getUserProfile($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("SELECT id, username, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            sendError('User not found', 404);
        }
        
        sendSuccess($user);
    } catch (PDOException $e) {
        sendError('Error fetching profile: ' . $e->getMessage());
    }
}

// Update user profile
function updateUserProfile($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    try {
        $fields = [];
        $params = [];
        
        $allowedFields = ['first_name', 'last_name', 'phone'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            sendError('No fields to update');
        }
        
        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        sendSuccess([], 'Profile updated successfully');
    } catch (PDOException $e) {
        sendError('Error updating profile: ' . $e->getMessage());
    }
}

// Change password
function changeUserPassword($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['currentPassword']) || !isset($input['newPassword'])) {
        sendError('Current password and new password are required');
    }
    
    // Validate new password
    $passwordValidation = validatePassword($input['newPassword']);
    if (!$passwordValidation['valid']) {
        sendError(implode(', ', $passwordValidation['errors']));
    }
    
    try {
        // Verify current password
        $stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['currentPassword'], $user['password_hash'])) {
            sendError('Current password is incorrect', 401);
        }
        
        // Update password
        $newPasswordHash = password_hash($input['newPassword'], PASSWORD_BCRYPT);
        $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$newPasswordHash, $userId]);
        
        sendSuccess([], 'Password changed successfully');
    } catch (PDOException $e) {
        sendError('Error changing password: ' . $e->getMessage());
    }
}

// Get user addresses
function getUserAddresses($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC");
        $stmt->execute([$userId]);
        $addresses = $stmt->fetchAll();
        
        sendSuccess($addresses);
    } catch (PDOException $e) {
        sendError('Error fetching addresses: ' . $e->getMessage());
    }
}

// Save user address
function saveUserAddress($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    $required = ['address_line1', 'city', 'postal_code', 'country'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            sendError("Field '$field' is required");
        }
    }
    
    try {
        // If this is the first address or marked as default, set as default
        if (isset($input['is_default']) && $input['is_default']) {
            $stmt = $conn->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
            $stmt->execute([$userId]);
        }
        
        $stmt = $conn->prepare("
            INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId,
            $input['address_line1'],
            $input['address_line2'] ?? null,
            $input['city'],
            $input['state'] ?? null,
            $input['postal_code'],
            $input['country'],
            $input['is_default'] ?? 0
        ]);
        
        $addressId = $conn->lastInsertId();
        
        sendSuccess(['id' => $addressId], 'Address saved successfully');
    } catch (PDOException $e) {
        sendError('Error saving address: ' . $e->getMessage());
    }
}

// Set default address
function setDefaultAddress($userId, $addressId) {
    $conn = getDBConnection();
    
    try {
        // Verify address belongs to user
        $stmt = $conn->prepare("SELECT id FROM user_addresses WHERE id = ? AND user_id = ?");
        $stmt->execute([$addressId, $userId]);
        if (!$stmt->fetch()) {
            sendError('Address not found', 404);
        }
        
        // Remove default from all addresses
        $stmt = $conn->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        // Set new default
        $stmt = $conn->prepare("UPDATE user_addresses SET is_default = 1 WHERE id = ?");
        $stmt->execute([$addressId]);
        
        sendSuccess([], 'Default address updated');
    } catch (PDOException $e) {
        sendError('Error updating default address: ' . $e->getMessage());
    }
}

// Delete user address
function deleteUserAddress($userId, $addressId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?");
        $stmt->execute([$addressId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Address not found', 404);
        }
        
        sendSuccess([], 'Address deleted successfully');
    } catch (PDOException $e) {
        sendError('Error deleting address: ' . $e->getMessage());
    }
}
