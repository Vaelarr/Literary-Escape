<?php
// Book operations for MySQL database

require_once __DIR__ . '/../config.php';

// Get all books with filters
function getBooks() {
    $conn = getDBConnection();
    
    $category = $_GET['category'] ?? null;
    $genre = $_GET['genre'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $sql = "SELECT * FROM books WHERE archived = 0";
    $params = [];
    
    if ($search) {
        $sql .= " AND (title LIKE ? OR author LIKE ? OR description LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    } elseif ($category && $category !== 'all') {
        $sql .= " AND category = ?";
        $params[] = $category;
    } elseif ($genre && $genre !== 'all') {
        $sql .= " AND genre = ?";
        $params[] = $genre;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $books = $stmt->fetchAll();
        
        // Add ratings to books
        foreach ($books as &$book) {
            $book['average_rating'] = getBookAverageRating($conn, $book['id']);
            $book['rating_count'] = getBookRatingCount($conn, $book['id']);
        }
        
        sendSuccess($books);
    } catch (PDOException $e) {
        sendError('Error fetching books: ' . $e->getMessage());
    }
}

// Get book by ID
function getBookById($id) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("SELECT * FROM books WHERE id = ? AND archived = 0");
        $stmt->execute([$id]);
        $book = $stmt->fetch();
        
        if (!$book) {
            sendError('Book not found', 404);
        }
        
        // Add ratings
        $book['average_rating'] = getBookAverageRating($conn, $book['id']);
        $book['rating_count'] = getBookRatingCount($conn, $book['id']);
        
        sendSuccess($book);
    } catch (PDOException $e) {
        sendError('Error fetching book: ' . $e->getMessage());
    }
}

// Create new book (admin only)
function createBook() {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    $required = ['title', 'author', 'price'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            sendError("Field '$field' is required");
        }
    }
    
    try {
        $stmt = $conn->prepare("
            INSERT INTO books (
                title, author, category, genre, description, price, 
                stock_quantity, cover, isbn, publisher, publication_year,
                language, pages, format, status, discount_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['title'],
            $input['author'],
            $input['category'] ?? null,
            $input['genre'] ?? null,
            $input['description'] ?? null,
            $input['price'],
            $input['stock_quantity'] ?? 0,
            $input['cover'] ?? null,
            $input['isbn'] ?? null,
            $input['publisher'] ?? null,
            $input['publication_year'] ?? null,
            $input['language'] ?? 'English',
            $input['pages'] ?? null,
            $input['format'] ?? null,
            $input['status'] ?? 'available',
            $input['discount_percentage'] ?? 0
        ]);
        
        $bookId = $conn->lastInsertId();
        
        sendSuccess(['id' => $bookId], 'Book created successfully');
    } catch (PDOException $e) {
        sendError('Error creating book: ' . $e->getMessage());
    }
}

// Update book (admin only)
function updateBook($id) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    try {
        // Check if book exists
        $stmt = $conn->prepare("SELECT id FROM books WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            sendError('Book not found', 404);
        }
        
        $fields = [];
        $params = [];
        
        $allowedFields = [
            'title', 'author', 'category', 'genre', 'description', 'price',
            'stock_quantity', 'cover', 'isbn', 'publisher', 'publication_year',
            'language', 'pages', 'format', 'status', 'discount_percentage'
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
        
        $params[] = $id;
        $sql = "UPDATE books SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        sendSuccess(['id' => $id], 'Book updated successfully');
    } catch (PDOException $e) {
        sendError('Error updating book: ' . $e->getMessage());
    }
}

// Delete book (admin only)
function deleteBook($id) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM books WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Book not found', 404);
        }
        
        sendSuccess([], 'Book deleted successfully');
    } catch (PDOException $e) {
        sendError('Error deleting book: ' . $e->getMessage());
    }
}

// Helper functions
function getBookAverageRating($conn, $bookId) {
    $stmt = $conn->prepare("SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = ?");
    $stmt->execute([$bookId]);
    $result = $stmt->fetch();
    return $result['avg_rating'] ? round($result['avg_rating'], 1) : null;
}

function getBookRatingCount($conn, $bookId) {
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM reviews WHERE book_id = ?");
    $stmt->execute([$bookId]);
    $result = $stmt->fetch();
    return $result['count'];
}
