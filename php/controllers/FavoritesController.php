<?php
/**
 * Favorites Controller
 * Handles user favorites/wishlist operations
 */

class FavoritesController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $user = AuthMiddleware::authenticateToken();
        
        try {
            $stmt = $this->db->prepare(
                "SELECT f.*, b.title, b.author, b.price, b.cover, b.rating
                 FROM favorites f
                 JOIN books b ON f.book_id = b.id
                 WHERE f.user_id = ?
                 ORDER BY f.created_at DESC"
            );
            $stmt->execute([$user['userId']]);
            $favorites = $stmt->fetchAll();
            
            echo json_encode($favorites);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function add() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $bookId = $data['bookId'] ?? 0;

        try {
            $stmt = $this->db->prepare(
                "INSERT OR IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)"
            );
            $stmt->execute([$user['userId'], $bookId]);
            
            echo json_encode(['message' => 'Added to favorites']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function remove($bookId) {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "DELETE FROM favorites WHERE user_id = ? AND book_id = ?"
            );
            $stmt->execute([$user['userId'], $bookId]);
            
            echo json_encode(['message' => 'Removed from favorites']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
