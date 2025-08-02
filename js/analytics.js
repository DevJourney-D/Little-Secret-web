// Vercel Analytics Integration for Neko U
// This file provides analytics tracking functionality

// Initialize Vercel Analytics
function initAnalytics() {
    // Vercel Analytics is automatically initialized via the script tag
    // This function provides additional tracking capabilities
    
    if (typeof window.va === 'function') {
        console.log('✅ เริ่มต้น Vercel Analytics สำเร็จแล้ว');
        
        // Track page view
        window.va('track', 'pageview', {
            page: window.location.pathname,
            title: document.title
        });
    } else {
        console.warn('⚠️ Vercel Analytics ไม่พร้อมใช้งาน');
    }
}

// Track custom events
function trackEvent(eventName, properties = {}) {
    if (typeof window.va === 'function') {
        window.va('track', eventName, {
            ...properties,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
    }
}

// Track user authentication events
function trackAuth(action) {
    trackEvent('auth', {
        action: action, // 'login', 'register', 'logout'
        platform: 'neko-u'
    });
}

// Track feature usage
function trackFeature(feature, action) {
    trackEvent('feature_usage', {
        feature: feature, // 'diary', 'chat', 'todo', 'pomodoro', 'math', 'neko-chat'
        action: action,   // 'view', 'create', 'edit', 'delete', 'complete'
        platform: 'neko-u'
    });
}

// Track relationship events
function trackRelationship(action) {
    trackEvent('relationship', {
        action: action, // 'connect', 'accept', 'reject', 'disconnect'
        platform: 'neko-u'
    });
}

// Track errors
function trackError(error, context = '') {
    trackEvent('error', {
        error: error.message || error,
        context: context,
        stack: error.stack || '',
        platform: 'neko-u'
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Vercel Analytics script is loaded
    setTimeout(initAnalytics, 100);
    
    // Track navigation
    if (window.history && window.history.pushState) {
        const originalPushState = window.history.pushState;
        window.history.pushState = function(...args) {
            originalPushState.apply(window.history, args);
            trackEvent('navigation', {
                from: document.referrer,
                to: window.location.href
            });
        };
    }
});

// Export functions for global use
window.analytics = {
    track: trackEvent,
    trackAuth: trackAuth,
    trackFeature: trackFeature,
    trackRelationship: trackRelationship,
    trackError: trackError
};

console.log('📊 Analytics helper โหลดเสร็จแล้ว');
