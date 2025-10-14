// Turso Database Seeding Script
// This script seeds the Turso database with sample books
// Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env

require('dotenv').config();
const db = require('./database-turso');

console.log('Starting Turso database seeding...');

// Sample books data - Integrated from seed-books.js
const sampleBooks = [
    // Fiction - Crime
    {
        isbn: '978-0-385-54499-1',
        title: "Death at the Sign of the Rook",
        author: "Kate Atkinson",
        description: "A gripping mystery novel featuring detective Jackson Brodie in his latest adventure.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/death at the sign of the rook.jpg",
        price: 24.99,
        publisher: 'Little, Brown',
        publication_date: '2023-09-05',
        publication_year: 2023,
        pages: 384,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 15,
        sku: 'FIC-CRI-001',
        cost_price: 14.99
    },
    {
        isbn: '978-0-385-54499-2',
        title: "Gone Girl",
        author: "Gillian Flynn",
        description: "A psychological thriller about a marriage gone terribly wrong.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/gone girl.jpg",
        price: 19.99,
        publisher: 'Crown Publishing',
        publication_date: '2012-06-05',
        publication_year: 2012,
        pages: 432,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 20,
        sku: 'FIC-CRI-002',
        cost_price: 11.99
    },
    {
        isbn: '978-0-385-54499-3',
        title: "Killing Floor",
        author: "Lee Child",
        description: "The first Jack Reacher novel that started the bestselling series.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/Killing floor.jpg",
        price: 22.99,
        publisher: 'Jove Books',
        publication_date: '1997-03-17',
        publication_year: 1997,
        pages: 534,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 18,
        sku: 'FIC-CRI-003',
        cost_price: 13.99
    },
    {
        isbn: '978-0-385-54499-4',
        title: "Murder on the Orient Express",
        author: "Agatha Christie",
        description: "The classic Hercule Poirot mystery set aboard a luxury train.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/murder on the orient express.jpg",
        price: 17.99,
        publisher: 'William Morrow',
        publication_date: '1934-01-01',
        publication_year: 1934,
        pages: 256,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 25,
        sku: 'FIC-CRI-004',
        cost_price: 10.99
    },
    {
        isbn: '978-0-385-54499-5',
        title: "The Thursday Murder Club",
        author: "Richard Osman",
        description: "A clever mystery featuring four unlikely detectives in a retirement village.",
        category: "Fiction",
        genre: "Crime",
        cover: "./media/books/Fiction/crime/the thursday murder club.jpg",
        price: 21.99,
        publisher: 'Pamela Dorman Books',
        publication_date: '2020-09-03',
        publication_year: 2020,
        pages: 368,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 12,
        sku: 'FIC-CRI-005',
        cost_price: 13.19
    },

    // Fiction - Magic Realism
    {
        isbn: '978-0-06-088328-7',
        title: "One Hundred Years of Solitude",
        author: "Gabriel García Márquez",
        description: "The masterpiece of magical realism telling the multi-generational story of the Buendía family.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/100 years of solitude.jpg",
        price: 26.99,
        publisher: 'Harper Perennial',
        publication_date: '1967-05-30',
        publication_year: 1967,
        pages: 417,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 10,
        sku: 'FIC-MAG-001',
        cost_price: 16.19
    },
    {
        isbn: '978-0-385-54499-6',
        title: "Kafka on the Shore",
        author: "Haruki Murakami",
        description: "A surreal tale of a teenage boy's journey and the mysterious events that follow.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/Kafka on the shore.webp",
        price: 24.99,
        publisher: 'Vintage',
        publication_date: '2005-01-18',
        publication_year: 2005,
        pages: 480,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 14,
        sku: 'FIC-MAG-002',
        cost_price: 14.99
    },
    {
        isbn: '978-0-385-54499-7',
        title: "Midnight's Children",
        author: "Salman Rushdie",
        description: "A magical realist epic chronicling India's transition from British colonialism to independence.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/midnight_s children.jpg",
        price: 23.99,
        publisher: 'Random House',
        publication_date: '1981-04-01',
        publication_year: 1981,
        pages: 536,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 8,
        sku: 'FIC-MAG-003',
        cost_price: 14.39
    },
    {
        isbn: '978-0-385-54499-8',
        title: "The Ocean at the End of the Lane",
        author: "Neil Gaiman",
        description: "A haunting tale of memory, magic, and survival from the master storyteller.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/the ocean at the end of the lane.jpg",
        price: 20.99,
        publisher: 'William Morrow',
        publication_date: '2013-06-18',
        publication_year: 2013,
        pages: 181,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 16,
        sku: 'FIC-MAG-004',
        cost_price: 12.59
    },
    {
        isbn: '978-0-385-54499-9',
        title: "The Wind-Up Bird Chronicle",
        author: "Haruki Murakami",
        description: "A mind-bending journey through the bizarre and mysterious.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "./media/books/Fiction/magic-realism/the wind-up bird chronicle.jpg",
        price: 25.99,
        publisher: 'Vintage',
        publication_date: '1997-10-28',
        publication_year: 1997,
        pages: 607,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 11,
        sku: 'FIC-MAG-005',
        cost_price: 15.59
    },

    // Fiction - Mystery
    {
        isbn: '978-0-385-54500-1',
        title: "And Then There Were None",
        author: "Agatha Christie",
        description: "The world's best-selling mystery novel about ten strangers trapped on an island.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/and then there were none.jpg",
        price: 18.99,
        publisher: 'William Morrow',
        publication_date: '1939-11-06',
        publication_year: 1939,
        pages: 272,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 22,
        sku: 'FIC-MYS-001',
        cost_price: 11.39
    },
    {
        isbn: '978-0-385-54499-0',
        title: 'The Da Vinci Code',
        author: 'Dan Brown',
        description: 'A thrilling adventure that unravels ancient secrets hidden in art and history.',
        category: 'Fiction',
        genre: 'Mystery',
        cover: './media/books/Fiction/mystery/da vinci.jpg',
        price: 21.99,
        publisher: 'Doubleday',
        publication_date: '2003-03-18',
        publication_year: 2003,
        pages: 454,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 19,
        sku: 'FIC-MYS-002',
        cost_price: 13.19
    },
    {
        isbn: '978-0-385-54500-2',
        title: "Don't Let the Forest In",
        author: "C.G. Drews",
        description: "A dark and atmospheric mystery about family secrets and ancient curses.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/dont let the forest in.jpg",
        price: 23.99,
        publisher: 'Orchard Books',
        publication_date: '2023-10-03',
        publication_year: 2023,
        pages: 352,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 13,
        sku: 'FIC-MYS-003',
        cost_price: 14.39
    },
    {
        isbn: '978-0-385-54500-3',
        title: "Everyone This Christmas",
        author: "Sarah Morgan",
        description: "A heartwarming mystery set during the holiday season.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/everyone this christmas.jpg",
        price: 19.99,
        publisher: 'HQN Books',
        publication_date: '2023-10-17',
        publication_year: 2023,
        pages: 384,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 17,
        sku: 'FIC-MYS-004',
        cost_price: 11.99
    },
    {
        isbn: '978-0-385-54500-4',
        title: "Murder Road",
        author: "Simone St. James",
        description: "A chilling mystery about a newlywed couple who become suspects in a murder.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/murder road.jpg",
        price: 24.99,
        publisher: 'Berkley',
        publication_date: '2023-09-05',
        publication_year: 2023,
        pages: 336,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 9,
        sku: 'FIC-MYS-005',
        cost_price: 14.99
    },
    {
        isbn: '978-0-385-54500-5',
        title: "The Secret History",
        author: "Donna Tartt",
        description: "A haunting and intellectually sophisticated tale of murder and morality.",
        category: "Fiction",
        genre: "Mystery",
        cover: "./media/books/Fiction/mystery/secret history.webp",
        price: 27.99,
        publisher: 'Vintage',
        publication_date: '1992-09-16',
        publication_year: 1992,
        pages: 576,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 7,
        sku: 'FIC-MYS-006',
        cost_price: 16.79
    },
    {
        isbn: '978-0-316-76948-0',
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        description: 'The international bestseller that launched the Millennium series.',
        category: 'Fiction',
        genre: 'Mystery',
        cover: './media/books/Fiction/mystery/the girl with the dragon tattoo.jpg',
        price: 22.99,
        publisher: 'Vintage Crime',
        publication_date: '2008-09-16',
        publication_year: 2008,
        pages: 480,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 21,
        sku: 'FIC-MYS-007',
        cost_price: 13.79
    },

    // Fiction - Science Fiction
    {
        isbn: '978-0-441-01394-5',
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'The epic science fiction masterpiece set on the desert planet Arrakis.',
        category: 'Fiction',
        genre: 'Science Fiction',
        cover: './media/books/Fiction/science-fiction/dune.jpg',
        price: 28.99,
        publisher: 'Ace Books',
        publication_date: '1965-08-01',
        publication_year: 1965,
        pages: 688,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 16,
        sku: 'FIC-SCI-001',
        cost_price: 17.39
    },
    {
        isbn: '978-0-385-54500-6',
        title: "Fahrenheit 451",
        author: "Ray Bradbury",
        description: "A dystopian classic about a future where books are banned and burned.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/fahrenheit 451.jpg",
        price: 19.99,
        publisher: 'Simon & Schuster',
        publication_date: '1953-10-19',
        publication_year: 1953,
        pages: 249,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 24,
        sku: 'FIC-SCI-002',
        cost_price: 11.99
    },
    {
        isbn: '978-0-385-54500-7',
        title: "Scythe",
        author: "Neal Shusterman",
        description: "In a world where death has been conquered, Scythes are tasked to kill.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/scythe.jpg",
        price: 23.99,
        publisher: 'Simon & Schuster',
        publication_date: '2016-11-22',
        publication_year: 2016,
        pages: 435,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 14,
        sku: 'FIC-SCI-003',
        cost_price: 14.39
    },
    {
        isbn: '978-0-385-54500-8',
        title: "The Toll",
        author: "Neal Shusterman",
        description: "The thrilling conclusion to the Arc of a Scythe trilogy.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/the toll.jpg",
        price: 25.99,
        publisher: 'Simon & Schuster',
        publication_date: '2019-11-05',
        publication_year: 2019,
        pages: 624,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 12,
        sku: 'FIC-SCI-004',
        cost_price: 15.59
    },
    {
        isbn: '978-0-385-54500-9',
        title: "Thunderhead",
        author: "Neal Shusterman",
        description: "The second book in the Arc of a Scythe series.",
        category: "Fiction",
        genre: "Science Fiction",
        cover: "./media/books/Fiction/science-fiction/thunderhead.jpg",
        price: 24.99,
        publisher: 'Simon & Schuster',
        publication_date: '2018-01-09',
        publication_year: 2018,
        pages: 513,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 13,
        sku: 'FIC-SCI-005',
        cost_price: 14.99
    },

    // Non-Fiction - Philosophy
    {
        isbn: '978-0-385-54501-0',
        title: "A History of Western Philosophy",
        author: "Bertrand Russell",
        description: "A comprehensive survey of Western philosophical thought from ancient Greece to the modern era.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/a history of western philosophy.jpg",
        price: 32.99,
        publisher: 'Simon & Schuster',
        publication_date: '1945-01-01',
        publication_year: 1945,
        pages: 895,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 8,
        sku: 'NON-PHI-001',
        cost_price: 19.79
    },
    {
        isbn: '978-0-385-54501-1',
        title: "Being and Time",
        author: "Martin Heidegger",
        description: "One of the most influential works of 20th-century philosophy.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/being and time.jpg",
        price: 29.99,
        publisher: 'Harper Perennial',
        publication_date: '1927-01-01',
        publication_year: 1927,
        pages: 589,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 6,
        sku: 'NON-PHI-002',
        cost_price: 17.99
    },
    {
        isbn: '978-0-385-54501-2',
        title: "Beyond Good and Evil",
        author: "Friedrich Nietzsche",
        description: "Nietzsche's critique of traditional moral concepts.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/beyond good and evil.jpg",
        price: 21.99,
        publisher: 'Vintage',
        publication_date: '1886-01-01',
        publication_year: 1886,
        pages: 260,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 11,
        sku: 'NON-PHI-003',
        cost_price: 13.19
    },
    {
        isbn: '978-0-385-54501-3',
        title: "Meditations on First Philosophy",
        author: "René Descartes",
        description: "The foundational text of modern Western philosophy.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/meditations on first philosophy.jpg",
        price: 18.99,
        publisher: 'Cambridge University Press',
        publication_date: '1641-01-01',
        publication_year: 1641,
        pages: 192,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 15,
        sku: 'NON-PHI-004',
        cost_price: 11.39
    },
    {
        isbn: '978-0-385-54501-4',
        title: "The Republic",
        author: "Plato",
        description: "Plato's influential dialogue on justice and the ideal state.",
        category: "Non-fiction",
        genre: "Philosophy",
        cover: "./media/books/Non-fiction/philosophy/republig.jpg",
        price: 20.99,
        publisher: 'Penguin Classics',
        publication_date: '380-01-01',
        publication_year: -380,
        pages: 416,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 17,
        sku: 'NON-PHI-005',
        cost_price: 12.59
    },

    // Non-Fiction - Politics
    {
        isbn: '978-0-385-54501-5',
        title: "Conjugal Dictatorship",
        author: "Primitivo Mijares",
        description: "An exposé of the Marcos regime in the Philippines.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/conjugal dictatorship.jpg",
        price: 26.99,
        publisher: 'Union Square Publications',
        publication_date: '1976-01-01',
        publication_year: 1976,
        pages: 434,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 9,
        sku: 'NON-POL-001',
        cost_price: 16.19
    },
    {
        isbn: '978-0-385-54501-6',
        title: "The Fourth Political Theory",
        author: "Alexander Dugin",
        description: "A controversial political philosophy challenging liberal democracy.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/the fourth political theory.jpg",
        price: 27.99,
        publisher: 'Arktos Media',
        publication_date: '2012-01-01',
        publication_year: 2012,
        pages: 212,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 7,
        sku: 'NON-POL-002',
        cost_price: 16.79
    },
    {
        isbn: '978-0-385-54501-7',
        title: "The New Machiavelli",
        author: "H.G. Wells",
        description: "A political novel exploring the challenges of modern governance.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/the new machiavelli.jpg",
        price: 23.99,
        publisher: 'John Lane Company',
        publication_date: '1911-01-01',
        publication_year: 1911,
        pages: 512,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 10,
        sku: 'NON-POL-003',
        cost_price: 14.39
    },
    {
        isbn: '978-0-385-54501-8',
        title: "What's the Matter with Kansas?",
        author: "Thomas Frank",
        description: "An analysis of American political culture and conservative populism.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/what_s the matter with kansan.jpg",
        price: 22.99,
        publisher: 'Metropolitan Books',
        publication_date: '2004-06-01',
        publication_year: 2004,
        pages: 306,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 12,
        sku: 'NON-POL-004',
        cost_price: 13.79
    },
    {
        isbn: '978-0-385-54501-9',
        title: "Whistleblowers",
        author: "C. Fred Alford",
        description: "An examination of those who speak truth to power.",
        category: "Non-fiction",
        genre: "Politics",
        cover: "./media/books/Non-fiction/politics/whistleblowers.jpg",
        price: 25.99,
        publisher: 'Cornell University Press',
        publication_date: '2001-10-01',
        publication_year: 2001,
        pages: 200,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 8,
        sku: 'NON-POL-005',
        cost_price: 15.59
    },

    // Discover Category Books
    {
        isbn: '978-0-385-54502-0',
        title: "Framed",
        author: "John Grisham",
        description: "A legal thriller featuring corruption and conspiracy.",
        category: "Discover",
        genre: "Thriller",
        cover: "./media/books/Discover/framed.jpg",
        price: 24.99,
        publisher: 'Dutton Books',
        publication_date: '2021-05-04',
        publication_year: 2021,
        pages: 256,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 14,
        sku: 'DIS-THR-001',
        cost_price: 14.99
    },
    {
        isbn: '978-0-385-54502-1',
        title: "Hexed",
        author: "Michelle Krys",
        description: "A supernatural young adult novel about witches and magic.",
        category: "Discover",
        genre: "Fantasy",
        cover: "./media/books/Discover/hexed.jpg",
        price: 18.99,
        publisher: 'Delacorte Press',
        publication_date: '2014-06-10',
        publication_year: 2014,
        pages: 374,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 16,
        sku: 'DIS-FAN-001',
        cost_price: 11.39
    },
    {
        isbn: '978-0-385-54502-2',
        title: "Hillbilly Elegy",
        author: "J.D. Vance",
        description: "A memoir of a family and culture in crisis.",
        category: "Discover",
        genre: "Memoir",
        cover: "./media/books/Discover/hillbily elegy.jpg",
        price: 23.99,
        publisher: 'Harper',
        publication_date: '2016-06-28',
        publication_year: 2016,
        pages: 264,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 13,
        sku: 'DIS-MEM-001',
        cost_price: 14.39
    },
    {
        isbn: '978-0-385-54502-3',
        title: "In Too Deep",
        author: "Jayne Ann Krentz",
        description: "A romantic suspense novel with mystery and intrigue.",
        category: "Discover",
        genre: "Romance",
        cover: "./media/books/Discover/in too deep.jpg",
        price: 19.99,
        publisher: 'Putnam',
        publication_date: '2010-12-28',
        publication_year: 2010,
        pages: 352,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 18,
        sku: 'DIS-ROM-001',
        cost_price: 11.99
    },
    {
        isbn: '978-0-385-54502-4',
        title: "Lost and Lassoed",
        author: "Jessica Clare",
        description: "A contemporary romance set in rural America.",
        category: "Discover",
        genre: "Romance",
        cover: "./media/books/Discover/lost and lassoed.jpg",
        price: 17.99,
        publisher: 'Berkley',
        publication_date: '2023-01-31',
        publication_year: 2023,
        pages: 352,
        language: 'English',
        format: 'Paperback',
        stock_quantity: 20,
        sku: 'DIS-ROM-002',
        cost_price: 10.79
    },
    {
        isbn: '978-0-385-54502-5',
        title: "Melania",
        author: "Melania Trump",
        description: "The memoir of the former First Lady.",
        category: "Discover",
        genre: "Biography",
        cover: "./media/books/Discover/melania.jpg",
        price: 29.99,
        publisher: 'Skyhorse Publishing',
        publication_date: '2024-10-08',
        publication_year: 2024,
        pages: 256,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 11,
        sku: 'DIS-BIO-001',
        cost_price: 17.99
    },
    {
        isbn: '978-0-385-54502-6',
        title: "On Tyranny",
        author: "Timothy Snyder",
        description: "Twenty lessons from the twentieth century on resisting authoritarianism.",
        category: "Discover",
        genre: "Politics",
        cover: "./media/books/Discover/on tyranny.jpg",
        price: 15.99,
        publisher: 'Tim Duggan Books',
        publication_date: '2017-02-28',
        publication_year: 2017,
        pages: 128,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 22,
        sku: 'DIS-POL-001',
        cost_price: 9.59
    },
    {
        isbn: '978-0-385-54502-7',
        title: "The Grey Wolf",
        author: "Louise Penny",
        description: "The latest Inspector Gamache mystery from the bestselling author.",
        category: "Discover",
        genre: "Mystery",
        cover: "./media/books/Discover/the grey wolf.jpg",
        price: 26.99,
        publisher: 'Minotaur Books',
        publication_date: '2024-10-29',
        publication_year: 2024,
        pages: 464,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 9,
        sku: 'DIS-MYS-001',
        cost_price: 16.19
    },
    {
        isbn: '978-0-385-54502-8',
        title: "The Waiting",
        author: "Michael Connelly",
        description: "A gripping thriller featuring Detective Harry Bosch.",
        category: "Discover",
        genre: "Thriller",
        cover: "./media/books/Discover/the waiting.jpg",
        price: 25.99,
        publisher: 'Little, Brown',
        publication_date: '2024-10-15',
        publication_year: 2024,
        pages: 400,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 12,
        sku: 'DIS-THR-002',
        cost_price: 15.59
    },
    {
        isbn: '978-0-385-54502-9',
        title: "War",
        author: "Bob Woodward",
        description: "An investigative look at modern American conflicts.",
        category: "Discover",
        genre: "Politics",
        cover: "./media/books/Discover/war.jpg",
        price: 28.99,
        publisher: 'Simon & Schuster',
        publication_date: '2024-10-15',
        publication_year: 2024,
        pages: 464,
        language: 'English',
        format: 'Hardcover',
        stock_quantity: 7,
        sku: 'DIS-POL-002',
        cost_price: 17.39
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
