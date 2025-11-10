<?php
/**
 * Review Controller
 * Handles book review operations
 */

class ReviewController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getByBookId($bookId) {
        try {
            $stmt = $this->db->prepare(
                "SELECT r.*, u.username
                 FROM reviews r
                 LEFT JOIN users u ON r.user_id = u.id
                 WHERE r.book_id = ?
                 ORDER BY r.created_at DESC"
            );
            $stmt->execute([$bookId]);
            $reviews = $stmt->fetchAll();
            
            echo json_encode($reviews);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $bookId = $data['bookId'] ?? 0;
        $rating = $data['rating'] ?? 0;
        $reviewText = $data['reviewText'] ?? '';
        $reviewerName = $data['reviewerName'] ?? '';

        // Validate input
        if (empty($bookId) || empty($rating) || empty($reviewText) || empty($reviewerName)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        try {
            // Check if user has already reviewed this book
            $stmt = $this->db->prepare(
                "SELECT id FROM reviews WHERE user_id = ? AND book_id = ?"
            );
            $stmt->execute([$user['userId'], $bookId]);
            
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'You have already reviewed this book']);
                return;
            }

            // Create review
            $stmt = $this->db->prepare(
                "INSERT INTO reviews (user_id, book_id, rating, review_text, reviewer_name) 
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$user['userId'], $bookId, $rating, $reviewText, $reviewerName]);
            
            $reviewId = $this->db->lastInsertId();

            http_response_code(201);
            echo json_encode([
                'message' => 'Review created successfully',
                'reviewId' => $reviewId
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($reviewId) {
        $user = AuthMiddleware::authenticateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $rating = $data['rating'] ?? 0;
        $reviewText = $data['reviewText'] ?? '';

        if (empty($rating) || empty($reviewText)) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating and review text are required']);
            return;
        }

        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        try {
            $stmt = $this->db->prepare(
                "UPDATE reviews 
                 SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND user_id = ?"
            );
            $stmt->execute([$rating, $reviewText, $reviewId, $user['userId']]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Review not found or unauthorized']);
                return;
            }

            echo json_encode(['message' => 'Review updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($reviewId) {
        $user = AuthMiddleware::authenticateToken();

        try {
            $stmt = $this->db->prepare(
                "DELETE FROM reviews WHERE id = ? AND user_id = ?"
            );
            $stmt->execute([$reviewId, $user['userId']]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Review not found or unauthorized']);
                return;
            }

            echo json_encode(['message' => 'Review deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAverageRating($bookId) {
        try {
            $stmt = $this->db->prepare(
                "SELECT AVG(rating) as average_rating, COUNT(*) as review_count
                 FROM reviews
                 WHERE book_id = ?"
            );
            $stmt->execute([$bookId]);
            $result = $stmt->fetch();
            
            echo json_encode([
                'averageRating' => $result['average_rating'] ?? 0,
                'reviewCount' => $result['review_count'] ?? 0
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
