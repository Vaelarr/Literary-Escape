<?php
// Order operations for MySQL database

require_once __DIR__ . '/../config.php';

// Create new order
function createOrder($userId) {
    $conn = getDBConnection();
    $input = getJsonInput();
    
    if (!isset($input['items']) || empty($input['items'])) {
        sendError('Order items are required');
    }
    
    if (!isset($input['shippingAddress'])) {
        sendError('Shipping address is required');
    }
    
    try {
        $conn->beginTransaction();
        
        // Calculate total
        $total = 0;
        foreach ($input['items'] as $item) {
            $stmt = $conn->prepare("SELECT price, discount_percentage, stock_quantity FROM books WHERE id = ?");
            $stmt->execute([$item['book_id']]);
            $book = $stmt->fetch();
            
            if (!$book) {
                throw new Exception('Book not found: ' . $item['book_id']);
            }
            
            if ($book['stock_quantity'] < $item['quantity']) {
                throw new Exception('Insufficient stock for book: ' . $item['book_id']);
            }
            
            $itemPrice = $book['price'] * (1 - $book['discount_percentage'] / 100);
            $total += $itemPrice * $item['quantity'];
        }
        
        // Create order
        $stmt = $conn->prepare("
            INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId,
            $total,
            'pending',
            $input['paymentMethod'] ?? 'cash',
            json_encode($input['shippingAddress'])
        ]);
        
        $orderId = $conn->lastInsertId();
        
        // Add order items and update stock
        foreach ($input['items'] as $item) {
            $stmt = $conn->prepare("SELECT price, discount_percentage FROM books WHERE id = ?");
            $stmt->execute([$item['book_id']]);
            $book = $stmt->fetch();
            
            $itemPrice = $book['price'] * (1 - $book['discount_percentage'] / 100);
            
            // Insert order item
            $stmt = $conn->prepare("
                INSERT INTO order_items (order_id, book_id, quantity, price)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$orderId, $item['book_id'], $item['quantity'], $itemPrice]);
            
            // Update book stock
            $stmt = $conn->prepare("UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ?");
            $stmt->execute([$item['quantity'], $item['book_id']]);
        }
        
        // Clear cart for selected items
        foreach ($input['items'] as $item) {
            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND book_id = ?");
            $stmt->execute([$userId, $item['book_id']]);
        }
        
        $conn->commit();
        
        sendSuccess(['orderId' => $orderId], 'Order created successfully');
        
    } catch (Exception $e) {
        $conn->rollBack();
        sendError('Error creating order: ' . $e->getMessage());
    }
}

// Get user's orders
function getUserOrders($userId) {
    $conn = getDBConnection();
    
    try {
        $stmt = $conn->prepare("
            SELECT * FROM orders
            WHERE user_id = ? AND archived = 0
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        sendSuccess($orders);
    } catch (PDOException $e) {
        sendError('Error fetching orders: ' . $e->getMessage());
    }
}

// Get order details
function getOrderDetails($userId, $orderId) {
    $conn = getDBConnection();
    
    try {
        // Get order
        $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
        $stmt->execute([$orderId, $userId]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendError('Order not found', 404);
        }
        
        // Get order items
        $stmt = $conn->prepare("
            SELECT oi.*, b.title, b.author, b.cover
            FROM order_items oi
            JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$orderId]);
        $order['items'] = $stmt->fetchAll();
        
        sendSuccess($order);
    } catch (PDOException $e) {
        sendError('Error fetching order details: ' . $e->getMessage());
    }
}
