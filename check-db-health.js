// Database health check script
require('dotenv').config();
const db = require('./database-config');

db.checkDatabaseHealth((err, results) => {
    if (err) {
        console.error('Database Health Check Failed:', err);
        process.exit(1);
    }
    console.log('Database Health:', results);
    process.exit(0);
});
