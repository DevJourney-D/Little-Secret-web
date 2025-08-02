// Neko U Settings Page Script
// Settings management for user profile, preferences, and account

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!nekouAuth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Load user data
    loadUserData();
    
    // Initialize event listeners
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Profile editing
    document.getElementById('editOverviewBtn')?.addEventListener('click', () => {
        document.querySelector('#updateProfileForm').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        setTimeout(() => toggleEditMode('updateProfile'), 500);
    });

    document.getElementById('editBasicProfileBtn')?.addEventListener('click', () => {
        toggleEditMode('updateProfile');
    });
    
    document.getElementById('saveBasicProfileBtn')?.addEventListener('click', () => {
        saveProfile('updateProfile');
    });
    
    document.getElementById('cancelBasicProfileBtn')?.addEventListener('click', () => {
        cancelEditMode('updateProfile');
    });

    // Preferences editing
    document.getElementById('editPreferencesBtn')?.addEventListener('click', () => {
        toggleEditMode('preferences');
    });
    
    document.getElementById('savePreferencesBtn')?.addEventListener('click', () => {
        savePreferences();
    });
    
    document.getElementById('cancelPreferencesBtn')?.addEventListener('click', () => {
        cancelEditMode('preferences');
    });

    // Security forms
    document.getElementById('editEmailBtn')?.addEventListener('click', toggleEmailFormVisibility);
    document.getElementById('editPasswordBtn')?.addEventListener('click', togglePasswordFormVisibility);

    // Form submissions
    document.getElementById('changeEmailForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleEmailChange();
    });

    document.getElementById('changePasswordForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handlePasswordChange();
    });

    // Delete account
    document.getElementById('deleteAccountBtn')?.addEventListener('click', handleDeleteAccount);

    // Password strength checker
    document.getElementById('newPassword')?.addEventListener('input', checkPasswordStrength);
}

// Load and display user data
async function loadUserData() {
    try {
        showLoading('กำลังโหลดข้อมูลผู้ใช้...');

        const currentUser = nekouAuth.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Fetch latest user profile from API
        const response = await api.users.getById(currentUser.id);
        
        if (!response || !response.success) {
            throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        }

        const user = response.data;
        populateUserInterface(user);
        updatePartnershipStatus(user);
        await loadUserStats(user.id);

        hideLoading();
    } catch (error) {
        console.error('Load user data error:', error);
        hideLoading();
        showAlert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ' + error.message, 'danger');
    }
}

