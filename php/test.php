<?php
/**
 * Simple test page for the PHP backend
 * Access via: http://localhost/php/test.php
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Backend Test - Literary Escape</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #16423C;
            border-bottom: 3px solid #33BDAA;
            padding-bottom: 10px;
        }
        h2 {
            color: #16423C;
            margin-top: 30px;
        }
        .test-section {
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-left: 4px solid #33BDAA;
            border-radius: 5px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        pre {
            background: #272822;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        button {
            background: #16423C;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #33BDAA;
        }
        .endpoint {
            font-family: monospace;
            background: #e9ecef;
            padding: 3px 8px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Literary Escape - PHP Backend Test</h1>
        
        <div class="test-section">
            <h2>📊 System Information</h2>
            <p><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
            <p><strong>Server Software:</strong> <?php echo $_SERVER['SERVER_SOFTWARE']; ?></p>
            <p><strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT']; ?></p>
            <p><strong>Current File:</strong> <?php echo __FILE__; ?></p>
        </div>

        <div class="test-section">
            <h2>🔌 Database Connection Test</h2>
            <?php
            require_once __DIR__ . '/config.php';
            
            try {
                $conn = getDBConnection();
                echo '<span class="status success">✅ Connected to MySQL</span>';
                
                // Get database info
                $stmt = $conn->query("SELECT DATABASE() as db_name");
                $result = $stmt->fetch();
                echo '<p><strong>Database Name:</strong> ' . $result['db_name'] . '</p>';
                
                // Count tables
                $stmt = $conn->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                echo '<p><strong>Total Tables:</strong> ' . count($tables) . '</p>';
                echo '<p><strong>Tables:</strong> ' . implode(', ', $tables) . '</p>';
                
                // Count records
                echo '<h3>Record Counts:</h3>';
                foreach (['books', 'users', 'orders', 'cart', 'favorites', 'reviews'] as $table) {
                    if (in_array($table, $tables)) {
                        $stmt = $conn->query("SELECT COUNT(*) as count FROM $table");
                        $count = $stmt->fetch()['count'];
                        echo "<p>• <strong>$table:</strong> $count records</p>";
                    }
                }
                
            } catch (Exception $e) {
                echo '<span class="status error">❌ Connection Failed</span>';
                echo '<p>' . $e->getMessage() . '</p>';
            }
            ?>
        </div>

        <div class="test-section">
            <h2>🧪 API Endpoint Tests</h2>
            <p>Test these endpoints by clicking the buttons below:</p>
            
            <div id="test-results"></div>
            
            <button onclick="testEndpoint('/api/test-db', 'GET')">Test Database API</button>
            <button onclick="testEndpoint('/api/books', 'GET')">Get All Books</button>
            <button onclick="testLogin()">Test Login</button>
            <button onclick="testAdminLogin()">Test Admin Login</button>
        </div>

        <div class="test-section">
            <h2>📋 Available Endpoints</h2>
            <h3>Public Endpoints:</h3>
            <ul>
                <li><span class="endpoint">GET /php/api/test-db</span> - Test database connection</li>
                <li><span class="endpoint">GET /php/api/books</span> - Get all books</li>
                <li><span class="endpoint">GET /php/api/books/:id</span> - Get book by ID</li>
                <li><span class="endpoint">POST /php/api/register</span> - Register new user</li>
                <li><span class="endpoint">POST /php/api/login</span> - User login</li>
                <li><span class="endpoint">POST /php/api/admin/login</span> - Admin login</li>
            </ul>
            
            <h3>Protected Endpoints (require auth token):</h3>
            <ul>
                <li><span class="endpoint">GET /php/api/cart</span> - Get cart items</li>
                <li><span class="endpoint">GET /php/api/favorites</span> - Get favorites</li>
                <li><span class="endpoint">GET /php/api/orders</span> - Get user orders</li>
                <li><span class="endpoint">GET /php/api/user/profile</span> - Get user profile</li>
            </ul>
            
            <h3>Admin Endpoints (require admin token):</h3>
            <ul>
                <li><span class="endpoint">GET /php/api/admin/books</span> - Get all books (admin)</li>
                <li><span class="endpoint">GET /php/api/admin/users</span> - Get all users</li>
                <li><span class="endpoint">GET /php/api/admin/orders</span> - Get all orders</li>
                <li><span class="endpoint">GET /php/api/admin/dashboard/stats</span> - Dashboard statistics</li>
            </ul>
        </div>

        <div class="test-section">
            <h2>🔐 Default Admin Credentials</h2>
            <p><strong>Email:</strong> admin@literaryescape.com</p>
            <p><strong>Password:</strong> Admin123!</p>
        </div>

        <div class="test-section">
            <h2>📝 Next Steps</h2>
            <ol>
                <li>Ensure XAMPP MySQL and Apache are running</li>
                <li>Run the setup script if not done: <code>php setup.php</code></li>
                <li>Test endpoints using the buttons above</li>
                <li>Update your frontend to use PHP backend</li>
                <li>Check the README.md for more information</li>
            </ol>
        </div>
    </div>

    <script>
        const baseURL = window.location.origin + '/php';
        
        async function testEndpoint(endpoint, method = 'GET', body = null) {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = '<p>Testing ' + endpoint + '...</p>';
            
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                if (body) {
                    options.body = JSON.stringify(body);
                }
                
                const response = await fetch(baseURL + endpoint, options);
                const data = await response.json();
                
                resultsDiv.innerHTML = `
                    <h3>Response from ${endpoint}</h3>
                    <p><span class="status ${response.ok ? 'success' : 'error'}">
                        Status: ${response.status} ${response.statusText}
                    </span></p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                resultsDiv.innerHTML = `
                    <h3>Error testing ${endpoint}</h3>
                    <p><span class="status error">❌ Failed</span></p>
                    <pre>${error.message}</pre>
                `;
            }
        }
        
        async function testLogin() {
            await testEndpoint('/api/login', 'POST', {
                email: 'test@example.com',
                password: 'Test123!'
            });
        }
        
        async function testAdminLogin() {
            await testEndpoint('/api/admin/login', 'POST', {
                email: 'admin@literaryescape.com',
                password: 'Admin123!'
            });
        }
    </script>
</body>
</html>
