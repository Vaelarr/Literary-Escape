<?php
/**
 * API Test Script
 * Quick tests to verify all controllers are working
 */

// Base URL
$baseUrl = 'http://localhost:8000';

// Color output for terminal
function colorOutput($message, $color = 'green') {
    $colors = [
        'green' => "\033[0;32m",
        'red' => "\033[0;31m",
        'yellow' => "\033[1;33m",
        'blue' => "\033[0;34m",
        'reset' => "\033[0m"
    ];
    
    echo $colors[$color] . $message . $colors['reset'] . PHP_EOL;
}

function testEndpoint($method, $endpoint, $data = null, $token = null) {
    global $baseUrl;
    
    $url = $baseUrl . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

echo PHP_EOL;
colorOutput("========================================", 'blue');
colorOutput("    Literary Escape PHP API Tests      ", 'blue');
colorOutput("========================================", 'blue');
echo PHP_EOL;

// Test counter
$passed = 0;
$failed = 0;

// 1. Test API Health
colorOutput("Testing API Health...", 'yellow');
$response = testEndpoint('GET', '/');
if ($response['status'] === 200) {
    colorOutput("✓ API is running", 'green');
    $passed++;
} else {
    colorOutput("✗ API health check failed", 'red');
    $failed++;
}

// 2. Test Admin Login
colorOutput("\nTesting Admin Login...", 'yellow');
$response = testEndpoint('POST', '/api/auth/admin/login', [
    'username' => 'admin',
    'password' => 'admin123'
]);

if ($response['status'] === 200 && isset($response['body']['token'])) {
    $adminToken = $response['body']['token'];
    colorOutput("✓ Admin login successful", 'green');
    $passed++;
} else {
    colorOutput("✗ Admin login failed", 'red');
    $failed++;
    $adminToken = null;
}

// 3. Test User Registration
colorOutput("\nTesting User Registration...", 'yellow');
$testUsername = 'testuser_' . time();
$response = testEndpoint('POST', '/api/auth/register', [
    'username' => $testUsername,
    'password' => 'Test123!@#',
    'email' => $testUsername . '@test.com'
]);

if ($response['status'] === 201) {
    colorOutput("✓ User registration successful", 'green');
    $passed++;
} else {
    colorOutput("✗ User registration failed: " . ($response['body']['error'] ?? 'Unknown error'), 'red');
    $failed++;
}

// 4. Test User Login
colorOutput("\nTesting User Login...", 'yellow');
$response = testEndpoint('POST', '/api/auth/login', [
    'username' => $testUsername,
    'password' => 'Test123!@#'
]);

if ($response['status'] === 200 && isset($response['body']['token'])) {
    $userToken = $response['body']['token'];
    colorOutput("✓ User login successful", 'green');
    $passed++;
} else {
    colorOutput("✗ User login failed", 'red');
    $failed++;
    $userToken = null;
}

// 5. Test Get Books
colorOutput("\nTesting Get Books...", 'yellow');
$response = testEndpoint('GET', '/api/books');
if ($response['status'] === 200) {
    colorOutput("✓ Get books successful (" . count($response['body']) . " books)", 'green');
    $passed++;
} else {
    colorOutput("✗ Get books failed", 'red');
    $failed++;
}

// 6. Test Create Book (Admin)
if ($adminToken) {
    colorOutput("\nTesting Create Book (Admin)...", 'yellow');
    $response = testEndpoint('POST', '/api/books', [
        'title' => 'Test Book',
        'author' => 'Test Author',
        'price' => 19.99,
        'genre' => 'Fiction',
        'category' => 'fiction',
        'cover' => 'test-cover.jpg',
        'stock' => 10
    ], $adminToken);
    
    if ($response['status'] === 201 && isset($response['body']['bookId'])) {
        $testBookId = $response['body']['bookId'];
        colorOutput("✓ Create book successful (ID: $testBookId)", 'green');
        $passed++;
    } else {
        colorOutput("✗ Create book failed", 'red');
        $failed++;
        $testBookId = null;
    }
}

// 7. Test Add to Cart (User)
if ($userToken && isset($testBookId)) {
    colorOutput("\nTesting Add to Cart...", 'yellow');
    $response = testEndpoint('POST', '/api/cart', [
        'book_id' => $testBookId,
        'quantity' => 2
    ], $userToken);
    
    if ($response['status'] === 201) {
        colorOutput("✓ Add to cart successful", 'green');
        $passed++;
    } else {
        colorOutput("✗ Add to cart failed", 'red');
        $failed++;
    }
}

// 8. Test Get Cart (User)
if ($userToken) {
    colorOutput("\nTesting Get Cart...", 'yellow');
    $response = testEndpoint('GET', '/api/cart', null, $userToken);
    
    if ($response['status'] === 200) {
        colorOutput("✓ Get cart successful (" . count($response['body']) . " items)", 'green');
        $passed++;
    } else {
        colorOutput("✗ Get cart failed", 'red');
        $failed++;
    }
}

// 9. Test Add to Favorites (User)
if ($userToken && isset($testBookId)) {
    colorOutput("\nTesting Add to Favorites...", 'yellow');
    $response = testEndpoint('POST', '/api/favorites', [
        'book_id' => $testBookId
    ], $userToken);
    
    if ($response['status'] === 201) {
        colorOutput("✓ Add to favorites successful", 'green');
        $passed++;
    } else {
        colorOutput("✗ Add to favorites failed", 'red');
        $failed++;
    }
}

// 10. Test Get User Profile
if ($userToken) {
    colorOutput("\nTesting Get User Profile...", 'yellow');
    $response = testEndpoint('GET', '/api/user/profile', null, $userToken);
    
    if ($response['status'] === 200) {
        colorOutput("✓ Get user profile successful", 'green');
        $passed++;
    } else {
        colorOutput("✗ Get user profile failed", 'red');
        $failed++;
    }
}

// 11. Test Admin Dashboard Stats
if ($adminToken) {
    colorOutput("\nTesting Admin Dashboard Stats...", 'yellow');
    $response = testEndpoint('GET', '/api/admin/dashboard/stats', null, $adminToken);
    
    if ($response['status'] === 200) {
        colorOutput("✓ Admin dashboard stats successful", 'green');
        $passed++;
    } else {
        colorOutput("✗ Admin dashboard stats failed", 'red');
        $failed++;
    }
}

// 12. Test Audit Trail
if ($adminToken) {
    colorOutput("\nTesting Audit Trail...", 'yellow');
    $response = testEndpoint('GET', '/api/admin/audit/recent', null, $adminToken);
    
    if ($response['status'] === 200) {
        colorOutput("✓ Audit trail successful", 'green');
        $passed++;
    } else {
        colorOutput("✗ Audit trail failed", 'red');
        $failed++;
    }
}

// Summary
echo PHP_EOL;
colorOutput("========================================", 'blue');
colorOutput("           Test Summary                 ", 'blue');
colorOutput("========================================", 'blue');
colorOutput("Passed: $passed", 'green');
colorOutput("Failed: $failed", 'red');
colorOutput("Total:  " . ($passed + $failed), 'yellow');
echo PHP_EOL;

if ($failed === 0) {
    colorOutput("🎉 All tests passed!", 'green');
} else {
    colorOutput("⚠️  Some tests failed. Check the output above.", 'yellow');
}

echo PHP_EOL;
