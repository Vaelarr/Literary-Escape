<?php
// Favorites operations for MySQL database

require_once __DIR__ . '/../config.php';

// Get user's favorites
function getFavorites($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT f.*, b.*
            FROM favorites f
            JOIN books b ON f.book_id = b.id
            WHERE f.user_id = ? AND b.archived = 0
            ORDER BY f.created_at DESC
        ");
        $stmt->execute([$userId]);
        $favorites = $stmt->fetchAll();
        
        sendSuccess($favorites);
    } catch (PDOException $e) {
        sendError('Error fetching favorites: ' . $e->getMessage());
    }
}

// Add book to favorites
function addToFavorites($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['bookId'])) {
        sendError('Book ID is required');
    }
    
    $bookId = $input['bookId'];
    
    try {
        // Check if book exists
        $stmt = $conn->prepare("SELECT id FROM books WHERE id = ? AND archived = 0");
        $stmt->execute([$bookId]);
        if (!$stmt->fetch()) {
            sendError('Book not found', 404);
        }
        
        // Check if already in favorites
        $stmt = $conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$userId, $bookId]);
        if ($stmt->fetch()) {
            sendError('Book already in favorites');
        }
        
        // Add to favorites
        $stmt = $conn->prepare("INSERT INTO favorites (user_id, book_id) VALUES (?, ?)");
        $stmt->execute([$userId, $bookId]);
        
        sendSuccess([], 'Added to favorites');
    } catch (PDOException $e) {
        sendError('Error adding to favorites: ' . $e->getMessage());
    }
}

// Remove book from favorites
function removeFromFavorites($userId, $bookId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM favorites WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$userId, $bookId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Favorite not found', 404);
        }
        
        sendSuccess([], 'Removed from favorites');
    } catch (PDOException $e) {
        sendError('Error removing from favorites: ' . $e->getMessage());
    }
}
