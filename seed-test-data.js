// Seed test data: 50 users and 50 orders
const { query } = require('./database-turso.js');
const bcrypt = require('bcrypt');

// Generate random data helpers
function randomEmail(index) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com', 'icloud.com'];
    return `testuser${index}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function randomName() {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'Robert', 'Olivia', 
                       'William', 'Sophia', 'Richard', 'Isabella', 'Thomas', 'Mia', 'Charles', 'Charlotte', 'Daniel', 'Amelia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                      'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'];
    return {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
}

function randomPhone() {
    return `09${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function randomAddress() {
    const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln', 'Elm St', 'Park Ave', 'Church St'];
    const cities = ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Caloocan', 'Mandaluyong', 'Paranaque'];
    const streetNum = Math.floor(1 + Math.random() * 999);
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    return `${streetNum} ${street}, ${city}, Metro Manila, Philippines`;
}

function randomOrderStatus() {
    const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    const weights = [0.15, 0.25, 0.20, 0.30, 0.10]; // Distribution weights
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < statuses.length; i++) {
        sum += weights[i];
        if (random <= sum) return statuses[i];
    }
    return 'completed';
}

function randomDate(daysBack = 90) {
    const now = new Date();
    const past = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000));
    return past.toISOString();
}

function randomAmount() {
    return (Math.random() * 5000 + 100).toFixed(2); // Between 100 and 5100 pesos
}

async function seedUsers() {
    console.log('📝 Creating 50 test users...');
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    const users = [];

    for (let i = 1; i <= 50; i++) {
        const { firstName, lastName } = randomName();
        const username = `testuser${i}`;
        const email = randomEmail(i);
        const phone = randomPhone();
        const address = randomAddress();

        try {
            const result = await query(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`,
                [username, email, hashedPassword, firstName, lastName, phone, address]
            );
            users.push({ id: result.lastInsertRowid, username, email });
            console.log(`✅ Created user ${i}/50: ${username}`);
        } catch (error) {
            console.error(`❌ Error creating user ${i}:`, error.message);
        }
    }

    return users;
}

async function getBookIds() {
    console.log('📚 Fetching available books...');
    const result = await query('SELECT id FROM books WHERE archived = 0 LIMIT 50', []);
    return result.rows.map(row => row.id);
}

async function seedOrders(userIds, bookIds) {
    console.log('📦 Creating 50 test orders...');

    if (bookIds.length === 0) {
        console.warn('⚠️  No books found in database. Please run seed-books.js first.');
        return;
    }

    for (let i = 1; i <= 50; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const status = randomOrderStatus();
        const totalAmount = randomAmount();
        const createdAt = randomDate(90); // Orders from last 90 days
        
        // Random shipping address
        const shippingAddress = randomAddress();
        const paymentMethod = ['Cash on Delivery', 'Credit Card', 'GCash'][Math.floor(Math.random() * 3)];

        try {
            const result = await query(
                `INSERT INTO orders (
                    user_id, status, total_amount, 
                    shipping_address, payment_method,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, status, totalAmount, shippingAddress, paymentMethod, createdAt]
            );

            const orderId = result.lastInsertRowid;

            // Add 1-5 random books to the order
            const numItems = Math.floor(1 + Math.random() * 5);
            for (let j = 0; j < numItems; j++) {
                const bookId = bookIds[Math.floor(Math.random() * bookIds.length)];
                const quantity = Math.floor(1 + Math.random() * 3);
                const price = (Math.random() * 1000 + 200).toFixed(2);

                try {
                    await query(
                        `INSERT INTO order_items (order_id, book_id, quantity, price) 
                         VALUES (?, ?, ?, ?)`,
                        [orderId, bookId, quantity, price]
                    );
                } catch (itemError) {
                    // Skip if duplicate
                    if (!itemError.message.includes('UNIQUE')) {
                        console.error(`  ⚠️  Error adding item to order ${orderId}:`, itemError.message);
                    }
                }
            }

            console.log(`✅ Created order ${i}/50: #${orderId} (${status}, ₱${totalAmount})`);
        } catch (error) {
            console.error(`❌ Error creating order ${i}:`, error.message);
        }
    }
}

async function main() {
    try {
        console.log('🚀 Starting test data seed...\n');

        // Create users
        const users = await seedUsers();
        console.log(`\n✅ Created ${users.length} users\n`);

        // Get user IDs
        const userResult = await query('SELECT id FROM users WHERE role = "user" ORDER BY id DESC LIMIT 50', []);
        const userIds = userResult.rows.map(row => row.id);

        if (userIds.length === 0) {
            console.error('❌ No users found in database');
            process.exit(1);
        }

        // Get book IDs
        const bookIds = await getBookIds();

        // Create orders
        await seedOrders(userIds, bookIds);

        console.log('\n✅ Test data seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users created: ${users.length}`);
        console.log(`   - Orders created: 50`);
        console.log(`   - Books available: ${bookIds.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { seedUsers, seedOrders };
