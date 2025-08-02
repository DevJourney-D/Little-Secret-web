// Diary management system for Neko U
let supabase;
let currentUser = null;
let partnerProfile = null;
let diaryEntries = [];
let currentEditId = null;

// DOM elements
const elements = {
    diaryForm: document.getElementById('diaryForm'),
    diaryTitle: document.getElementById('diaryTitle'),
    diaryContent: document.getElementById('diaryContent'),
    diaryMood: document.getElementById('diaryMood'),
    diaryVisibility: document.getElementById('diaryVisibility'),
    diaryCategory: document.getElementById('diaryCategory'),
    saveDiaryBtn: document.getElementById('saveDiaryBtn'),
    charCount: document.getElementById('charCount'),
    
    // Edit modal elements
    editDiaryModal: document.getElementById('editDiaryModal'),
    editDiaryForm: document.getElementById('editDiaryForm'),
    editDiaryId: document.getElementById('editDiaryId'),
    editDiaryTitle: document.getElementById('editDiaryTitle'),
    editDiaryContent: document.getElementById('editDiaryContent'),
    editDiaryMood: document.getElementById('editDiaryMood'),
    editDiaryVisibility: document.getElementById('editDiaryVisibility'),
    editDiaryCategory: document.getElementById('editDiaryCategory'),
    editCharCount: document.getElementById('editCharCount'),
    updateDiaryBtn: document.getElementById('updateDiaryBtn'),
    
    // Delete modal elements
    deleteDiaryModal: document.getElementById('deleteDiaryModal'),
    deleteDiaryId: document.getElementById('deleteDiaryId'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    
    // Search and filter elements
    searchInput: document.getElementById('searchInput'),
    sortBy: document.getElementById('sortBy'),
    
    // Tab content containers
    allDiaryEntries: document.getElementById('allDiaryEntries'),
    myDiaryEntries: document.getElementById('myDiaryEntries'),
    partnerDiaryEntries: document.getElementById('partnerDiaryEntries'),
    sharedDiaryEntries: document.getElementById('sharedDiaryEntries'),
    
    userDisplayName: document.getElementById('userDisplayName')
};

// Initialize the diary page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('📖 เริ่มต้นไดอารี่...');
        
        // ตรวจสอบการเข้าสู่ระบบ
        const isLoggedIn = await userInfo.isUserLoggedIn();
        if (!isLoggedIn) {
            console.log('❌ ไม่ได้เข้าสู่ระบบ');
            utils.redirect('index.html');
            return;
        }

        // ดึงข้อมูลผู้ใช้และคู่รักจาก cache
        currentUser = await userInfo.getCurrentUser();
        partnerProfile = await userInfo.getPartnerInfo();
        
        if (!currentUser) {
            utils.redirect('index.html');
            return;
        }
        
        await initializeDiary();
        
        console.log('✅ ไดอารี่เริ่มต้นสำเร็จ');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นไดอารี่:', error);
    }
});
    console.log('🏠 เริ่มต้นหน้าไดอารี่...');
    
    try {
        // ตรวจสอบการเข้าสู่ระบบ
        const isLoggedIn = await userInfo.isUserLoggedIn();
        if (!isLoggedIn) {
            console.log('❌ ไม่ได้เข้าสู่ระบบ');
            utils.redirect('index.html');
            return;
        }

        // ดึงข้อมูลผู้ใช้และคู่รัก
        currentUser = await userInfo.getCurrentUser();
        partnerProfile = await userInfo.getPartnerInfo();
        
        if (!currentUser) {
            console.log('❌ ไม่สามารถดึงข้อมูลผู้ใช้ได้');
            utils.redirect('index.html');
            return;
        }

        console.log('✅ โหลดข้อมูลผู้ใช้สำเร็จ:', currentUser.display_name || currentUser.username);
        
        // แสดงชื่อผู้ใช้
        updateUserDisplay();
        
        await initializeDiary();
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นหน้าไดอารี่:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการโหลดหน้าไดอารี่', 'error');
    }

function updateUserDisplay() {
    if (elements.userDisplayName && currentUser) {
        const displayName = currentUser.display_name || currentUser.username || 'ผู้ใช้';
        elements.userDisplayName.textContent = displayName;
        console.log('👤 แสดงชื่อผู้ใช้:', displayName);
    }
}

