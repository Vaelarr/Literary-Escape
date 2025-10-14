// Test database configuration and connection
// This script helps verify your database setup

const db = require('./database-config');

console.log('🔍 Testing Database Configuration...\n');

// Test database health
db.checkDatabaseHealth((err, results) => {
    if (err) {
        console.error('❌ Database Health Check Failed:');
        console.error(err);
        process.exit(1);
    }

    console.log('✅ Database Health Check Passed!');
    console.log('📊 Results:', JSON.stringify(results, null, 2));
    console.log('');

    // Test book operations
    console.log('🔍 Testing Book Operations...');
    db.bookOperations.getAll((err, books) => {
        if (err) {
            console.error('❌ Failed to fetch books:', err);
            process.exit(1);
        }

        console.log(`✅ Successfully fetched ${books ? books.length : 0} books`);
        
        if (books && books.length > 0) {
            console.log('📚 Sample book:', {
                id: books[0].id,
                title: books[0].title,
                author: books[0].author
            });
        } else {
            console.log('ℹ️  No books found in database. Run seed script to add sample data.');
        }

        console.log('\n🎉 All tests passed! Your database is ready.');
        process.exit(0);
    });
});
