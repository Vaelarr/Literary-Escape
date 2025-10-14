const { bookOperations, bulkInsertBooks, initializeDatabase } = require('./database');

// Sample books based on your media folder structure
const sampleBooks = [
    // Fiction - Crime
    {
        title: "Death at the Sign of the Rook",
        author: "Kate Atkinson",
        description: "A gripping mystery novel featuring detective Jackson Brodie in his latest adventure.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/death at the sign of the rook.jpg",
        price: 24.99,
        stock_quantity: 15
    },
    {
        title: "Gone Girl",
        author: "Gillian Flynn",
        description: "A psychological thriller about a marriage gone terribly wrong.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/gone girl.jpg",
        price: 19.99,
        stock_quantity: 20
    },
    {
        title: "Killing Floor",
        author: "Lee Child",
        description: "The first Jack Reacher novel that started the bestselling series.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/Killing floor.jpg",
        price: 22.99,
        stock_quantity: 18
    },
    {
        title: "Murder on the Orient Express",
        author: "Agatha Christie",
        description: "The classic Hercule Poirot mystery set aboard a luxury train.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/murder on the orient express.jpg",
        price: 17.99,
        stock_quantity: 25
    },
    {
        title: "The Thursday Murder Club",
        author: "Richard Osman",
        description: "A clever mystery featuring four unlikely detectives in a retirement village.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/the thursday murder club.jpg",
        price: 21.99,
        stock_quantity: 12
    },

    // Fiction - Magic Realism
    {
        title: "One Hundred Years of Solitude",
        author: "Gabriel García Márquez",
        description: "The masterpiece of magical realism telling the multi-generational story of the Buendía family.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/100 years of solitude.jpg",
        price: 26.99,
        stock_quantity: 10
    },
    {
        title: "Kafka on the Shore",
        author: "Haruki Murakami",
        description: "A surreal tale of a teenage boy's journey and the mysterious events that follow.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/Kafka on the shore.webp",
        price: 24.99,
        stock_quantity: 14
    },
    {
        title: "Midnight's Children",
        author: "Salman Rushdie",
        description: "A magical realist epic chronicling India's transition from British colonialism to independence.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/midnight_s children.jpg",
        price: 23.99,
        stock_quantity: 8
    },
    {
        title: "The Ocean at the End of the Lane",
        author: "Neil Gaiman",
        description: "A haunting tale of memory, magic, and survival from the master storyteller.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/the ocean at the end of the lane.jpg",
        price: 20.99,
        stock_quantity: 16
    },
    {
        title: "The Wind-Up Bird Chronicle",
        author: "Haruki Murakami",
        description: "A mind-bending journey through the bizarre and mysterious.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/the wind-up bird chronicle.jpg",
        price: 25.99,
        stock_quantity: 11
    },

    // Fiction - Mystery
    {
        title: "And Then There Were None",
        author: "Agatha Christie",
        description: "The world's best-selling mystery novel about ten strangers trapped on an island.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/and then there were none.jpg",
        price: 18.99,
        stock_quantity: 22
    },
    {
        title: "The Da Vinci Code",
        author: "Dan Brown",
        description: "A thrilling adventure that unravels ancient secrets hidden in art and history.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/da vinci.jpg",
        price: 21.99,
        stock_quantity: 19
    },
    {
        title: "Don't Let the Forest In",
        author: "C.G. Drews",
        description: "A dark and atmospheric mystery about family secrets and ancient curses.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/dont let the forest in.jpg",
        price: 23.99,
        stock_quantity: 13
    },
    {
        title: "Everyone This Christmas",
        author: "Sarah Morgan",
        description: "A heartwarming mystery set during the holiday season.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/everyone this christmas.jpg",
        price: 19.99,
        stock_quantity: 17
    },
    {
        title: "Murder Road",
        author: "Simone St. James",
        description: "A chilling mystery about a newlywed couple who become suspects in a murder.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/murder road.jpg",
        price: 24.99,
        stock_quantity: 9
    },
    {
        title: "The Secret History",
        author: "Donna Tartt",
        description: "A haunting and intellectually sophisticated tale of murder and morality.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/secret history.webp",
        price: 27.99,
        stock_quantity: 7
    },
    {
        title: "The Girl with the Dragon Tattoo",
        author: "Stieg Larsson",
        description: "The international bestseller that launched the Millennium series.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/the girl with the dragon tattoo.jpg",
        price: 22.99,
        stock_quantity: 21
    },

    // Fiction - Science Fiction
    {
        title: "Dune",
        author: "Frank Herbert",
        description: "The epic science fiction masterpiece set on the desert planet Arrakis.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/dune.jpg",
        price: 28.99,
        stock_quantity: 16
    },
    {
        title: "Fahrenheit 451",
        author: "Ray Bradbury",
        description: "A dystopian classic about a future where books are banned and burned.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/fahrenheit 451.jpg",
        price: 19.99,
        stock_quantity: 24
    },
    {
        title: "Scythe",
        author: "Neal Shusterman",
        description: "In a world where death has been conquered, Scythes are tasked to kill.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/scythe.jpg",
        price: 23.99,
        stock_quantity: 14
    },
    {
        title: "The Toll",
        author: "Neal Shusterman",
        description: "The thrilling conclusion to the Arc of a Scythe trilogy.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/the toll.jpg",
        price: 25.99,
        stock_quantity: 12
    },
    {
        title: "Thunderhead",
        author: "Neal Shusterman",
        description: "The second book in the Arc of a Scythe series.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/thunderhead.jpg",
        price: 24.99,
        stock_quantity: 13
    },

    // Non-Fiction - Philosophy
    {
        title: "A History of Western Philosophy",
        author: "Bertrand Russell",
        description: "A comprehensive survey of Western philosophical thought from ancient Greece to the modern era.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/a history of western philosophy.jpg",
        price: 32.99,
        stock_quantity: 8
    },
    {
        title: "Being and Time",
        author: "Martin Heidegger",
        description: "One of the most influential works of 20th-century philosophy.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/being and time.jpg",
        price: 29.99,
        stock_quantity: 6
    },
    {
        title: "Beyond Good and Evil",
        author: "Friedrich Nietzsche",
        description: "Nietzsche's critique of traditional moral concepts.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/beyond good and evil.jpg",
        price: 21.99,
        stock_quantity: 11
    },
    {
        title: "Meditations on First Philosophy",
        author: "René Descartes",
        description: "The foundational text of modern Western philosophy.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/meditations on first philosophy.jpg",
        price: 18.99,
        stock_quantity: 15
    },
    {
        title: "The Republic",
        author: "Plato",
        description: "Plato's influential dialogue on justice and the ideal state.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/republig.jpg",
        price: 20.99,
        stock_quantity: 17
    },

    // Non-Fiction - Politics
    {
        title: "Conjugal Dictatorship",
        author: "Primitivo Mijares",
        description: "An exposé of the Marcos regime in the Philippines.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/conjugal dictatorship.jpg",
        price: 26.99,
        stock_quantity: 9
    },
    {
        title: "The Fourth Political Theory",
        author: "Alexander Dugin",
        description: "A controversial political philosophy challenging liberal democracy.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/the fourth political theory.jpg",
        price: 27.99,
        stock_quantity: 7
    },
    {
        title: "The New Machiavelli",
        author: "H.G. Wells",
        description: "A political novel exploring the challenges of modern governance.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/the new machiavelli.jpg",
        price: 23.99,
        stock_quantity: 10
    },
    {
        title: "What's the Matter with Kansas?",
        author: "Thomas Frank",
        description: "An analysis of American political culture and conservative populism.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/what_s the matter with kansan.jpg",
        price: 22.99,
        stock_quantity: 12
    },
    {
        title: "Whistleblowers",
        author: "C. Fred Alford",
        description: "An examination of those who speak truth to power.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/whistleblowers.jpg",
        price: 25.99,
        stock_quantity: 8
    },

    // Discover Category Books
    {
        title: "Framed",
        author: "John Grisham",
        description: "A legal thriller featuring corruption and conspiracy.",
        category: "Discover",
        genre: "Thriller",
        cover: "./media/books/Discover/framed.jpg",
        price: 24.99,
        stock_quantity: 14
    },
    {
        title: "Hexed",
        author: "Michelle Krys",
        description: "A supernatural young adult novel about witches and magic.",
        category: "Discover",
        genre: "Fantasy",
        cover: "./media/books/Discover/hexed.jpg",
        price: 18.99,
        stock_quantity: 16
    },
    {
        title: "Hillbilly Elegy",
        author: "J.D. Vance",
        description: "A memoir of a family and culture in crisis.",
        category: "Discover",
        genre: "Memoir",
        cover: "./media/books/Discover/hillbily elegy.jpg",
        price: 23.99,
        stock_quantity: 13
    },
    {
        title: "In Too Deep",
        author: "Jayne Ann Krentz",
        description: "A romantic suspense novel with mystery and intrigue.",
        category: "Discover",
        genre: "Romance",
        cover: "./media/books/Discover/in too deep.jpg",
        price: 19.99,
        stock_quantity: 18
    },
    {
        title: "Lost and Lassoed",
        author: "Jessica Clare",
        description: "A contemporary romance set in rural America.",
        category: "Discover",
        genre: "Romance",
        cover: "./media/books/Discover/lost and lassoed.jpg",
        price: 17.99,
        stock_quantity: 20
    },
    {
        title: "Melania",
        author: "Melania Trump",
        description: "The memoir of the former First Lady.",
        category: "Discover",
        genre: "Biography",
        cover: "./media/books/Discover/melania.jpg",
        price: 29.99,
        stock_quantity: 11
    },
    {
        title: "On Tyranny",
        author: "Timothy Snyder",
        description: "Twenty lessons from the twentieth century on resisting authoritarianism.",
        category: "Discover",
        genre: "Politics",
        cover: "./media/books/Discover/on tyranny.jpg",
        price: 15.99,
        stock_quantity: 22
    },
    {
        title: "The Grey Wolf",
        author: "Louise Penny",
        description: "The latest Inspector Gamache mystery from the bestselling author.",
        category: "Discover",
        genre: "Mystery",
        cover: "./media/books/Discover/the grey wolf.jpg",
        price: 26.99,
        stock_quantity: 9
    },
    {
        title: "The Waiting",
        author: "Michael Connelly",
        description: "A gripping thriller featuring Detective Harry Bosch.",
        category: "Discover",
        genre: "Thriller",
        cover: "./media/books/Discover/the waiting.jpg",
        price: 25.99,
        stock_quantity: 12
    },
    {
        title: "War",
        author: "Bob Woodward",
        description: "An investigative look at modern American conflicts.",
        category: "Discover",
        genre: "Politics",
        cover: "./media/books/Discover/war.jpg",
        price: 28.99,
        stock_quantity: 7
    }
];

