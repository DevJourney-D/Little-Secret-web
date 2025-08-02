// Neko U Configuration
// 🔥 New Backend API Integration 🔥

// Backend API Configuration
const API_BASE_URL = 'https://little-secret-api.vercel.app';  // Production - ใช้ URL ใหม่

// Supabase Configuration (for realtime features only)
const SUPABASE_URL = 'https://cnvrikxkxrdeuofbbwkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudnJpa3hreHJkZXVvZmJid2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODQxODgsImV4cCI6MjA2ODY2MDE4OH0.eXstBvMggQML1LeQyFDcNxmB6Djjp7zZlmH8gbDRBd8';

// Initialize Supabase client (for realtime only)
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// hCaptcha Configuration
const HCAPTCHA_SITEKEY = 'd5aaaaa0-748c-4fc6-a57e-e9d89df6bb76';

console.log('🚀 Neko U API Configuration');
console.log('📍 API Base URL:', API_BASE_URL);
console.log('🔑 Supabase for realtime:', SUPABASE_URL);

// Application configuration
const CONFIG = {
    appName: 'Neko U',
    version: '2.0.0',
    apiBaseUrl: API_BASE_URL,
    redirectAfterLogin: 'dashboard.html',
    redirectAfterLogout: 'index.html',
    features: {
        realTimeChat: true,
        diarySharing: true,
        todoLists: true,
        pomodoro: true,
        mathProblems: true,
        calculator: true,
        nekoChat: true
    }
};

