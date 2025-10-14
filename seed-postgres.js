// Seed script for PostgreSQL database
// Run this after deploying to Vercel to populate initial data

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Use connection string from environment variable
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seedDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('Starting database seeding...');
        await client.query('BEGIN');

        // 1. Create admin account
        console.log('Creating admin account...');
        const adminPassword = await bcrypt.hash('Admin123!', 10);
        await client.query(
            `INSERT INTO admins (username, email, password_hash, first_name, last_name, phone)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO NOTHING`,
            ['admin', 'admin@literaryescape.com', adminPassword, 'Admin', 'User', '555-0100']
        );

        // 2. Create sample books
        console.log('Creating sample books...');
        const sampleBooks = [
            {
                isbn: '9780141439518',
                title: 'Pride and Prejudice',
                author: 'Jane Austen',
                description: 'A romantic novel of manners',
                category: 'Fiction',
                genre: 'Romance',
                cover: './media/books/Fiction/pride-prejudice.jpg',
                price: 12.99,
                publisher: 'Penguin Classics',
                publication_year: 1813,
                pages: 432,
                stock_quantity: 50
            },
            {
                isbn: '9780547928227',
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                description: 'A fantasy adventure novel',
                category: 'Fiction',
                genre: 'Fantasy',
                cover: './media/books/Fiction/hobbit.jpg',
                price: 14.99,
                publisher: 'Houghton Mifflin Harcourt',
                publication_year: 1937,
                pages: 310,
                stock_quantity: 75
            },
            {
                isbn: '9780062315007',
                title: 'The Alchemist',
                author: 'Paulo Coelho',
                description: 'A philosophical novel about following your dreams',
                category: 'Fiction',
                genre: 'Philosophy',
                cover: './media/books/Fiction/alchemist.jpg',
                price: 13.99,
                publisher: 'HarperOne',
                publication_year: 1988,
                pages: 208,
                stock_quantity: 60
            },
            {
                isbn: '9780142000679',
                title: 'The Outsiders',
                author: 'S.E. Hinton',
                description: 'A coming-of-age novel',
                category: 'Fiction',
                genre: 'Young Adult',
                cover: './media/books/Fiction/outsiders.jpg',
                price: 10.99,
                publisher: 'Penguin Books',
                publication_year: 1967,
                pages: 192,
                stock_quantity: 45
            },
            {
                isbn: '9780735211292',
                title: 'Atomic Habits',
                author: 'James Clear',
                description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
                category: 'Non-Fiction',
                genre: 'Self-Help',
                cover: './media/books/Non-fiction/atomic-habits.jpg',
                price: 16.99,
                publisher: 'Avery',
                publication_year: 2018,
                pages: 320,
                stock_quantity: 100
            },
            {
                isbn: '9780307887894',
                title: 'Sapiens',
                author: 'Yuval Noah Harari',
                description: 'A Brief History of Humankind',
                category: 'Non-Fiction',
                genre: 'History',
                cover: './media/books/Non-fiction/sapiens.jpg',
                price: 18.99,
                publisher: 'Harper',
                publication_year: 2015,
                pages: 464,
                stock_quantity: 80
            }
        ];

        for (const book of sampleBooks) {
            await client.query(
                `INSERT INTO books (
                    isbn, title, author, description, category, genre, cover, price,
                    publisher, publication_year, pages, stock_quantity
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT DO NOTHING`,
                [
                    book.isbn, book.title, book.author, book.description,
                    book.category, book.genre, book.cover, book.price,
                    book.publisher, book.publication_year, book.pages, book.stock_quantity
                ]
            );
        }

        await client.query('COMMIT');
        console.log('✅ Database seeding completed successfully!');
        
        // Display summary
        const bookCount = await client.query('SELECT COUNT(*) FROM books');
        const adminCount = await client.query('SELECT COUNT(*) FROM admins');
        
        console.log('\n📊 Seeding Summary:');
        console.log(`   - Books created: ${bookCount.rows[0].count}`);
        console.log(`   - Admins created: ${adminCount.rows[0].count}`);
        console.log('\n🔐 Admin Credentials:');
        console.log('   Email: admin@literaryescape.com');
        console.log('   Password: Admin123!');
        console.log('   ⚠️  Remember to change this password in production!\n');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the seeding function
seedDatabase()
    .then(() => {
        console.log('Seeding process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seeding process failed:', error);
        process.exit(1);
    });