// Initialize diary functionality
async function initializeDiary() {
    try {
        console.log('🔄 เริ่มต้นระบบไดอารี่...');
        
        // ตั้งค่า event listeners
        setupEventListeners();
        
        // โหลดไดอารี่ทั้งหมด
        await loadDiaryEntries();
        
        console.log('✅ ระบบไดอารี่พร้อมใช้งาน');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นระบบไดอารี่:', error);
        utils.showAlert('ไม่สามารถโหลดระบบไดอารี่ได้', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Initialize mood selectors
    initializeMoodSelectors();
    
    // Initialize character counters
    initializeCharacterCounters();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize search and filters
    initializeSearchAndFilters();
}

// Initialize mood selectors
function initializeMoodSelectors() {
    // Main mood selector
    const moodOptions = document.querySelectorAll('.mood-option:not(#editMoodSelector .mood-option)');
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            elements.diaryMood.value = this.dataset.mood;
        });
    });
    
    // Edit modal mood selector
    const editMoodOptions = document.querySelectorAll('#editMoodSelector .mood-option');
    editMoodOptions.forEach(option => {
        option.addEventListener('click', function() {
            editMoodOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            elements.editDiaryMood.value = this.dataset.mood;
        });
    });
}

// Initialize character counters
function initializeCharacterCounters() {
    // Main form character counter
    elements.diaryContent.addEventListener('input', function() {
        const count = this.value.length;
        elements.charCount.textContent = count;
        
        if (count > 1000) {
            elements.charCount.style.color = '#dc3545';
        } else if (count > 800) {
            elements.charCount.style.color = '#ffc107';
        } else {
            elements.charCount.style.color = '#666';
        }
    });
    
    // Edit modal character counter
    elements.editDiaryContent.addEventListener('input', function() {
        const count = this.value.length;
        elements.editCharCount.textContent = count;
        
        if (count > 1000) {
            elements.editCharCount.style.color = '#dc3545';
        } else if (count > 800) {
            elements.editCharCount.style.color = '#ffc107';
        } else {
            elements.editCharCount.style.color = '#666';
        }
    });
}

// Initialize form handlers
function initializeFormHandlers() {
    // Main diary form
    elements.diaryForm.addEventListener('submit', handleDiarySubmit);
    
    // Edit diary form
    elements.updateDiaryBtn.addEventListener('click', handleDiaryUpdate);
    
    // Delete diary confirmation
    elements.confirmDeleteBtn.addEventListener('click', handleDiaryDelete);
}

// Initialize search and filters
function initializeSearchAndFilters() {
    // Search input
    elements.searchInput.addEventListener('input', debounce(filterAndDisplayEntries, 300));
    
    // Sort selector
    elements.sortBy.addEventListener('change', filterAndDisplayEntries);
    
    // Tab change handlers
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const targetTab = event.target.id;
            console.log(`Switching to tab: ${targetTab}`);
            
            // Show appropriate loading and then filter
            setTimeout(() => {
                filterAndDisplayEntries();
            }, 100);
        });
    });
    
    // Handle initial tab loading
    setTimeout(() => {
        filterAndDisplayEntries();
    }, 100);
}

