const db = require('./database-turso');

async function checkSchema() {
    try {
        // Check cart table schema
        const schema = await db.query(`SELECT sql FROM sqlite_master WHERE type='table' AND name='cart'`);
        console.log('Cart table schema:');
        console.log(schema.rows[0]?.sql);
        
        // Try to insert a test row to see what columns exist
        console.log('\nTrying to get cart items...');
        const result = await db.query('SELECT * FROM cart LIMIT 1');
        console.log('Query result columns:', result.columns);
        console.log('Query result rows:', result.rows);
        
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

checkSchema();
