// Neko U Login System
// Login form handler and functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Check if user is already logged in
    nekouAuth.isAuthenticated().then(isAuth => {
        if (isAuth) {
            console.log('User already authenticated, redirecting to dashboard');
            window.location.href = CONFIG.redirectAfterLogin;
        }
    }).catch(error => {
        console.log('Authentication check failed:', error);
        // User not authenticated, stay on login page
    });
    
    // Load saved username if remember me was checked
    loadSavedUsername();
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
    
    // Remember username
    if (rememberMeCheckbox) {
        rememberMeCheckbox.addEventListener('change', handleRememberMe);
    }
    
    // Enter key support for better UX
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleLogin(event);
            }
        });
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate inputs
        if (!username) {
            showAlert('กรุณากรอกชื่อผู้ใช้', 'warning');
            document.getElementById('username').focus();
            return;
        }
        
        if (!password) {
            showAlert('กรุณากรอกรหัสผ่าน', 'warning');
            document.getElementById('password').focus();
            return;
        }
        
        // Save username if remember me is checked (using cookie)
        if (rememberMe) {
            nekouAuth.setCookie('nekouRememberUsername', username, 30 * 24 * 60); // 30 days
        } else {
            nekouAuth.deleteCookie('nekouRememberUsername');
        }
        
        // Attempt login
        console.log('🔐 Attempting login for user:', username);
        await nekouAuth.login(username, password);
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Show specific error messages
        if (error.message.includes('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง') || 
            error.message.includes('Invalid credentials') || 
            error.message.includes('User not found')) {
            showAlert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
        } else if (error.message.includes('CORS')) {
            showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาเข้าถึงแอปผ่าน http://localhost:3000', 'error');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            showAlert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต', 'error');
        } else {
            showAlert(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
        }
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'bi bi-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bi bi-eye';
    }
}

// Handle remember me functionality
function handleRememberMe() {
    const rememberMe = document.getElementById('rememberMe').checked;
    const username = document.getElementById('username').value.trim();
    
    if (rememberMe && username) {
        localStorage.setItem('nekouRememberUsername', username);
    } else if (!rememberMe) {
        localStorage.removeItem('nekouRememberUsername');
    }
}

// Load saved username from cookie
function loadSavedUsername() {
    const savedUsername = nekouAuth.getCookie('nekouRememberUsername');
    const usernameInput = document.getElementById('username');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    if (savedUsername && usernameInput) {
        usernameInput.value = savedUsername;
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
        // Focus on password field for better UX
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.focus();
        }
    }
}

// Show forgot password modal (placeholder)
function showForgotPasswordModal() {
    showAlert('ฟีเจอร์การรีเซ็ตรหัสผ่านกำลังพัฒนา กรุณาติดต่อผู้ดูแลระบบ', 'info');
}

// Guest login (for demo purposes)
function guestLogin() {
    showAlert('โหมดแขกกำลังพัฒนา', 'info');
}

// Quick login for testing (development only)
function quickLogin(username, password) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        document.getElementById('username').value = username;
        document.getElementById('password').value = password;
        console.log('🧪 Quick login filled for testing');
    }
}

// Auto-focus on first empty field
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && !usernameInput.value) {
        usernameInput.focus();
    } else if (passwordInput && !passwordInput.value) {
        passwordInput.focus();
    }
});

// Handle form validation styling
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('#loginForm input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim() !== '') {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

console.log('🔐 Neko U Login System Loaded');
