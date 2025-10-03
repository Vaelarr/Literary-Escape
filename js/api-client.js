class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
        this.connectionTested = false;
    }

    // Test database connectivity
    async testConnection() {
        if (this.connectionTested) return true;
        
        try {
            console.log('Testing database connection...');
            const response = await fetch(`${this.baseURL}/test-db`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('Database connection test successful:', data);
                this.connectionTested = true;
                return true;
            } else {
                console.error('Database connection test failed:', data);
                return false;
            }
        } catch (error) {
            console.error('Database connection test error:', error);
            return false;
        }
    }

    // Helper method for making requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Only add authorization header if token exists and endpoint requires it
        const publicEndpoints = ['/test-db'];
        const isPublicBooksEndpoint = endpoint.startsWith('/books') && (options.method === 'GET' || !options.method);
        const isPublicEndpoint = publicEndpoints.some(publicEndpoint => 
            endpoint.startsWith(publicEndpoint) || endpoint === publicEndpoint
        ) || isPublicBooksEndpoint;

        console.log('API Request Debug:', {
            endpoint,
            method: options.method || 'GET',
            hasToken: !!this.token,
            isPublicEndpoint,
            isPublicBooksEndpoint
        });

        if (this.token && !isPublicEndpoint) {
            config.headers.Authorization = `Bearer ${this.token}`;
            console.log('Authorization header added');
        } else {
            console.log('No authorization header added:', {
                hasToken: !!this.token,
                isPublicEndpoint
            });
        }

        try {
            console.log(`Making API request to: ${endpoint}`);
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API request failed:', data);
                throw new Error(data.error || 'Request failed');
            }
            
            console.log(`API request successful: ${endpoint}`);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        console.log('Registering user:', { 
            username: userData.username, 
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name
        });
        
        try {
            const response = await this.makeRequest('/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            console.log('Registration successful');
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    async login(email, password) {
        console.log('Attempting login for:', email);
        const response = await this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response:', response);
        
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('Token stored successfully:', this.token ? 'Present' : 'Missing');
        } else {
            console.warn('No token in login response');
        }
        
        return response;
    }

    async adminLogin(email, password) {
        console.log('Attempting admin login for:', email);
        const response = await this.makeRequest('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        console.log('Admin login response:', response);
        
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('Admin token stored successfully:', this.token ? 'Present' : 'Missing');
        } else {
            console.warn('No token in admin login response');
        }
        
        return response;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // Book methods - these don't require authentication for viewing
    async getBooks(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.makeRequest(`/books?${params}`);
    }

    async getBook(id) {
        return this.makeRequest(`/books/${id}`);
    }

    async searchBooks(query) {
        return this.makeRequest(`/api/books?search=${encodeURIComponent(query)}`);
    }

    // Cart methods
    async getCart() {
        return this.makeRequest('/cart');
    }

    async addToCart(bookId, quantity = 1) {
        console.log(`Adding ${quantity} of book ${bookId} to cart`);
        return this.makeRequest('/cart', {
            method: 'POST',
            body: JSON.stringify({ bookId: parseInt(bookId), quantity: parseInt(quantity) })
        });
    }

    async updateCartItem(bookId, quantity) {
        console.log(`Updating cart item ${bookId} to quantity ${quantity}`);
        return this.makeRequest(`/cart/${bookId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: parseInt(quantity) })
        });
    }

    async removeFromCart(bookId) {
        return this.makeRequest(`/cart/${bookId}`, {
            method: 'DELETE'
        });
    }

    // Cart selection methods for checkout
    async updateCartSelection(bookId, selected) {
        return this.makeRequest(`/cart/${bookId}/select`, {
            method: 'PUT',
            body: JSON.stringify({ selected })
        });
    }

    async selectAllForCheckout() {
        return this.makeRequest('/cart/select-all', {
            method: 'POST'
        });
    }

    async deselectAllForCheckout() {
        return this.makeRequest('/cart/deselect-all', {
            method: 'POST'
        });
    }

    async getSelectedCartItems() {
        return this.makeRequest('/cart/selected');
    }

    async getSelectedCartTotal() {
        return this.makeRequest('/cart/selected/total');
    }

    // Favorites methods
    async getFavorites() {
        return this.makeRequest('/favorites');
    }

    async addToFavorites(bookId) {
        return this.makeRequest('/favorites', {
            method: 'POST',
            body: JSON.stringify({ bookId })
        });
    }

    async removeFromFavorites(bookId) {
        return this.makeRequest(`/favorites/${bookId}`, {
            method: 'DELETE'
        });
    }

    // Order methods
    async createOrder(payload) {
        return this.makeRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async getOrders() {
        return this.makeRequest('/orders');
    }

    // User profile methods
    async getUserProfile() {
        return this.makeRequest('/user/profile');
    }

    // Check if current user is admin
    async isAdmin() {
        try {
            const profile = await this.getUserProfile();
            return profile && profile.role === 'admin';
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    async updateUserProfile(profileData) {
        return this.makeRequest('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.makeRequest('/user/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Address methods
    async getUserAddresses() {
        return this.makeRequest('/user/addresses');
    }

    async saveUserAddress(addressData) {
        return this.makeRequest('/user/addresses', {
            method: 'POST',
            body: JSON.stringify(addressData)
        });
    }

    async setDefaultAddress(addressId) {
        return this.makeRequest(`/user/addresses/${addressId}/default`, {
            method: 'PUT'
        });
    }

    async deleteUserAddress(addressId) {
        return this.makeRequest(`/user/addresses/${addressId}`, {
            method: 'DELETE'
        });
    }

    // Enhanced order methods
    async getOrderDetails(orderId) {
        return this.makeRequest(`/orders/${orderId}`);
    }

    // Admin orders
    async adminListOrders() {
        return this.makeRequest('/admin/orders');
    }

    async adminUpdateOrder(id, fields) {
        return this.makeRequest(`/admin/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(fields)
        });
    }

    async adminDeleteOrder(id) {
        return this.makeRequest(`/admin/orders/${id}`, {
            method: 'DELETE'
        });
    }

    async adminGetUserOrders(userId) {
        return this.makeRequest(`/admin/users/${userId}/orders`);
    }

    // Get detailed order information for admin
    async adminGetOrderDetails(orderId) {
        return this.makeRequest(`/admin/orders/${orderId}/details`);
    }

    // Admin book methods
    async adminCreateBook(book) {
        console.log('Admin creating book:', book);
        console.log('Current token:', this.token ? 'Present' : 'Missing');
        return this.makeRequest('/books', {
            method: 'POST',
            body: JSON.stringify(book)
        });
    }

    async adminUpdateBook(id, book) {
        console.log('Admin updating book ID:', id, 'with data:', book);
        console.log('Current token:', this.token ? 'Present' : 'Missing');
        return this.makeRequest(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(book)
        });
    }

    async adminDeleteBook(id) {
        console.log('Admin deleting book ID:', id);
        console.log('Current token:', this.token ? 'Present' : 'Missing');
        return this.makeRequest(`/books/${id}`, {
            method: 'DELETE'
        });
    }

    // Admin user methods
    async adminListUsers() {
        return this.makeRequest('/users');
    }

    async adminDeleteUser(id) {
        return this.makeRequest(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Utility methods
    isLoggedIn() {
        const hasToken = !!this.token;
        console.log('Login status check:', { hasToken, token: this.token ? 'Present' : 'Missing' });
        return hasToken;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('Current user:', user);
        return user;
    }

    // Archive methods
    async archiveBook(bookId) {
        return this.makeRequest(`/admin/books/${bookId}/archive`, {
            method: 'POST'
        });
    }

    async unarchiveBook(bookId) {
        return this.makeRequest(`/admin/books/${bookId}/unarchive`, {
            method: 'POST'
        });
    }

    async archiveUser(userId) {
        return this.makeRequest(`/admin/users/${userId}/archive`, {
            method: 'POST'
        });
    }

    async unarchiveUser(userId) {
        return this.makeRequest(`/admin/users/${userId}/unarchive`, {
            method: 'POST'
        });
    }

    async archiveOrder(orderId) {
        return this.makeRequest(`/admin/orders/${orderId}/archive`, {
            method: 'POST'
        });
    }

    async unarchiveOrder(orderId) {
        return this.makeRequest(`/admin/orders/${orderId}/unarchive`, {
            method: 'POST'
        });
    }

    // Get archived items
    async getArchivedBooks(page = 1, limit = 10) {
        return this.makeRequest(`/admin/books/archived?page=${page}&limit=${limit}`);
    }

    async getArchivedUsers(page = 1, limit = 10) {
        return this.makeRequest(`/admin/users/archived?page=${page}&limit=${limit}`);
    }

    async getArchivedOrders(page = 1, limit = 10) {
        return this.makeRequest(`/admin/orders/archived?page=${page}&limit=${limit}`);
    }

    // Get all items for admin (non-archived)
    async getAllBooksForAdmin(page = 1, limit = 10) {
        return this.makeRequest(`/admin/books?page=${page}&limit=${limit}`);
    }

    async getAllUsersForAdmin(page = 1, limit = 10) {
        return this.makeRequest(`/admin/users?page=${page}&limit=${limit}`);
    }

    async getAllOrdersForAdmin(page = 1, limit = 10) {
        return this.makeRequest(`/admin/orders?page=${page}&limit=${limit}`);
    }

    async validateVoucher(code) {
        return this.makeRequest('/vouchers/validate', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }
}

// Create global API client instance
console.log('Initializing API client...');
const api = new APIClient();

// Make API client globally accessible
window.api = api;

// Test connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await api.testConnection();
        console.log('API client ready');
    } catch (error) {
        console.warn('API client initialization warning:', error);
    }
});
