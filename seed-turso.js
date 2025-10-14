// Turso Database Seeding Script
// This script seeds the Turso database with sample books
// Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env

require('dotenv').config();
const db = require('./database-turso');

console.log('Starting Turso database seeding...');

// Sample books data
const sampleBooks = [
    // Fiction - Crime
    {
        isbn: '978-0-316-76948-0',
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        description: 'A gripping mystery thriller combining murder investigation with family saga.',
        category: 'Fiction',
        genre: 'Crime',
        cover: '/media/books/Fiction/crime/dragon-tattoo.jpg',
        price: 15.99,
        publisher: 'Vintage Crime',
        publication_date: '2008-09-16',
        publication_year: 2008,
        pages: 480,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 25,
        sku: 'FIC-CRI-001',
        cost_price: 9.99
    },
    // Fiction - Mystery
    {
        isbn: '978-0-385-54499-0',
        title: 'The Da Vinci Code',
        author: 'Dan Brown',
        description: 'A mystery thriller novel following symbologist Robert Langdon.',
        category: 'Fiction',
        genre: 'Mystery',
        cover: '/media/books/Fiction/mystery/da-vinci-code.jpg',
        price: 14.99,
        publisher: 'Doubleday',
        publication_date: '2003-03-18',
        publication_year: 2003,
        pages: 454,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 30,
        sku: 'FIC-MYS-001',
        cost_price: 8.99
    },
    // Fiction - Science Fiction
    {
        isbn: '978-0-441-01394-5',
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'Epic science fiction novel set in the distant future amidst a huge interstellar empire.',
        category: 'Fiction',
        genre: 'Science Fiction',
        cover: '/media/books/Fiction/science-fiction/dune.jpg',
        price: 18.99,
        publisher: 'Ace Books',
        publication_date: '1965-08-01',
        publication_year: 1965,
        pages: 688,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 20,
        sku: 'FIC-SCI-001',
        cost_price: 11.99
    },
    // Non-Fiction - Philosophy
    {
        isbn: '978-0-14-044792-5',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        description: 'Personal writings of the Roman Emperor on Stoic philosophy.',
        category: 'Non-fiction',
        genre: 'Philosophy',
        cover: '/media/books/Non-fiction/philosophy/meditations.jpg',
        price: 12.99,
        publisher: 'Penguin Classics',
        publication_date: '180-01-01',
        publication_year: 180,
        pages: 254,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 35,
        sku: 'NON-PHI-001',
        cost_price: 7.99
    },
    // Non-Fiction - Self-Help
    {
        isbn: '978-1-5011-2927-1',
        title: 'Atomic Habits',
        author: 'James Clear',
        description: 'An easy and proven way to build good habits and break bad ones.',
        category: 'Non-fiction',
        genre: 'Self-Help',
        cover: '/media/books/Non-fiction/self-help/atomic-habits.jpg',
        price: 16.99,
        publisher: 'Avery',
        publication_date: '2018-10-16',
        publication_year: 2018,
        pages: 320,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 40,
        sku: 'NON-SEL-001',
        cost_price: 10.99
    }
];

// Seed the database
async function seedDatabase() {
    try {
        // Initialize database schema
        console.log('Initializing database schema...');
        await new Promise((resolve, reject) => {
            db.initializeDatabase((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Schema initialized successfully!');

        // Check if books already exist
        const existingBooks = await new Promise((resolve, reject) => {
            db.bookOperations.getAll((err, books) => {
                if (err) reject(err);
                else resolve(books);
            });
        });

        if (existingBooks.length > 0) {
            console.log(`Database already contains ${existingBooks.length} books.`);
            console.log('Skipping seeding to avoid duplicates.');
            console.log('If you want to re-seed, delete the existing books first.');
            return;
        }

        // Insert sample books
        console.log(`\nInserting ${sampleBooks.length} sample books...`);
        
        for (const book of sampleBooks) {
            await new Promise((resolve, reject) => {
                db.bookOperations.create(book, (err, result) => {
                    if (err) {
                        console.error(`Error inserting book "${book.title}":`, err.message);
                        reject(err);
                    } else {
                        console.log(`✓ Added: ${book.title} by ${book.author}`);
                        resolve(result);
                    }
                });
            });
        }

        console.log('\n✅ Database seeded successfully!');
        console.log(`Total books: ${sampleBooks.length}`);
        
        // Verify the data
        const finalBooks = await new Promise((resolve, reject) => {
            db.bookOperations.getAll((err, books) => {
                if (err) reject(err);
                else resolve(books);
            });
        });

        console.log(`\nVerification: Database now contains ${finalBooks.length} books.`);
        
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase()
    .then(() => {
        console.log('\nSeeding complete! You can now start the server.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
