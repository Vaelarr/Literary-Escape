class DatabaseBookDisplay {
    constructor() {
        this.currentBooks = [];
        this.userFavorites = new Set();
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Always load user favorites if logged in, but don't fail if not
            await this.loadUserFavorites();
            this.setupEventListeners();
            this.initialized = true;
            console.log('DatabaseBookDisplay initialized successfully');
        } catch (error) {
            console.warn('DatabaseBookDisplay initialization failed:', error);
            // Continue with basic functionality even if init fails
            this.initialized = false;
        }
    }

    async loadUserFavorites() {
        try {
            // Only load favorites if user is logged in
            if (typeof api !== 'undefined' && api && api.isLoggedIn && api.isLoggedIn()) {
                console.log('Loading user favorites...');
                const favorites = await api.getFavorites();
                console.log('Raw favorites data:', favorites);
                console.log('Favorites data type:', typeof favorites);
                console.log('Is favorites array?:', Array.isArray(favorites));
                
                // Handle different response formats with enhanced logging
                let favoriteIds = [];
                if (Array.isArray(favorites)) {
                    console.log('Processing array of favorites, length:', favorites.length);
                    favoriteIds = favorites.map((fav, index) => {
                        const id = parseInt(fav.book_id || fav.id);
                        console.log(`Favorite ${index}: book_id=${fav.book_id}, id=${fav.id}, parsed=${id}`);
                        return id;
                    });
                } else if (favorites && favorites.favorites && Array.isArray(favorites.favorites)) {
                    console.log('Processing nested favorites array, length:', favorites.favorites.length);
                    favoriteIds = favorites.favorites.map((fav, index) => {
                        const id = parseInt(fav.book_id || fav.id);
                        console.log(`Nested favorite ${index}: book_id=${fav.book_id}, id=${fav.id}, parsed=${id}`);
                        return id;
                    });
                } else if (favorites && favorites.data && Array.isArray(favorites.data)) {
                    console.log('Processing data property favorites, length:', favorites.data.length);
                    favoriteIds = favorites.data.map((fav, index) => {
                        const id = parseInt(fav.book_id || fav.id);
                        console.log(`Data favorite ${index}: book_id=${fav.book_id}, id=${fav.id}, parsed=${id}`);
                        return id;
                    });
                } else {
                    console.warn('Unexpected favorites format:', favorites);
                }
                
                // Filter out invalid IDs and log the results
                const validIds = favoriteIds.filter(id => !isNaN(id) && id > 0);
                console.log('Valid favorite IDs:', validIds);
                
                this.userFavorites = new Set(validIds);
                console.log('Final userFavorites Set:', Array.from(this.userFavorites));
                
                // Verify the data was loaded correctly
                if (validIds.length > 0) {
                    console.log(`Successfully loaded ${validIds.length} favorites for user`);
                } else {
                    console.log('No valid favorites found for user');
                }
                
            } else {
                // Clear favorites if not logged in
                this.userFavorites = new Set();
                console.log('User not logged in, cleared favorites');
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            // Don't throw, just continue with empty favorites
            this.userFavorites = new Set();
        }
    }

    async loadAllBooks() {
        try {
            // Always try to load books regardless of login status
            if (typeof api === 'undefined' || !api) {
                console.warn('API not available for loadAllBooks');
                return [];
            }

            // Get all books from API - no authentication required for viewing
            const books = await api.getBooks({});
            return Array.isArray(books) ? books : [];
        } catch (error) {
            console.error('Failed to load all books:', error);
            return [];
        }
    }

    async loadBooksByCategory(category) {
        try {
            // Always try to load books regardless of login status
            if (typeof api === 'undefined' || !api || typeof api.getBooks !== 'function') {
                console.warn('API not available for loadBooksByCategory');
                return [];
            }
            
            const books = await api.getBooks({ category });
            return Array.isArray(books) ? books : [];
        } catch (error) {
            console.error(`Failed to load ${category} books:`, error);
            return [];
        }
    }

    async getBookById(id) {
        try {
            // Always try to load book details regardless of login status
            return await api.getBook(id);
        } catch (error) {
            console.error(`Failed to load book ${id}:`, error);
            return null;
        }
    }

    // Helper function to create 2D book model HTML
    create2DBookModel(book, size = 'medium') {
        const bookTitle = book.title || 'Unknown Title';
        const bookPrice = book.price ? parseFloat(book.price).toFixed(2) : '0.00';
        const bookImage = book.cover || book.image_url || 'media/placeholder.jpg';
        const bookId = book.id || Math.random().toString(36).substr(2, 9);
        const bookAuthor = book.author || 'Unknown Author';
        
        const isLoggedIn = typeof api !== 'undefined' && api && api.isLoggedIn && api.isLoggedIn();
        const isFavorite = isLoggedIn && this.userFavorites.has(parseInt(bookId));
        
        return `
            <div class="book-3d ${size}" data-book-id="${bookId}" onclick="window.location.href='product.html?id=${bookId}'">
                <div class="book-container">
                    <div class="book-cover" style="background-image: url('${bookImage}')">
                        <div class="book-overlay">
                            <h4>${bookTitle}</h4>
                            <p>by ${bookAuthor}</p>
                            <p class="book-price">₱${bookPrice}</p>
                        </div>
                    </div>
                    <div class="book-spine"></div>
                    <div class="book-pages"></div>
                    <div class="book-shadow"></div>
                </div>
            </div>
        `;
    }

    createBookCard(book) {
        // Ensure book has required properties with simplified data
        const bookTitle = book.title || 'Unknown Title';
        const bookAuthor = book.author || 'Unknown Author';
        const bookPrice = book.price ? parseFloat(book.price).toFixed(2) : '0.00';
        const bookImage = book.cover || book.image_url || 'media/placeholder.jpg';
        const bookId = book.id || Math.random().toString(36).substr(2, 9);
        const bookGenre = book.genre || book.category || 'Fiction';
        const bookRating = book.rating || book.average_rating || (Math.random() * 2 + 3).toFixed(1);
        const originalPrice = book.original_price || (parseFloat(bookPrice) * 1.2).toFixed(2);
        const isOnSale = book.is_on_sale || Math.random() > 0.8;
        
        // Check if user is logged in and if book is favorite
        const isLoggedIn = typeof api !== 'undefined' && api && api.isLoggedIn && api.isLoggedIn();
        const isFavorite = isLoggedIn && this.userFavorites.has(parseInt(bookId));
        
        // Generate simple star rating HTML
        const fullStars = Math.floor(bookRating);
        const hasHalfStar = bookRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star text-warning"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star text-muted"></i>';
        }
        
        return `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-4">
                <div class="simple-book-card" data-product-id="${bookId}">
                    ${isOnSale ? '<div class="sale-badge">Sale</div>' : ''}
                    
                    <div class="book-image-container" onclick="window.location.href='product.html?id=${bookId}'">
                        <img src="${bookImage}" alt="${bookTitle}" class="book-cover-image" 
                             onerror="this.src='media/placeholder.jpg'" 
                             loading="lazy" />
                    </div>
                    
                    <div class="book-info">
                        <div class="book-category">
                            <span class="category-tag">${bookGenre}</span>
                        </div>
                        
                        <h5 class="book-title">
                            <a href="product.html?id=${bookId}" class="book-link">${bookTitle}</a>
                        </h5>
                        
                        <p class="book-author">by ${bookAuthor}</p>
                        
                        <div class="book-rating">
                            <div class="stars">${starsHTML}</div>
                            <span class="rating-text">${bookRating}</span>
                        </div>
                        
                        <div class="book-price-section">
                            ${isOnSale ? `<span class="original-price">₱${originalPrice}</span>` : ''}
                            <span class="current-price">₱${bookPrice}</span>
                        </div>
                        
                        <div class="book-actions">
                            <button class="btn-add-to-cart" data-book-id="${bookId}">
                                <i class="fa-solid fa-cart-shopping me-2"></i>Add to Cart
                            </button>
                            <button class="btn-favorite ${isFavorite ? 'active' : ''}" data-book-id="${bookId}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    displayBooks(books, container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) {
            console.error('Container not found');
            return;
        }

        if (!books || books.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No books available</p></div>';
            return;
        }

        try {
            container.innerHTML = books.map(book => this.createBookCard(book)).join('');
            this.attachEventListeners(container);
            this.setupLazyLoading(container);
        } catch (error) {
            console.error('Error displaying books:', error);
            container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error displaying books</p></div>';
        }
    }

    // Enhanced method to show loading skeleton
    showLoadingSkeleton(container, count = 8) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) return;

        const skeletons = Array.from({length: count}, () => this.createSkeletonCard()).join('');
        container.innerHTML = skeletons;
    }

    createSkeletonCard() {
        return `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-4">
                <div class="skeleton-card">
                    <div class="skeleton skeleton-image"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-author"></div>
                    <div class="skeleton skeleton-rating"></div>
                    <div class="skeleton skeleton-price"></div>
                </div>
            </div>
        `;
    }

    setupLazyLoading(container) {
        // Setup intersection observer for lazy loading images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            const lazyImages = container.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // New method to display books using 2D model
    displayBooks2D(books, container, size = 'medium') {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) {
            console.error('Container not found');
            return;
        }

        if (!books || books.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No books available</p></div>';
            return;
        }

        try {
            // Create a container that displays books in a grid layout
            const booksHTML = books.map(book => `
                <div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center">
                    ${this.create2DBookModel(book, size)}
                </div>
            `).join('');
            
            container.innerHTML = booksHTML;
            this.attachEventListeners(container);
        } catch (error) {
            console.error('Error displaying 2D books:', error);
            container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error displaying books</p></div>';
        }
    }

    // Method for displaying a single book in 2D model (for product pages)
    displaySingleBook2D(book, container, size = 'xlarge') {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) {
            console.error('Container not found');
            return;
        }

        if (!book) {
            container.innerHTML = '<div class="text-center text-muted">Book not available</div>';
            return;
        }

        try {
            // Create a 2D book model without navigation (for product page viewing)
            const bookTitle = book.title || 'Unknown Title';
            const bookPrice = book.price ? parseFloat(book.price).toFixed(2) : '0.00';
            const bookImage = book.cover || book.image_url || 'media/placeholder.jpg';
            const bookId = book.id || Math.random().toString(36).substr(2, 9);
            const bookAuthor = book.author || 'Unknown Author';
            
            const book2DModel = `
                <div class="book-3d ${size}" data-book-id="${bookId}">
                    <div class="book-container">
                        <div class="book-cover" style="background-image: url('${bookImage}')">
                        </div>
                        <div class="book-spine"></div>
                        <div class="book-pages"></div>
                        <div class="book-shadow"></div>
                    </div>
                </div>
            `;
            
            container.innerHTML = book2DModel;
        } catch (error) {
            console.error('Error displaying single 2D book:', error);
            container.innerHTML = '<div class="text-center text-danger">Error displaying book</div>';
        }
    }

    attachEventListeners(container) {
        // Add to cart events (support both old and new button classes)
        const cartButtons = container.querySelectorAll('.cart-btn button, .btn-add-to-cart');
        cartButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const bookId = btn.dataset.bookId;
                await this.addToCart(bookId);
            });
        });

        // Favorite events (support both old and new button classes)
        const favoriteButtons = container.querySelectorAll('.btn-favorite');
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const bookId = btn.dataset.bookId;
                await this.toggleFavorite(bookId, btn);
            });
        });

        // Add legacy support for existing hover effects on old product boxes
        const productBoxes = container.querySelectorAll('.product-box');
        productBoxes.forEach(box => {
            box.addEventListener('mouseenter', () => {
                box.classList.add('is-hover');
            });
            
            box.addEventListener('mouseleave', () => {
                box.classList.remove('is-hover');
            });
        });
    }

    async addToCart(bookId) {
        if (!api.isLoggedIn()) {
            // Show notification instead of redirecting
            showLoginRequired();
            return;
        }

        try {
            await api.addToCart(bookId);
            this.showMessage('Added to cart successfully!', 'success');
            
            // Use the universal navbar count system
            if (window.navbarCounts) {
                await window.navbarCounts.refreshCart();
            }
        } catch (error) {
            this.showMessage('Failed to add to cart', 'error');
        }
    }

    async toggleFavorite(bookId, button) {
        if (!api.isLoggedIn()) {
            // Show notification instead of redirecting
            showLoginRequired();
            return;
        }

        try {
            // Disable button during request
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            console.log(`Starting toggleFavorite for book ${bookId}`);

            // Get fresh favorites data from database to ensure accuracy
            console.log('Getting current favorites from server...');
            const currentFavorites = await api.getFavorites();
            console.log('Current favorites from server:', currentFavorites);
            console.log('Current favorites type:', typeof currentFavorites);
            console.log('Current favorites is array:', Array.isArray(currentFavorites));
            
            // Handle different response formats to check if book is favorited
            let isFavorite = false;
            let favoritesList = [];
            
            if (Array.isArray(currentFavorites)) {
                favoritesList = currentFavorites;
            } else if (currentFavorites && currentFavorites.favorites && Array.isArray(currentFavorites.favorites)) {
                favoritesList = currentFavorites.favorites;
            } else if (currentFavorites && currentFavorites.data && Array.isArray(currentFavorites.data)) {
                favoritesList = currentFavorites.data;
            }

            // Check if book is currently a favorite
            isFavorite = favoritesList.some(fav => {
                const favBookId = fav.book_id || fav.id;
                console.log(`Checking favorite: favBookId=${favBookId}, bookId=${bookId}, match=${favBookId == bookId}`);
                return favBookId == bookId;
            });

            console.log(`Book ${bookId} is currently favorite: ${isFavorite}`);

            let operationResult;
            if (isFavorite) {
                console.log(`Removing book ${bookId} from favorites...`);
                operationResult = await api.removeFromFavorites(bookId);
                console.log('Remove operation result:', operationResult);
                
                // Verify removal was successful by checking favorites again
                const favoritesAfterRemove = await api.getFavorites();
                const stillFavorite = this.checkIfBookInFavorites(bookId, favoritesAfterRemove);
                
                if (stillFavorite) {
                    throw new Error('Book still appears in favorites after removal attempt');
                }
                
                this.userFavorites.delete(parseInt(bookId));
                button.classList.remove('active');
                this.showMessage('Removed from favorites', 'success');
                console.log(`Successfully removed book ${bookId} from favorites`);
                
            } else {
                console.log(`Adding book ${bookId} to favorites...`);
                operationResult = await api.addToFavorites(bookId);
                console.log('Add operation result:', operationResult);
                
                // Verify addition was successful by checking favorites again
                const favoritesAfterAdd = await api.getFavorites();
                const nowFavorite = this.checkIfBookInFavorites(bookId, favoritesAfterAdd);
                
                if (!nowFavorite) {
                    throw new Error('Book does not appear in favorites after addition attempt');
                }
                
                this.userFavorites.add(parseInt(bookId));
                button.classList.add('active');
                this.showMessage('Added to favorites!', 'success');
                console.log(`Successfully added book ${bookId} to favorites`);
            }

            // Update the favorites count in navbar using the universal navbar count system
            if (window.navbarCounts) {
                await window.navbarCounts.refreshFavorites();
            }

            // Re-enable button
            button.disabled = false;
            button.innerHTML = originalText;

            // Reload favorites on the favorites page if we're there
            if (window.location.pathname.includes('favorites.html')) {
                console.log('On favorites page, reloading favorites...');
                if (typeof loadFavorites === 'function') {
                    setTimeout(() => {
                        loadFavorites();
                    }, 500);
                } else {
                    console.warn('loadFavorites function not available');
                    // Fallback: reload the page
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            }

        } catch (error) {
            console.error('Failed to update favorites:', error);
            console.error('Toggle favorite error details:', {
                bookId,
                message: error.message,
                stack: error.stack
            });
            this.showMessage('Failed to update favorites: ' + error.message, 'error');
            
            // Re-enable button on error
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    // Helper method to check if a book is in favorites list
    checkIfBookInFavorites(bookId, favoritesResponse) {
        if (!favoritesResponse) return false;
        
        let favoritesList = [];
        if (Array.isArray(favoritesResponse)) {
            favoritesList = favoritesResponse;
        } else if (favoritesResponse.favorites && Array.isArray(favoritesResponse.favorites)) {
            favoritesList = favoritesResponse.favorites;
        } else if (favoritesResponse.data && Array.isArray(favoritesResponse.data)) {
            favoritesList = favoritesResponse.data;
        }
        
        return favoritesList.some(fav => {
            const favBookId = fav.book_id || fav.id;
            return favBookId == bookId;
        });
    }

    setupEventListeners() {
        // Search functionality
        const searchForm = document.querySelector('form.d-flex');
        const searchInput = document.querySelector('input[type="search"]');
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                }
            });
        }
    }

    showMessage(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        
        // Set notification type classes
        const typeClasses = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };
        
        notification.classList.add('alert', typeClasses[type] || 'alert-info');
        
        // Add custom styles
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            min-width: 350px;
            max-width: 400px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: none;
            font-weight: 500;
            font-size: 14px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease-in-out;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Add icon based on type
        const icons = {
            'success': '<i class="fas fa-check-circle" style="color: #155724;"></i>',
            'error': '<i class="fas fa-exclamation-circle" style="color: #721c24;"></i>',
            'warning': '<i class="fas fa-exclamation-triangle" style="color: #856404;"></i>',
            'info': '<i class="fas fa-info-circle" style="color: #0c5460;"></i>'
        };

        notification.innerHTML = `
            ${icons[type] || icons['info']}
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" aria-label="Close" style="
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Add close button functionality
        const closeBtn = notification.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            this.closeNotification(notification);
        });

        // Auto-remove after delay
        const autoRemoveDelay = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            this.closeNotification(notification);
        }, autoRemoveDelay);

        // Make notification clickable to dismiss
        notification.addEventListener('click', (e) => {
            if (e.target !== closeBtn) {
                this.closeNotification(notification);
            }
        });
    }

    closeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }

    async updateCartCount() {
        try {
            // Only update cart count if user is logged in
            if (typeof api === 'undefined' || !api || !api.isLoggedIn || !api.isLoggedIn()) {
                // Clear any existing cart badge for non-logged-in users
                const cartIcon = document.querySelector('.fa-cart-shopping');
                if (cartIcon) {
                    const cartIconParent = cartIcon.parentElement;
                    const badge = cartIconParent.querySelector('.badge');
                    if (badge) {
                        badge.remove();
                    }
                }
                return;
            }
            
            const cartItems = await api.getCart();
            const count = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
            
            const cartIcon = document.querySelector('.fa-cart-shopping');
            if (!cartIcon) return;
            
            const cartIconParent = cartIcon.parentElement;
            let badge = cartIconParent.querySelector('.badge');
            
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'badge bg-danger rounded-pill position-absolute';
                    badge.style.cssText = 'top: -5px; right: -10px; font-size: 0.7em;';
                    cartIconParent.style.position = 'relative';
                    cartIconParent.appendChild(badge);
                }
                badge.textContent = count;
            } else if (badge) {
                badge.remove();
            }
        } catch (error) {
            console.error('Failed to update cart count:', error);
            // Don't throw, just log the error
        }
    }

    async loadBooksByGenre(genre) {
        try {
            // Always try to load books regardless of login status
            if (typeof api === 'undefined' || !api || typeof api.getBooks !== 'function') {
                console.warn('API not available for loadBooksByGenre');
                return [];
            }
            
            console.log(`Loading books for genre: ${genre}`);
            
            // Map genre names to match database values if needed
            const genreMap = {
                'Magic Realism': 'Magic Realism',
                'Mystery': 'Mystery',
                'Sci-Fi': ['Science Fiction', 'Sci-Fi'],
                'Science Fiction': ['Science Fiction', 'Sci-Fi'],
                'Crime': ['Crime', 'Crime Fiction'],
                'True Crime': 'True Crime',
                'Politics': 'Politics',
                'Philosophy': 'Philosophy',
                'Self-Help': ['Self Help', 'Self-Help']
            };
            
            // Get all books first, then filter by genre
            const allBooks = await api.getBooks({});
            console.log(`Total books loaded: ${allBooks.length}`);
            
            if (!Array.isArray(allBooks) || allBooks.length === 0) {
                console.log('No books returned from API');
                return [];
            }
            
            // Filter books by genre
            const searchGenres = genreMap[genre] || genre;
            const genreList = Array.isArray(searchGenres) ? searchGenres : [searchGenres];
            
            const filteredBooks = allBooks.filter(book => {
                const bookGenre = book.genre || '';
                return genreList.some(g => 
                    bookGenre.toLowerCase().includes(g.toLowerCase()) ||
                    g.toLowerCase().includes(bookGenre.toLowerCase())
                );
            });
            
            console.log(`Books found for genre "${genre}": ${filteredBooks.length}`);
            return filteredBooks;
            
        } catch (error) {
            console.error(`Failed to load books for genre ${genre}:`, error);
            return [];
        }
    }

    async searchBooks(query) {
        try {
            if (typeof api === 'undefined' || !api || typeof api.searchBooks !== 'function') {
                console.warn('API search not available, falling back to client-side search');
                
                // Fallback to client-side search
                const allBooks = await this.loadAllBooks();
                const searchTerm = query.toLowerCase();
                
                return allBooks.filter(book => {
                    const title = (book.title || '').toLowerCase();
                    const author = (book.author || '').toLowerCase();
                    const description = (book.description || '').toLowerCase();
                    const genre = (book.genre || '').toLowerCase();
                    
                    return title.includes(searchTerm) || 
                           author.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           genre.includes(searchTerm);
                });
            }
            
            console.log(`Searching books for query: ${query}`);
            const results = await api.searchBooks(query);
            console.log(`Search results found: ${results.length}`);
            return Array.isArray(results) ? results : [];
            
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }

    // Enhanced display with smooth animations
    displayBooksWithAnimation(books, container, animationDelay = 50) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) {
            console.error('Container not found');
            return;
        }

        if (!books || books.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No books available</p></div>';
            return;
        }

        try {
            // Clear container
            container.innerHTML = '';
            
            // Add books with staggered animation
            books.forEach((book, index) => {
                const bookHTML = this.createBookCard(book);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bookHTML;
                const bookElement = tempDiv.firstElementChild;
                
                bookElement.style.opacity = '0';
                bookElement.style.transform = 'translateY(20px)';
                bookElement.style.transition = 'all 0.3s ease';
                
                container.appendChild(bookElement);
                
                // Animate in with delay
                setTimeout(() => {
                    if (bookElement.parentNode) {
                        bookElement.style.opacity = '1';
                        bookElement.style.transform = 'translateY(0)';
                    }
                }, index * animationDelay);
            });

            // Attach event listeners after all elements are added
            setTimeout(() => {
                this.attachEventListeners(container);
                this.setupLazyLoading(container);
            }, books.length * animationDelay + 100);

        } catch (error) {
            console.error('Error displaying books:', error);
            container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error displaying books</p></div>';
        }
    }
}

