<?php
/**
 * Book Controller
 * Handles all book-related operations
 */

class BookController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function testDatabase() {
        try {
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM books");
            $result = $stmt->fetch();
            
            echo json_encode([
                'success' => true,
                'message' => 'Database connection successful',
                'bookCount' => $result['count'],
                'databaseType' => 'SQLite'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection failed',
                'details' => $e->getMessage()
            ]);
        }
    }

    public function getAll() {
        $category = $_GET['category'] ?? null;
        $genre = $_GET['genre'] ?? null;
        $search = $_GET['search'] ?? null;

        try {
            if ($search) {
                $stmt = $this->db->prepare(
                    "SELECT * FROM books 
                     WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?)
                     AND (archived = 0 OR archived IS NULL)
                     ORDER BY title"
                );
                $searchTerm = "%$search%";
                $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
            } elseif ($category) {
                $stmt = $this->db->prepare(
                    "SELECT * FROM books 
                     WHERE category = ? AND (archived = 0 OR archived IS NULL) 
                     ORDER BY title"
                );
                $stmt->execute([$category]);
            } elseif ($genre) {
                $stmt = $this->db->prepare(
                    "SELECT * FROM books 
                     WHERE genre = ? AND (archived = 0 OR archived IS NULL) 
                     ORDER BY title"
                );
                $stmt->execute([$genre]);
            } else {
                $stmt = $this->db->query(
                    "SELECT * FROM books 
                     WHERE archived = 0 OR archived IS NULL 
                     ORDER BY title"
                );
            }

            $books = $stmt->fetchAll();
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $stmt = $this->db->prepare(
                "SELECT * FROM books 
                 WHERE id = ? AND (archived = 0 OR archived IS NULL)"
            );
            $stmt->execute([$id]);
            $book = $stmt->fetch();

            if (!$book) {
                http_response_code(404);
                echo json_encode(['error' => 'Book not found']);
                return;
            }

            echo json_encode($book);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        $user = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['title']) || empty($data['author'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and author are required']);
            return;
        }

        $bookData = array_merge([
            'price' => 0,
            'stock_quantity' => 1,
            'category' => 'Fiction',
            'genre' => 'General'
        ], $data);

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO books (isbn, title, author, description, category, genre, cover, price, 
                 publisher, publication_date, pages, language, format, weight, dimensions, rating, stock_quantity)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );

            $stmt->execute([
                $bookData['isbn'] ?? ('978-0-000-' . rand(10000, 99999) . '-0'),
                $bookData['title'],
                $bookData['author'],
                $bookData['description'] ?? null,
                $bookData['category'],
                $bookData['genre'],
                $bookData['cover'] ?? null,
                $bookData['price'],
                $bookData['publisher'] ?? 'Unknown Publisher',
                $bookData['publication_date'] ?? '2020-01-01',
                $bookData['pages'] ?? 300,
                $bookData['language'] ?? 'English',
                $bookData['format'] ?? 'Paperback',
                $bookData['weight'] ?? 0.3,
                $bookData['dimensions'] ?? '5.5 x 8.0 x 1.0 inches',
                $bookData['rating'] ?? 4.0,
                $bookData['stock_quantity']
            ]);

            $bookId = $this->db->lastInsertId();

            // Log audit trail
            $this->logAuditTrail(
                $user,
                'CREATE',
                'book',
                $bookId,
                $bookData['title'],
                null,
                $bookData,
                "Created new book \"{$bookData['title']}\" by {$bookData['author']}"
            );

            http_response_code(201);
            echo json_encode(['id' => $bookId, 'message' => 'Book created']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $user = AuthMiddleware::authenticateAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        // Get old book data for audit trail
        $stmt = $this->db->prepare("SELECT * FROM books WHERE id = ?");
        $stmt->execute([$id]);
        $oldBook = $stmt->fetch();

        if (!$oldBook) {
            http_response_code(404);
            echo json_encode(['error' => 'Book not found']);
            return;
        }

        try {
            $stmt = $this->db->prepare(
                "UPDATE books SET
                 isbn = ?, title = ?, author = ?, description = ?, category = ?,
                 genre = ?, cover = ?, price = ?, publisher = ?, publication_date = ?,
                 pages = ?, language = ?, format = ?, weight = ?, dimensions = ?,
                 rating = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?"
            );

            $stmt->execute([
                $data['isbn'] ?? $oldBook['isbn'],
                $data['title'] ?? $oldBook['title'],
                $data['author'] ?? $oldBook['author'],
                $data['description'] ?? $oldBook['description'],
                $data['category'] ?? $oldBook['category'],
                $data['genre'] ?? $oldBook['genre'],
                $data['cover'] ?? $oldBook['cover'],
                $data['price'] ?? $oldBook['price'],
                $data['publisher'] ?? $oldBook['publisher'],
                $data['publication_date'] ?? $oldBook['publication_date'],
                $data['pages'] ?? $oldBook['pages'],
                $data['language'] ?? $oldBook['language'],
                $data['format'] ?? $oldBook['format'],
                $data['weight'] ?? $oldBook['weight'],
                $data['dimensions'] ?? $oldBook['dimensions'],
                $data['rating'] ?? $oldBook['rating'],
                $data['stock_quantity'] ?? $oldBook['stock_quantity'],
                $id
            ]);

            // Log audit trail
            $title = $data['title'] ?? $oldBook['title'];
            $this->logAuditTrail(
                $user,
                'UPDATE',
                'book',
                $id,
                $title,
                $oldBook,
                $data,
                "Updated book \"$title\""
            );

            echo json_encode(['message' => 'Book updated', 'changes' => $stmt->rowCount()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        $user = AuthMiddleware::authenticateAdmin();

        // Get book data for audit trail
        $stmt = $this->db->prepare("SELECT * FROM books WHERE id = ?");
        $stmt->execute([$id]);
        $oldBook = $stmt->fetch();

        if (!$oldBook) {
            http_response_code(404);
            echo json_encode(['error' => 'Book not found']);
            return;
        }

        try {
            $stmt = $this->db->prepare("DELETE FROM books WHERE id = ?");
            $stmt->execute([$id]);

            // Log audit trail
            $this->logAuditTrail(
                $user,
                'DELETE',
                'book',
                $id,
                $oldBook['title'],
                $oldBook,
                null,
                "Deleted book \"{$oldBook['title']}\" by {$oldBook['author']}"
            );

            echo json_encode(['message' => 'Book deleted', 'changes' => $stmt->rowCount()]);
        } catch (PDOException $e) {
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
