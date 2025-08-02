// ===== Loading Manager =====
console.log('⏳ Loading.js loaded');

class LoadingManager {
    constructor() {
        this.activeLoadings = new Set();
        this.createGlobalLoader();
    }

    createGlobalLoader() {
        // Create global loading overlay
        const loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="loader-text mt-3">กำลังโหลด...</div>
            </div>
        `;
        
        // Add styles
        const styles = `
            .global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(5px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                transition: opacity 0.3s ease;
            }
            
            .global-loader.show {
                display: flex;
                opacity: 1;
            }
            
            .loader-content {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .loader-text {
                color: #6c757d;
                font-size: 0.9rem;
            }
            
            .btn-loading {
                position: relative;
            }
            
            .btn-loading .btn-text {
                opacity: 0;
            }
            
            .btn-loading .btn-spinner {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        `;
        
        if (!document.getElementById('loadingStyles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'loadingStyles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(loader);
    }

    show(text = 'กำลังโหลด...') {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            const textElement = loader.querySelector('.loader-text');
            if (textElement) textElement.textContent = text;
            loader.classList.add('show');
        }
    }

    hide() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.remove('show');
        }
    }

    showButton(buttonId, loadingText = 'กำลังดำเนินการ...') {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (this.activeLoadings.has(buttonId)) return;

        this.activeLoadings.add(buttonId);
        
        // Store original content
        button.dataset.originalHtml = button.innerHTML;
        button.dataset.originalDisabled = button.disabled;
        
        // Set loading state
        button.disabled = true;
        button.classList.add('btn-loading');
        button.innerHTML = `
            <span class="btn-text">${button.dataset.originalHtml}</span>
            <span class="btn-spinner">
                <span class="spinner-border spinner-border-sm me-2"></span>${loadingText}
            </span>
        `;
    }

    hideButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (!this.activeLoadings.has(buttonId)) return;

        this.activeLoadings.delete(buttonId);
        
        // Restore original state
        button.innerHTML = button.dataset.originalHtml || button.innerHTML;
        button.disabled = button.dataset.originalDisabled === 'true';
        button.classList.remove('btn-loading');
        
        // Clean up data attributes
        delete button.dataset.originalHtml;
        delete button.dataset.originalDisabled;
    }

    showForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        buttons.forEach(button => {
            const buttonId = button.id || `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!button.id) button.id = buttonId;
            this.showButton(buttonId);
        });

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = true;
            input.dataset.wasDisabled = 'true';
        });
    }

    hideForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        buttons.forEach(button => {
            if (button.id) this.hideButton(button.id);
        });

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.dataset.wasDisabled === 'true') {
                input.disabled = false;
                delete input.dataset.wasDisabled;
            }
        });
    }

    async withLoading(asyncFunction, text = 'กำลังดำเนินการ...') {
        this.show(text);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            this.hide();
        }
    }

    async withButtonLoading(buttonId, asyncFunction, loadingText = 'กำลังดำเนินการ...') {
        this.showButton(buttonId, loadingText);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            this.hideButton(buttonId);
        }
    }

    async withFormLoading(formId, asyncFunction) {
        this.showForm(formId);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            this.hideForm(formId);
        }
    }
}

// Create global instance
const loading = new LoadingManager();

// Helper functions for backwards compatibility
function showLoading(text) {
    loading.show(text);
}

function hideLoading() {
    loading.hide();
}

function setButtonLoading(buttonId, isLoading, loadingText) {
    if (isLoading) {
        loading.showButton(buttonId, loadingText);
    } else {
        loading.hideButton(buttonId);
    }
}

// Auto-hide loading on page unload
window.addEventListener('beforeunload', () => {
    loading.hide();
});

console.log('✅ Loading.js loaded successfully');
