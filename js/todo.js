// Todo functionality with UserInfoManager
let currentUser = null;
let partnerInfo = null;
let todos = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('📝 เริ่มต้น Todo...');
        
        // ตรวจสอบการเข้าสู่ระบบ
        const isLoggedIn = await userInfo.isUserLoggedIn();
        if (!isLoggedIn) {
            console.log('❌ ไม่ได้เข้าสู่ระบบ');
            utils.redirect('index.html');
            return;
        }

        // ดึงข้อมูลผู้ใช้และคู่รักจาก cache
        currentUser = await userInfo.getCurrentUser();
        partnerInfo = await userInfo.getPartnerInfo();
        
        if (!currentUser) {
            utils.redirect('index.html');
            return;
        }
        
        initializeTodo();
        await loadAllTodos();
        updateStatistics();
        
        console.log('✅ Todo เริ่มต้นสำเร็จ');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้น Todo:', error);
    }
});

function initializeTodo() {
    // Initialize form handlers
    const todoForm = document.getElementById('todoForm');
    if (todoForm) {
        todoForm.addEventListener('submit', handleSaveTodo);
    }
    
    // Initialize tab handlers
    const tabs = document.querySelectorAll('#statusTabs button');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', handleTabChange);
    });
}

async function handleSaveTodo(e) {
    e.preventDefault();
    
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    const priority = document.getElementById('todoPriority').value;
    const category = document.getElementById('todoCategory').value;
    const dueDate = document.getElementById('todoDueDate').value;
    const shared = document.getElementById('todoShared').checked;
    
    // Validation
    if (!title) {
        utils.showAlert('กรุณากรอกชื่องาน', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveTodoBtn');
    const originalText = saveBtn.innerHTML;
    
    try {
        // Show loading
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinning"></i> กำลังบันทึก...';
        
        const todoData = {
            user_id: currentUser.id,
            title: title,
            description: description,
            priority: priority,
            category: category,
            status: 'pending',
            completed: false,
            shared_with_partner: shared,
            created_at: new Date().toISOString()
        };
        
        if (dueDate) {
            todoData.due_date = new Date(dueDate).toISOString();
        }
        
        // Save to database
        const { data, error } = await supabase
            .from('todos')
            .insert([todoData])
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        utils.showToast('เพิ่มงานเรียบร้อยแล้ว! ✅', 'success');
        
        // Clear form
        document.getElementById('todoForm').reset();
        
        // Reload todos
        await loadAllTodos();
        updateStatistics();
        
    } catch (error) {
        console.error('Error saving todo:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการบันทึกงาน', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

async function handleTabChange(e) {
    const targetTab = e.target.id;
    
    switch (targetTab) {
        case 'all-tab':
            renderTodos(todos, 'allTodos');
            break;
        case 'pending-tab':
            renderTodos(todos.filter(todo => todo.status === 'pending'), 'pendingTodos');
            break;
        case 'in_progress-tab':
            renderTodos(todos.filter(todo => todo.status === 'in_progress'), 'inProgressTodos');
            break;
        case 'completed-tab':
            renderTodos(todos.filter(todo => todo.status === 'completed'), 'completedTodos');
            break;
    }
}

async function loadAllTodos() {
    try {
        let query = supabase
            .from('todos')
            .select(`
                *,
                users!todos_user_id_fkey (
                    first_name,
                    last_name
                )
            `)
            .order('created_at', { ascending: false });
        
        // Load user's todos and partner's shared todos
        if (currentUser.partnerId) {
            query = query.or(`user_id.eq.${currentUser.id},and(user_id.eq.${currentUser.partnerId},shared_with_partner.eq.true)`);
        } else {
            query = query.eq('user_id', currentUser.id);
        }
        
        const { data: todosData, error } = await query;
        
        if (error) {
            throw error;
        }
        
        todos = todosData || [];
        
        // Render initial view (all todos)
        renderTodos(todos, 'allTodos');
        
    } catch (error) {
        console.error('Error loading todos:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function renderTodos(todosToRender, containerId) {
    const container = document.getElementById(containerId);
    
    if (!todosToRender || todosToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-list-check"></i>
                <h5>ไม่มีรายการงาน</h5>
                <p>ยังไม่มีงานในหมวดนี้</p>
            </div>
        `;
        return;
    }
    
    const todosHTML = todosToRender.map(todo => {
        const isOwner = todo.user_id === currentUser.id;
        const dueStatus = getDueStatus(todo.due_date);
        
        return `
            <div class="todo-item ${todo.status} ${todo.completed ? 'todo-completed' : ''} priority-${todo.priority}">
                <div class="todo-header-row">
                    <div class="flex-grow-1">
                        <div class="todo-title">${todo.title}</div>
                        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                    </div>
                    <div class="todo-actions">
                        ${isOwner ? `
                            ${todo.status === 'pending' ? `
                                <button class="btn btn-primary btn-sm" onclick="updateTodoStatus('${todo.id}', 'in_progress')">
                                    <i class="bi bi-play"></i> เริ่มทำ
                                </button>
                            ` : ''}
                            ${todo.status === 'in_progress' ? `
                                <button class="btn btn-success btn-sm" onclick="updateTodoStatus('${todo.id}', 'completed')">
                                    <i class="bi bi-check"></i> เสร็จ
                                </button>
                            ` : ''}
                            ${todo.status === 'completed' ? `
                                <button class="btn btn-warning btn-sm" onclick="updateTodoStatus('${todo.id}', 'pending')">
                                    <i class="bi bi-arrow-clockwise"></i> ยกเลิก
                                </button>
                            ` : ''}
                            <button class="btn btn-danger btn-sm" onclick="deleteTodo('${todo.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="todo-meta">
                    <div class="todo-badges">
                        <span class="status-badge status-${todo.status}">
                            ${getStatusText(todo.status)}
                        </span>
                        <span class="badge bg-secondary">${getCategoryName(todo.category)}</span>
                        <span class="badge bg-${getPriorityColor(todo.priority)}">${getPriorityText(todo.priority)}</span>
                        ${todo.shared_with_partner ? '<span class="badge bg-pink">💕 แบ่งปัน</span>' : ''}
                        ${!isOwner ? '<span class="badge bg-info">คู่รัก</span>' : ''}
                    </div>
                    <div class="text-end">
                        <div class="small text-muted">
                            โดย ${todo.users.first_name} ${todo.users.last_name}
                        </div>
                        ${todo.due_date ? `
                            <div class="due-date ${dueStatus.class}">
                                <i class="bi bi-calendar"></i> ${dueStatus.text}
                            </div>
                        ` : ''}
                        <div class="small text-muted">
                            สร้างเมื่อ ${utils.formatDate(todo.created_at)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = todosHTML;
}

function updateStatistics() {
    const pending = todos.filter(todo => todo.status === 'pending').length;
    const inProgress = todos.filter(todo => todo.status === 'in_progress').length;
    const completed = todos.filter(todo => todo.status === 'completed').length;
    const total = todos.length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;
}

async function updateTodoStatus(todoId, newStatus) {
    try {
        const updateData = {
            status: newStatus,
            updated_at: new Date().toISOString()
        };
        
        if (newStatus === 'completed') {
            updateData.completed = true;
            updateData.completed_at = new Date().toISOString();
        } else {
            updateData.completed = false;
            updateData.completed_at = null;
        }
        
        const { data, error } = await supabase
            .from('todos')
            .update(updateData)
            .eq('id', todoId)
            .eq('user_id', currentUser.id); // Ensure user can only update their own todos
        
        if (error) {
            throw error;
        }
        
        // Show success message
        const statusText = getStatusText(newStatus);
        utils.showAlert(`เปลี่ยนสถานะเป็น "${statusText}" แล้ว!`, 'success');
        
        // Reload todos
        await loadAllTodos();
        updateStatistics();
        
        // Update current tab view
        const activeTab = document.querySelector('#statusTabs .nav-link.active');
        if (activeTab) {
            activeTab.click();
        }
        
    } catch (error) {
        console.error('Error updating todo status:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
}

async function deleteTodo(todoId) {
    const confirmed = await utils.showConfirm(
        '🗑️ ลบงาน', 
        'คุณแน่ใจหรือไม่ที่จะลบงานนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
        'ลบเลย',
        'ยกเลิก',
        'danger'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', todoId)
            .eq('user_id', currentUser.id); // Ensure user can only delete their own todos
        
        if (error) {
            throw error;
        }
        
        utils.showToast('ลบงานเรียบร้อยแล้ว! 🗑️', 'success');
        
        // Reload todos
        await loadAllTodos();
        updateStatistics();
        
        // Update current tab view
        const activeTab = document.querySelector('#statusTabs .nav-link.active');
        if (activeTab) {
            activeTab.click();
        }
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการลบงาน', 'error');
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'รอดำเนินการ',
        'in_progress': 'กำลังทำ',
        'completed': 'เสร็จแล้ว'
    };
    return statusMap[status] || status;
}

function getCategoryName(category) {
    const categories = {
        'personal': 'ส่วนตัว',
        'work': 'งาน',
        'relationship': 'ความสัมพันธ์',
        'health': 'สุขภาพ',
        'learning': 'เรียนรู้',
        'other': 'อื่นๆ'
    };
    return categories[category] || 'อื่นๆ';
}

function getPriorityText(priority) {
    const priorities = {
        'low': 'ไม่เร่งด่วน',
        'normal': 'ปกติ',
        'high': 'สำคัญ'
    };
    return priorities[priority] || 'ปกติ';
}

function getPriorityColor(priority) {
    const colors = {
        'low': 'success',
        'normal': 'secondary',
        'high': 'danger'
    };
    return colors[priority] || 'secondary';
}

function getDueStatus(dueDate) {
    if (!dueDate) {
        return { text: '', class: '' };
    }
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    if (diffHours < 0) {
        return {
            text: `เลยกำหนด ${Math.abs(Math.floor(diffDays))} วัน`,
            class: 'overdue'
        };
    } else if (diffHours < 24) {
        return {
            text: `เหลือ ${Math.floor(diffHours)} ชั่วโมง`,
            class: 'due-soon'
        };
    } else if (diffDays < 7) {
        return {
            text: `เหลือ ${Math.floor(diffDays)} วัน`,
            class: 'due-soon'
        };
    } else {
        return {
            text: utils.formatDate(dueDate),
            class: ''
        };
    }
}

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
        await supabase.auth.signOut();
        utils.clearUserSession();
        utils.redirect('index.html');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Add spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .spinning {
        animation: spin 1s linear infinite;
    }
    .bg-pink {
        background-color: var(--secondary-color) !important;
    }
`;
document.head.appendChild(style);

console.log('✅ หน้า Todo โหลดเสร็จแล้ว');