// Utility functions
function showLoading(message = 'กำลังโหลด...') {
    // Simple loading implementation
    document.body.style.cursor = 'wait';
    console.log('Loading:', message);
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'x-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Populate user interface with data
function populateUserInterface(user) {
    // Populate user overview
    document.getElementById('userDisplayName').textContent = user.display_name || `${user.first_name} ${user.last_name}`;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userUsername').textContent = user.username;
    document.getElementById('userJoinDate').textContent = formatDate(user.created_at);
    document.getElementById('currentEmailDisplay').textContent = user.email;

    // Update navbar
    document.getElementById('userName').textContent = user.display_name || user.nickname || user.first_name;

    // Populate basic profile form
    document.getElementById('firstName').value = user.first_name || '';
    document.getElementById('lastName').value = user.last_name || '';
    document.getElementById('displayName').value = user.display_name || '';
    document.getElementById('nickname').value = user.nickname || '';
    document.getElementById('birthDate').value = user.birth_date || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('bio').value = user.bio || '';

    // Set gender radio button
    if (user.gender) {
        const genderElement = document.getElementById(`gender${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}`);
        if (genderElement) {
            genderElement.checked = true;
        }
    }

    // Populate preferences from JSON fields
    const notificationSettings = user.notification_settings || {};
    const privacySettings = user.privacy_settings || {};

    document.getElementById('notificationChat').checked = notificationSettings.chat || false;
    document.getElementById('notificationDiary').checked = notificationSettings.diary || false;
    document.getElementById('notificationPush').checked = notificationSettings.push || false;
    document.getElementById('notificationEmail').checked = notificationSettings.email || false;
    
    document.getElementById('diaryDefault').value = privacySettings.diary_default || 'shared';
    document.getElementById('profileVisibility').value = privacySettings.profile_visibility || 'partner';
    document.getElementById('lastSeenVisible').checked = privacySettings.last_seen_visible !== false;
    
    document.getElementById('language').value = user.language || 'th';
    document.getElementById('timezone').value = user.timezone || 'Asia/Bangkok';

    // Populate quick info sidebar
    populateQuickInfo(user);
}

// Populate quick info sidebar
function populateQuickInfo(user) {
    document.getElementById('userGender').textContent = user.gender ? 
        (user.gender === 'male' ? 'ชาย' : user.gender === 'female' ? 'หญิง' : 'อื่นๆ') : 'ไม่ระบุ';
    document.getElementById('userPhone').textContent = user.phone || 'ไม่ระบุ';
    document.getElementById('userBirthDate').textContent = user.birth_date ? formatDate(user.birth_date) : 'ไม่ระบุ';
    document.getElementById('userTimezone').textContent = user.timezone === 'Asia/Bangkok' ? 'เวลาไทย' : user.timezone;
    document.getElementById('userLanguage').textContent = user.language === 'th' ? 'ไทย' : 'English';
}

// Load user statistics
async function loadUserStats(userId) {
    try {
        // Load diary stats
        const diaryResponse = await api.diary.getStats(userId);
        if (diaryResponse && diaryResponse.success) {
            const diaryCount = diaryResponse.data.total_entries || 0;
            const diaryCard = document.querySelector('.stat-card:nth-child(1) p');
            if (diaryCard) {
                diaryCard.textContent = `${diaryCount} บันทึก`;
            }
        }

        // Calculate relationship days if partner exists
        const currentUser = nekouAuth.getCurrentUser();
        if (currentUser.partner_id && currentUser.relationship_anniversary) {
            const anniversaryDate = new Date(currentUser.relationship_anniversary);
            const today = new Date();
            const daysTogether = Math.floor((today - anniversaryDate) / (1000 * 60 * 60 * 24));
            
            const daysCard = document.querySelector('.stat-card:nth-child(3) p');
            if (daysCard) {
                daysCard.textContent = `${daysTogether} วัน`;
            }
        }

    } catch (error) {
        console.error('Load stats error:', error);
        // Keep default values on error
    }
}

// Update partnership status display
function updatePartnershipStatus(user) {
    const partnershipElement = document.getElementById('partnershipStatus');
    const partnerInfoElement = document.getElementById('partnerInfo');
    
    if (user.partner_id) {
        partnershipElement.innerHTML = `
            <span class="partnership-badge connected">
                <i class="bi bi-heart-fill"></i>
                มีคู่รักแล้ว
            </span>
        `;
        
        partnerInfoElement.innerHTML = `
            <i class="bi bi-heart-fill display-6 text-success mb-3"></i>
            <h6 class="text-success">เชื่อมต่อกับคู่รักแล้ว</h6>
            <p class="text-muted small">รหัสคู่รัก: ${user.partner_code || 'ไม่ระบุ'}</p>
            <button class="btn btn-outline-danger btn-sm" onclick="disconnectPartner()">
                <i class="bi bi-unlink me-1"></i>ยกเลิกการเชื่อมต่อ
            </button>
        `;
    } else {
        partnershipElement.innerHTML = `
            <span class="partnership-badge none">
                <i class="bi bi-heart"></i>
                ยังไม่มีคู่รัก
            </span>
        `;
        
        partnerInfoElement.innerHTML = `
            <i class="bi bi-heart-break display-6 text-muted mb-3"></i>
            <p class="text-muted">ยังไม่มีคู่รัก</p>
            <p class="text-muted small">รหัสของคุณ: <strong>${user.partner_code || 'กำลังสร้าง...'}</strong></p>
            <button class="btn btn-primary btn-sm" onclick="showConnectPartnerModal()">
                <i class="bi bi-plus me-1"></i>เชื่อมต่อกับคู่รัก
            </button>
        `;
    }
}

// Edit mode functions
function toggleEditMode(section) {
    const card = document.querySelector(`#${section}Form`).closest('.settings-card');
    const viewControls = card.querySelectorAll('.view-mode-controls');
    const editControls = card.querySelectorAll('.edit-mode-controls');
    const inputs = card.querySelectorAll('input, select, textarea');
    
    viewControls.forEach(control => control.style.display = 'none');
    editControls.forEach(control => control.style.display = 'inline-block');
    
    inputs.forEach(input => {
        if (!input.closest('#changeEmailForm') && !input.closest('#changePasswordForm')) {
            input.disabled = false;
        }
    });
    
    card.classList.add('edit-mode');
}

function cancelEditMode(section) {
    const card = document.querySelector(`#${section}Form`).closest('.settings-card');
    const viewControls = card.querySelectorAll('.view-mode-controls');
    const editControls = card.querySelectorAll('.edit-mode-controls');
    const inputs = card.querySelectorAll('input, select, textarea');
    
    viewControls.forEach(control => control.style.display = 'inline-block');
    editControls.forEach(control => control.style.display = 'none');
    
    inputs.forEach(input => {
        if (!input.closest('#changeEmailForm') && !input.closest('#changePasswordForm')) {
            input.disabled = true;
        }
    });
    
    card.classList.remove('edit-mode');
    
    // Reload original data
    loadUserData();
}

// Save profile data
async function saveProfile(section) {
    const saveBtn = document.querySelector(`#save${section.charAt(0).toUpperCase() + section.slice(1)}Btn`);
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>กำลังบันทึก...';
    saveBtn.disabled = true;

    try {
        const currentUser = nekouAuth.getCurrentUser();
        if (!currentUser) {
            throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        const form = document.getElementById(`${section}Form`);
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Handle gender radio button
        const genderRadio = form.querySelector('input[name="gender"]:checked');
        if (genderRadio) {
            data.gender = genderRadio.value;
        }

        // Map frontend fields to backend expected format
        const updateData = {
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: data.displayName,
            nickname: data.nickname,
            gender: data.gender,
            birth_date: data.birthDate,
            phone: data.phone,
            bio: data.bio
        };

        // Remove empty/undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === '' || updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const response = await api.users.update(currentUser.id, updateData);

        if (!response || !response.success) {
            throw new Error(response?.message || 'ไม่สามารถบันทึกข้อมูลได้');
        }

        // Update localStorage with new data
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('nekouUser', JSON.stringify(updatedUser));

        showAlert('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        cancelEditMode(section);
        
    } catch (error) {
        console.error('Save profile error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'danger');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Save preferences
async function savePreferences() {
    const saveBtn = document.getElementById('savePreferencesBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>กำลังบันทึก...';
    saveBtn.disabled = true;

    try {
        const currentUser = nekouAuth.getCurrentUser();
        if (!currentUser) {
            throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        const form = document.getElementById('preferencesForm');
        
        // Collect notification settings
        const notificationSettings = {
            chat: form.querySelector('#notificationChat').checked,
            diary: form.querySelector('#notificationDiary').checked,
            push: form.querySelector('#notificationPush').checked,
            email: form.querySelector('#notificationEmail').checked
        };

        // Collect privacy settings
        const privacySettings = {
            diary_default: form.querySelector('#diaryDefault').value,
            profile_visibility: form.querySelector('#profileVisibility').value,
            last_seen_visible: form.querySelector('#lastSeenVisible').checked
        };

        // Map to backend format
        const updateData = {
            notification_settings: notificationSettings,
            privacy_settings: privacySettings,
            language: form.querySelector('#language').value,
            timezone: form.querySelector('#timezone').value
        };

        const response = await api.users.update(currentUser.id, updateData);

        if (!response || !response.success) {
            throw new Error(response?.message || 'ไม่สามารถบันทึกการตั้งค่าได้');
        }

        // Update localStorage with new data
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('nekouUser', JSON.stringify(updatedUser));

        showAlert('บันทึกการตั้งค่าเรียบร้อยแล้ว', 'success');
        cancelEditMode('preferences');

    } catch (error) {
        console.error('Save preferences error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'danger');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Security functions
function toggleEmailFormVisibility() {
    const form = document.getElementById('changeEmailForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function togglePasswordFormVisibility() {
    const form = document.getElementById('changePasswordForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Handle email change
async function handleEmailChange() {
    const btn = document.getElementById('changeEmailBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>กำลังเปลี่ยน...';
    btn.disabled = true;

    try {
        const currentUser = nekouAuth.getCurrentUser();
        if (!currentUser) {
            throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        const newEmail = document.getElementById('newEmail').value;
        const currentPassword = document.getElementById('currentPasswordEmail').value;

        // Validate email format
        if (!nekouAuth.isValidEmail(newEmail)) {
            throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
        }

        // Check email availability first
        const availability = await nekouAuth.checkEmail(newEmail);
        if (!availability.available) {
            throw new Error('อีเมลนี้ถูกใช้แล้ว');
        }

        const response = await api.users.update(currentUser.id, {
            email: newEmail,
            current_password: currentPassword
        });

        if (!response || !response.success) {
            throw new Error(response?.message || 'ไม่สามารถเปลี่ยนอีเมลได้');
        }

        showAlert('เปลี่ยนอีเมลสำเร็จ', 'success');
        toggleEmailFormVisibility();
        document.getElementById('changeEmailForm').reset();
        
        // Update localStorage
        const updatedUser = { ...currentUser, email: newEmail };
        localStorage.setItem('nekouUser', JSON.stringify(updatedUser));
        
        await loadUserData();

    } catch (error) {
        console.error('Email change error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนอีเมล', 'danger');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Handle password change
async function handlePasswordChange() {
    const btn = document.getElementById('changePasswordBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>กำลังเปลี่ยน...';
    btn.disabled = true;

    try {
        const currentUser = nekouAuth.getCurrentUser();
        if (!currentUser) {
            throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            throw new Error('รหัสผ่านใหม่ไม่ตรงกัน');
        }

        if (newPassword.length < 6) {
            throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }

        const response = await api.request(`/api/users/${currentUser.id}/change-password`, {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });

        if (!response || !response.success) {
            throw new Error(response?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        }

        showAlert('เปลี่ยนรหัสผ่านสำเร็จ คุณจะถูกนำไปยังหน้าเข้าสู่ระบบใหม่', 'success');
        togglePasswordFormVisibility();
        document.getElementById('changePasswordForm').reset();

        // Reset password strength indicator
        resetPasswordStrengthIndicator();

        // Logout user after password change for security
        setTimeout(() => {
            nekouAuth.logout();
        }, 2000);

    } catch (error) {
        console.error('Password change error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'danger');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Partner connection functions
function showConnectPartnerModal() {
    const partnerCode = prompt('กรุณาใส่รหัสคู่รักของคุณ (6 ตัวอักษร):');
    if (partnerCode && partnerCode.length === 6) {
        connectWithPartner(partnerCode.toUpperCase());
    } else if (partnerCode) {
        showAlert('รหัสคู่รักต้องมี 6 ตัวอักษร', 'warning');
    }
}

async function connectWithPartner(partnerCode) {
    try {
        const currentUser = nekouAuth.getCurrentUser();
        const response = await api.users.connectPartner(currentUser.id, partnerCode);
        
        if (response && response.success) {
            showAlert('เชื่อมต่อกับคู่รักสำเร็จ! 💕', 'success');
            await loadUserData(); // Reload to show updated status
        } else {
            throw new Error(response?.message || 'ไม่สามารถเชื่อมต่อได้');
        }
    } catch (error) {
        console.error('Connect partner error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'danger');
    }
}

async function disconnectPartner() {
    if (!confirm('คุณต้องการยกเลิกการเชื่อมต่อกับคู่รักหรือไม่?')) {
        return;
    }

    try {
        const currentUser = nekouAuth.getCurrentUser();
        const response = await api.users.update(currentUser.id, {
            partner_id: null
        });
        
        if (response && response.success) {
            showAlert('ยกเลิกการเชื่อมต่อแล้ว', 'info');
            await loadUserData();
        } else {
            throw new Error(response?.message || 'ไม่สามารถยกเลิกการเชื่อมต่อได้');
        }
    } catch (error) {
        console.error('Disconnect partner error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ', 'danger');
    }
}

// Account deletion
async function handleDeleteAccount() {
    const confirmed = confirm('⚠️ คุณแน่ใจหรือไม่?\n\nการลบบัญชีจะทำให้ข้อมูลทั้งหมดถูกลบอย่างถาวร และไม่สามารถกู้คืนได้');
    
    if (!confirmed) return;

    const deleteConfirm = prompt('พิมพ์ "DELETE" เพื่อยืนยันการลบบัญชี:');
    if (deleteConfirm !== 'DELETE') {
        showAlert('การยืนยันไม่ถูกต้อง', 'warning');
        return;
    }

    const password = prompt('กรุณาใส่รหัสผ่านเพื่อยืนยันการลบบัญชี:');
    if (!password) return;

    const btn = document.getElementById('deleteAccountBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>กำลังลบ...';
    btn.disabled = true;

    try {
        const currentUser = nekouAuth.getCurrentUser();

        const response = await api.request(`/api/users/${currentUser.id}`, {
            method: 'DELETE',
            body: JSON.stringify({ password: password })
        });

        if (!response || !response.success) {
            throw new Error(response?.message || 'ไม่สามารถลบบัญชีได้');
        }

        showAlert('ลบบัญชีสำเร็จ กำลังเปลี่ยนเส้นทาง...', 'success');
        
        // Clear local storage and redirect
        localStorage.removeItem('nekouUser');
        localStorage.removeItem('nekouToken');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Delete account error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการลบบัญชี', 'danger');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Password strength checker
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    
    let strength = 0;
    let feedback = 'อ่อนแอ';
    let color = 'bg-danger';
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        feedback = 'แข็งแกร่ง';
        color = 'bg-success';
    } else if (strength >= 50) {
        feedback = 'ปานกลาง';
        color = 'bg-warning';
    }
    
    strengthBar.className = `progress-bar ${color}`;
    strengthBar.style.width = `${strength}%`;
    strengthText.textContent = `ความแข็งแกร่ง: ${feedback}`;
}

function resetPasswordStrengthIndicator() {
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    if (strengthBar) strengthBar.style.width = '0%';
    if (strengthText) strengthText.textContent = 'ความแข็งแกร่งของรหัสผ่าน';
}

function handleLogout() {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        nekouAuth.logout();
    }
}

// Partner connection functions
function showConnectPartnerModal() {
    const partnerCode = prompt('กรุณาใส่รหัสคู่รักของคุณ (6 ตัวอักษร):');
    if (partnerCode && partnerCode.length === 6) {
        connectWithPartner(partnerCode.toUpperCase());
    } else if (partnerCode) {
        showAlert('รหัสคู่รักต้องมี 6 ตัวอักษร', 'warning');
    }
}

async function connectWithPartner(partnerCode) {
    try {
        const currentUser = nekouAuth.getCurrentUser();
        const response = await api.users.connectPartner(currentUser.id, partnerCode);
        
        if (response && response.success) {
            showAlert('เชื่อมต่อกับคู่รักสำเร็จ! 💕', 'success');
            await loadUserData(); // Reload to show updated status
        } else {
            throw new Error(response?.message || 'ไม่สามารถเชื่อมต่อได้');
        }
    } catch (error) {
        console.error('Connect partner error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'danger');
    }
}

async function disconnectPartner() {
    if (!confirm('คุณต้องการยกเลิกการเชื่อมต่อกับคู่รักหรือไม่?')) {
        return;
    }
    
    try {
        const currentUser = nekouAuth.getCurrentUser();
        const response = await api.users.disconnectPartner(currentUser.id);
        
        if (response && response.success) {
            showAlert('ยกเลิกการเชื่อมต่อสำเร็จ', 'success');
            await loadUserData(); // Reload to show updated status
        } else {
            throw new Error(response?.message || 'ไม่สามารถยกเลิกการเชื่อมต่อได้');
        }
    } catch (error) {
        console.error('Disconnect partner error:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ', 'danger');
    }
}

console.log('⚙️ Neko U Settings System Loaded');
