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

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cartItems');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center">Your cart is empty</p>';
        updateTotals(); // Add this to ensure totals are updated when cart becomes empty
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

function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
    }
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateTotals();  // Add this
    updateCartCount(); // Add this to update badge
}

function updateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 50 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
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