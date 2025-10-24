<?php
// Voucher operations for MySQL database

require_once __DIR__ . '/../config.php';

// Validate voucher (public endpoint)
function validateVoucher() {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['code'])) {
        sendError('Voucher code is required');
    }
    
    $code = $input['code'];
    $orderAmount = $input['orderAmount'] ?? 0;
    
    try {
        $stmt = $conn->prepare("
            SELECT * FROM vouchers
            WHERE code = ? AND is_active = 1
        ");
        $stmt->execute([$code]);
        $voucher = $stmt->fetch();
        
        if (!$voucher) {
            sendError('Invalid voucher code', 404);
        }
        
        // Check validity dates
        $now = time();
        if ($voucher['valid_from'] && strtotime($voucher['valid_from']) > $now) {
            sendError('Voucher is not yet valid');
        }
        if ($voucher['valid_until'] && strtotime($voucher['valid_until']) < $now) {
            sendError('Voucher has expired');
        }
        
        // Check usage limit
        if ($voucher['usage_limit'] && $voucher['times_used'] >= $voucher['usage_limit']) {
            sendError('Voucher usage limit reached');
        }
        
        // Check minimum order amount
        if ($voucher['min_order_amount'] && $orderAmount < $voucher['min_order_amount']) {
            sendError('Order amount does not meet minimum requirement');
        }
        
        // Calculate discount
        $discount = 0;
        if ($voucher['discount_type'] === 'percentage') {
            $discount = $orderAmount * ($voucher['discount_value'] / 100);
            if ($voucher['max_discount_amount']) {
                $discount = min($discount, $voucher['max_discount_amount']);
            }
        } else {
            $discount = $voucher['discount_value'];
        }
        
        sendSuccess([
            'valid' => true,
            'voucher' => $voucher,
            'discount' => $discount
        ]);
        
    } catch (PDOException $e) {
        sendError('Error validating voucher: ' . $e->getMessage());
    }
}

// Admin: Get all vouchers
function adminGetVouchers() {
    $conn = getDBConnection();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $offset = ($page - 1) * $limit;
    
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM vouchers");
        $totalCount = $stmt->fetch()['total'];
        
        $stmt = $conn->prepare("SELECT * FROM vouchers ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$limit, $offset]);
        $vouchers = $stmt->fetchAll();
        
        sendSuccess([
            'vouchers' => $vouchers,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching vouchers: ' . $e->getMessage());
    }
}

// Admin: Get single voucher
function adminGetVoucher($voucherId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("SELECT * FROM vouchers WHERE id = ?");
        $stmt->execute([$voucherId]);
        $voucher = $stmt->fetch();
        
        if (!$voucher) {
            sendError('Voucher not found', 404);
        }
        
        sendSuccess($voucher);
    } catch (PDOException $e) {
        sendError('Error fetching voucher: ' . $e->getMessage());
    }
}

// Admin: Create voucher
function adminCreateVoucher() {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    $required = ['code', 'discount_type', 'discount_value'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            sendError("Field '$field' is required");
        }
    }
    
    if (!in_array($input['discount_type'], ['percentage', 'fixed'])) {
        sendError('Invalid discount type');
    }
    
    try {
        // Check if code already exists
        $stmt = $conn->prepare("SELECT id FROM vouchers WHERE code = ?");
        $stmt->execute([$input['code']]);
        if ($stmt->fetch()) {
            sendError('Voucher code already exists');
        }
        
        $stmt = $conn->prepare("
            INSERT INTO vouchers (
                code, description, discount_type, discount_value,
                min_order_amount, max_discount_amount, usage_limit,
                valid_from, valid_until, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['code'],
            $input['description'] ?? null,
            $input['discount_type'],
            $input['discount_value'],
            $input['min_order_amount'] ?? 0,
            $input['max_discount_amount'] ?? null,
            $input['usage_limit'] ?? null,
            $input['valid_from'] ?? null,
            $input['valid_until'] ?? null,
            $input['is_active'] ?? 1
        ]);
        
        $voucherId = $conn->lastInsertId();
        
        sendSuccess(['id' => $voucherId], 'Voucher created successfully');
    } catch (PDOException $e) {
        sendError('Error creating voucher: ' . $e->getMessage());
    }
}

// Admin: Update voucher
function adminUpdateVoucher($voucherId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    try {
        // Check if voucher exists
        $stmt = $conn->prepare("SELECT id FROM vouchers WHERE id = ?");
        $stmt->execute([$voucherId]);
        if (!$stmt->fetch()) {
            sendError('Voucher not found', 404);
        }
        
        $fields = [];
        $params = [];
        
        $allowedFields = [
            'code', 'description', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'usage_limit',
            'valid_from', 'valid_until', 'is_active'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            sendError('No fields to update');
        }
        
        $params[] = $voucherId;
        $sql = "UPDATE vouchers SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        sendSuccess([], 'Voucher updated successfully');
    } catch (PDOException $e) {
        sendError('Error updating voucher: ' . $e->getMessage());
    }
}

// Admin: Delete voucher
function adminDeleteVoucher($voucherId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM vouchers WHERE id = ?");
        $stmt->execute([$voucherId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Voucher not found', 404);
        }
        
        sendSuccess([], 'Voucher deleted successfully');
    } catch (PDOException $e) {
        sendError('Error deleting voucher: ' . $e->getMessage());
    }
}
