// Migration script to add archived column to existing Turso database tables
require('dotenv').config();

const { createClient } = require('@libsql/client');

// Validate that Turso credentials are set
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env file');
    process.exit(1);
}

console.log('🌐 Connecting to Turso Cloud Database...');
console.log('   Database:', process.env.TURSO_DATABASE_URL.split('.')[0].replace('libsql://', ''));

// Create Turso client
const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper function to execute queries
async function query(sql, params = []) {
    try {
        const result = await turso.execute({
            sql: sql,
            args: params
        });
        return result;
    } catch (error) {
        throw error;
    }
}

async function runMigrations() {
    try {
        console.log('\n🔧 Running database migrations...\n');
        
        // Migration 1: Add archived column to users table
        console.log('📝 Migration 1: Adding archived column to users table...');
        try {
            await query('ALTER TABLE users ADD COLUMN archived BOOLEAN DEFAULT 0');
            console.log('✅ Successfully added archived column to users table');
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('duplicate column')) {
                console.log('ℹ️  Users table already has archived column - skipping');
            } else {
                console.error('❌ Error adding archived column to users:', error.message);
                throw error;
            }
        }
        
        // Migration 2: Add archived column to orders table
        console.log('\n📝 Migration 2: Adding archived column to orders table...');
        try {
            await query('ALTER TABLE orders ADD COLUMN archived BOOLEAN DEFAULT 0');
            console.log('✅ Successfully added archived column to orders table');
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('duplicate column')) {
                console.log('ℹ️  Orders table already has archived column - skipping');
            } else {
                console.error('❌ Error adding archived column to orders:', error.message);
                throw error;
            }
        }
        
        // Verify migrations
        console.log('\n🔍 Verifying migrations...');
        
        try {
            // Test users table
            const usersTest = await query('SELECT archived FROM users LIMIT 1');
            console.log('✅ Users.archived column verified');
        } catch (error) {
            console.error('❌ Users.archived column verification failed:', error.message);
        }
        
        try {
            // Test orders table
            const ordersTest = await query('SELECT archived FROM orders LIMIT 1');
            console.log('✅ Orders.archived column verified');
        } catch (error) {
            console.error('❌ Orders.archived column verification failed:', error.message);
        }
        
        console.log('\n✨ All migrations completed successfully!\n');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migrations
console.log('Starting migration process...\n');
runMigrations();
