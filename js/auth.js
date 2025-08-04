// Neko U Authentication System
// 🔥 New Backend API Integration with Cookie Storage

class NekoAuth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.autoLogoutTimer = null;
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.initPromise = this.init();
    }

    // Cookie management helper functions
    setCookie(name, value, hours = 24) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    // Start auto logout timer
    startAutoLogoutTimer() {
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
        }
        
        // Set logout time
        this.logoutTime = Date.now() + this.sessionDuration;
        
        this.autoLogoutTimer = setTimeout(() => {
            console.log('⏰ Session expired - Auto logout');
            if (typeof showAlert === 'function') {
                showAlert('เซสชันหมดอายุ กำลังออกจากระบบอัตโนมัติ', 'warning');
            }
            this.logoutToLogin();
        }, this.sessionDuration);
        
        console.log('⏱️ Auto logout timer started (5 minutes)');
        
        // Start countdown display
        this.startCountdownDisplay();
    }

    // Display countdown timer
    startCountdownDisplay() {
        const updateCountdown = () => {
            if (!this.logoutTime) return;
            
            const now = Date.now();
            const timeLeft = this.logoutTime - now;
            
            if (timeLeft <= 0) {
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Update display if element exists
            const timerElement = document.getElementById('timeRemaining');
            const sessionElement = document.getElementById('sessionTimer');
            
            if (timerElement) {
                timerElement.textContent = display;
            }
            
            if (sessionElement && this.token) {
                sessionElement.style.display = 'block';
            }
            
            // Show warning when less than 1 minute left
            if (timeLeft < 60000 && sessionElement) {
                sessionElement.className = 'alert alert-warning';
            }
        };
        
        // Update immediately and then every second
        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Reset timer on user activity
    resetAutoLogoutTimer() {
        if (this.token && this.currentUser) {
            // Clear old countdown
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
            }
            
            this.startAutoLogoutTimer();
            // Update cookie expiration
            this.setCookie('nekouToken', this.token, 5);
        }
    }

    async init() {
        // Load token from cookie instead of localStorage
        const savedToken = this.getCookie('nekouToken');
        
        if (savedToken) {
            this.token = savedToken;
            // Verify token with API and get fresh user data
            try {
                await this.validateAndRefreshUser();
                // Start auto logout timer for existing session
                this.startAutoLogoutTimer();
                // Set up activity listeners to reset timer
                this.setupActivityListeners();
            } catch (error) {
                console.warn('Token validation failed, logging out:', error);
                this.logoutToLogin();
            }
        }
    }

    // Validate token and get fresh user data from API
    async validateAndRefreshUser() {
        if (!this.token) {
            throw new Error('No token available');
        }
        
        try {
            // Get user data from cookie since we don't have a specific endpoint
            const userStr = this.getCookie('nekouUser');
            if (userStr) {
                this.currentUser = JSON.parse(userStr);
                console.log('✅ User data loaded from cookie:', this.currentUser);
                
                // Optionally verify with getUserById endpoint if needed
                if (this.currentUser.id) {
                    try {
                        const userResponse = await api.users.getById(this.currentUser.id);
                        if (userResponse.success) {
                            this.currentUser = userResponse.data;
                            this.setCookie('nekouUser', JSON.stringify(this.currentUser), 5);
                        }
                    } catch (error) {
                        console.warn('Failed to refresh user data from API, using cached data');
                    }
                }
                
                return this.currentUser;
            } else {
                throw new Error('No user data found in cookie');
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            throw error;
        }
    }

    // Set up activity listeners to reset auto logout timer
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        const resetTimer = () => this.resetAutoLogoutTimer();
        
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });
        
        console.log('👀 Activity listeners set up for auto logout reset');
    }
    // Login with username and password
    async login(username, password) {
        try {
            if (typeof showLoading === 'function') {
                showLoading('กำลังเข้าสู่ระบบ...', 'login');
            }
            
            console.log('🔐 Attempting login for:', username);
            
            // First check API health
            const healthCheck = await api.healthCheck();
            if (!healthCheck.healthy) {
                throw new Error('API Server ไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
            }
            
            const response = await api.auth.login(username, password);
            console.log('📥 Login response:', response);
            
            if (response.success && response.data) {
                // Save token and user data from API response
                this.token = response.data.token;
                this.currentUser = response.data.user;
                
                // Store in cookies with 5 minutes expiration
                this.setCookie('nekouToken', this.token, 5);
                this.setCookie('nekouUser', JSON.stringify(this.currentUser), 5);
                
                // Start auto logout timer
                this.startAutoLogoutTimer();
                // Set up activity listeners
                this.setupActivityListeners();
                
                console.log('✅ User logged in successfully:', this.currentUser);
                
                if (typeof showAlert === 'function') {
                    showAlert('เข้าสู่ระบบสำเร็จ! 🎉', 'success');
                }
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = CONFIG.redirectAfterLogin;
                }, 1500);
                
                return response;
            } else {
                throw new Error(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
            
            // Handle specific error types
            if (error.message.includes('Invalid credentials') || 
                error.message.includes('User not found') ||
                error.message.includes('Wrong password')) {
                errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            } else if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
                errorMessage = 'ปัญหา API Server: endpoint ไม่รองรับการล็อกอิน กรุณาติดต่อผู้ดูแล';
            } else if (error.message.includes('404') || error.message.includes('Not Found')) {
                errorMessage = 'ไม่พบ API endpoint กรุณาตรวจสอบการตั้งค่าเซิร์ฟเวอร์';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาใช้ http://localhost:3000';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
            } else if (error.message.includes('API Server ไม่พร้อมใช้งาน')) {
                errorMessage = error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (typeof showAlert === 'function') {
                showAlert(errorMessage, 'error');
            }
            throw error;
        } finally {
            if (typeof hideLoading === 'function') {
                hideLoading('login');
            }
        }
    }

    // Register new user
    async register(userData) {
        try {
            if (typeof showLoading === 'function') {
                showLoading('กำลังลงทะเบียน...', 'register');
            }
            
            // Validate data
            this.validateRegistrationData(userData);
            
            console.log('📝 Attempting registration for:', userData.username);
            const response = await api.auth.register(userData);
            console.log('📥 Registration response:', response);
            
            if (response.success && response.data) {
                if (typeof showAlert === 'function') {
                    showAlert('ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ... 🎉', 'success');
                }
                
                console.log('✅ User registered successfully:', response.data);
                
                // Auto login after successful registration
                setTimeout(async () => {
                    try {
                        await this.login(userData.username, userData.password);
                    } catch (loginError) {
                        console.error('Auto login failed:', loginError);
                        if (typeof showAlert === 'function') {
                            showAlert('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ', 'info');
                        }
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    }
                }, 1500);
                
                return response;
            } else {
                throw new Error(response.message || 'ลงทะเบียนไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'เกิดข้อผิดพลาดในการลงทะเบียน';
            
            // Handle specific error types
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate') ||
                error.message.includes('Username already taken')) {
                errorMessage = 'ชื่อผู้ใช้หรืออีเมลนี้มีคนใช้แล้ว กรุณาเลือกใหม่';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
            } else if (error.message.includes('Password too weak')) {
                errorMessage = 'รหัสผ่านไม่ปลอดภัยพอ กรุณาใช้รหัสผ่านที่แข็งแรงกว่า';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาใช้ http://localhost:3000';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (typeof showAlert === 'function') {
                showAlert(errorMessage, 'error');
            }
            throw error;
        } finally {
            if (typeof hideLoading === 'function') {
                hideLoading('register');
            }
        }
    }

    // Validate registration data
    validateRegistrationData(data) {
        if (!data.firstName || data.firstName.trim().length < 2) {
            throw new Error('กรุณากรอกชื่อที่มีความยาวอย่างน้อย 2 ตัวอักษร');
        }
        
        if (!data.lastName || data.lastName.trim().length < 2) {
            throw new Error('กรุณากรอกนามสกุลที่มีความยาวอย่างน้อย 2 ตัวอักษร');
        }
        
        if (!data.nickname || data.nickname.trim().length < 2) {
            throw new Error('กรุณากรอกชื่อเล่นที่มีความยาวอย่างน้อย 2 ตัวอักษร');
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            throw new Error('กรุณากรอกอีเมลที่ถูกต้อง');
        }
        
        if (!data.username || data.username.length < 3) {
            throw new Error('กรุณากรอกชื่อผู้ใช้ที่มีความยาวอย่างน้อย 3 ตัวอักษร');
        }
        
        if (!data.password || data.password.length < 6) {
            throw new Error('กรุณากรอกรหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        
        if (data.password !== data.confirmPassword) {
            throw new Error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        }
        
        if (!data.gender) {
            throw new Error('กรุณาเลือกเพศ');
        }

        if (!data.birthDate) {
            throw new Error('กรุณาเลือกวันเกิด');
        }
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Logout and redirect to login page
    logoutToLogin() {
        this.clearAuthData();
        
        console.log('🚪 Redirecting to login page');
        
        if (typeof showAlert === 'function') {
            showAlert('ออกจากระบบแล้ว กำลังกลับไปหน้าเข้าสู่ระบบ 👋', 'info');
        }
        
        setTimeout(() => {
            // Always redirect to login page
            window.location.href = 'index.html';
        }, 1500);
    }

    // Logout with configurable redirect
    logout(redirectTo = null) {
        this.clearAuthData();
        
        console.log('🚪 User logged out successfully');
        
        if (typeof showAlert === 'function') {
            showAlert('ออกจากระบบแล้ว 👋', 'info');
        }
        
        setTimeout(() => {
            if (redirectTo) {
                window.location.href = redirectTo;
            } else {
                // Default redirect based on current page
                const currentPath = window.location.pathname;
                if (currentPath.includes('/html/')) {
                    window.location.href = 'index.html'; // Login page
                } else {
                    window.location.href = 'html/index.html'; // From root to login
                }
            }
        }, 1500);
    }

    // Clear all authentication data
    clearAuthData() {
        // Clear timers
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
            this.autoLogoutTimer = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Hide session timer
        const sessionElement = document.getElementById('sessionTimer');
        if (sessionElement) {
            sessionElement.style.display = 'none';
        }
        
        // Clear instance variables
        this.currentUser = null;
        this.token = null;
        this.logoutTime = null;
        
        // Clear all auth-related cookies
        this.deleteCookie('nekouToken');
        this.deleteCookie('nekouUser');
        // Don't clear remember username on auto logout
        // this.deleteCookie('nekouRememberUsername');
    }

    // Check if user is authenticated
    async isAuthenticated() {
        const token = this.getCookie('nekouToken');
        
        if (!token) {
            return false;
        }
        
        // If we have a token but no user data, validate with API
        if (!this.currentUser) {
            try {
                this.token = token;
                await this.validateAndRefreshUser();
                // Restart timer for existing session
                this.startAutoLogoutTimer();
                return true;
            } catch (error) {
                console.warn('Authentication validation failed:', error);
                this.logoutToLogin();
                return false;
            }
        }
        
        return !!(this.token && this.currentUser);
    }

    // Get current user - always fetch fresh data from API if needed
    async getCurrentUser() {
        if (!this.currentUser && this.token) {
            try {
                await this.validateAndRefreshUser();
            } catch (error) {
                console.error('Failed to get current user:', error);
                this.logoutToLogin();
                return null;
            }
        }
        return this.currentUser;
    }
    
    // Get current user synchronously (from cache)
    getCurrentUserSync() {
        return this.currentUser;
    }

    // Get token
    getToken() {
        return this.token;
    }

    // Check username availability via API
    async checkUsername(username) {
        try {
            const response = await api.request(`/users/username/${encodeURIComponent(username)}`, {
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Username check error:', error);
            if (error.message.includes('CORS') || error.message.includes('network')) {
                return { available: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง' };
            }
            return { available: false, message: 'ไม่สามารถตรวจสอบชื่อผู้ใช้ได้' };
        }
    }

    // Check email availability via API
    async checkEmail(email) {
        try {
            const response = await api.request(`/users/email/${encodeURIComponent(email)}`, {
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Email check error:', error);
            if (error.message.includes('CORS') || error.message.includes('network')) {
                return { available: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง' };
            }
            return { available: false, message: 'ไม่สามารถตรวจสอบอีเมลได้' };
        }
    }
}

// Initialize auth system
const nekouAuth = new NekoAuth();

// Wait for auth initialization before using
window.addEventListener('DOMContentLoaded', async () => {
    await nekouAuth.initPromise;
    console.log('🔐 Neko U Auth System Ready');
});

// Utility functions for showing alerts and loading states
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertMessage');
    if (!alertContainer) return;
    
    const alertTypes = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
    };
    
    const alertClass = alertTypes[type] || alertTypes.info;
    
    alertContainer.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

function showLoading(message, buttonId) {
    const button = document.getElementById(buttonId + 'Btn');
    if (button) {
        button.disabled = true;
        const textSpan = button.querySelector('.register-text') || button.querySelector('.login-text');
        const loadingSpan = button.querySelector('.loading');
        
        if (textSpan) textSpan.style.display = 'none';
        if (loadingSpan) {
            loadingSpan.style.display = 'inline';
            loadingSpan.innerHTML = `<i class="bi bi-arrow-clockwise spinning"></i> ${message}`;
        }
    }
}

function hideLoading(buttonId) {
    const button = document.getElementById(buttonId + 'Btn');
    if (button) {
        button.disabled = false;
        const textSpan = button.querySelector('.register-text') || button.querySelector('.login-text');
        const loadingSpan = button.querySelector('.loading');
        
        if (textSpan) textSpan.style.display = 'inline';
        if (loadingSpan) loadingSpan.style.display = 'none';
    }
}

// Create global instance
const nekoAuth = new NekoAuth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NekoAuth, nekoAuth };
}

console.log('🔐 Neko U Auth System Loaded');