// Create global instance with error handling
let dbBookDisplay;
try {
    dbBookDisplay = new DatabaseBookDisplay();
} catch (error) {
    console.error('Failed to create DatabaseBookDisplay instance:', error);
    // Create a minimal fallback object
    dbBookDisplay = {
        updateCartCount: () => Promise.resolve(),
        showMessage: (message, type) => {
            console.log(`${type.toUpperCase()}: ${message}`);
            // Use custom notifications based on type
            if (typeof showSuccess === 'function' && typeof showError === 'function') {
                if (type === 'success') showSuccess(message);
                else if (type === 'error') showError(message);
                else if (type === 'warning') showWarning(message);
                else showInfo(message);
            } else {
                // Fallback to console if custom notifications not available
                console.warn(`Notification (${type}): ${message}`);
            }
        },
        displayBooks: (books, container) => {
            console.warn('DatabaseBookDisplay not properly initialized');
        },
        loadAllBooks: () => Promise.resolve([]),
        loadBooksByGenre: () => Promise.resolve([]),
        loadBooksByCategory: () => Promise.resolve([]),
        getBookById: () => Promise.resolve(null),
        searchBooks: () => Promise.resolve([]),
        toggleFavorite: () => Promise.resolve(),
        addToCart: () => Promise.resolve()
    };
}