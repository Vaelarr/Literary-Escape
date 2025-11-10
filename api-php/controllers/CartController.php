<?php
/**
 * Cart Controller
 * Handles shopping cart operations
 */

class CartController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getCart() {
        $user = AuthMiddleware::authenticateToken();
        
        try {
            $stmt = $this->db->prepare(
                "SELECT c.*, b.title, b.author, b.price, b.cover, b.stock_quantity
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ?
                 ORDER BY c.created_at DESC"
            );
            $stmt->execute([$user['userId']]);
            $items = $stmt->fetchAll();
            
            echo json_encode($items);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addItem() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $bookId = $data['bookId'] ?? 0;
        $quantity = $data['quantity'] ?? 1;

        try {
            // Check if item already exists in cart
            $stmt = $this->db->prepare(
                "SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?"
            );
            $stmt->execute([$user['userId'], $bookId]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Update quantity
                $newQuantity = $existing['quantity'] + $quantity;
                $stmt = $this->db->prepare(
                    "UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?"
                );
                $stmt->execute([$newQuantity, $user['userId'], $bookId]);
            } else {
                // Insert new item
                $stmt = $this->db->prepare(
                    "INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)"
                );
                $stmt->execute([$user['userId'], $bookId, $quantity]);
            }

            echo json_encode(['message' => 'Item added to cart']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateQuantity($bookId) {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $quantity = $data['quantity'] ?? 1;

        try {
            $stmt = $this->db->prepare(
                "UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?"
            );
            $stmt->execute([$quantity, $user['userId'], $bookId]);
            
            echo json_encode(['message' => 'Cart updated']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function removeItem($bookId) {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "DELETE FROM cart WHERE user_id = ? AND book_id = ?"
            );
            $stmt->execute([$user['userId'], $bookId]);
            
            echo json_encode(['message' => 'Item removed from cart']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateSelection($bookId) {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $selected = $data['selected'] ?? false;

        try {
            $stmt = $this->db->prepare(
                "UPDATE cart SET selected_for_checkout = ? WHERE user_id = ? AND book_id = ?"
            );
            $stmt->execute([$selected ? 1 : 0, $user['userId'], $bookId]);
            
            echo json_encode(['message' => 'Selection updated']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function selectAll() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "UPDATE cart SET selected_for_checkout = 1 WHERE user_id = ?"
            );
            $stmt->execute([$user['userId']]);
            
            echo json_encode(['message' => 'All items selected for checkout']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deselectAll() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "UPDATE cart SET selected_for_checkout = 0 WHERE user_id = ?"
            );
            $stmt->execute([$user['userId']]);
            
            echo json_encode(['message' => 'All items deselected']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getSelected() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "SELECT c.*, b.title, b.author, b.price, b.cover, b.stock_quantity
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ? AND c.selected_for_checkout = 1
                 ORDER BY c.created_at DESC"
            );
            $stmt->execute([$user['userId']]);
            $items = $stmt->fetchAll();
            
            echo json_encode($items);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getSelectedTotal() {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "SELECT SUM(c.quantity * b.price) as total, COUNT(c.id) as count
                 FROM cart c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.user_id = ? AND c.selected_for_checkout = 1"
            );
            $stmt->execute([$user['userId']]);
            $result = $stmt->fetch();
            
            echo json_encode([
                'total' => $result['total'] ?? 0,
                'count' => $result['count'] ?? 0
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