// Handle diary form submission
async function handleDiarySubmit(e) {
    e.preventDefault();
    
    try {
        elements.saveDiaryBtn.disabled = true;
        elements.saveDiaryBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinning"></i> กำลังบันทึก...';
        
        const formData = {
            title: elements.diaryTitle.value.trim(),
            content: elements.diaryContent.value.trim(),
            mood: elements.diaryMood.value,
            visibility: elements.diaryVisibility.value,
            category: elements.diaryCategory.value,
            user_id: currentUser.id,
            created_at: new Date().toISOString()
        };
        
        // Validate form data
        if (!formData.title || !formData.content || !formData.mood) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
        
        if (formData.content.length > 1000) {
            throw new Error('เนื้อหาต้องไม่เกิน 1000 ตัวอักษร');
        }
        
        // Save to database
        if (!window.supabase) {
            throw new Error('ไม่พบการเชื่อมต่อฐานข้อมูล กรุณาตั้งค่า Supabase');
        }

        const { data, error } = await window.supabase
            .from('diary_entries')
            .insert([formData])
            .select();
            
        if (error) throw error;
        
        // Show success message
        showAlert('บันทึกไดอารี่เรียบร้อยแล้ว! 💕', 'success');
        
        // Reset form
        resetDiaryForm();
        
        // Reload entries
        await loadDiaryEntries();
        
    } catch (error) {
        console.error('Error saving diary:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
        elements.saveDiaryBtn.disabled = false;
        elements.saveDiaryBtn.innerHTML = '<i class="bi bi-save"></i> บันทึกไดอารี่';
    }
}

// Handle diary update
async function handleDiaryUpdate() {
    try {
        elements.updateDiaryBtn.disabled = true;
        elements.updateDiaryBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinning"></i> กำลังบันทึก...';
        
        const entryId = elements.editDiaryId.value;
        const formData = {
            title: elements.editDiaryTitle.value.trim(),
            content: elements.editDiaryContent.value.trim(),
            mood: elements.editDiaryMood.value,
            visibility: elements.editDiaryVisibility.value,
            category: elements.editDiaryCategory.value,
            updated_at: new Date().toISOString()
        };
        
        // Validate form data
        if (!formData.title || !formData.content || !formData.mood) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
        
        if (formData.content.length > 1000) {
            throw new Error('เนื้อหาต้องไม่เกิน 1000 ตัวอักษร');
        }
        
        // Update in database
        if (!window.supabase) {
            throw new Error('ไม่พบการเชื่อมต่อฐานข้อมูล');
        }

        const { error } = await window.supabase
            .from('diary_entries')
            .update(formData)
            .eq('id', entryId)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(elements.editDiaryModal);
        modal.hide();
        
        // Show success message
        showAlert('แก้ไขไดอารี่เรียบร้อยแล้ว! ✨', 'success');
        
        // Reload entries
        await loadDiaryEntries();
        
    } catch (error) {
        console.error('Error updating diary:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการแก้ไข', 'error');
    } finally {
        elements.updateDiaryBtn.disabled = false;
        elements.updateDiaryBtn.innerHTML = '<i class="bi bi-save"></i> บันทึกการแก้ไข';
    }
}

// Handle diary deletion
async function handleDiaryDelete() {
    try {
        elements.confirmDeleteBtn.disabled = true;
        elements.confirmDeleteBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinning"></i> กำลังลบ...';
        
        const entryId = elements.deleteDiaryId.value;
        
        // Delete from database
        if (!window.supabase) {
            throw new Error('ไม่พบการเชื่อมต่อฐานข้อมูล');
        }

        const { error } = await window.supabase
            .from('diary_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(elements.deleteDiaryModal);
        modal.hide();
        
        // Show success message
        showAlert('ลบไดอารี่เรียบร้อยแล้ว', 'success');
        
        // Reload entries
        await loadDiaryEntries();
        
    } catch (error) {
        console.error('Error deleting diary:', error);
        showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
    } finally {
        elements.confirmDeleteBtn.disabled = false;
        elements.confirmDeleteBtn.innerHTML = '<i class="bi bi-trash"></i> ลบไดอารี่';
    }
}

// Load diary entries
async function loadDiaryEntries() {
    try {
        showLoadingSpinner(true);
        
        // ตรวจสอบ Supabase connection
        if (!window.supabase) {
            console.log('⚠️ ไม่พบการเชื่อมต่อ Supabase - ใช้โหมดทดสอบ');
            diaryEntries = [];
            setTimeout(() => {
                filterAndDisplayEntries();
                utils.showAlert('โหมดทดสอบ: กรุณาตั้งค่า Supabase เพื่อใช้งานจริง', 'info');
            }, 1500);
            return;
        }

        // ตรวจสอบข้อมูลผู้ใช้
        if (!currentUser || !currentUser.id) {
            console.error('❌ ไม่มีข้อมูลผู้ใช้');
            throw new Error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        }
        
        // Build query with proper error handling
        let query = window.supabase
            .from('diary_entries')
            .select(`
                *,
                author:users!diary_entries_user_id_fkey(
                    id,
                    first_name, 
                    last_name, 
                    display_name, 
                    username,
                    avatar_url,
                    nickname
                )
            `)
            .order('created_at', { ascending: false });
        
        // Add user filter based on current user and partner
        const userIds = [currentUser.id];
        if (partnerProfile && partnerProfile.id) {
            userIds.push(partnerProfile.id);
        }
        
        query = query.in('user_id', userIds);
        
        console.log('🔄 โหลดไดอารี่สำหรับผู้ใช้:', userIds);
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`ไม่สามารถโหลดข้อมูลจากฐานข้อมูลได้: ${error.message}`);
        }
        
        diaryEntries = data || [];
        
        // Show success message if data loaded
        if (diaryEntries.length > 0) {
            console.log(`✅ โหลดไดอารี่สำเร็จ: ${diaryEntries.length} รายการ`);
        } else {
            console.log('📝 ยังไม่มีไดอารี่ในระบบ');
        }
        
        setTimeout(() => {
            filterAndDisplayEntries();
        }, 800); // Small delay to show loading animation
        
    } catch (error) {
        console.error('Error loading diary entries:', error);
        
        // Show error in all containers
        const containers = [
            elements.allDiaryEntries,
            elements.myDiaryEntries,
            elements.partnerDiaryEntries,
            elements.sharedDiaryEntries
        ];
        
        containers.forEach(container => {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                        <h4>เกิดข้อผิดพลาดในการโหลดข้อมูล</h4>
                        <p>${error.message || 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้'}</p>
                        <button class="btn btn-primary" onclick="loadDiaryEntries()">
                            <i class="bi bi-arrow-clockwise"></i> ลองใหม่
                        </button>
                    </div>
                `;
            }
        });
        
        utils.showAlert(error.message || 'เกิดข้อผิดพลาดในการโหลดไดอารี่', 'error');
    } finally {
        showLoadingSpinner(false);
    }
}

// Filter and display entries based on current tab and search
function filterAndDisplayEntries() {
    const activeTab = document.querySelector('.nav-link.active').id;
    const searchTerm = elements.searchInput.value.toLowerCase();
    const sortBy = elements.sortBy.value;
    
    let filteredEntries = [...diaryEntries];
    
    // Filter by tab
    switch (activeTab) {
        case 'mine-tab':
            filteredEntries = filteredEntries.filter(entry => entry.user_id === currentUser.id);
            break;
        case 'partner-tab':
            if (partnerProfile) {
                filteredEntries = filteredEntries.filter(entry => entry.user_id === partnerProfile.id);
            } else {
                filteredEntries = [];
            }
            break;
        case 'shared-tab':
            filteredEntries = filteredEntries.filter(entry => entry.visibility === 'shared');
            break;
        // 'all-tab' shows all entries, no additional filtering needed
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredEntries = filteredEntries.filter(entry => 
            entry.title.toLowerCase().includes(searchTerm) ||
            entry.content.toLowerCase().includes(searchTerm) ||
            entry.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort entries
    filteredEntries.sort((a, b) => {
        switch (sortBy) {
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'title':
                return a.title.localeCompare(b.title, 'th');
            case 'newest':
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    
    // Display entries in the active tab
    const activeContainer = getActiveContainer();
    displayEntries(filteredEntries, activeContainer);
    
    // Update other tabs if they exist
    updateAllTabsData(filteredEntries);
}

// Update all tabs with filtered data
function updateAllTabsData(allFilteredEntries) {
    // Update "ของฉัน" tab
    const myEntries = allFilteredEntries.filter(entry => entry.user_id === currentUser.id);
    if (elements.myDiaryEntries && document.querySelector('#mine-tab').classList.contains('active')) {
        displayEntries(myEntries, elements.myDiaryEntries);
    }
    
    // Update "ของคู่รัก" tab
    if (partnerProfile) {
        const partnerEntries = allFilteredEntries.filter(entry => entry.user_id === partnerProfile.id);
        if (elements.partnerDiaryEntries && document.querySelector('#partner-tab').classList.contains('active')) {
            displayEntries(partnerEntries, elements.partnerDiaryEntries);
        }
    }
    
    // Update "แบ่งปันกัน" tab
    const sharedEntries = allFilteredEntries.filter(entry => entry.visibility === 'shared');
    if (elements.sharedDiaryEntries && document.querySelector('#shared-tab').classList.contains('active')) {
        displayEntries(sharedEntries, elements.sharedDiaryEntries);
    }
    
    // Update "ทั้งหมด" tab
    if (elements.allDiaryEntries && document.querySelector('#all-tab').classList.contains('active')) {
        displayEntries(allFilteredEntries, elements.allDiaryEntries);
    }
}

// Get the active tab container
function getActiveContainer() {
    const activeTab = document.querySelector('.nav-link.active').id;
    
    switch (activeTab) {
        case 'mine-tab':
            return elements.myDiaryEntries;
        case 'partner-tab':
            return elements.partnerDiaryEntries;
        case 'shared-tab':
            return elements.sharedDiaryEntries;
        case 'all-tab':
        default:
            return elements.allDiaryEntries;
    }
}

// Display diary entries in container
function displayEntries(entries, container) {
    if (entries.length === 0) {
        const activeTab = document.querySelector('.nav-link.active').id;
        let emptyMessage = {
            title: 'ยังไม่มีไดอารี่',
            description: 'เริ่มเขียนไดอารี่แรกของคุณกันเถอะ!'
        };
        
        // Customize empty message based on active tab
        switch (activeTab) {
            case 'mine-tab':
                emptyMessage = {
                    title: 'ยังไม่มีไดอารี่ของคุณ',
                    description: 'เริ่มเขียนไดอารี่แรกของคุณกันเถอะ!'
                };
                break;
            case 'partner-tab':
                emptyMessage = {
                    title: 'ยังไม่มีไดอารี่ของคู่รัก',
                    description: 'รอคู่รักเขียนไดอารี่สักหน่อยนะ 💕'
                };
                break;
            case 'shared-tab':
                emptyMessage = {
                    title: 'ยังไม่มีไดอารี่ที่แบ่งปัน',
                    description: 'เขียนไดอารี่และเลือก "แบ่งปันกับคู่รัก" เพื่อให้คู่รักได้อ่านด้วยกัน 💕'
                };
                break;
            default:
                emptyMessage = {
                    title: 'ยังไม่พบข้อมูลไดอารี่',
                    description: 'เริ่มเขียนไดอารี่แรกของคุณกันเถอะ!'
                };
        }
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-journal-x"></i>
                <h4>${emptyMessage.title}</h4>
                <p>${emptyMessage.description}</p>
            </div>
        `;
        return;
    }
    
    const entriesHtml = entries.map(entry => createEntryHtml(entry)).join('');
    container.innerHTML = entriesHtml;
}

// Create HTML for a single diary entry
function createEntryHtml(entry) {
    const isOwner = entry.user_id === currentUser.id;
    const authorName = isOwner ? 'คุณ' : (entry.author?.display_name || 'คู่รัก');
    const authorInitial = authorName.charAt(0);
    const entryDate = formatDate(entry.created_at);
    const categoryName = getCategoryName(entry.category);
    const visibilityBadge = entry.visibility === 'shared' ? 
        '<span class="visibility-badge visibility-shared">แบ่งปัน 💕</span>' : 
        '<span class="visibility-badge visibility-private">ส่วนตัว 🔒</span>';
    
    const actionButtons = isOwner ? `
        <div class="diary-actions">
            <button class="btn btn-action btn-edit" onclick="editDiary('${entry.id}')">
                <i class="bi bi-pencil"></i> แก้ไข
            </button>
            <button class="btn btn-action btn-delete" onclick="confirmDeleteDiary('${entry.id}')">
                <i class="bi bi-trash"></i> ลบ
            </button>
        </div>
    ` : '';
    
    return `
        <div class="diary-entry" data-entry-id="${entry.id}">
            <div class="diary-meta">
                <div class="diary-author">
                    <div class="author-avatar">${authorInitial}</div>
                    <span>${authorName}</span>
                    ${visibilityBadge}
                </div>
                <div class="diary-date">
                    <i class="bi bi-calendar3"></i>
                    ${entryDate}
                </div>
            </div>
            
            <div class="diary-title">
                <span class="diary-mood">${entry.mood}</span>
                ${entry.title}
            </div>
            
            <div class="diary-content">
                ${entry.content.replace(/\n/g, '<br>')}
            </div>
            
            <div class="diary-tags">
                <span class="diary-tag">${categoryName}</span>
            </div>
            
            ${actionButtons}
        </div>
    `;
}

// Edit diary entry
function editDiary(entryId) {
    const entry = diaryEntries.find(e => e.id === entryId);
    if (!entry || entry.user_id !== currentUser.id) {
        showAlert('ไม่สามารถแก้ไขไดอารี่นี้ได้', 'error');
        return;
    }
    
    // Populate edit form
    elements.editDiaryId.value = entry.id;
    elements.editDiaryTitle.value = entry.title;
    elements.editDiaryContent.value = entry.content;
    elements.editDiaryMood.value = entry.mood;
    elements.editDiaryVisibility.value = entry.visibility;
    elements.editDiaryCategory.value = entry.category;
    
    // Update character count
    elements.editCharCount.textContent = entry.content.length;
    
    // Select mood
    document.querySelectorAll('#editMoodSelector .mood-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.mood === entry.mood) {
            opt.classList.add('selected');
        }
    });
    
    // Show modal
    const modal = new bootstrap.Modal(elements.editDiaryModal);
    modal.show();
}

// Confirm diary deletion
function confirmDeleteDiary(entryId) {
    const entry = diaryEntries.find(e => e.id === entryId);
    if (!entry || entry.user_id !== currentUser.id) {
        showAlert('ไม่สามารถลบไดอารี่นี้ได้', 'error');
        return;
    }
    
    elements.deleteDiaryId.value = entryId;
    
    // Show modal
    const modal = new bootstrap.Modal(elements.deleteDiaryModal);
    modal.show();
}

// Utility functions
function resetDiaryForm() {
    elements.diaryForm.reset();
    elements.diaryMood.value = '';
    elements.charCount.textContent = '0';
    document.querySelectorAll('.mood-option:not(#editMoodSelector .mood-option)').forEach(opt => {
        opt.classList.remove('selected');
    });
}

function showLoadingSpinner(show) {
    const containers = [
        { element: elements.allDiaryEntries, text: 'กำลังโหลดไดอารี่...' },
        { element: elements.myDiaryEntries, text: 'กำลังโหลดไดอารี่ของคุณ...' },
        { element: elements.partnerDiaryEntries, text: 'กำลังโหลดไดอารี่ของคู่รัก...' },
        { element: elements.sharedDiaryEntries, text: 'กำลังโหลดไดอารี่ที่แบ่งปัน...' }
    ];
    
    if (show) {
        containers.forEach(container => {
            if (container.element) {
                container.element.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner-container">
                            <div class="spinner-ring"></div>
                            <div class="spinner-ring"></div>
                            <div class="spinner-ring"></div>
                            <div class="loading-heart">💕</div>
                        </div>
                        <p class="loading-text">${container.text}</p>
                    </div>
                `;
            }
        });
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'วันนี้ ' + date.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else if (diffDays === 1) {
        return 'เมื่อวาน ' + date.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else {
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function getCategoryName(category) {
    const categories = {
        'daily': 'ประจำวัน',
        'love': 'ความรัก',
        'travel': 'ท่องเที่ยว',
        'food': 'อาหาร',
        'work': 'งาน',
        'other': 'อื่นๆ'
    };
    return categories[category] || 'อื่นๆ';
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert.position-fixed');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="bi bi-check-circle-fill me-2"></i>';
            break;
        case 'error':
            icon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
            break;
        case 'warning':
            icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
            break;
        default:
            icon = '<i class="bi bi-info-circle-fill me-2"></i>';
    }
    
    alertDiv.innerHTML = `
        ${icon}${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

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

// Setup real-time subscription for diary updates
function setupRealtimeSubscription() {
    if (!window.supabase || !currentUser) return;
    
    const userIds = [currentUser.id];
    if (partnerProfile && partnerProfile.id) {
        userIds.push(partnerProfile.id);
    }
    
    window.supabase
        .channel('diary_entries')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'diary_entries',
                filter: `user_id=in.(${userIds.join(',')})`
            }, 
            (payload) => {
                console.log('Real-time update:', payload);
                loadDiaryEntries();
            }
        )
        .subscribe();
}

function initializeDropdown() {
    // Ensure dropdown works properly
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl));
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
                const dropdownInstance = bootstrap.Dropdown.getInstance(dropdown.previousElementSibling);
                if (dropdownInstance) {
                    dropdownInstance.hide();
                }
            }
        });
    });
}

function updateUserDisplay() {
    const userName = document.getElementById('userName');
    if (userName && currentUser) {
        userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
}

// Navigation functions
function showProfile() {
    utils.redirect('settings.html');
}

// Logout function
async function logout() {
    const confirmed = await utils.showConfirm(
        '👋 ออกจากระบบ', 
        'คุณแน่ใจหรือไม่ที่จะออกจากระบบ?',
        'ออกจากระบบ',
        'ยกเลิก',
        'warning'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Clean up PresenceManager before logout
        if (window.presenceManager) {
            window.presenceManager.cleanup();
        }
        
        // Sign out from Supabase
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }
        
        // Clear local storage
        utils.clearUserSession();
        
        // Redirect to login
        utils.redirect('index.html');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการออกจากระบบ:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    }
}

// Make functions globally available
window.editDiary = editDiary;
window.confirmDeleteDiary = confirmDeleteDiary;
window.logout = logout;
