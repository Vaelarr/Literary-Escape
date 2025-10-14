// Database configuration switcher
// Automatically uses PostgreSQL on Vercel and SQLite for local development

const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.POSTGRES_URL || process.env.DATABASE_URL || isProduction;

let database;

if (usePostgres) {
    console.log('Using PostgreSQL database');
    database = require('./database-postgres');
} else {
    console.log('Using SQLite database (local development)');
    database = require('./database');
}

module.exports = database;
