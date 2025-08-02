// ===== Utility Functions =====
console.log('🔧 Utils.js loaded');

// ===== Date & Time Utils =====
function formatDate(date, format = 'th-long') {
    if (!date) return 'ไม่ระบุ';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'วันที่ไม่ถูกต้อง';
    
    const options = {
        'th-short': { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            locale: 'th-TH'
        },
        'th-long': { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            locale: 'th-TH'
        },
        'en-short': { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            locale: 'en-US'
        }
    };
    
    const config = options[format] || options['th-long'];
    return d.toLocaleDateString(config.locale, {
        year: config.year,
        month: config.month,
        day: config.day
    });
}

function formatDateTime(date, includeSeconds = false) {
    if (!date) return 'ไม่ระบุ';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'วันที่ไม่ถูกต้อง';
    
    const dateStr = formatDate(d);
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' })
    };
    
    const timeStr = d.toLocaleTimeString('th-TH', timeOptions);
    return `${dateStr} เวลา ${timeStr}`;
}

function getTimeAgo(date) {
    if (!date) return 'ไม่ทราบ';
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;
    
    if (diffMs < minute) return 'เมื่อสักครู่';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} นาทีที่แล้ว`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} ชั่วโมงที่แล้ว`;
    if (diffMs < month) return `${Math.floor(diffMs / day)} วันที่แล้ว`;
    if (diffMs < year) return `${Math.floor(diffMs / month)} เดือนที่แล้ว`;
    return `${Math.floor(diffMs / year)} ปีที่แล้ว`;
}

// ===== String Utils =====
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== Validation Utils =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9-+\s()]+$/;
    return phoneRegex.test(phone);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ===== UI Utils =====
function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();

    const alertTypes = {
        'success': { class: 'alert-success', icon: 'check-circle' },
        'error': { class: 'alert-danger', icon: 'exclamation-circle' },
        'warning': { class: 'alert-warning', icon: 'exclamation-triangle' },
        'info': { class: 'alert-info', icon: 'info-circle' }
    };

    const alertConfig = alertTypes[type] || alertTypes['info'];

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertConfig.class} alert-dismissible fade show custom-alert`;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1050; min-width: 300px; max-width: 500px;';
    alertDiv.innerHTML = `
        <i class="bi bi-${alertConfig.icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
}

function toggleLoading(elementId, isLoading, originalText = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (isLoading) {
        element.disabled = true;
        element.dataset.originalText = element.innerHTML;
        element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>กำลังดำเนินการ...';
    } else {
        element.disabled = false;
        element.innerHTML = element.dataset.originalText || originalText;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('คัดลอกแล้ว!', 'success', 2000);
    }).catch(() => {
        showAlert('ไม่สามารถคัดลอกได้', 'error');
    });
}

// ===== Form Utils =====
function validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = formData[field];
        
        if (fieldRules.required && (!value || value.trim() === '')) {
            errors[field] = fieldRules.message || `กรุณาป้อน${field}`;
            continue;
        }
        
        if (value && fieldRules.type) {
            switch (fieldRules.type) {
                case 'email':
                    if (!isValidEmail(value)) {
                        errors[field] = 'รูปแบบอีเมลไม่ถูกต้อง';
                    }
                    break;
                case 'phone':
                    if (!isValidPhone(value)) {
                        errors[field] = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
                    }
                    break;
                case 'url':
                    if (!isValidUrl(value)) {
                        errors[field] = 'รูปแบบ URL ไม่ถูกต้อง';
                    }
                    break;
            }
        }
        
        if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[field] = `ต้องมีอย่างน้อย ${fieldRules.minLength} ตัวอักษร`;
        }
        
        if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors[field] = `ต้องไม่เกิน ${fieldRules.maxLength} ตัวอักษร`;
        }
    }
    
    return errors;
}

function clearFormErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.invalid-feedback');
    errorElements.forEach(el => el.remove());
    
    const invalidInputs = formElement.querySelectorAll('.is-invalid');
    invalidInputs.forEach(input => input.classList.remove('is-invalid'));
}

function showFormErrors(formElement, errors) {
    clearFormErrors(formElement);
    
    for (const [field, message] of Object.entries(errors)) {
        const input = formElement.querySelector(`[name="${field}"], #${field}`);
        if (input) {
            input.classList.add('is-invalid');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = message;
            
            input.parentNode.appendChild(errorDiv);
        }
    }
}

// ===== Storage Utils =====
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ===== Number Utils =====
function formatNumber(num, decimals = 0) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatCurrency(amount, currency = 'THB') {
    if (isNaN(amount)) return '฿0';
    
    const currencyMap = {
        'THB': { symbol: '฿', locale: 'th-TH' },
        'USD': { symbol: '$', locale: 'en-US' },
        'EUR': { symbol: '€', locale: 'de-DE' }
    };
    
    const config = currencyMap[currency] || currencyMap['THB'];
    
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// ===== Debounce & Throttle =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== Random Utils =====
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ===== Export for use =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        formatDateTime,
        getTimeAgo,
        truncateText,
        capitalizeFirst,
        sanitizeHtml,
        isValidEmail,
        isValidPhone,
        isValidUrl,
        showAlert,
        toggleLoading,
        copyToClipboard,
        validateForm,
        clearFormErrors,
        showFormErrors,
        setLocalStorage,
        getLocalStorage,
        removeLocalStorage,
        formatNumber,
        formatCurrency,
        debounce,
        throttle,
        generateId,
        generateUUID
    };
}

console.log('✅ Utils.js loaded successfully');
