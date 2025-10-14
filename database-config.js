// Database configuration switcher
// Automatically selects the appropriate database based on environment variables:
// 1. Turso Cloud (if TURSO_DATABASE_URL is set) - Edge-hosted SQLite
// 2. PostgreSQL (if POSTGRES_URL/DATABASE_URL is set) - Traditional production database
// 3. SQLite (local file) - Default for local development

const isProduction = process.env.NODE_ENV === 'production';
const useTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;
const usePostgres = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let database;

if (useTurso) {
    console.log('Using Turso Cloud database (Edge SQLite)');
    database = require('./database-turso');
} else if (usePostgres) {
    console.log('Using PostgreSQL database');
    database = require('./database-postgres');
} else {
    console.log('Using SQLite database (local development)');
    database = require('./database');
}

module.exports = database;
