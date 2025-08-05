// Authentication Check Script for localStorage
function checkAuthenticationStatus() {
    console.log('🔍 === AUTHENTICATION STATUS CHECK (localStorage) ===');
    
    // Check localStorage data
    console.log('💾 localStorage contents:');
    console.log('  - nekouToken:', localStorage.getItem('nekouToken') ? 'exists' : 'missing');
    console.log('  - nekouUser:', localStorage.getItem('nekouUser') ? 'exists' : 'missing');
    
    // Check raw values for corruption
    const rawToken = localStorage.getItem('nekouToken');
    const rawUser = localStorage.getItem('nekouUser');
    
    if (rawToken) {
        console.log('🔑 Raw token preview:', rawToken.substring(0, 20) + '...');
        if (rawToken === 'undefined' || rawToken === 'null' || rawToken === '') {
            console.log('❌ Token is corrupted (literal string):', rawToken);
        }
    }
    
    if (rawUser) {
        console.log('👤 Raw user data preview:', rawUser.substring(0, 50) + '...');
        if (rawUser === 'undefined' || rawUser === 'null' || rawUser === '') {
            console.log('❌ User data is corrupted (literal string):', rawUser);
        }
    }
    
    // Check if SIMPLE_API exists
    if (typeof SIMPLE_API === 'undefined') {
        console.error('❌ SIMPLE_API is not defined');
        console.log('⚠️ SIMPLE_API not ready yet, will retry...');
        return false;
    }
    
    // Check token with detailed logging
    const token = SIMPLE_API.getToken();
    console.log('🔑 Token check result:');
    console.log('  - Exists:', !!token);
    console.log('  - Type:', typeof token);
    console.log('  - Length:', token ? token.length : 0);
    console.log('  - Preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    // Check user data with detailed logging
    const user = SIMPLE_API.getCurrentUser();
    console.log('👤 User data check result:');
    console.log('  - Exists:', !!user);
    console.log('  - Type:', typeof user);
    console.log('  - Has ID:', !!(user && user.id));
    console.log('  - Username/Email:', user ? (user.username || user.email) : 'null');
    
    // Show warning but don't redirect immediately
    if (!token) {
        console.log('⚠️ No valid token found - authentication required');
        return false;
    }
    
    if (!user || !user.id) {
        console.log('⚠️ No valid user data - authentication required');
        return false;
    }
    
    console.log('✅ Authentication check passed');
    return true;
}

// Enhanced function to clear corrupted data
function clearCorruptedAuthData() {
    console.log('🧹 Clearing all authentication data...');
    
    // Clear localStorage (primary storage)
    try {
        localStorage.removeItem('nekouToken');
        localStorage.removeItem('nekouUser');
        console.log('✅ localStorage cleared');
    } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
    }
    
    // Clear cookies (backup/legacy)
    try {
        document.cookie = 'nekouToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        document.cookie = 'nekouUser=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        console.log('✅ Cookies cleared');
    } catch (error) {
        console.error('❌ Error clearing cookies:', error);
    }
    
    console.log('🧹 All authentication data cleared');
}

// Run automatic check when script loads
console.log('🔐 Auth-check script loaded');

// Make functions globally available
window.checkAuthenticationStatus = checkAuthenticationStatus;
window.clearCorruptedAuthData = clearCorruptedAuthData;
