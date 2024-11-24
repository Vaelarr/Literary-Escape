function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

function populateProductDetails() {
    const productId = getProductIdFromUrl();
    const product = books.find(book => book.id === productId);

    if (!product) {
        console.error('Product not found');
        return;
    }

    // Get all product elements
    const productSection = document.getElementById('product-show');
    const image = productSection.querySelector('.image');
    const title = productSection.querySelector('.title');
    const author = productSection.querySelector('.author');
    const description = productSection.querySelector('.description');
    const category = productSection.querySelector('.category');
    const genre = productSection.querySelector('.genre');
    const price = productSection.querySelector('.price');
    const addToCartBtn = productSection.querySelector('.add-to-cart-btn');
    const favoriteBtn = productSection.querySelector('.favorite-btn');

    // Populate product data
    image.src = product.cover || 'media/Discover/placeholder.png';
    image.alt = product.title;
    title.textContent = product.title;
    author.textContent = `Author: ${product.author}`;
    description.textContent = product.description;
    category.textContent = `Category: ${product.category}`;
    genre.textContent = `Genre: ${product.genre}`;
    price.textContent = `Price: ₱${product.price.toFixed(2)}`;

    // Add event listeners
    addToCartBtn.addEventListener('click', () => {
        const productData = {
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.cover
        };
        addToCart(productData);
    });

    favoriteBtn.addEventListener('click', () => {
        const productData = {
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.cover
        };
        toggleFavorite(favoriteBtn, productData);
    });

    // Set initial favorite state
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.some(item => item.id === product.id)) {
        favoriteBtn.querySelector('i').style.color = '#ff0000';
    }
}

document.addEventListener('DOMContentLoaded', populateProductDetails);