// API Helper Functions
const api = {
    // Generic API request handler
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('nekouToken');
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            headers: defaultHeaders,
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        };
        
        try {
            console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            
            // Handle different content types
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
            
            console.log(`✅ API Response: ${endpoint}`, data);
            return data;
        } catch (error) {
            console.error(`❌ API Error: ${endpoint}`, error);
            
            // Better error handling for network issues
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
            }
            
            throw error;
        }
    },

    // User Authentication
    auth: {
        async login(username, password) {
            return api.request('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        async register(userData) {
            // Map frontend data to backend expected format
            const backendData = {
                email: userData.email,
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName,
                nickname: userData.nickname,
                gender: userData.gender,
                birth_date: userData.birthDate,
                password: userData.password,
                partner_code: userData.partnerCode || null
            };
            
            return api.request('/api/users', {
                method: 'POST',
                body: JSON.stringify(backendData)
            });
        },

        logout() {
            localStorage.removeItem('nekouUser');
            localStorage.removeItem('nekouToken');
            window.location.href = CONFIG.redirectAfterLogout;
        },

        getCurrentUser() {
            const userStr = localStorage.getItem('nekouUser');
            return userStr ? JSON.parse(userStr) : null;
        },

        isAuthenticated() {
            return !!localStorage.getItem('nekouToken');
        }
    },

    // User Management
    users: {
        async getById(userId) {
            return api.request(`/api/users/${userId}`);
        },

        async update(userId, userData) {
            return api.request(`/api/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },

        async generatePartnerCode(userId) {
            return api.request(`/api/users/${userId}/generate-partner-code`, {
                method: 'POST'
            });
        },

        async connectPartner(userId, partnerCode) {
            return api.request(`/api/users/${userId}/connect-partner`, {
                method: 'POST',
                body: JSON.stringify({ partner_code: partnerCode })
            });
        },

        async disconnectPartner(userId) {
            return api.request(`/api/users/${userId}/disconnect-partner`, {
                method: 'DELETE'
            });
        },

        // Check availability
        async checkUsername(username) {
            return api.request(`/api/users/username/${encodeURIComponent(username)}`);
        },

        async checkEmail(email) {
            return api.request(`/api/users/email/${encodeURIComponent(email)}`);
        }
    },

    // Diary Management
    diary: {
        async getAll(userId) {
            return api.request(`/api/${userId}/diaries`);
        },

        async getShared(userId) {
            return api.request(`/api/${userId}/diaries/shared`);
        },

        async create(userId, diaryData) {
            return api.request(`/api/${userId}/diaries`, {
                method: 'POST',
                body: JSON.stringify(diaryData)
            });
        },

        async addReaction(userId, diaryId, reaction) {
            return api.request(`/api/${userId}/diaries/${diaryId}/reaction`, {
                method: 'POST',
                body: JSON.stringify({ reaction })
            });
        },

        async getStats(userId) {
            return api.request(`/api/${userId}/diaries/stats`);
        }
    },

    // Chat Management
    chat: {
        async getMessages(userId, partnerId) {
            return api.request(`/api/${userId}/messages/${partnerId}`);
        },

        async sendMessage(userId, messageData) {
            return api.request(`/api/${userId}/messages`, {
                method: 'POST',
                body: JSON.stringify(messageData)
            });
        },

        async markAsRead(userId, messageIds) {
            return api.request(`/api/${userId}/messages/mark-read`, {
                method: 'POST',
                body: JSON.stringify({ message_ids: messageIds })
            });
        },

        async addReaction(userId, messageId, reaction) {
            return api.request(`/api/${userId}/messages/${messageId}/reaction`, {
                method: 'POST',
                body: JSON.stringify({ reaction })
            });
        }
    },

    // Todo Management
    todo: {
        async getAll(userId) {
            return api.request(`/api/${userId}/todos`);
        },

        async getShared(userId) {
            return api.request(`/api/${userId}/todos/shared`);
        },

        async create(userId, todoData) {
            return api.request(`/api/${userId}/todos`, {
                method: 'POST',
                body: JSON.stringify(todoData)
            });
        },

        async toggle(userId, todoId) {
            return api.request(`/api/${userId}/todos/${todoId}/toggle`, {
                method: 'PATCH'
            });
        }
    },

    // Pomodoro Management
    pomodoro: {
        async start(userId, sessionData) {
            return api.request(`/api/${userId}/pomodoro/start`, {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });
        },

        async getCurrent(userId) {
            return api.request(`/api/${userId}/pomodoro/current`);
        },

        async complete(userId, sessionId, completionData) {
            return api.request(`/api/${userId}/pomodoro/${sessionId}/complete`, {
                method: 'POST',
                body: JSON.stringify(completionData)
            });
        },

        async getStats(userId) {
            return api.request(`/api/${userId}/pomodoro/stats`);
        }
    },

    // Math Learning
    math: {
        async generate(userId, params) {
            return api.request(`/api/${userId}/math/generate`, {
                method: 'POST',
                body: JSON.stringify(params)
            });
        },

        async submit(userId, answerData) {
            return api.request(`/api/${userId}/math/submit`, {
                method: 'POST',
                body: JSON.stringify(answerData)
            });
        },

        async getHistory(userId) {
            return api.request(`/api/${userId}/math/history`);
        },

        async getStats(userId) {
            return api.request(`/api/${userId}/math/stats`);
        }
    },

    // Neko Chat
    neko: {
        async chat(userId, message) {
            return api.request(`/api/${userId}/neko/chat`, {
                method: 'POST',
                body: JSON.stringify({ message })
            });
        },

        async getConversations(userId) {
            return api.request(`/api/${userId}/neko/conversations`);
        },

        async getDailyAdvice(userId) {
            return api.request(`/api/${userId}/neko/advice`);
        },

        async getMorningGreeting(userId) {
            return api.request(`/api/${userId}/neko/greeting`);
        }
    },

    // Dashboard
    async getDashboard(userId) {
        return api.request(`/api/${userId}/dashboard`);
    }
};

// Utility functions
const utils = {
    // Show alert message
    showAlert: (message, type = 'info', containerId = 'alertMessage') => {
        const alertContainer = document.getElementById(containerId);
        if (!alertContainer) return;

        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 
                          type === 'warning' ? 'alert-warning' : 'alert-info';

        alertContainer.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi bi-${type === 'success' ? 'check-circle' : 
                                 type === 'error' ? 'exclamation-triangle' : 
                                 type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Auto hide after 5 seconds
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    },

    // Show confirmation dialog
    showConfirm: (title, message, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', type = 'danger') => {
        return new Promise((resolve) => {
            const modalId = 'confirmModal' + Date.now();
            const iconClass = type === 'danger' ? 'bi-trash text-danger' : 
                             type === 'warning' ? 'bi-exclamation-triangle text-warning' :
                             'bi-question-circle text-primary';
            
            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header border-0">
                                <h5 class="modal-title d-flex align-items-center">
                                    <i class="bi ${iconClass} me-2" style="font-size: 1.5rem;"></i>
                                    ${title}
                                </h5>
                            </div>
                            <div class="modal-body text-center">
                                <p class="mb-0">${message}</p>
                            </div>
                            <div class="modal-footer border-0 justify-content-center">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                    ${cancelText}
                                </button>
                                <button type="button" class="btn btn-${type}" id="confirmBtn${modalId}">
                                    ${confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            const confirmBtn = document.getElementById(`confirmBtn${modalId}`);
            
            confirmBtn.addEventListener('click', () => {
                resolve(true);
                modal.hide();
            });
            
            document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
                document.getElementById(modalId).remove();
                resolve(false);
            });
            
            modal.show();
        });
    },

    // Show toast notification
    showToast: (message, type = 'info', duration = 5000) => {
        const toastId = 'toast' + Date.now();
        const iconClass = type === 'success' ? 'bi-check-circle text-success' : 
                         type === 'error' ? 'bi-exclamation-triangle text-danger' : 
                         type === 'warning' ? 'bi-exclamation-triangle text-warning' : 
                         'bi-info-circle text-info';
        
        const toastHtml = `
            <div class="toast show position-fixed" id="${toastId}" style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <div class="toast-header">
                    <i class="bi ${iconClass} me-2"></i>
                    <strong class="me-auto">Neko U</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.hide();
            setTimeout(() => toastElement.remove(), 300);
        }, duration);
    },

    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format time
    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Redirect to page with smooth transition (ป้องกัน redirect loop)
    redirect: (page) => {
        // ตรวจสอบว่าไม่ได้อยู่ในหน้าเดียวกันแล้ว
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const targetPage = page.split('?')[0]; // ตัด query parameters ออก
        
        if (currentPage === targetPage) {
            console.log('🚫 หยุดการ redirect เพราะอยู่ในหน้าเดียวกันแล้ว:', page);
            return;
        }
        
        console.log('🔀 กำลัง redirect จาก', currentPage, 'ไป', page);
        
        // Add loading class to body for transition effect
        document.body.classList.add('page-loading');
        
        // Wait for transition then redirect
        setTimeout(() => {
            window.location.href = page;
        }, 300);
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return localStorage.getItem('userSession') !== null;
    },

    // Get current user
    getCurrentUser: () => {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    },

    // Save user session
    saveUserSession: (user) => {
        localStorage.setItem('userSession', JSON.stringify(user));
    },

    // Clear user session
    clearUserSession: () => {
        localStorage.removeItem('userSession');
        localStorage.removeItem('partnerInfo');
    },

    // Save partner info
    savePartnerInfo: (partner) => {
        localStorage.setItem('partnerInfo', JSON.stringify(partner));
    },

    // Get partner info
    getPartnerInfo: () => {
        const partner = localStorage.getItem('partnerInfo');
        return partner ? JSON.parse(partner) : null;
    },

    // Clear partner info
    clearPartnerInfo: () => {
        localStorage.removeItem('partnerInfo');
    },

    // API Helper functions
    apiCall: async (endpoint, options = {}) => {
        const user = utils.getCurrentUser();
        const token = user?.access_token;

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, finalOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    },

    // GET request helper
    get: async (endpoint) => {
        return utils.apiCall(endpoint);
    },

    // POST request helper
    post: async (endpoint, data) => {
        return utils.apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // PUT request helper
    put: async (endpoint, data) => {
        return utils.apiCall(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // DELETE request helper
    delete: async (endpoint) => {
        return utils.apiCall(endpoint, {
            method: 'DELETE'
        });
    }
};

// Loading states
const loading = {
    show: (buttonId, loadingText = 'กำลังประมวลผล...') => {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.disabled = true;
        const originalText = button.querySelector('.login-text, .register-text, .btn-text');
        const loadingSpan = button.querySelector('.loading');
        
        if (originalText) originalText.style.display = 'none';
        if (loadingSpan) {
            loadingSpan.style.display = 'inline';
            loadingSpan.textContent = loadingText;
        }
    },

    hide: (buttonId) => {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.disabled = false;
        const originalText = button.querySelector('.login-text, .register-text, .btn-text');
        const loadingSpan = button.querySelector('.loading');
        
        if (originalText) originalText.style.display = 'inline';
        if (loadingSpan) loadingSpan.style.display = 'none';
    }
};

// Check authentication on page load (ป้องกัน redirect loop)
document.addEventListener('DOMContentLoaded', () => {
    // ป้องกันการ redirect หลายครั้ง
    if (window.location.href.includes('?redirected=true')) {
        console.log('🔄 หยุดการ redirect เพื่อป้องกัน loop');
        return;
    }
    
    // ปิดการ auto redirect ชั่วคราวเพื่อแก้ปัญหา auto reload
    console.log('⚠️ การ auto redirect ถูกปิดชั่วคราว');
    console.log('📄 หน้าปัจจุบัน:', window.location.pathname.split('/').pop() || 'index.html');
    console.log('🔐 สถานะล็อกอิน:', utils.isLoggedIn() ? 'เข้าสู่ระบบแล้ว' : 'ยังไม่ได้เข้าสู่ระบบ');
    
    // TODO: เปิดการ redirect กลับเมื่อแก้ปัญหาแล้ว
    
    /*
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'register.html', 'email-verified.html', 'reset-password.html', ''];
    
    // เพิ่มหน่วงเวลาเล็กน้อยเพื่อรอให้ utils โหลดเสร็จ
    setTimeout(() => {
        try {
            // If user is logged in and on public page, redirect to dashboard
            if (utils.isLoggedIn() && publicPages.includes(currentPage)) {
                console.log('🔀 ผู้ใช้ล็อกอินแล้ว เปลี่ยนไปแดชบอร์ด');
                utils.redirect('dashboard.html?redirected=true');
                return;
            }
            
            // If user is not logged in and on protected page, redirect to login
            if (!utils.isLoggedIn() && !publicPages.includes(currentPage)) {
                console.log('🔒 ผู้ใช้ยังไม่ได้ล็อกอิน เปลี่ยนไปหน้าล็อกอิน');
                utils.redirect('index.html?redirected=true');
                return;
            }
        } catch (error) {
            console.warn('⚠️ ข้อผิดพลาดในการตรวจสอบ auth:', error);
        }
    }, 100);
    */
});

console.log('✅ Neko U Configuration โหลดเสร็จแล้ว');
