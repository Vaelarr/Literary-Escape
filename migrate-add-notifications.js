// Migration script to add admin_notifications table
require('dotenv').config();

const { query } = require('./database-config');

async function migrateAddNotifications() {
    try {
        console.log('🔄 Starting migration: Add admin_notifications table...');

        // Create admin_notifications table
        await query(`
            CREATE TABLE IF NOT EXISTS admin_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notification_type TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                entity_name TEXT,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                read_by_admin_id INTEGER,
                read_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (read_by_admin_id) REFERENCES admins(id)
            )
        `);

        console.log('✅ admin_notifications table created successfully');

        // Create indexes for better performance
        await query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON admin_notifications(is_read)');
        await query('CREATE INDEX IF NOT EXISTS idx_notifications_type ON admin_notifications(notification_type)');
        await query('CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at DESC)');

        console.log('✅ Indexes created successfully');

        console.log('✅ Migration completed successfully!');
        console.log('📊 New features:');
        console.log('   - Database-backed admin notifications');
        console.log('   - New order notifications');
        console.log('   - Mark as read functionality');
        console.log('   - Auto-refresh every 30 seconds');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateAddNotifications();
