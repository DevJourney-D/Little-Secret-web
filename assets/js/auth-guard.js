/**
 * 🛡️ Authentication Guard
 * Helper functions for protecting pages and managing user sessions
 */

class AuthGuard {
    constructor(api = nekoAPI) {
        this.api = api;
        this.redirectPath = './index.html';
        this.loginPaths = ['index.html', 'login.html', 'register.html'];
    }

    /**
     * Protect a page - redirect to login if not authenticated
     */
    async protectPage() {
        console.log('🛡️ AuthGuard: Checking page protection...');
        
        try {
            const user = await this.api.autoLogin();
            
            if (!user) {
                console.log('🚫 AuthGuard: User not authenticated, redirecting to login');
                this.redirectToLogin();
                return false;
            }
            
            console.log('✅ AuthGuard: User authenticated, allowing access');
            return user;
        } catch (error) {
            console.error('❌ AuthGuard: Error during authentication check:', error);
            this.redirectToLogin();
            return false;
        }
    }

    /**
     * Redirect authenticated users away from login pages
     */
    async redirectIfAuthenticated() {
        console.log('🔄 AuthGuard: Checking if user should be redirected from login page...');
        
        const user = this.api.getCurrentUser();
        const token = this.api.getToken();
        
        if (user && token) {
            console.log('✅ AuthGuard: User already authenticated, redirecting to dashboard');
            window.location.href = './dashboard.html';
            return true;
        }
        
        return false;
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        console.log('🚪 AuthGuard: Redirecting to login page');
        setTimeout(() => {
            window.location.href = this.redirectPath;
        }, 100);
    }

    /**
     * Check if current page is a login page
     */
    isLoginPage() {
        const currentPage = window.location.pathname.split('/').pop();
        return this.loginPaths.includes(currentPage);
    }

    /**
     * Initialize authentication for the current page
     */
    async init() {
        console.log('🚀 AuthGuard: Initializing for page:', window.location.pathname);
        
        if (this.isLoginPage()) {
            return await this.redirectIfAuthenticated();
        } else {
            return await this.protectPage();
        }
    }

    /**
     * Set up automatic session validation
     */
    setupSessionCheck(intervalMinutes = 5) {
        console.log(`⏰ AuthGuard: Setting up session check every ${intervalMinutes} minutes`);
        
        setInterval(async () => {
            console.log('⏰ AuthGuard: Performing periodic session check...');
            
            if (!this.api.isAuthenticated()) {
                console.log('⚠️ AuthGuard: Session lost, redirecting to login');
                this.redirectToLogin();
                return;
            }

            try {
                const isValid = await this.api.validateSession();
                if (!isValid) {
                    console.log('⚠️ AuthGuard: Session invalid, redirecting to login');
                    this.redirectToLogin();
                }
            } catch (error) {
                console.error('❌ AuthGuard: Session validation failed:', error);
                this.redirectToLogin();
            }
        }, intervalMinutes * 60 * 1000);
    }
}

// Create global instance
const authGuard = new AuthGuard();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 Page loaded, initializing AuthGuard...');
    
    try {
        const user = await authGuard.init();
        
        if (user && !authGuard.isLoginPage()) {
            // Set up session monitoring for protected pages
            authGuard.setupSessionCheck(5);
            
            // Update UI with user info if elements exist
            updateUserUI(user);
        }
    } catch (error) {
        console.error('❌ AuthGuard initialization failed:', error);
    }
});

/**
 * Update UI elements with user information
 */
function updateUserUI(user) {
    // Update welcome messages
    const welcomeElements = document.querySelectorAll('[data-user-welcome]');
    welcomeElements.forEach(el => {
        el.textContent = `Welcome, ${user.display_name || user.username}!`;
    });

    // Update user name displays
    const nameElements = document.querySelectorAll('[data-user-name]');
    nameElements.forEach(el => {
        el.textContent = user.display_name || user.username;
    });

    // Update user email displays
    const emailElements = document.querySelectorAll('[data-user-email]');
    emailElements.forEach(el => {
        el.textContent = user.email;
    });

    // Show authenticated content
    const authElements = document.querySelectorAll('[data-auth-required]');
    authElements.forEach(el => {
        el.style.display = 'block';
    });

    console.log('✅ UI updated with user information');
}

/**
 * Global logout function
 */
function globalLogout() {
    console.log('🚪 Global logout initiated');
    nekoAPI.logout();
    window.location.href = './index.html';
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.authGuard = authGuard;
    window.updateUserUI = updateUserUI;
    window.globalLogout = globalLogout;
}

console.log('🛡️ AuthGuard loaded successfully!');