// Function to seed the database
function seedDatabase() {
    console.log('Starting database seeding...');
    
    // First, initialize the database
    initializeDatabase((err) => {
        if (err) {
            console.error('Failed to initialize database:', err);
            return;
        }
        
        console.log('Database initialized successfully');
        
        // Check if books already exist
        bookOperations.getAll((err, existingBooks) => {
            if (err) {
                console.error('Failed to check existing books:', err);
                return;
            }
            
            if (existingBooks.length > 0) {
                console.log(`Database already contains ${existingBooks.length} books. Skipping seeding.`);
                console.log('If you want to re-seed, please clear the database first.');
                process.exit(0);
                return;
            }
            
            console.log('Database is empty. Starting bulk insert...');
            
            // Use the bulk insert function
            bulkInsertBooks(sampleBooks, (err, result) => {
                if (err) {
                    console.error('Bulk insert failed:', err.message);
                    console.error('Details:', err.details || err);
                } else {
                    console.log('\n🎉 Database seeding completed successfully!');
                    console.log(`✅ Successfully inserted: ${result.success} books`);
                    if (result.errors > 0) {
                        console.log(`❌ Failed to insert: ${result.errors} books`);
                        console.log('Error details:', result.details);
                    }
                }
                
                // Verify the results
                bookOperations.getAll((err, allBooks) => {
                    if (!err) {
                        console.log(`\n📚 Total books in database: ${allBooks.length}`);
                        
                        // Show category breakdown
                        const categoryCount = {};
                        allBooks.forEach(book => {
                            categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
                        });
                        
                        console.log('\n📊 Books by category:');
                        Object.entries(categoryCount).forEach(([category, count]) => {
                            console.log(`   ${category}: ${count} books`);
                        });
                    }
                    
                    process.exit(0);
                });
            });
        });
    });
}

// Run the seeding
if (require.main === module) {
    seedDatabase();
}

module.exports = { sampleBooks, seedDatabase };