// Neko U - Complete API Functions Implementation
// ฟังก์ชันสำหรับใช้งาน API endpoints ทั้งหมด

class NekoUAPI {
    constructor() {
        // Use the same logic as config.js for API base URL
        this.baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || 3000}`  // Development proxy
            : 'https://little-secret-api.vercel.app';  // Production
        this.token = localStorage.getItem('nekouToken');
    }

    // Helper method for making API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (this.token) {
            defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            mode: 'cors',
            credentials: 'omit',
            headers: defaultHeaders,
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        };

        try {
            console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            console.log(`✅ API Response:`, data);
            return data;
        } catch (error) {
            console.error(`❌ API Error: ${endpoint}`, error);
            throw error;
        }
    }

    // Update token
    setToken(token) {
        this.token = token;
        localStorage.setItem('nekouToken', token);
    }

    // 🌟 GENERAL
    async healthCheck() {
        return this.request('/api/health');
    }

    // 👤 USER MANAGEMENT
    // Public Endpoints (No Auth Required)
    async registerUser(userData) {
        return this.request('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async loginUser(username, password) {
        return this.request('/api/users/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async checkEmail(email) {
        return this.request(`/api/users/email/${encodeURIComponent(email)}`);
    }

    async checkUsername(username) {
        return this.request(`/api/users/username/${encodeURIComponent(username)}`);
    }

    // Protected Endpoints (Auth Required)
    async getUserById(userId) {
        return this.request(`/api/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.request(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.request(`/api/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async setOnlineStatus(userId, status) {
        return this.request(`/api/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async updatePreferences(userId, preferences) {
        return this.request(`/api/users/${userId}/preferences`, {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async generatePartnerCode(userId) {
        return this.request(`/api/users/${userId}/generate-partner-code`, {
            method: 'POST'
        });
    }

    async connectWithPartner(userId, partnerCode) {
        return this.request(`/api/users/${userId}/connect-partner`, {
            method: 'POST',
            body: JSON.stringify({ partner_code: partnerCode })
        });
    }

    async searchUsers(currentUserId, query) {
        return this.request(`/api/users/${currentUserId}/search?q=${encodeURIComponent(query)}`);
    }

    async getActivityLogs(userId) {
        return this.request(`/api/users/${userId}/activity-logs`);
    }

    // 📝 DIARY MANAGEMENT
    // CRUD Operations
    async createDiary(userId, diaryData) {
        return this.request(`/api/${userId}/diaries`, {
            method: 'POST',
            body: JSON.stringify(diaryData)
        });
    }

    async getUserDiaries(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/${userId}/diaries${queryString ? '?' + queryString : ''}`);
    }

    async getDiaryById(userId, diaryId) {
        return this.request(`/api/${userId}/diaries/${diaryId}`);
    }

    async updateDiary(userId, diaryId, diaryData) {
        return this.request(`/api/${userId}/diaries/${diaryId}`, {
            method: 'PUT',
            body: JSON.stringify(diaryData)
        });
    }

    async deleteDiary(userId, diaryId) {
        return this.request(`/api/${userId}/diaries/${diaryId}`, {
            method: 'DELETE'
        });
    }

    // Special Features
    async getSharedDiaries(userId) {
        return this.request(`/api/${userId}/diaries/shared`);
    }

    async getRecentDiaries(userId) {
        return this.request(`/api/${userId}/diaries/recent`);
    }

    async getDiaryStats(userId) {
        return this.request(`/api/${userId}/diaries/stats`);
    }

    async exportDiaries(userId) {
        return this.request(`/api/${userId}/diaries/export`);
    }

    async addDiaryReaction(userId, diaryId, reaction) {
        return this.request(`/api/${userId}/diaries/${diaryId}/reaction`, {
            method: 'POST',
            body: JSON.stringify({ reaction })
        });
    }

    // Filtering & Search
    async getDiariesByCategory(userId, category) {
        return this.request(`/api/${userId}/diaries/category/${encodeURIComponent(category)}`);
    }

    async getDiariesByMood(userId, mood) {
        return this.request(`/api/${userId}/diaries/mood/${encodeURIComponent(mood)}`);
    }

    async searchDiaries(userId, query) {
        return this.request(`/api/${userId}/diaries/search?q=${encodeURIComponent(query)}`);
    }

    // 💬 CHAT MANAGEMENT
    // Messaging
    async sendMessage(userId, messageData) {
        return this.request(`/api/${userId}/messages`, {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async getMessages(userId, partnerId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/${userId}/messages/${partnerId}${queryString ? '?' + queryString : ''}`);
    }

    async getLatestMessages(userId) {
        return this.request(`/api/${userId}/messages/latest`);
    }

    async updateMessage(userId, messageId, messageData) {
        return this.request(`/api/${userId}/messages/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify(messageData)
        });
    }

    async deleteMessage(userId, messageId) {
        return this.request(`/api/${userId}/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    // Message Features
    async getUnreadCount(userId) {
        return this.request(`/api/${userId}/messages/unread-count`);
    }

    async markAsRead(userId, messageIds) {
        return this.request(`/api/${userId}/messages/mark-read`, {
            method: 'POST',
            body: JSON.stringify({ message_ids: messageIds })
        });
    }

    async addMessageReaction(userId, messageId, reaction) {
        return this.request(`/api/${userId}/messages/${messageId}/reaction`, {
            method: 'POST',
            body: JSON.stringify({ reaction })
        });
    }

    async removeMessageReaction(userId, messageId) {
        return this.request(`/api/${userId}/messages/${messageId}/reaction`, {
            method: 'DELETE'
        });
    }

    // Analytics & Export
    async getChatStats(userId) {
        return this.request(`/api/${userId}/messages/stats`);
    }

    async getChatMedia(userId) {
        return this.request(`/api/${userId}/messages/media`);
    }

    async exportMessages(userId) {
        return this.request(`/api/${userId}/messages/export`);
    }

    async getConversationSummary(userId) {
        return this.request(`/api/${userId}/messages/summary`);
    }

    async searchMessages(userId, query) {
        return this.request(`/api/${userId}/messages/search?q=${encodeURIComponent(query)}`);
    }

    // ✅ TODO MANAGEMENT
    // CRUD Operations
    async createTodo(userId, todoData) {
        return this.request(`/api/${userId}/todos`, {
            method: 'POST',
            body: JSON.stringify(todoData)
        });
    }

    async getUserTodos(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/${userId}/todos${queryString ? '?' + queryString : ''}`);
    }

    async getTodoById(userId, todoId) {
        return this.request(`/api/${userId}/todos/${todoId}`);
    }

    async updateTodo(userId, todoId, todoData) {
        return this.request(`/api/${userId}/todos/${todoId}`, {
            method: 'PUT',
            body: JSON.stringify(todoData)
        });
    }

    async deleteTodo(userId, todoId) {
        return this.request(`/api/${userId}/todos/${todoId}`, {
            method: 'DELETE'
        });
    }

    // Todo Features
    async toggleTodoCompleted(userId, todoId) {
        return this.request(`/api/${userId}/todos/${todoId}/toggle`, {
            method: 'PATCH'
        });
    }

    async getSharedTodos(userId) {
        return this.request(`/api/${userId}/todos/shared`);
    }

    async getUpcomingTodos(userId) {
        return this.request(`/api/${userId}/todos/upcoming`);
    }

    async getTodoStats(userId) {
        return this.request(`/api/${userId}/todos/stats`);
    }

    async getTodosWithReminders(userId) {
        return this.request(`/api/${userId}/todos/reminders`);
    }

    async getTodoSummary(userId) {
        return this.request(`/api/${userId}/todos/summary`);
    }

    async exportTodos(userId) {
        return this.request(`/api/${userId}/todos/export`);
    }

    // Filtering & Search
    async getTodosByCategory(userId, category) {
        return this.request(`/api/${userId}/todos/category/${encodeURIComponent(category)}`);
    }

    async getTodosByPriority(userId, priority) {
        return this.request(`/api/${userId}/todos/priority/${encodeURIComponent(priority)}`);
    }

    async getTodosByStatus(userId, status) {
        return this.request(`/api/${userId}/todos/status/${encodeURIComponent(status)}`);
    }

    async searchTodos(userId, query) {
        return this.request(`/api/${userId}/todos/search?q=${encodeURIComponent(query)}`);
    }

    // 🍅 POMODORO MANAGEMENT
    // Session Management
    async startPomodoroSession(userId, sessionData) {
        return this.request(`/api/${userId}/pomodoro/start`, {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }

    async getCurrentPomodoroSession(userId) {
        return this.request(`/api/${userId}/pomodoro/current`);
    }

    async completePomodoroSession(userId, sessionId, completionData) {
        return this.request(`/api/${userId}/pomodoro/${sessionId}/complete`, {
            method: 'POST',
            body: JSON.stringify(completionData)
        });
    }

    async cancelPomodoroSession(userId, sessionId) {
        return this.request(`/api/${userId}/pomodoro/${sessionId}/cancel`, {
            method: 'DELETE'
        });
    }

    async updatePomodoroSession(userId, sessionId, sessionData) {
        return this.request(`/api/${userId}/pomodoro/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify(sessionData)
        });
    }

    async addPomodoroInterruption(userId, sessionId, interruptionData) {
        return this.request(`/api/${userId}/pomodoro/${sessionId}/interrupt`, {
            method: 'POST',
            body: JSON.stringify(interruptionData)
        });
    }

    // Analytics & History
    async getPomodoroHistory(userId) {
        return this.request(`/api/${userId}/pomodoro/history`);
    }

    async getPomodoroStats(userId) {
        return this.request(`/api/${userId}/pomodoro/stats`);
    }

    async getProductivityTrend(userId) {
        return this.request(`/api/${userId}/pomodoro/trend`);
    }

    async getBestPomodoroSessions(userId) {
        return this.request(`/api/${userId}/pomodoro/best`);
    }

    async getPomodoroSummary(userId) {
        return this.request(`/api/${userId}/pomodoro/summary`);
    }

    async exportPomodoroSessions(userId) {
        return this.request(`/api/${userId}/pomodoro/export`);
    }

    // Filtering & Search
    async getPomodoroSessionsByType(userId, sessionType) {
        return this.request(`/api/${userId}/pomodoro/type/${encodeURIComponent(sessionType)}`);
    }

    async searchPomodoroSessions(userId, query) {
        return this.request(`/api/${userId}/pomodoro/search?q=${encodeURIComponent(query)}`);
    }

    // Presets
    async createPomodoroPreset(userId, presetData) {
        return this.request(`/api/${userId}/pomodoro/presets`, {
            method: 'POST',
            body: JSON.stringify(presetData)
        });
    }

    // 🧮 MATH LEARNING
    // Problem Management
    async generateMathProblem(userId, params) {
        return this.request(`/api/${userId}/math/generate`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async submitMathAnswer(userId, answerData) {
        return this.request(`/api/${userId}/math/submit`, {
            method: 'POST',
            body: JSON.stringify(answerData)
        });
    }

    async generateReviewProblems(userId, params) {
        return this.request(`/api/${userId}/math/review`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    // History & Analytics
    async getMathHistory(userId) {
        return this.request(`/api/${userId}/math/history`);
    }

    async getMathStats(userId) {
        return this.request(`/api/${userId}/math/stats`);
    }

    async getIncorrectMathProblems(userId) {
        return this.request(`/api/${userId}/math/incorrect`);
    }

    async getLearningTrend(userId) {
        return this.request(`/api/${userId}/math/trend`);
    }

    async deleteMathHistory(userId) {
        return this.request(`/api/${userId}/math/history`, {
            method: 'DELETE'
        });
    }

    // 🐱 NEKO CHAT
    // Chat Features
    async chatWithNeko(userId, message) {
        return this.request(`/api/${userId}/neko/chat`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    async getNekoConversationHistory(userId) {
        return this.request(`/api/${userId}/neko/conversations`);
    }

    async getNekoConversationStats(userId) {
        return this.request(`/api/${userId}/neko/stats`);
    }

    async getDailyAdvice(userId) {
        return this.request(`/api/${userId}/neko/advice`);
    }

    async getMorningGreeting(userId) {
        return this.request(`/api/${userId}/neko/greeting`);
    }

    // Management
    async deleteNekoConversation(userId, conversationId) {
        return this.request(`/api/${userId}/neko/conversation/${conversationId}`, {
            method: 'DELETE'
        });
    }

    async clearAllNekoConversations(userId) {
        return this.request(`/api/${userId}/neko/conversations`, {
            method: 'DELETE'
        });
    }

    async updateNekoMode(userId, mode) {
        return this.request(`/api/${userId}/neko/mode`, {
            method: 'PUT',
            body: JSON.stringify({ mode })
        });
    }

    // 📊 DASHBOARD
    // Summary Data
    async getDashboardData(userId) {
        return this.request(`/api/${userId}/dashboard`);
    }
}

// Create global instance
const nekoAPI = new NekoUAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NekoUAPI, nekoAPI };
}

console.log('✅ Neko U API Functions loaded - 281 endpoints ready!');
