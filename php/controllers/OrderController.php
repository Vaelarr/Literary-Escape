<?php
/**
 * Order Controller
 * Handles order creation and management
 */

class OrderController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

	public function receiveOrder($orderId) {
		$user = AuthMiddleware::authenticateToken();

		// Get old order data for audit trail
		$stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
		$stmt->execute([$orderId]);
		$oldOrder = $stmt->fetch();

		if (!$oldOrder) {
			http_response_code(404);
			echo json_encode(['error' => 'Order not found']);
			return;
		}

		try {
			$stmt = $this->db->prepare("UPDATE orders SET status = 'received' WHERE id = ?");
			$stmt->execute([$orderId]);

			// Log audit trail
			$this->logAuditTrail(
				[ 'userId' => $user['userId'], 'email' => $user['email'] ],
				'UPDATE',
				'order',
				$orderId,
				"Order #$orderId",
				['status' => $oldOrder['status']],
				['status' => 'received'],
				"User marked order #$orderId as received"
			);

			echo json_encode(['message' => 'Order marked as received']);
		} catch (PDOException $e) {
			http_response_code(500);
			echo json_encode(['error' => $e->getMessage()]);
		}
	}

    public function create() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $shippingAddress = $data['shippingAddress'] ?? [];
        $paymentMethod = $data['paymentMethod'] ?? '';
        $courier = $data['courier'] ?? '';
        $discounts = $data['discounts'] ?? [];
        $totals = $data['totals'] ?? [];

        try {
            // Get selected cart items
            $stmt = $this->db->prepare(
                "SELECT c.*, b.price
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ? AND c.selected_for_checkout = 1"
            );
            $stmt->execute([$user['userId']]);
            $cartItems = $stmt->fetchAll();

            if (empty($cartItems)) {
                http_response_code(400);
                echo json_encode(['error' => 'Cart is empty or no items selected for checkout']);
                return;
            }

            // Calculate total
            $itemsSubtotal = array_sum(array_map(function($item) {
                return $item['quantity'] * $item['price'];
            }, $cartItems));
            
            $totalAmount = $totals['total'] ?? $itemsSubtotal;

            // Create order
            $this->db->beginTransaction();

            $addressData = json_encode([
                'shippingAddress' => $shippingAddress,
                'paymentMethod' => $paymentMethod,
                'courier' => $courier,
                'discounts' => $discounts,
                'itemsSubtotal' => $itemsSubtotal
            ]);

            $stmt = $this->db->prepare(
                "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)"
            );
            $stmt->execute([$user['userId'], $totalAmount, $addressData]);
            
            $orderId = $this->db->lastInsertId();

            // Add order items
            $stmt = $this->db->prepare(
                "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)"
            );
            
            foreach ($cartItems as $item) {
                $stmt->execute([
                    $orderId,
                    $item['book_id'],
                    $item['quantity'],
                    $item['price']
                ]);
            }

            // Clear cart
            $stmt = $this->db->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user['userId']]);

            $this->db->commit();

            echo json_encode(['message' => 'Order created successfully', 'orderId' => $orderId]);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAll() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
            );
            $stmt->execute([$user['userId']]);
            $orders = $stmt->fetchAll();
            
            echo json_encode($orders);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getById($id) {
        $user = AuthMiddleware::authenticateToken();

        try {
            // Get order
            $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch();

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                return;
            }

            // Verify order belongs to user
            if ($order['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied']);
                return;
            }

            // Get order items
            $stmt = $this->db->prepare(
                "SELECT oi.*, b.title, b.author, b.cover
                 FROM order_items oi
                 JOIN books b ON oi.book_id = b.id
                 WHERE oi.order_id = ?"
            );
            $stmt->execute([$id]);
            $items = $stmt->fetchAll();

            $order['items'] = $items;
            
            echo json_encode($order);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getUserOrders($userId) {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
            );
            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll();
            
            echo json_encode($orders);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAdminOrderDetails($orderId) {
        AuthMiddleware::authenticateAdmin();

        try {
            // Get order with user details
            $stmt = $this->db->prepare(
                "SELECT o.*, u.username, u.email, u.first_name, u.last_name, u.phone, u.address
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 WHERE o.id = ?"
            );
            $stmt->execute([$orderId]);
            $order = $stmt->fetch();

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                return;
            }

            // Get order items
            $stmt = $this->db->prepare(
                "SELECT oi.*, b.title, b.author, b.cover, b.category, b.genre
                 FROM order_items oi
                 JOIN books b ON oi.book_id = b.id
                 WHERE oi.order_id = ?"
            );
            $stmt->execute([$orderId]);
            $items = $stmt->fetchAll();

            $order['items'] = $items;
            
            // Parse shipping info
            if (!empty($order['shipping_address'])) {
                $order['shippingInfo'] = json_decode($order['shipping_address'], true);
            }
            
            echo json_encode($order);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateOrder($orderId) {
        $user = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        // Get old order data for audit trail
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $oldOrder = $stmt->fetch();

        if (!$oldOrder) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            return;
        }

        try {
            $updates = [];
            $values = [];

            if (isset($data['status'])) {
                $updates[] = 'status = ?';
                $values[] = $data['status'];
            }

            if (isset($data['shipping_address'])) {
                $updates[] = 'shipping_address = ?';
                $values[] = $data['shipping_address'];
            }

            if (empty($updates)) {
                echo json_encode(['message' => 'No updates provided', 'changes' => 0]);
                return;
            }

            $values[] = $orderId;
            $sql = "UPDATE orders SET " . implode(', ', $updates) . " WHERE id = ?";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);

            // Log audit trail
            $this->logAuditTrail(
                $user,
                'UPDATE',
                'order',
                $orderId,
                "Order #$orderId",
                ['status' => $oldOrder['status'], 'shipping_address' => $oldOrder['shipping_address']],
                $data,
                "Updated order #$orderId status from \"{$oldOrder['status']}\" to \"{$data['status']}\""
            );

            echo json_encode(['message' => 'Order updated', 'changes' => $stmt->rowCount()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteOrder($orderId) {
        $user = AuthMiddleware::authenticateAdmin();

        // Get order data for audit trail
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $orderData = $stmt->fetch();

        if (!$orderData) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Delete order items
            $stmt = $this->db->prepare("DELETE FROM order_items WHERE order_id = ?");
            $stmt->execute([$orderId]);

            // Delete order
            $stmt = $this->db->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);

            $this->db->commit();

            // Log audit trail
            $this->logAuditTrail(
                $user,
                'DELETE',
                'Order',
                $orderId,
                "Order #$orderId",
                $orderData,
                null,
                "Deleted order #$orderId ({$orderData['status']})"
            );

            echo json_encode(['message' => 'Order deleted']);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function logAuditTrail($user, $actionType, $entityType, $entityId, $entityName, $oldValue, $newValue, $description) {
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
                $user['userId'],
                $user['email'],
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $description
            ]);
        } catch (PDOException $e) {
            error_log('Error logging audit trail: ' . $e->getMessage());
        }
    }
}
