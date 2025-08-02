// Neko U Registration System
// Registration form handler and validation

document.addEventListener('DOMContentLoaded', function() {
    // Initialize registration form
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Real-time validation
    if (usernameInput) {
        usernameInput.addEventListener('blur', checkUsernameAvailability);
        usernameInput.addEventListener('input', validateUsername);
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', checkEmailAvailability);
        emailInput.addEventListener('input', validateEmail);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Set up date input constraints
    setupDateInput();
});

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    try {
        const formData = getFormData();
        
        // Validate form data
        validateFormData(formData);
        
        // Register user
        await nekouAuth.register(formData);
        
    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
    }
}

// Get form data
function getFormData() {
    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        nickname: document.getElementById('nickname').value.trim(),
        email: document.getElementById('email').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        gender: document.getElementById('gender').value,
        birthDate: document.getElementById('birthDate').value,
        partnerCode: document.getElementById('partnerCode').value.trim().toUpperCase() || null
    };
}

// Validate form data
function validateFormData(data) {
    // Age validation
    if (data.birthDate) {
        const birthDate = new Date(data.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 13) {
            throw new Error('ต้องมีอายุอย่างน้อย 13 ปีเพื่อสมัครสมาชิก');
        }
        
        if (age > 120) {
            throw new Error('กรุณาตรวจสอบวันเกิดของคุณ');
        }
    }
    
    // Partner code validation
    if (data.partnerCode && data.partnerCode.length !== 6) {
        throw new Error('รหัสคู่ต้องมี 6 ตัวอักษร');
    }
}

