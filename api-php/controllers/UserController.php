<?php
/**
 * User Controller
 * Handles user profile and account management
 */

class UserController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getProfile() {
        $user = AuthMiddleware::authenticateToken();

        try {
            // Check if this is an admin token
            if (($user['role'] ?? '') === 'admin' && ($user['isAdmin'] ?? false)) {
                // Get admin profile
                $stmt = $this->db->prepare("SELECT * FROM admins WHERE id = ?");
                $stmt->execute([$user['userId']]);
                $profile = $stmt->fetch();

                if (!$profile) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Admin not found']);
                    return;
                }

                unset($profile['password_hash']);
                echo json_encode($profile);
            } else {
                // Get regular user profile
                $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
                $stmt->execute([$user['userId']]);
                $profile = $stmt->fetch();

                if (!$profile) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    return;
                }

                unset($profile['password_hash']);
                echo json_encode($profile);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateProfile() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $stmt = $this->db->prepare(
                "UPDATE users SET 
                 first_name = ?, last_name = ?, email = ?, phone = ?, 
                 address = ?, birthdate = ?, city = ?, zip_code = ?, 
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?"
            );

            $stmt->execute([
                $data['first_name'] ?? '',
                $data['last_name'] ?? '',
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['address'] ?? '',
                $data['birthdate'] ?? null,
                $data['city'] ?? '',
                $data['zip_code'] ?? '',
                $user['userId']
            ]);

            echo json_encode(['message' => 'Profile updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function changePassword() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        try {
            // Get current user
            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$user['userId']]);
            $userData = $stmt->fetch();

            if (!$userData) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            // Verify current password
            if (!password_verify($currentPassword, $userData['password_hash'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password is incorrect']);
                return;
            }

            // Validate new password
            $passwordValidation = AuthMiddleware::validatePassword($newPassword);
            if (!$passwordValidation['isValid']) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Password requirements not met: ' . implode(', ', $passwordValidation['errors'])
                ]);
                return;
            }

            // Hash and update password
            $newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt = $this->db->prepare(
                "UPDATE users SET password_hash = ? WHERE id = ?"
            );
            $stmt->execute([$newPasswordHash, $user['userId']]);

            echo json_encode(['message' => 'Password changed successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAddresses() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "SELECT * FROM user_addresses 
                 WHERE user_id = ? 
                 ORDER BY is_default DESC, created_at DESC"
            );
            $stmt->execute([$user['userId']]);
            $addresses = $stmt->fetchAll();
            
            echo json_encode($addresses);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function saveAddress() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $this->db->beginTransaction();

            // If setting as default, unset all other defaults
            if ($data['is_default'] ?? false) {
                $stmt = $this->db->prepare(
                    "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?"
                );
                $stmt->execute([$user['userId']]);
            }

            // Insert new address
            $stmt = $this->db->prepare(
                "INSERT INTO user_addresses (user_id, label, full_address, city, zip_code, is_default)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );

            $stmt->execute([
                $user['userId'],
                $data['label'] ?? '',
                $data['full_address'] ?? '',
                $data['city'] ?? '',
                $data['zip_code'] ?? '',
                ($data['is_default'] ?? false) ? 1 : 0
            ]);

            $this->db->commit();

            echo json_encode(['message' => 'Address saved successfully']);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function setDefaultAddress($addressId) {
        $user = AuthMiddleware::authenticateToken();

        try {
            $this->db->beginTransaction();

            // Unset all defaults
            $stmt = $this->db->prepare(
                "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?"
            );
            $stmt->execute([$user['userId']]);

            // Set new default
            $stmt = $this->db->prepare(
                "UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?"
            );
            $stmt->execute([$addressId, $user['userId']]);

            $this->db->commit();

            echo json_encode(['message' => 'Default address updated']);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteAddress($addressId) {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "DELETE FROM user_addresses WHERE id = ? AND user_id = ?"
            );
            $stmt->execute([$addressId, $user['userId']]);

            echo json_encode(['message' => 'Address deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getReviews() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "SELECT 
                 r.id, r.rating, r.review_text, r.reviewer_name, r.created_at, r.updated_at,
                 b.id as book_id, b.title, b.author, b.cover, b.price, b.genre, b.category
                 FROM reviews r
                 JOIN books b ON r.book_id = b.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC"
            );
            $stmt->execute([$user['userId']]);
            $reviews = $stmt->fetchAll();
            
            echo json_encode($reviews);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
