<?php
// Review operations for MySQL database

require_once __DIR__ . '/../config.php';

// Get reviews for a book
function getBookReviews($bookId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT r.*, u.username, u.first_name, u.last_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.book_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$bookId]);
        $reviews = $stmt->fetchAll();
        
        sendSuccess($reviews);
    } catch (PDOException $e) {
        sendError('Error fetching reviews: ' . $e->getMessage());
    }
}

// Create review
function createReview($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['bookId']) || !isset($input['rating'])) {
        sendError('Book ID and rating are required');
    }
    
    $bookId = $input['bookId'];
    $rating = $input['rating'];
    $reviewText = $input['reviewText'] ?? '';
    $reviewerName = $input['reviewerName'] ?? null;
    
    if ($rating < 1 || $rating > 5) {
        sendError('Rating must be between 1 and 5');
    }
    
    try {
        // Check if book exists
        $stmt = $conn->prepare("SELECT id FROM books WHERE id = ?");
        $stmt->execute([$bookId]);
        if (!$stmt->fetch()) {
            sendError('Book not found', 404);
        }
        
        // Check if user already reviewed this book
        $stmt = $conn->prepare("SELECT id FROM reviews WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$userId, $bookId]);
        if ($stmt->fetch()) {
            sendError('You have already reviewed this book');
        }
        
        // Create review
        $stmt = $conn->prepare("
            INSERT INTO reviews (user_id, book_id, rating, review_text, reviewer_name)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $bookId, $rating, $reviewText, $reviewerName]);
        
        $reviewId = $conn->lastInsertId();
        
        sendSuccess(['id' => $reviewId], 'Review created successfully');
    } catch (PDOException $e) {
        sendError('Error creating review: ' . $e->getMessage());
    }
}

// Update review
function updateReview($userId, $reviewId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['rating'])) {
        sendError('Rating is required');
    }
    
    $rating = $input['rating'];
    $reviewText = $input['reviewText'] ?? '';
    
    if ($rating < 1 || $rating > 5) {
        sendError('Rating must be between 1 and 5');
    }
    
    try {
        // Verify review belongs to user
        $stmt = $conn->prepare("SELECT id FROM reviews WHERE id = ? AND user_id = ?");
        $stmt->execute([$reviewId, $userId]);
        if (!$stmt->fetch()) {
            sendError('Review not found', 404);
        }
        
        $stmt = $conn->prepare("UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?");
        $stmt->execute([$rating, $reviewText, $reviewId]);
        
        sendSuccess([], 'Review updated successfully');
    } catch (PDOException $e) {
        sendError('Error updating review: ' . $e->getMessage());
    }
}

// Delete review
function deleteReview($userId, $reviewId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM reviews WHERE id = ? AND user_id = ?");
        $stmt->execute([$reviewId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Review not found', 404);
        }
        
        sendSuccess([], 'Review deleted successfully');
    } catch (PDOException $e) {
        sendError('Error deleting review: ' . $e->getMessage());
    }
}

// Get average rating for a book
function getAverageRating($bookId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT AVG(rating) as average, COUNT(*) as count
            FROM reviews
            WHERE book_id = ?
        ");
        $stmt->execute([$bookId]);
        $result = $stmt->fetch();
        
        sendSuccess([
            'average' => $result['average'] ? round($result['average'], 1) : 0,
            'count' => $result['count']
        ]);
    } catch (PDOException $e) {
        sendError('Error fetching average rating: ' . $e->getMessage());
    }
}

// Get user's reviews
function getUserReviews($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT r.*, b.title, b.author, b.cover
            FROM reviews r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$userId]);
        $reviews = $stmt->fetchAll();
        
        sendSuccess($reviews);
    } catch (PDOException $e) {
        sendError('Error fetching user reviews: ' . $e->getMessage());
    }
}
