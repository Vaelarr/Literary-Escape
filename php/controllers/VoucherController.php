<?php
/**
 * Voucher Controller
 * Handles discount voucher operations
 */

class VoucherController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT * FROM vouchers ORDER BY created_at DESC"
            );
            $vouchers = $stmt->fetchAll();
            
            echo json_encode($vouchers);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getById($voucherId) {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare("SELECT * FROM vouchers WHERE id = ?");
            $stmt->execute([$voucherId]);
            $voucher = $stmt->fetch();

            if (!$voucher) {
                http_response_code(404);
                echo json_encode(['error' => 'Voucher not found']);
                return;
            }

            echo json_encode($voucher);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        $admin = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        $code = strtoupper($data['code'] ?? '');
        $discountType = $data['discount_type'] ?? 'percentage';
        $discountValue = $data['discount_value'] ?? 0;
        $minPurchase = $data['min_purchase'] ?? null;
        $maxDiscount = $data['max_discount'] ?? null;
        $validFrom = $data['valid_from'] ?? null;
        $validUntil = $data['valid_until'] ?? null;
        $usageLimit = $data['usage_limit'] ?? null;
        $description = $data['description'] ?? '';

        // Validate input
        if (empty($code) || empty($discountValue)) {
            http_response_code(400);
            echo json_encode(['error' => 'Code and discount value are required']);
            return;
        }

        if (!in_array($discountType, ['percentage', 'fixed'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid discount type']);
            return;
        }

        try {
            // Check if code already exists
            $stmt = $this->db->prepare("SELECT id FROM vouchers WHERE code = ?");
            $stmt->execute([$code]);
            
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Voucher code already exists']);
                return;
            }

            // Create voucher
            $stmt = $this->db->prepare(
                "INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, 
                 max_discount, valid_from, valid_until, usage_limit, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );

            $stmt->execute([
                $code,
                $discountType,
                $discountValue,
                $minPurchase,
                $maxDiscount,
                $validFrom,
                $validUntil,
                $usageLimit,
                $description
            ]);

            $voucherId = $this->db->lastInsertId();

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'vouchers', $voucherId, 'create');

            http_response_code(201);
            echo json_encode([
                'message' => 'Voucher created successfully',
                'voucherId' => $voucherId
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($voucherId) {
        $admin = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $stmt = $this->db->prepare(
                "UPDATE vouchers SET 
                 code = ?, discount_type = ?, discount_value = ?, 
                 min_purchase = ?, max_discount = ?, valid_from = ?, 
                 valid_until = ?, usage_limit = ?, description = ?, 
                 is_active = ?
                 WHERE id = ?"
            );

            $stmt->execute([
                strtoupper($data['code'] ?? ''),
                $data['discount_type'] ?? 'percentage',
                $data['discount_value'] ?? 0,
                $data['min_purchase'] ?? null,
                $data['max_discount'] ?? null,
                $data['valid_from'] ?? null,
                $data['valid_until'] ?? null,
                $data['usage_limit'] ?? null,
                $data['description'] ?? '',
                isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
                $voucherId
            ]);

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'vouchers', $voucherId, 'update');

            echo json_encode(['message' => 'Voucher updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($voucherId) {
        $admin = AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare("DELETE FROM vouchers WHERE id = ?");
            $stmt->execute([$voucherId]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Voucher not found']);
                return;
            }

            // Log audit trail
            $this->logAuditTrail($admin['userId'], 'vouchers', $voucherId, 'delete');

            echo json_encode(['message' => 'Voucher deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function validate() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);

        $code = strtoupper($data['code'] ?? '');
        $cartTotal = floatval($data['cart_total'] ?? 0);

        if (empty($code)) {
            http_response_code(400);
            echo json_encode(['error' => 'Voucher code is required']);
            return;
        }

        try {
            $stmt = $this->db->prepare(
                "SELECT * FROM vouchers WHERE code = ? AND is_active = 1"
            );
            $stmt->execute([$code]);
            $voucher = $stmt->fetch();

            if (!$voucher) {
                http_response_code(404);
                echo json_encode(['error' => 'Invalid voucher code']);
                return;
            }

            $now = date('Y-m-d H:i:s');

            // Check validity period
            if ($voucher['valid_from'] && $now < $voucher['valid_from']) {
                http_response_code(400);
                echo json_encode(['error' => 'Voucher is not yet valid']);
                return;
            }

            if ($voucher['valid_until'] && $now > $voucher['valid_until']) {
                http_response_code(400);
                echo json_encode(['error' => 'Voucher has expired']);
                return;
            }

            // Check minimum purchase
            if ($voucher['min_purchase'] && $cartTotal < $voucher['min_purchase']) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Minimum purchase amount not met',
                    'minPurchase' => $voucher['min_purchase']
                ]);
                return;
            }

            // Check usage limit
            if ($voucher['usage_limit']) {
                $stmt = $this->db->prepare(
                    "SELECT COUNT(*) as count FROM orders WHERE voucher_code = ?"
                );
                $stmt->execute([$code]);
                $usageCount = $stmt->fetch()['count'];

                if ($usageCount >= $voucher['usage_limit']) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Voucher usage limit reached']);
                    return;
                }
            }

            // Calculate discount
            $discountAmount = 0;
            if ($voucher['discount_type'] === 'percentage') {
                $discountAmount = ($cartTotal * $voucher['discount_value']) / 100;
                
                if ($voucher['max_discount'] && $discountAmount > $voucher['max_discount']) {
                    $discountAmount = $voucher['max_discount'];
                }
            } else {
                $discountAmount = $voucher['discount_value'];
            }

            $finalTotal = max(0, $cartTotal - $discountAmount);

            echo json_encode([
                'valid' => true,
                'voucher' => $voucher,
                'discountAmount' => round($discountAmount, 2),
                'finalTotal' => round($finalTotal, 2)
            ]);
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
