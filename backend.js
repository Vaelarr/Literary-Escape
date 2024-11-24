
// Audio controls
const audio = document.getElementById('bgMusic');
const audioControl = document.getElementById('audioControl');
const audioIcon = audioControl.querySelector('i');
audio.volume = 0.2;

window.addEventListener('load', () => audio.pause());

audioControl.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        audioIcon.className = 'fas fa-volume-up';
    } else {
        audio.pause();
        audioIcon.className = 'fas fa-volume-mute';
    }
});

// Favorites loading and management
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const container = document.getElementById('favoritesContainer');
    if (!container) return console.error('Favorites container not found');

    container.innerHTML = favorites.length
        ? favorites.map((item, index) => `
            <div class="col-md-3 mb-4">
                <div class="card">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">₱${item.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-danger btn-sm" onclick="removeFromFavorites(${index})">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            <button class="btn btn-success btn-sm" onclick="addToCartFromFavorites(${index})">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>`).join('')
        : '<p class="text-center">No favorites added yet</p>';
}

function removeFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    updateFavoritesCount();
    showNotification('Item removed from favorites');
}

function addToCartFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    addToCart(favorites[index]);
    showNotification('Item added to cart');
}

document.addEventListener('DOMContentLoaded', loadFavorites);

// Toggle favorite status
function toggleFavorite(heartButton, productData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Please login to add items to favorites', 'error');
        setTimeout(() => {
            window.location.href = 'account.html';
        }, 3000);
        return;
    }

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const heartIcon = heartButton.querySelector('i');
    const isFavorite = favorites.some(item => item.id === productData.id);

    if (isFavorite) {
        favorites = favorites.filter(item => item.id !== productData.id);
        heartIcon.style.color = '#000';
        showNotification('Item removed from favorites');
    } else {
        favorites.push(productData);
        heartIcon.style.color = '#f00';
        showNotification('Item added to favorites');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const count = favorites.length;
    const badge = document.querySelector('.favorites-count');

    if (count > 0) {
        if (!badge) {
            const favoritesLink = document.querySelector('a[href="favorites.html"]');
            const newBadge = document.createElement('span');
            newBadge.className = 'favorites-count';
            newBadge.textContent = count;
            favoritesLink.appendChild(newBadge);
        } else {
            badge.textContent = count;
        }
    } else if (badge) {
        badge.remove();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    displayOrderItems();

    // Redirect if cart is empty
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary'));
    if (!orderSummary || orderSummary.items.length === 0) {
        window.location.href = 'cart.html';
    }
});

document.addEventListener('DOMContentLoaded', updateCartCount);

// Initialize favorites count on page load
document.addEventListener('DOMContentLoaded', function () {
    updateFavoritesCount();
    updateCartCount();
});

function updateCart() {
    loadCart();
    updateCartCount();
    loadCheckoutSummary();
}

function updateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 50 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
    updateCheckoutButton();
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cartItems');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center">Your cart is empty</p>';
        updateTotals();
        return;
    }

    cart.forEach((item, index) => {
        cartContainer.innerHTML += `
                <div class="cart-item">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid">
                        </div>
                        <div class="col-md-4">
                            <h5>${item.name}</h5>
                        </div>
                        <div class="col-md-3">
                            <div class="quantity-controls">
                                <button onclick="updateQuantity(${index}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity(${index}, 1)">+</button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <strong>₱${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
    });
    updateTotals();
}

function loadCheckoutSummary() {
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Calculate values
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 50 : 0;
    const total = subtotal + shipping;

    // Store in localStorage for checkout page
    const orderSummary = {
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        items: cart
    };
    localStorage.setItem('orderSummary', JSON.stringify(orderSummary));

    // Update DOM elements if they exist
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    if (subtotalElement) {
        subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    }
    if (totalElement) {
        totalElement.textContent = `₱${total.toFixed(2)}`;
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartLink = document.querySelector('a[href="cart.html"]');
    let badge = document.querySelector('.cart-count');

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-count';
            cartLink.appendChild(badge);
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}

function updateCheckoutButton() {
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('₱', ''));
    const checkoutButton = document.querySelector('.btn-success');

    if (subtotal === 0) {
        checkoutButton.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Proceed to Shop';
        checkoutButton.onclick = () => window.location.href = 'index.html#featured-section';
    } else {
        checkoutButton.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Proceed to Checkout';
        checkoutButton.onclick = () => window.location.href = 'checkout.html';
    }
}

function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateTotals();
        updateCartCount();
    }
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateTotals();
    updateCartCount();
    showNotification('Item removed from cart');
}

document.addEventListener('DOMContentLoaded', loadCart);

// Cart functionality
function addToCart(productData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'error');
        setTimeout(() => {
            window.location.href = 'account.html';
        }, 3000);
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productData.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
        showNotification('Item quantity updated in cart');
    } else {
        cart.push({ ...productData, quantity: 1 });
        showNotification('Item added to cart');
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}


// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

function updateNavAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userIcon = document.querySelector('a[href="account.html"]');

    if (currentUser && userIcon) {
        // Transform user icon into logout button
        userIcon.href = '#';
        userIcon.title = 'Logout';
        userIcon.innerHTML = '<i class="fas fa-sign-out-alt" style="color: #ffffff;"></i>';
        userIcon.addEventListener('click', logout);
    } else if (userIcon) {
        // Reset to user icon
        userIcon.href = 'account.html';
        userIcon.title = 'Account';
        userIcon.innerHTML = '<i class="fas fa-user" style="color: #ffffff;"></i>';
        // Remove logout listener if exists
        userIcon.removeEventListener('click', logout);
    }
}

function logout(e) {
    e.preventDefault();

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // Save user-specific data under user ID
        const userId = currentUser.id;
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
        localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }

    // Clear current user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('favorites');
    localStorage.removeItem('cart');

    updateCartCount();
    updateFavoritesCount();
    updateNavAuth();
    showNotification('You have been logged out');
    setTimeout(() => {
        window.location.href = 'account.html';
    }, 3000);
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    updateNavAuth();
    updateCartCount();
    updateFavoritesCount();
});

// Show notification
function showNotification(message, type = 'success') {
    try {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification-popup');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification-popup ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Force reflow to trigger animation
        notification.offsetHeight;

        // Show notification
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

function searchBooks(query) {
    // Return empty array if no query
    if (!query) return [];

    query = query.toLowerCase().trim();

    // Search across multiple fields
    return books.filter(book => {
        const searchableFields = [
            book.title,
            book.author,
            book.genre,
            book.category
        ].map(field => (field || '').toLowerCase());

        // Check if query matches any field
        return searchableFields.some(field => field.includes(query));
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-wrapper input');
    const searchPopup = document.getElementById('search-popup');
    const resultsContent = document.getElementById('results-content');

    // Existing input event for live search
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value;
        const results = searchBooks(query);

        if (query.length > 0) {
            searchPopup.style.display = 'block';

            resultsContent.innerHTML = results.length ? results.map(book => `
                <div class="book-result">
                    <a style="text-decoration:none; color: black;" href="product-details.html?id=${book.id}">
                        <img src="${book.cover}" alt="${book.title}" class="book-result-image">
                    </a>
                    <div class="search-result-info">
                    <a style="text-decoration:none; color: black;" href="product.html?id=${book.id}">
                        <h4>${book.title}</h4>
                        <p><i>${book.author}</i></p>
                        <p class="fw-bold">${book.genre}</p>
                    </a>
                    </div>
                </div>
            `).join('') : '<p style="color: red">No results found. Please type in another term.</p>';
        } else {
            searchPopup.style.display = 'none';
        }
    });

    // Add enter key handler
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();

            if (query) {
                // Search across all fields
                const results = searchBooks(query);
                if (results.length > 0) {
                    // Navigate to results page with encoded query
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                } else {
                    // Show no results notification
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                }
            }
        }
    });

    // Close search popup when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchPopup.contains(e.target) && !searchInput.contains(e.target)) {
            searchPopup.style.display = 'none';
        }
    });
});
