/**
 * 🐱 Neko U API Helper
 * Simple JavaScript library for frontend integration
 * Version: 2.0.0
 */

class NekoUAPI {
    constructor(options = {}) {
        this.baseURL = options.baseURL || 'https://little-secret-api.vercel.app';
        this.tokenKey = options.tokenKey || 'nekouToken';
        this.userKey = options.userKey || 'nekouUser';
        this.timeout = options.timeout || 10000;
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    /**
     * Get JWT token from localStorage
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Set JWT token to localStorage
     */
    setToken(token) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
            console.log('🔑 Token stored in localStorage');
        } else {
            console.error('❌ Attempted to store null/undefined token');
        }
    }

    /**
     * Remove JWT token
     */
    removeToken() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        console.log('🗑️ Tokens and user data removed from localStorage');
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Set current user data
     */
    setCurrentUser(userData) {
        if (userData) {
            localStorage.setItem(this.userKey, JSON.stringify(userData));
            console.log('👤 User data stored in localStorage:', userData.username || userData.email);
        } else {
            console.error('❌ Attempted to store null/undefined user data');
        }
    }

    /**
     * Base request method
     */
    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const config = {
            method: 'GET',
            headers,
            ...options
        };

        try {
            console.log(`🌐 API Request: ${config.method} ${endpoint}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ API Response:`, data);
            return data;

        } catch (error) {
            console.error(`❌ API Error: ${endpoint}`, error);
            
            // Handle specific error cases
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                console.warn('🚨 Authentication error detected, clearing tokens and redirecting...');
                this.removeToken();
                
                // Only redirect if we're not already on a login page
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.includes('register.html') &&
                    !window.location.pathname.includes('login.html')) {
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 1000);
                }
            }
            
            throw error;
        }
    }

    // ============================================
    // AUTHENTICATION METHODS
    // ============================================

    /**
     * User registration
     */
    async register(userData) {
        const response = await this.request('/api/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.token) {
            console.log('🔑 Saving token to localStorage:', response.token);
            console.log('👤 Saving user data to localStorage:', response.user);
            
            this.setToken(response.token);
            this.setCurrentUser(response.user);
            
            // Verify storage was successful
            const savedToken = this.getToken();
            const savedUser = this.getCurrentUser();
            console.log('✅ Token saved successfully:', !!savedToken);
            console.log('✅ User data saved successfully:', !!savedUser);
        } else {
            console.error('❌ Registration response missing token or user data:', response);
        }

        return response;
    }

    /**
     * User login
     */
    async login(username, password) {
        const response = await this.request('/api/users/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success && response.token) {
            console.log('🔑 Saving token to localStorage:', response.token);
            console.log('👤 Saving user data to localStorage:', response.user);
            
            this.setToken(response.token);
            this.setCurrentUser(response.user);
            
            // Verify storage was successful
            const savedToken = this.getToken();
            const savedUser = this.getCurrentUser();
            console.log('✅ Token saved successfully:', !!savedToken);
            console.log('✅ User data saved successfully:', !!savedUser);
        } else {
            console.error('❌ Login response missing token or user data:', response);
        }

        return response;
    }

    /**
     * User logout
     */
    logout() {
        this.removeToken();
        console.log('🚪 User logged out');
    }

    /**
     * Check if username is available
     */
    async checkUsername(username) {
        return this.request(`/api/users/check-username/${encodeURIComponent(username)}`);
    }

    /**
     * Check if email is available
     */
    async checkEmail(email) {
        return this.request(`/api/users/check-email/${encodeURIComponent(email)}`);
    }

    // ============================================
    // USER METHODS
    // ============================================

    /**
     * Get user profile
     */
    async getUser(userId) {
        return this.request(`/api/users/${userId}`);
    }

    /**
     * Update user profile
     */
    async updateUser(userId, userData) {
        return this.request(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Generate partner code
     */
    async generatePartnerCode(userId) {
        return this.request(`/api/users/${userId}/partner-code`, {
            method: 'POST'
        });
    }

    /**
     * Connect with partner
     */
    async connectPartner(userId, partnerCode) {
        return this.request(`/api/users/${userId}/connect-partner`, {
            method: 'POST',
            body: JSON.stringify({ partnerCode })
        });
    }

    /**
     * Get dashboard data
     */
    async getDashboard(userId) {
        return this.request(`/api/users/${userId}/dashboard`);
    }

    // ============================================
    // DIARY METHODS
    // ============================================

    /**
     * Get all user diaries
     */
    async getDiaries(userId, options = {}) {
        const params = new URLSearchParams(options);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/api/diary/${userId}${query}`);
    }

    /**
     * Create new diary
     */
    async createDiary(userId, diaryData) {
        return this.request(`/api/diary/${userId}`, {
            method: 'POST',
            body: JSON.stringify(diaryData)
        });
    }

    /**
     * Get specific diary
     */
    async getDiary(userId, diaryId) {
        return this.request(`/api/diary/${userId}/${diaryId}`);
    }

    /**
     * Update diary
     */
    async updateDiary(userId, diaryId, diaryData) {
        return this.request(`/api/diary/${userId}/${diaryId}`, {
            method: 'PUT',
            body: JSON.stringify(diaryData)
        });
    }

    /**
     * Delete diary
     */
    async deleteDiary(userId, diaryId) {
        return this.request(`/api/diary/${userId}/${diaryId}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // TODO METHODS
    // ============================================

    /**
     * Get all user todos
     */
    async getTodos(userId, options = {}) {
        const params = new URLSearchParams(options);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/api/todo/${userId}${query}`);
    }

    /**
     * Create new todo
     */
    async createTodo(userId, todoData) {
        return this.request(`/api/todo/${userId}`, {
            method: 'POST',
            body: JSON.stringify(todoData)
        });
    }

    /**
     * Update todo
     */
    async updateTodo(userId, todoId, todoData) {
        return this.request(`/api/todo/${userId}/${todoId}`, {
            method: 'PUT',
            body: JSON.stringify(todoData)
        });
    }

    /**
     * Toggle todo completion
     */
    async toggleTodo(userId, todoId) {
        return this.request(`/api/todo/${userId}/${todoId}/toggle`, {
            method: 'PATCH'
        });
    }

    /**
     * Delete todo
     */
    async deleteTodo(userId, todoId) {
        return this.request(`/api/todo/${userId}/${todoId}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // CHAT METHODS
    // ============================================

    /**
     * Get chat messages
     */
    async getMessages(userId, options = {}) {
        const params = new URLSearchParams(options);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/api/chat/${userId}/messages${query}`);
    }

    /**
     * Send message
     */
    async sendMessage(userId, messageData) {
        return this.request(`/api/chat/${userId}/send`, {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(userId) {
        return this.request(`/api/chat/${userId}/unread-count`);
    }

    // ============================================
    // POMODORO METHODS
    // ============================================

    /**
     * Start pomodoro session
     */
    async startPomodoro(userId, sessionData) {
        return this.request(`/api/users/${userId}/pomodoro/start`, {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }

    /**
     * Get current pomodoro session
     */
    async getCurrentPomodoro(userId) {
        return this.request(`/api/users/${userId}/pomodoro/current`);
    }

    /**
     * Complete pomodoro session
     */
    async completePomodoro(userId, sessionId) {
        return this.request(`/api/users/${userId}/pomodoro/${sessionId}/complete`, {
            method: 'POST'
        });
    }

    /**
     * Get pomodoro history
     */
    async getPomodoroHistory(userId) {
        return this.request(`/api/users/${userId}/pomodoro/history`);
    }

    // ============================================
    // MATH METHODS
    // ============================================

    /**
     * Generate math problem
     */
    async generateMathProblem(userId, options = {}) {
        return this.request(`/api/math/${userId}/generate`, {
            method: 'POST',
            body: JSON.stringify(options)
        });
    }

    /**
     * Submit math answer
     */
    async submitMathAnswer(userId, answerData) {
        return this.request(`/api/math/${userId}/submit`, {
            method: 'POST',
            body: JSON.stringify(answerData)
        });
    }

    /**
     * Get math stats
     */
    async getMathStats(userId) {
        return this.request(`/api/math/${userId}/stats`);
    }

    // ============================================
    // NEKO CHAT METHODS
    // ============================================

    /**
     * Chat with Neko AI
     */
    async chatWithNeko(userId, message) {
        return this.request(`/api/neko/${userId}/chat`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    /**
     * Get morning greeting from Neko
     */
    async getNekoGreeting(userId) {
        return this.request(`/api/neko/${userId}/greeting`);
    }

    /**
     * Get Neko conversation history
     */
    async getNekoConversations(userId) {
        return this.request(`/api/neko/${userId}/conversations`);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        const hasAuth = !!(token && user);
        console.log(`🔍 Authentication check: ${hasAuth ? 'Authenticated' : 'Not authenticated'}`);
        if (hasAuth) {
            console.log(`👤 Current user: ${user.username || user.email}`);
        }
        return hasAuth;
    }

    /**
     * Validate current session
     */
    async validateSession() {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            const user = this.getCurrentUser();
            // Try to fetch current user data to validate token
            const response = await this.getUser(user.id);
            return response.success;
        } catch (error) {
            console.warn('🚨 Session validation failed:', error.message);
            this.removeToken();
            return false;
        }
    }

    /**
     * Auto-login check on page load
     */
    async autoLogin() {
        console.log('🔍 Checking for existing authentication...');
        
        if (this.isAuthenticated()) {
            const isValid = await this.validateSession();
            if (isValid) {
                console.log('✅ Auto-login successful');
                return this.getCurrentUser();
            } else {
                console.log('❌ Session expired, clearing tokens');
                this.removeToken();
                return null;
            }
        } else {
            console.log('ℹ️ No existing authentication found');
            return null;
        }
    }

    /**
     * Format date for API
     */
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toISOString().split('T')[0];
    }

    /**
     * Handle API errors globally
     */
    handleError(error, context = '') {
        console.error(`API Error${context ? ` (${context})` : ''}:`, error);
        
        // Show user-friendly error messages
        if (error.message.includes('Network')) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
        } else if (error.message.includes('timeout')) {
            alert('การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
        } else {
            alert(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * Debug localStorage contents
     */
    debugAuth() {
        console.log('🔍 Authentication Debug Info:');
        console.log('Token exists:', !!this.getToken());
        console.log('Token value:', this.getToken()?.substring(0, 20) + '...');
        console.log('User exists:', !!this.getCurrentUser());
        console.log('User data:', this.getCurrentUser());
        console.log('Is authenticated:', this.isAuthenticated());
    }

    /**
     * Force logout and clear all data
     */
    forceLogout() {
        console.log('🚪 Force logout initiated');
        this.removeToken();
        window.location.reload();
    }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

// Create global instance
const nekoAPI = new NekoUAPI();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NekoUAPI;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.NekoUAPI = NekoUAPI;
    window.nekoAPI = nekoAPI;
}

console.log('🐱 Neko U API Helper loaded successfully!');
