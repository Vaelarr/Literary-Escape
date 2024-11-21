const navbarContainer = document.getElementById('navbar');
const audio = document.getElementById('bgMusic');
const audioControl = document.getElementById('audioControl');
const audioIcon = audioControl.querySelector('i');
const videoBtn = document.getElementById('videoBtn');
const videoContainer = document.getElementById('videoContainer');
const exitFullscreen = document.getElementById('exitFullscreen');
var featuredSection = document.getElementById("featured-section");

document.addEventListener('DOMContentLoaded', function () {
    const exploreLink = document.querySelector('.explore-link');

    exploreLink.addEventListener('click', function (e) {
        e.preventDefault();
        const showcaseSection = document.getElementById('showcase-section');
        if (showcaseSection) {
            showcaseSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

audio.volume = 0.2; // Set initial volume to 20%

window.addEventListener('load', () => {
    audio.pause();
});

audioControl.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        audioIcon.className = 'fas fa-volume-up';
    } else {
        audio.pause();
        audioIcon.className = 'fas fa-volume-mute';
    }
});

let scrollPosition = 0;

videoBtn.addEventListener('click', () => {
    scrollPosition = window.pageYOffset;
    navbarContainer.style.display = 'none';
    videoContainer.style.display = 'block';
    document.body.classList.add('video-open');
    document.body.style.top = `-${scrollPosition}px`;
    audio.pause();
});

exitFullscreen.addEventListener('click', () => {
    navbarContainer.style.display = 'block';
    videoContainer.style.display = 'none';
    document.body.classList.remove('video-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
});

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

function toggleFavorite(heartButton, productData) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const heartIcon = heartButton.querySelector('i');

    // Check if item is already in favorites
    const isFavorite = favorites.some(item => item.id === productData.id);

    if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter(item => item.id !== productData.id);
        heartIcon.style.color = '#000000';
    } else {
        // Add to favorites
        favorites.push(productData);
        heartIcon.style.color = '#ff0000';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

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

// Update toggleFavorite function
function toggleFavorite(heartButton, productData) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const heartIcon = heartButton.querySelector('i');
    const isFavorite = favorites.some(item => item.id === productData.id);

    if (isFavorite) {
        favorites = favorites.filter(item => item.id !== productData.id);
        heartIcon.style.color = '#000000';
    } else {
        favorites.push(productData);
        heartIcon.style.color = '#ff0000';
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
}

document.addEventListener('DOMContentLoaded', loadCart);

// Cart functionality
function addToCart(productData) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productData.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...productData, quantity: 1 });
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