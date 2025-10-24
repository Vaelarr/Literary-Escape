<?php
// Cart operations for MySQL database

require_once __DIR__ . '/../config.php';

// Get cart items for user
function getCart($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT c.*, b.title, b.author, b.price, b.cover, b.stock_quantity, b.discount_percentage
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ? AND b.archived = 0
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        
        sendSuccess($items);
    } catch (PDOException $e) {
        sendError('Error fetching cart: ' . $e->getMessage());
    }
}

// Add item to cart
function addToCart($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['bookId'])) {
        sendError('Book ID is required');
    }
    
    $bookId = $input['bookId'];
    $quantity = $input['quantity'] ?? 1;
    
    try {
        // Check if book exists and has stock
        $stmt = $conn->prepare("SELECT stock_quantity FROM books WHERE id = ? AND archived = 0");
        $stmt->execute([$bookId]);
        $book = $stmt->fetch();
        
        if (!$book) {
            sendError('Book not found', 404);
        }
        
        if ($book['stock_quantity'] < $quantity) {
            sendError('Insufficient stock');
        }
        
        // Check if item already in cart
        $stmt = $conn->prepare("SELECT quantity FROM cart WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$userId, $bookId]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update quantity
            $newQuantity = $existing['quantity'] + $quantity;
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?");
            $stmt->execute([$newQuantity, $userId, $bookId]);
        } else {
            // Insert new item
            $stmt = $conn->prepare("INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $bookId, $quantity]);
        }
        
        sendSuccess([], 'Item added to cart');
    } catch (PDOException $e) {
        sendError('Error adding to cart: ' . $e->getMessage());
    }
}

// Update cart item quantity
function updateCartItem($userId, $bookId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['quantity'])) {
        sendError('Quantity is required');
    }
    
    $quantity = $input['quantity'];
    
    if ($quantity < 1) {
        sendError('Quantity must be at least 1');
    }
    
    try {
        // Check stock
        $stmt = $conn->prepare("SELECT stock_quantity FROM books WHERE id = ?");
        $stmt->execute([$bookId]);
        $book = $stmt->fetch();
        
        if (!$book) {
            sendError('Book not found', 404);
        }
        
        if ($book['stock_quantity'] < $quantity) {
            sendError('Insufficient stock');
        }
        
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$quantity, $userId, $bookId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Cart item not found', 404);
        }
        
        sendSuccess([], 'Cart updated');
    } catch (PDOException $e) {
        sendError('Error updating cart: ' . $e->getMessage());
    }
}

// Remove item from cart
function removeFromCart($userId, $bookId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$userId, $bookId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Cart item not found', 404);
        }
        
        sendSuccess([], 'Item removed from cart');
    } catch (PDOException $e) {
        sendError('Error removing from cart: ' . $e->getMessage());
    }
}

// Update cart item selection for checkout
function updateCartSelection($userId, $bookId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    $selected = $input['selected'] ?? true;
    
    try {
        $stmt = $conn->prepare("UPDATE cart SET selected_for_checkout = ? WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$selected ? 1 : 0, $userId, $bookId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Cart item not found', 404);
        }
        
        sendSuccess([], 'Selection updated');
    } catch (PDOException $e) {
        sendError('Error updating selection: ' . $e->getMessage());
    }
}

// Select all items for checkout
function selectAllForCheckout($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE cart SET selected_for_checkout = 1 WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        sendSuccess([], 'All items selected');
    } catch (PDOException $e) {
        sendError('Error selecting items: ' . $e->getMessage());
    }
}

// Deselect all items for checkout
function deselectAllForCheckout($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE cart SET selected_for_checkout = 0 WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        sendSuccess([], 'All items deselected');
    } catch (PDOException $e) {
        sendError('Error deselecting items: ' . $e->getMessage());
    }
}

// Get selected cart items
function getSelectedCartItems($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT c.*, b.title, b.author, b.price, b.cover, b.discount_percentage
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ? AND c.selected_for_checkout = 1 AND b.archived = 0
        ");
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        
        sendSuccess($items);
    } catch (PDOException $e) {
        sendError('Error fetching selected items: ' . $e->getMessage());
    }
}

// Get selected cart total
function getSelectedCartTotal($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT SUM(c.quantity * b.price * (1 - b.discount_percentage / 100)) as total
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ? AND c.selected_for_checkout = 1 AND b.archived = 0
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        sendSuccess(['total' => $result['total'] ?? 0]);
    } catch (PDOException $e) {
        sendError('Error calculating total: ' . $e->getMessage());
    }
}
