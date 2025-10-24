/**
 * Alternative API Client Configuration for PHP Backend
 * 
 * OPTION 1: Replace the baseURL in your existing api-client.js
 * Change line ~11 in js/api-client.js:
 * 
 * FROM:
 *   this.baseURL = isLocalhost 
 *       ? 'http://localhost:3000/api'
 *       : '/api';
 * 
 * TO (for PHP backend):
 *   this.baseURL = isLocalhost 
 *       ? 'http://localhost/php/api'
 *       : '/php/api';
 * 
 * ---------------------------------------------------
 * 
 * OPTION 2: Create a dual-backend setup
 * You can keep both backends and switch between them:
 */

class DualAPIClient extends APIClient {
    constructor(usePhpBackend = false) {
        super();
        
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        if (usePhpBackend) {
            // PHP/MySQL Backend
            this.baseURL = isLocalhost 
                ? 'http://localhost/php/api'
                : '/php/api';
            console.log('🐘 Using PHP Backend (MySQL)');
        } else {
            // Node.js/Turso Backend (default)
            this.baseURL = isLocalhost 
                ? 'http://localhost:3000/api'
                : '/api';
            console.log('🟢 Using Node.js Backend (Turso)');
        }
        
        console.log('API Client initialized with baseURL:', this.baseURL);
    }
}

/**
 * OPTION 3: Environment-based switching
 * Add to your HTML pages before api-client.js:
 */

// <script>
//     // Set this to true to use PHP backend, false for Node.js
//     window.USE_PHP_BACKEND = true;
// </script>

/**
 * Then modify api-client.js constructor to check this flag:
 * 
 * constructor() {
 *     const isLocalhost = window.location.hostname === 'localhost' || 
 *                        window.location.hostname === '127.0.0.1' ||
 *                        window.location.hostname === '';
 *     
 *     const usePhp = window.USE_PHP_BACKEND || false;
 *     
 *     this.baseURL = isLocalhost 
 *         ? (usePhp ? 'http://localhost/php/api' : 'http://localhost:3000/api')
 *         : (usePhp ? '/php/api' : '/api');
 *     
 *     console.log(`Using ${usePhp ? 'PHP' : 'Node.js'} backend:`, this.baseURL);
 *     
 *     this.token = localStorage.getItem('authToken');
 *     this.connectionTested = false;
 *     this.checkAndClearAdminToken();
 * }
 */

/**
 * OPTION 4: URL Parameter switching
 * Access your site with ?backend=php or ?backend=node
 * Add this to api-client.js constructor:
 */

// constructor() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const backendParam = urlParams.get('backend');
//     
//     const isLocalhost = window.location.hostname === 'localhost' || 
//                        window.location.hostname === '127.0.0.1' ||
//                        window.location.hostname === '';
//     
//     let usePhp = false;
//     
//     if (backendParam === 'php') {
//         usePhp = true;
//         localStorage.setItem('preferredBackend', 'php');
//     } else if (backendParam === 'node') {
//         usePhp = false;
//         localStorage.setItem('preferredBackend', 'node');
//     } else {
//         usePhp = localStorage.getItem('preferredBackend') === 'php';
//     }
//     
//     this.baseURL = isLocalhost 
//         ? (usePhp ? 'http://localhost/php/api' : 'http://localhost:3000/api')
//         : (usePhp ? '/php/api' : '/api');
//     
//     console.log(`Using ${usePhp ? 'PHP/MySQL' : 'Node.js/Turso'} backend:`, this.baseURL);
//     
//     this.token = localStorage.getItem('authToken');
//     this.connectionTested = false;
//     this.checkAndClearAdminToken();
// }

/**
 * RECOMMENDED APPROACH:
 * 
 * For development, use OPTION 4 (URL parameter switching)
 * For production, use OPTION 1 (simple baseURL change)
 * 
 * This allows you to:
 * - Test both backends easily
 * - Keep existing functionality
 * - Switch seamlessly
 * - No code duplication
 */
