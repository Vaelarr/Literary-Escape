// Migration script to add entity_name column to audit_trail table
require('dotenv').config();

const { createClient } = require('@libsql/client');

async function migrateAuditTrail() {
    console.log('Starting audit_trail table migration...');
    
    const turso = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        // Check if column already exists
        console.log('Checking if entity_name column exists...');
        const tableInfo = await turso.execute('PRAGMA table_info(audit_trail)');
        const hasEntityName = tableInfo.rows.some(col => col.name === 'entity_name');
        
        if (hasEntityName) {
            console.log('✅ entity_name column already exists in audit_trail table');
            return;
        }

        // Add entity_name column
        console.log('Adding entity_name column to audit_trail table...');
        await turso.execute(`
            ALTER TABLE audit_trail 
            ADD COLUMN entity_name TEXT
        `);
        
        console.log('✅ Successfully added entity_name column to audit_trail table');
        console.log('Migration complete!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        turso.close();
    }
}

// Run migration
if (require.main === module) {
    migrateAuditTrail()
        .then(() => {
            console.log('\n✅ All migrations completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = migrateAuditTrail;
