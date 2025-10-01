// Universal navbar count management system
// This script handles favorites and cart count updates consistently across all pages

class NavbarCounts {
    constructor() {
        console.log('NavbarCounts constructor called');
        this.api = window.api;
        this.favoritesCountElement = null;
        this.cartCountElement = null;
        this.init();
    }

    async init() {
        console.log('NavbarCounts init called');
        // Wait for DOM and API to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }

        // Wait for API to be available
        await this.waitForAPI();
        
        // Initial count update
        console.log('Initial count update triggered');
        await this.updateAllCounts();
    }

    setupElements() {
        this.favoritesCountElement = document.getElementById('favorites-count');
        this.cartCountElement = document.getElementById('cart-count');
        console.log('Elements setup:', {
            favorites: !!this.favoritesCountElement,
            cart: !!this.cartCountElement
        });
    }

    setCartCount(count) {
        if (!this.cartCountElement) {
            this.setupElements();
        }
        if (this.cartCountElement) {
            this.cartCountElement.textContent = count;
            console.log('Cart count element updated to:', count);
        } else {
            console.log('Cart count element not found');
        }
    }

    async waitForAPI() {
        let attempts = 0;
        while (!this.api && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            this.api = window.api;
            attempts++;
        }
        if (!this.api) {
            console.warn('API not available for navbar counts');
        } else {
            console.log('API client found and ready');
        }
    }

    async updateFavoritesCount() {
        if (!this.favoritesCountElement) {
            this.setupElements();
        }

        try {
            if (!this.api || !this.api.isLoggedIn()) {
                const favoritesCount = 0;
                if (this.favoritesCountElement) {
                    this.favoritesCountElement.textContent = favoritesCount;
                }
                return;
            }

            const favorites = await this.api.getFavorites();
            const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;
            
            if (this.favoritesCountElement) {
                this.favoritesCountElement.textContent = favoritesCount;
            }
        } catch (error) {
            console.error('Error updating favorites count:', error);
            if (this.favoritesCountElement) {
                this.favoritesCountElement.textContent = '0';
            }
        }
    }

    async updateCartCount() {
        console.log('updateCartCount called');
        try {
            if (!this.api) {
                console.log('API client not available');
                this.setCartCount(0);
                return;
            }

            if (!this.api.isLoggedIn()) {
                console.log('User not logged in, setting cart count to 0');
                this.setCartCount(0);
                return;
            }

            console.log('Fetching cart items...');
            const cartItems = await this.api.getCart();
            console.log('Cart items received:', cartItems);
            let totalItems = 0;
            
            // API returns cart items directly as an array
            if (Array.isArray(cartItems)) {
                totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
                console.log('Calculated total items:', totalItems);
            } else {
                console.log('Invalid cart response format (expected array):', cartItems);
            }

            this.setCartCount(totalItems);
            console.log('Cart count updated to:', totalItems);
        } catch (error) {
            console.error('Error updating cart count:', error);
            this.setCartCount(0);
        }
    }

    async updateAllCounts() {
        console.log('updateAllCounts called');
        await Promise.all([
            this.updateFavoritesCount(),
            this.updateCartCount()
        ]);
    }

    // Public methods for external use
    async refreshFavorites() {
        await this.updateFavoritesCount();
    }

    async refreshCart() {
        await this.updateCartCount();
    }

    async refreshAll() {
        await this.updateAllCounts();
    }
}

// Create global instance
console.log('Creating global navbarCounts instance');
const navbarCounts = new NavbarCounts();

// Make functions globally available for backward compatibility
window.updateFavoritesCount = () => navbarCounts.refreshFavorites();
window.updateCartCount = () => navbarCounts.refreshCart();
window.updateAllCounts = () => navbarCounts.refreshAll();

// Export for use in other scripts
window.navbarCounts = navbarCounts;

// Add a test function for debugging
window.testCartCount = async function() {
    console.log('Testing cart count system...');
    if (window.navbarCounts) {
        await window.navbarCounts.refreshCart();
        console.log('Cart count refreshed');
    } else {
        console.log('navbarCounts not available');
    }
};

// Auto-refresh counts on authentication state changes
document.addEventListener('userLogin', () => navbarCounts.refreshAll());
document.addEventListener('userLogout', () => navbarCounts.refreshAll());