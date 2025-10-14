// Database configuration switcher
// Automatically selects the appropriate database based on environment variables:
// 1. Turso Cloud (if TURSO_DATABASE_URL is set) - Edge-hosted SQLite
// 2. PostgreSQL (if POSTGRES_URL/DATABASE_URL is set) - Traditional production database
// 3. SQLite (local file) - Default for local development

// Load environment variables
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const useTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;
const usePostgres = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let database;

console.log('=================================================');
console.log('DATABASE CONFIGURATION');
console.log('=================================================');
console.log('Environment Variables Check:');
console.log('- TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? '✅ SET (Cloud Database)' : '❌ NOT SET');
console.log('- TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? '✅ SET' : '❌ NOT SET');
console.log('- POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ SET' : '❌ NOT SET');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('=================================================');

if (useTurso) {
    console.log('✅ SELECTED: Turso Cloud Database (ONLINE)');
    console.log('   URL:', process.env.TURSO_DATABASE_URL);
    console.log('=================================================');
    database = require('./database-turso');
} else if (usePostgres) {
    console.log('✅ SELECTED: PostgreSQL Database (ONLINE)');
    console.log('=================================================');
    database = require('./database-postgres');
} else {
    console.log('⚠️  SELECTED: Local SQLite Database (OFFLINE)');
    console.log('   File: literary_escape.db');
    console.log('=================================================');
    database = require('./database');
}

module.exports = database;
