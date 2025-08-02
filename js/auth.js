// Neko U Authentication System
// 🔥 New Backend API Integration

class NekoAuth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.init();
    }

    init() {
        // Load user from localStorage
        const savedUser = localStorage.getItem('nekouUser');
        const savedToken = localStorage.getItem('nekouToken');
        
        if (savedUser && savedToken) {
            this.currentUser = JSON.parse(savedUser);
            this.token = savedToken;
        }
    }

    // Login with username and password
    async login(username, password) {
        try {
            if (typeof showLoading === 'function') {
                showLoading('กำลังเข้าสู่ระบบ...', 'login');
            }
            
            const response = await api.auth.login(username, password);
            
            if (response.success) {
                // Save user data and token
                this.currentUser = response.data.user;
                this.token = response.data.token;
                
                localStorage.setItem('nekouUser', JSON.stringify(this.currentUser));
                localStorage.setItem('nekouToken', this.token);
                
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
            if (typeof showAlert === 'function') {
                showAlert(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
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
            
            const response = await api.auth.register(userData);
            
            if (response.success) {
                if (typeof showAlert === 'function') {
                    showAlert('ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ... 🎉', 'success');
                }
                
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
            if (typeof showAlert === 'function') {
                showAlert(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
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

    // Logout
    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('nekouUser');
        localStorage.removeItem('nekouToken');
        
        if (typeof showAlert === 'function') {
            showAlert('ออกจากระบบแล้ว 👋', 'info');
        }
        
        setTimeout(() => {
            window.location.href = CONFIG.redirectAfterLogout;
        }, 1500);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.currentUser && this.token);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get token
    getToken() {
        return this.token;
    }

    // Check username availability
    async checkUsername(username) {
        try {
            const response = await api.users.checkUsername(username);
            return response;
        } catch (error) {
            console.error('Username check error:', error);
            if (error.message.includes('เชื่อมต่อเซิร์ฟเวอร์')) {
                return { available: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง' };
            }
            return { available: false, message: 'ไม่สามารถตรวจสอบชื่อผู้ใช้ได้' };
        }
    }

    // Check email availability
    async checkEmail(email) {
        try {
            const response = await api.users.checkEmail(email);
            return response;
        } catch (error) {
            console.error('Email check error:', error);
            if (error.message.includes('เชื่อมต่อเซิร์ฟเวอร์')) {
                return { available: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง' };
            }
            return { available: false, message: 'ไม่สามารถตรวจสอบอีเมลได้' };
        }
    }

    // Check email availability  
    async checkEmail(email) {
        try {
            const response = await api.users.checkEmail(email);
            return response;
        } catch (error) {
            console.error('Email check error:', error);
            return { available: false, message: 'ไม่สามารถตรวจสอบอีเมลได้' };
        }
    }
}

// Initialize auth system
const nekouAuth = new NekoAuth();

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

console.log('🔐 Neko U Auth System Loaded');
