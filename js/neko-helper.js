// Neko U - API Helper Functions for Production Use
// สำหรับใช้ในหน้าจริงของแอปพลิเคชัน

class NekoUHelper {
    constructor() {
        this.api = nekoAPI; // ใช้ instance จาก api-functions.js
        this.currentUser = null;
        this.isInitialized = false;
    }

    // Initialize helper with user data
    async initialize() {
        try {
            const token = localStorage.getItem('nekouToken');
            const userStr = localStorage.getItem('nekouUser');
            
            if (token && userStr) {
                this.api.setToken(token);
                this.currentUser = JSON.parse(userStr);
                this.isInitialized = true;
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Helper initialization failed:', error);
            return false;
        }
    }

    // Get current user ID
    getCurrentUserId() {
        return this.currentUser?.id || null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isInitialized && this.currentUser && localStorage.getItem('nekouToken');
    }

    // ===========================================
    // USER MANAGEMENT HELPERS
    // ===========================================
    
    async login(username, password) {
        try {
            const result = await this.api.loginUser(username, password);
            
            if (result.success) {
                this.api.setToken(result.data.token);
                this.currentUser = result.data.user;
                localStorage.setItem('nekouUser', JSON.stringify(result.data.user));
                this.isInitialized = true;
                
                return {
                    success: true,
                    user: result.data.user,
                    message: 'เข้าสู่ระบบสำเร็จ'
                };
            }
            
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async register(userData) {
        try {
            const result = await this.api.registerUser(userData);
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    logout() {
        localStorage.removeItem('nekouToken');
        localStorage.removeItem('nekouUser');
        this.currentUser = null;
        this.isInitialized = false;
        window.location.href = 'index.html';
    }

    async updateProfile(profileData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            const result = await this.api.updateUser(this.getCurrentUserId(), profileData);
            
            if (result.success) {
                // Update local user data
                this.currentUser = { ...this.currentUser, ...result.data };
                localStorage.setItem('nekouUser', JSON.stringify(this.currentUser));
            }
            
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async generatePartnerCode() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.generatePartnerCode(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async connectPartner(partnerCode) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.connectWithPartner(this.getCurrentUserId(), partnerCode);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // DIARY HELPERS
    // ===========================================
    
    async getDiaries(filters = {}) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getUserDiaries(this.getCurrentUserId(), filters);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async createDiary(diaryData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.createDiary(this.getCurrentUserId(), diaryData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateDiary(diaryId, diaryData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.updateDiary(this.getCurrentUserId(), diaryId, diaryData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async deleteDiary(diaryId) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.deleteDiary(this.getCurrentUserId(), diaryId);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getSharedDiaries() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getSharedDiaries(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getDiaryStats() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getDiaryStats(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // CHAT HELPERS
    // ===========================================

    async sendMessage(content, messageType = 'text') {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            const messageData = {
                content,
                message_type: messageType
            };
            
            return await this.api.sendMessage(this.getCurrentUserId(), messageData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getMessages(partnerId, params = {}) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getMessages(this.getCurrentUserId(), partnerId, params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getLatestMessages() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getLatestMessages(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async markMessagesAsRead(messageIds) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.markAsRead(this.getCurrentUserId(), messageIds);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getChatStats() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getChatStats(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // TODO HELPERS
    // ===========================================

    async getTodos(filters = {}) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getUserTodos(this.getCurrentUserId(), filters);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async createTodo(todoData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.createTodo(this.getCurrentUserId(), todoData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateTodo(todoId, todoData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.updateTodo(this.getCurrentUserId(), todoId, todoData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async deleteTodo(todoId) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.deleteTodo(this.getCurrentUserId(), todoId);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async toggleTodo(todoId) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.toggleTodoCompleted(this.getCurrentUserId(), todoId);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getTodoStats() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getTodoStats(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // POMODORO HELPERS
    // ===========================================

    async startPomodoroSession(sessionData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.startPomodoroSession(this.getCurrentUserId(), sessionData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getCurrentPomodoroSession() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getCurrentPomodoroSession(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async completePomodoroSession(sessionId, completionData = {}) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.completePomodoroSession(this.getCurrentUserId(), sessionId, completionData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async cancelPomodoroSession(sessionId) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.cancelPomodoroSession(this.getCurrentUserId(), sessionId);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getPomodoroStats() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getPomodoroStats(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // MATH LEARNING HELPERS
    // ===========================================

    async generateMathProblem(params = {}) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.generateMathProblem(this.getCurrentUserId(), params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async submitMathAnswer(answerData) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.submitMathAnswer(this.getCurrentUserId(), answerData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getMathStats() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getMathStats(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // NEKO CHAT HELPERS
    // ===========================================

    async chatWithNeko(message) {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.chatWithNeko(this.getCurrentUserId(), message);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getNekoConversations() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getNekoConversationHistory(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getDailyAdvice() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getDailyAdvice(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getMorningGreeting() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getMorningGreeting(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // DASHBOARD HELPERS
    // ===========================================

    async getDashboardData() {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
        }

        try {
            return await this.api.getDashboardData(this.getCurrentUserId());
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ===========================================
    // UTILITY HELPERS
    // ===========================================

    // Show notification
    showNotification(message, type = 'info') {
        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Format date for Thai locale
    formatDate(date) {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Check username availability
    async checkUsernameAvailability(username) {
        try {
            const result = await this.api.checkUsername(username);
            // API returns user data if username exists, null if available
            return {
                available: !result.success || !result.data,
                message: result.success && result.data ? 'Username ถูกใช้แล้ว' : 'Username ใช้ได้'
            };
        } catch (error) {
            return { available: false, message: 'ไม่สามารถตรวจสอบได้' };
        }
    }

    // Check email availability
    async checkEmailAvailability(email) {
        try {
            const result = await this.api.checkEmail(email);
            // API returns user data if email exists, null if available
            return {
                available: !result.success || !result.data,
                message: result.success && result.data ? 'Email ถูกใช้แล้ว' : 'Email ใช้ได้'
            };
        } catch (error) {
            return { available: false, message: 'ไม่สามารถตรวจสอบได้' };
        }
    }
}

// Create global helper instance
const nekoHelper = new NekoUHelper();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await nekoHelper.initialize();
    console.log('🐱 Neko U Helper initialized:', nekoHelper.isAuthenticated() ? 'Authenticated' : 'Not authenticated');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NekoUHelper, nekoHelper };
}

console.log('✅ Neko U Helper Functions loaded!');
