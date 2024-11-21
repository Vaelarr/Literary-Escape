var cards = document.querySelectorAll('.product-box');

[...cards].forEach((card) => {
    card.addEventListener('mouseover', function () {
        card.classList.add('is-hover');
    })
    card.addEventListener('mouseleave', function () {
        card.classList.remove('is-hover');
    })
})

document.addEventListener('DOMContentLoaded', function () {
    const showMoreBtn = document.querySelector('[data-bs-target="#showMoreProducts"]');
    const showMoreText = showMoreBtn.querySelector('.show-more');
    const showLessText = showMoreBtn.querySelector('.show-less');

    document.getElementById('showMoreProducts').addEventListener('shown.bs.collapse', function () {
        showMoreText.classList.add('d-none');
        showLessText.classList.remove('d-none');
    });

    document.getElementById('showMoreProducts').addEventListener('hidden.bs.collapse', function () {
        showMoreText.classList.remove('d-none');
        showLessText.classList.add('d-none');
    });
});

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const container = document.getElementById('favoritesContainer');

    if (favorites.length === 0) {
        container.innerHTML = '<p class="text-center">No favorites added yet</p>';
        return;
    }

    container.innerHTML = favorites.map((item, index) => `
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
        </div>
    `).join('');
}

function removeFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    updateFavoritesCount()
    showNotification('Item removed from favorites');
}

function addToCartFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const item = favorites[index];
    addToCart(item);
    updateCartCount();
    showNotification('Item added to cart');
}

document.addEventListener('DOMContentLoaded', loadFavorites);

document.querySelectorAll('.product-box').forEach(productBox => {
    const heartButton = productBox.querySelector('.icons a:first-child');
    const productData = {
        id: Date.now() + Math.random(), // Unique identifier
        name: productBox.querySelector('.product-name h4').textContent,
        price: parseFloat(productBox.querySelector('.product-price span').textContent),
        image: productBox.querySelector('img').src
    };

    // Set initial heart color
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.some(item => item.name === productData.name)) {
        heartButton.querySelector('i').style.color = '#ff0000';
    }

    heartButton.addEventListener('click', function (e) {
        e.preventDefault();
        toggleFavorite(this, productData);
    });
});

function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const count = favorites.length;
    const favoritesLink = document.querySelector('a[href="favorites.html"]');
    let badge = favoritesLink.querySelector('.favorites-count');

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'favorites-count';
            badge.style.cssText = `
                position: absolute;
                top: -10px;
                right: -10px;
                background-color: #16423C;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 12px;
                min-width: 18px;
                height: 18px;
                text-align: center;
                line-height: 14px;
                z-index: 5;
            `;
            favoritesLink.appendChild(badge);
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}


function toggleFavorite(heartButton, productData) {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'account.html';
        return;
    }

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const heartIcon = heartButton.querySelector('i');
    const isFavorite = favorites.some(item => item.id === productData.id);

    if (isFavorite) {
        favorites = favorites.filter(item => item.id !== productData.id);
        heartIcon.style.color = '#000000';
        showNotification('Item removed from favorites');
    } else {
        favorites.push(productData);
        heartIcon.style.color = '#ff0000';
        showNotification('Item added to favorites');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Update HTML for favorites link in navbar
document.querySelector('.nav-icons a:first-child').href = 'favorites.html';

// Initialize favorites count on page load
document.addEventListener('DOMContentLoaded', function () {
    updateFavoritesCount();
    updateCartCount();
});

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
        checkoutButton.onclick = () => window.location.href = 'index.html';
    } else {
        checkoutButton.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Proceed to Checkout';
        checkoutButton.onclick = null;
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
        window.location.href = 'account.html';
        showNotification('Please login to add items to cart', 'error');
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

// Add click event listeners to all "Add to Cart" buttons
document.querySelectorAll('.cart-btn button').forEach(button => {
    button.addEventListener('click', function (e) {
        const productBox = this.closest('.product-box');
        const productData = {
            id: Date.now(), // Unique identifier
            name: productBox.querySelector('.product-name h4').textContent,
            price: parseFloat(productBox.querySelector('.product-price span').textContent),
            image: productBox.querySelector('img').src
        };
        addToCart(productData);
    });
});

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

    // Clear all user-specific data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('favorites');
    localStorage.removeItem('cart');

    updateNavAuth();
    updateCartCount();
    updateFavoritesCount();

    window.location.href = 'account.html';
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    updateNavAuth();
    updateCartCount();
    updateFavoritesCount();
});

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
