// Clear all books from Turso database
require('dotenv').config();
const db = require('./database-turso');

async function clearBooks() {
    try {
        console.log('Fetching all books...');
        
        const books = await new Promise((resolve, reject) => {
            db.bookOperations.getAll((err, books) => {
                if (err) reject(err);
                else resolve(books);
            });
        });

        console.log(`Found ${books.length} books to delete.`);

        if (books.length === 0) {
            console.log('No books to delete.');
            return;
        }

        console.log('Deleting books...');
        for (const book of books) {
            await new Promise((resolve, reject) => {
                db.bookOperations.delete(book.id, (err) => {
                    if (err) {
                        console.error(`Error deleting book "${book.title}":`, err.message);
                        reject(err);
                    } else {
                        console.log(`✓ Deleted: ${book.title}`);
                        resolve();
                    }
                });
            });
        }

        console.log('\n✅ All books deleted successfully!');
        
    } catch (error) {
        console.error('\n❌ Error clearing books:', error);
        process.exit(1);
    }
}

clearBooks()
    .then(() => {
        console.log('\nYou can now run the seed script to add new books.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Clearing failed:', error);
        process.exit(1);
    });