// Check username availability
async function checkUsernameAvailability() {
    const username = document.getElementById('username').value.trim();
    const feedbackElement = document.getElementById('username-feedback') || createFeedbackElement('username');
    
    if (username.length < 3) {
        showFieldFeedback('username', 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร', 'warning');
        return;
    }
    
    try {
        showFieldFeedback('username', 'กำลังตรวจสอบ...', 'info');
        const response = await nekouAuth.checkUsername(username);
        
        if (response.available) {
            showFieldFeedback('username', '✓ ชื่อผู้ใช้นี้ใช้ได้', 'success');
        } else {
            showFieldFeedback('username', 'ชื่อผู้ใช้นี้ถูกใช้แล้ว', 'error');
        }
    } catch (error) {
        showFieldFeedback('username', 'ไม่สามารถตรวจสอบได้', 'error');
    }
}

// Check email availability
async function checkEmailAvailability() {
    const email = document.getElementById('email').value.trim();
    
    if (!isValidEmail(email)) {
        showFieldFeedback('email', 'รูปแบบอีเมลไม่ถูกต้อง', 'warning');
        return;
    }
    
    try {
        showFieldFeedback('email', 'กำลังตรวจสอบ...', 'info');
        const response = await nekouAuth.checkEmail(email);
        
        if (response.available) {
            showFieldFeedback('email', '✓ อีเมลนี้ใช้ได้', 'success');
        } else {
            showFieldFeedback('email', 'อีเมลนี้ถูกใช้แล้ว', 'error');
        }
    } catch (error) {
        showFieldFeedback('email', 'ไม่สามารถตรวจสอบได้', 'error');
    }
}

// Validate username format
function validateUsername() {
    const username = document.getElementById('username').value.trim();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    if (username.length === 0) return;
    
    if (!usernameRegex.test(username)) {
        showFieldFeedback('username', 'ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ (3-20 ตัวอักษร)', 'warning');
    }
}

// Validate email format
function validateEmail() {
    const email = document.getElementById('email').value.trim();
    
    if (email.length === 0) return;
    
    if (!isValidEmail(email)) {
        showFieldFeedback('email', 'รูปแบบอีเมลไม่ถูกต้อง', 'warning');
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthElement = document.getElementById('password-strength') || createPasswordStrengthIndicator();
    
    if (password.length === 0) {
        strengthElement.innerHTML = '';
        return;
    }
    
    const strength = calculatePasswordStrength(password);
    updatePasswordStrengthDisplay(strengthElement, strength);
}

// Check password match
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword.length === 0) return;
    
    if (password !== confirmPassword) {
        showFieldFeedback('confirmPassword', 'รหัสผ่านไม่ตรงกัน', 'error');
    } else {
        showFieldFeedback('confirmPassword', '✓ รหัสผ่านตรงกัน', 'success');
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    return {
        score,
        checks,
        level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    };
}

// Update password strength display
function updatePasswordStrengthDisplay(element, strength) {
    const percentage = Math.min((strength.score / 5) * 100, 100);
    const colors = {
        weak: '#dc3545',
        medium: '#ffc107',
        strong: '#198754'
    };
    
    element.innerHTML = `
        <div class="strength-meter">
            <div class="strength-fill ${strength.level}" style="width: ${percentage}%; background-color: ${colors[strength.level]}"></div>
        </div>
        <div class="strength-text text-${strength.level === 'weak' ? 'danger' : strength.level === 'medium' ? 'warning' : 'success'}">
            ความแข็งแกร่ง: ${strength.level === 'weak' ? 'อ่อน' : strength.level === 'medium' ? 'ปานกลาง' : 'แข็งแกร่ง'}
        </div>
        <div class="password-requirements text-muted">
            <small>
                ✓ ความยาวอย่างน้อย 6 ตัวอักษร ${strength.checks.length ? '✓' : '✗'}<br>
                แนะนำ: ตัวพิมพ์เล็ก ${strength.checks.lowercase ? '✓' : '✗'}, 
                ตัวพิมพ์ใหญ่ ${strength.checks.uppercase ? '✓' : '✗'}, 
                ตัวเลข ${strength.checks.numbers ? '✓' : '✗'}, 
                อักขระพิเศษ ${strength.checks.special ? '✓' : '✗'}
            </small>
        </div>
    `;
}

// Show field feedback
function showFieldFeedback(fieldId, message, type) {
    let feedbackElement = document.getElementById(`${fieldId}-feedback`);
    
    if (!feedbackElement) {
        feedbackElement = createFeedbackElement(fieldId);
    }
    
    const colors = {
        success: 'text-success',
        error: 'text-danger',
        warning: 'text-warning',
        info: 'text-info'
    };
    
    feedbackElement.className = `${fieldId}-feedback form-text ${colors[type] || colors.info}`;
    feedbackElement.innerHTML = `<small>${message}</small>`;
}

// Create feedback element
function createFeedbackElement(fieldId) {
    const field = document.getElementById(fieldId);
    const feedbackElement = document.createElement('div');
    feedbackElement.id = `${fieldId}-feedback`;
    feedbackElement.className = `${fieldId}-feedback form-text`;
    
    field.parentNode.appendChild(feedbackElement);
    return feedbackElement;
}

// Create password strength indicator
function createPasswordStrengthIndicator() {
    const passwordField = document.getElementById('password');
    const strengthElement = document.createElement('div');
    strengthElement.id = 'password-strength';
    strengthElement.className = 'password-strength';
    
    passwordField.parentNode.appendChild(strengthElement);
    return strengthElement;
}

// Setup date input constraints
function setupDateInput() {
    const birthDateInput = document.getElementById('birthDate');
    if (!birthDateInput) return;
    
    // Set max date to today
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    birthDateInput.max = maxDate;
    
    // Set min date to 120 years ago
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    birthDateInput.min = minDate.toISOString().split('T')[0];
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Auto-format partner code
document.addEventListener('DOMContentLoaded', function() {
    const partnerCodeInput = document.getElementById('partnerCode');
    if (partnerCodeInput) {
        partnerCodeInput.addEventListener('input', function(e) {
            // Convert to uppercase and limit to 6 characters
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (value.length > 6) {
                value = value.substring(0, 6);
            }
            e.target.value = value;
        });
    }
});

console.log('📝 Neko U Registration System Loaded');
