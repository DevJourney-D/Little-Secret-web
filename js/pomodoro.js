// Pomodoro Timer functionality
let currentUser = null;
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isBreak = false;
let sessionCount = 0;
let currentSession = null;
let totalTime = 0;
let todaySessions = 0;
let streak = 0;
let currentTask = null;
let todoList = [];

const WORK_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes  
const LONG_BREAK = 15 * 60; // 15 minutes

document.addEventListener('DOMContentLoaded', async () => {
    // Prevent iOS zoom on input focus
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    try {
        console.log('⏰ เริ่มต้น Pomodoro...');
        // ตรวจสอบการเข้าสู่ระบบ
        const isLoggedIn = await nekouAuth.isAuthenticated();
        if (!isLoggedIn) {
            console.log('❌ ไม่ได้เข้าสู่ระบบ');
            utils.redirect('index.html');
            return;
        }
        // ดึงข้อมูลผู้ใช้
        currentUser = nekouAuth.getCurrentUser();
        if (!currentUser) {
            utils.redirect('index.html');
            return;
        }
        await initializePomodoro();
        console.log('✅ Pomodoro เริ่มต้นสำเร็จ');
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้น Pomodoro:', error);
        // fallback: แสดง error message
        document.body.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger text-center">
                    <h4>ข้อผิดพลาดในการโหลดหน้า</h4>
                    <p>ไม่สามารถโหลดหน้า Pomodoro ได้ กรุณาลองรีเฟรชหน้า</p>
                    <button class="btn btn-primary" onclick="location.reload()">รีเฟรชหน้า</button>
                    <a href="dashboard.html" class="btn btn-secondary ms-2">กลับหน้าหลัก</a>
                </div>
            </div>
        `;
    }
});
        
        console.log('🔧 Dependencies loaded:', configLoaded);
        
    // ...ลบโค้ด auth fallback/manual ออก ใช้ userInfo อย่างเดียว...

async function initializePomodoro() {
    try {
        console.log('🍅 เริ่มต้น Pomodoro Timer...');
        
        // Load user settings and statistics
        await loadPomodoroStats();
        
        // Load todo list
        await loadTodoList();
        
        // Initialize progress ring
        updateProgressRing();
        
        // Update display
        updateTimerDisplay();
        updateSessionDisplay();
        updateCurrentTaskDisplay();
        
        console.log('✅ หน้า Pomodoro โหลดเสร็จแล้ว');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้น Pomodoro:', error);
        // Don't redirect, just show error and continue with basic functionality
        const todoListContainer = document.getElementById('todoList');
        if (todoListContainer) {
            todoListContainer.innerHTML = `
                <div class="text-center text-warning py-3">
                    <i class="bi bi-exclamation-triangle fs-1 mb-2"></i>
                    <div>ไม่สามารถโหลดข้อมูลได้</div>
                    <small>คุณยังคงสามารถใช้ Timer ได้</small>
                </div>
            `;
        }
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        
        // Create new session record
        if (!currentSession) {
            createNewSession();
        }
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            updateProgressRing();
            
            if (timeLeft <= 0) {
                completeSession();
            }
        }, 1000);
        
        updateButtonStates();
        updateTimerStatus();
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        
        updateButtonStates();
        updateTimerStatus();
    }
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    
    // Reset to work time
    isBreak = false;
    timeLeft = getWorkTime();
    currentSession = null;
    
    updateTimerDisplay();
    updateProgressRing();
    updateButtonStates();
    updateTimerStatus();
}

function completeSession() {
    clearInterval(timerInterval);
    isRunning = false;
    
    if (!isBreak) {
        // Completed work session
        sessionCount++;
        totalTime += getWorkTime() / 60; // Convert to minutes
        todaySessions++;
        
        // Save session to database
        saveSession();
        
        // Determine break type
        if (sessionCount % 4 === 0) {
            // Long break after 4 work sessions
            timeLeft = getLongBreak();
            showNotification('🎉 เสร็จแล้ว! ได้เวลาพักยาว ' + (getLongBreak() / 60) + ' นาที');
        } else {
            // Short break
            timeLeft = getShortBreak();
            showNotification('✅ เสร็จแล้ว! ได้เวลาพักสั้น ' + (getShortBreak() / 60) + ' นาที');
        }
        
        isBreak = true;
    } else {
        // Completed break
        timeLeft = getWorkTime();
        isBreak = false;
        showNotification('⏰ หมดเวลาพัก! กลับมาทำงานกันเถอะ');
    }
    
    currentSession = null;
    updateTimerDisplay();
    updateProgressRing();
    updateButtonStates();
    updateTimerStatus();
    updateSessionDisplay();
    updateStatsDisplay();
}

async function createNewSession() {
    try {
        const sessionData = {
            duration: isBreak ? (isBreak === 'long' ? getLongBreak() / 60 : getShortBreak() / 60) : getWorkTime() / 60,
            type: isBreak ? (isBreak === 'long' ? 'long_break' : 'break') : 'work',
            task: currentTask ? currentTask.title : null,
            category: 'work'
        };
        
        const response = await api.pomodoro.create(currentUser.id, sessionData);
        
        if (response.success) {
            currentSession = response.data;
            console.log('✅ สร้าง Pomodoro session สำเร็จ');
        } else {
            throw new Error(response.message || 'ไม่สามารถสร้าง session ได้');
        }
        
    } catch (error) {
        console.error('Error creating session:', error);
        // Continue with offline mode
        currentSession = {
            id: Date.now().toString(),
            type: isBreak ? 'break' : 'work',
            offline: true
        };
    }
}

async function saveSession() {
    if (!currentSession) return;
    
    try {
        if (!currentSession.offline) {
            const completionData = {
                actualDuration: Math.floor((timeLeft - timeLeft) / 60) || 25,
                notes: currentTask ? currentTask.title : null
            };
            
            const response = await api.pomodoro.complete(currentUser.id, currentSession.id, completionData);
            
            if (response.success) {
                console.log('✅ บันทึก Pomodoro session สำเร็จ');
            } else {
                console.error('Error saving session:', response.message);
            }
        }
        
    } catch (error) {
        console.error('Error saving session:', error);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timerDisplay').textContent = display;
    
    // Update page title
    document.title = `${display} - ${isBreak ? 'พัก' : 'ทำงาน'} - Neko U`;
}

function updateProgressRing() {
    const circle = document.getElementById('progressCircle');
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    let totalDuration;
    if (isBreak) {
        totalDuration = sessionCount % 4 === 0 ? getLongBreak() : getShortBreak();
    } else {
        totalDuration = getWorkTime();
    }
    
    const progress = (totalDuration - timeLeft) / totalDuration;
    const offset = circumference - (progress * circumference);
    
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
    
    // Change color based on session type
    if (isBreak) {
        circle.style.stroke = '#4ECDC4';
    } else {
        circle.style.stroke = '#FF6B6B';
    }
}

function updateButtonStates() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
}

function updateTimerStatus() {
    const statusElement = document.getElementById('timerStatus');
    
    if (isRunning) {
        if (isBreak) {
            statusElement.textContent = sessionCount % 4 === 0 ? 'กำลังพักยาว' : 'กำลังพักสั้น';
            statusElement.className = 'badge bg-success fs-6';
        } else {
            statusElement.textContent = 'กำลังทำงาน';
            statusElement.className = 'badge bg-danger fs-6';
        }
    } else {
        if (isBreak) {
            statusElement.textContent = 'พักอยู่ (หยุดชั่วคราว)';
            statusElement.className = 'badge bg-warning fs-6';
        } else {
            statusElement.textContent = timeLeft === getWorkTime() ? 'พร้อมเริ่มต้น' : 'หยุดชั่วคราว';
            statusElement.className = 'badge bg-primary fs-6';
        }
    }
}

function updateSessionDisplay() {
    document.getElementById('sessionCount').textContent = sessionCount;
}

function updateStatsDisplay() {
    document.getElementById('totalTime').textContent = Math.round(totalTime);
    document.getElementById('todaySessions').textContent = todaySessions;
    document.getElementById('streak').textContent = streak;
    
    // Update current task display in stats panel
    const currentTaskElement = document.getElementById('currentTask');
    if (currentTaskElement) {
        if (currentTask) {
            currentTaskElement.innerHTML = `
                <strong>${escapeHtml(currentTask.title)}</strong>
                ${currentTask.description ? `<br><small class="text-muted">${escapeHtml(currentTask.description)}</small>` : ''}
            `;
        } else {
            currentTaskElement.textContent = 'ยังไม่ได้เลือกงาน';
        }
    }
}

function getWorkTime() {
    const workTimeInput = document.getElementById('workTime');
    return parseInt(workTimeInput.value) * 60;
}

function getShortBreak() {
    const shortBreakInput = document.getElementById('shortBreak');
    return parseInt(shortBreakInput.value) * 60;
}

function getLongBreak() {
    const longBreakInput = document.getElementById('longBreak');
    return parseInt(longBreakInput.value) * 60;
}

function selectTask() {
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    taskModal.show();
}

function setCurrentTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    
    if (taskName) {
        currentTask = taskDescription ? `${taskName}: ${taskDescription}` : taskName;
        document.getElementById('currentTask').textContent = currentTask;
        
        // Clear form
        document.getElementById('taskName').value = '';
        document.getElementById('taskDescription').value = '';
        
        // Close modal
        const taskModal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        taskModal.hide();
        
        showNotification('✅ เลือกงาน: ' + taskName);
    }
}

async function loadPomodoroStats() {
    try {
        // Set default values first
        todaySessions = 0;
        totalTime = 0;
        streak = 0;
        
        if (!currentUser || !currentUser.id) {
            console.log('ℹ️ ไม่มีข้อมูลผู้ใช้ ใช้สถิติเริ่มต้น');
            updateStatsDisplay();
            return;
        }
        
        console.log(`� กำลังโหลดสถิติสำหรับ: ${currentUser.displayName || currentUser.username}`);
        
        try {
            // Load Pomodoro sessions from API
            const today = new Date().toISOString().split('T')[0];
            const response = await api.pomodoro.getAll(currentUser.id, {
                date: today,
                status: 'completed'
            });
            
            if (response.success && response.data) {
                const sessions = response.data.sessions || [];
                const stats = response.data.stats || {};
                
                // Calculate today's statistics
                todaySessions = stats.completedToday || 0;
                totalTime = stats.totalMinutes || 0;
                streak = 1; // Simple streak for now
                
                console.log(`📊 สถิติโหลดเสร็จ: วันนี้ ${todaySessions} รอบ, รวม ${totalTime} นาที`);
            } else {
                console.log('⚠️ ไม่สามารถโหลดสถิติได้ ใช้ค่าเริ่มต้น');
            }
        } catch (error) {
            console.error('❌ ข้อผิดพลาดในการโหลดสถิติ:', error);
        }
        
        // Update display
        updateStatsDisplay();
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดสถิติ Pomodoro:', error);
        // Use default values on any error
        todaySessions = 0;
        totalTime = 0;
        streak = 0;
        updateStatsDisplay();
    }
}

function calculateStreak(sessions) {
    if (!sessions.length) return 0;
    
    const today = new Date();
    const dates = sessions.map(s => new Date(s.started_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const sessionDate = new Date(uniqueDates[i]).toDateString();
        const checkDateStr = checkDate.toDateString();
        
        if (sessionDate === checkDateStr) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return currentStreak;
}

function showNotification(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast show position-fixed top-0 end-0 m-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="toast-header">
            <i class="bi bi-stopwatch text-primary me-2"></i>
            <strong class="me-auto">Pomodoro</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Settings change handlers
document.addEventListener('change', (e) => {
    if (['workTime', 'shortBreak', 'longBreak'].includes(e.target.id)) {
        if (!isRunning && !isBreak) {
            timeLeft = getWorkTime();
            updateTimerDisplay();
            updateProgressRing();
        }
    }
});

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
        
        // Stop timer if running
        if (isRunning) {
            pauseTimer();
        }
        
        // Sign out from Supabase
        await window.supabase.auth.signOut();
        
        // Clear local storage
        utils.clearUserSession();
        
        // Redirect to login
        utils.redirect('index.html');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการออกจากระบบ:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    }
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

// Todo List Management Functions
async function loadTodoList() {
    const todoListContainer = document.getElementById('todoList');
    
    try {
        if (!currentUser || !currentUser.id) {
            console.log('ℹ️ ไม่มีข้อมูลผู้ใช้ แสดงข้อความแทน');
            todoList = [];
            displayEmptyTodoMessage();
            return;
        }
        
        console.log('� กำลังโหลด Todo list...');
        
        // Show loading
        if (todoListContainer) {
            todoListContainer.innerHTML = `
                <div class="text-center text-muted py-3">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    กำลังโหลดรายการงาน...
                </div>
            `;
        }
        
        const response = await api.todo.getAll(currentUser.id, {
            status: 'pending'
        });
            
        if (response.success && response.data) {
            todoList = response.data.todos || [];
            displayTodoList();
            
            console.log(`✅ โหลด Todo สำเร็จ: ${todoList.length} รายการ`);
        } else {
            throw new Error(response.message || 'ไม่สามารถโหลด Todo ได้');
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลด Todo:', error);
        todoList = [];
        displayTodoError();
    }
}

function displayEmptyTodoMessage() {
    const todoListContainer = document.getElementById('todoList');
    if (todoListContainer) {
        todoListContainer.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="bi bi-person-x fs-1 mb-2"></i>
                <div>ไม่มีข้อมูลผู้ใช้</div>
                <small>กรุณาล็อกอินเพื่อใช้งาน Todo</small>
            </div>
        `;
    }
}

function displayGuestTodoMessage() {
    const todoListContainer = document.getElementById('todoList');
    if (todoListContainer) {
        todoListContainer.innerHTML = `
            <div class="text-center text-info py-3">
                <i class="bi bi-person-circle fs-1 mb-2"></i>
                <div>โหมดผู้เยี่ยมชม</div>
                <small>ล็อกอินเพื่อเชื่อมต่อ Todo list</small>
            </div>
        `;
    }
}

function displayOfflineTodoMessage() {
    const todoListContainer = document.getElementById('todoList');
    if (todoListContainer) {
        todoListContainer.innerHTML = `
            <div class="text-center text-warning py-3">
                <i class="bi bi-wifi-off fs-1 mb-2"></i>
                <div>โหมด Offline</div>
                <small>ไม่สามารถเชื่อมต่อฐานข้อมูลได้</small>
            </div>
        `;
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function displayTodoList() {
    const todoListContainer = document.getElementById('todoList');
    
    if (todoList.length === 0) {
        todoListContainer.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="bi bi-list-task fs-1 mb-2"></i>
                <div>ไม่มีรายการสิ่งที่ต้องทำ</div>
                <small>สร้างงานใหม่หรือไปที่หน้า Todo เพื่อเพิ่มงาน</small>
            </div>
        `;
        return;
    }
    
    todoListContainer.innerHTML = todoList.map(todo => `
        <div class="task-item ${currentTask?.id === todo.id ? 'selected' : ''}" 
             onclick="selectTask(${JSON.stringify(todo).replace(/"/g, '&quot;')})">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${escapeHtml(todo.title)}</h6>
                    ${todo.description ? `<small class="text-muted">${escapeHtml(todo.description)}</small>` : ''}
                </div>
                <div class="text-end">
                    <span class="badge bg-${getPriorityColor(todo.priority)} ms-2">${getPriorityText(todo.priority)}</span>
                    ${todo.category ? `<br><small class="text-muted">${escapeHtml(todo.category)}</small>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function displayTodoError() {
    const todoListContainer = document.getElementById('todoList');
    todoListContainer.innerHTML = `
        <div class="text-center text-danger py-3">
            <i class="bi bi-exclamation-triangle fs-1 mb-2"></i>
            <div>ไม่สามารถโหลดรายการงานได้</div>
            <button class="btn btn-outline-primary btn-sm mt-2" onclick="loadTodoList()">
                <i class="bi bi-arrow-clockwise"></i> ลองอีกครั้ง
            </button>
        </div>
    `;
}

function selectTask(todo) {
    currentTask = todo;
    displayTodoList(); // Refresh to show selection
    updateCurrentTaskDisplay();
}

function clearTaskSelection() {
    currentTask = null;
    displayTodoList(); // Refresh to clear selection
    updateCurrentTaskDisplay();
}

function updateCurrentTaskDisplay() {
    const currentTaskDisplay = document.getElementById('currentTaskDisplay');
    const currentTaskName = document.getElementById('currentTaskName');
    
    if (currentTask) {
        currentTaskDisplay.style.display = 'block';
        currentTaskName.innerHTML = `
            <strong>${escapeHtml(currentTask.title)}</strong>
            ${currentTask.description ? `<br><small>${escapeHtml(currentTask.description)}</small>` : ''}
        `;
    } else {
        currentTaskDisplay.style.display = 'none';
    }
}

async function createAndSelectTask() {
    const name = document.getElementById('newTaskName').value.trim();
    const description = document.getElementById('newTaskDescription').value.trim();
    const priority = document.getElementById('newTaskPriority').value;
    const addToTodo = document.getElementById('addToTodoList').checked;
    
    if (!name) {
        utils.showAlert('กรุณาใส่ชื่องาน', 'error');
        return;
    }
    
    try {
        const newTask = {
            id: Date.now(), // Temporary ID for immediate use
            title: name,
            description: description || null,
            priority: priority,
            category: 'pomodoro',
            completed: false,
            created_at: new Date().toISOString()
        };
        
        // Add to todo list if requested
        if (addToTodo) {
            const { data: savedTask, error } = await window.supabase
                .from('todos')
                .insert({
                    user_id: currentUser.id,
                    title: name,
                    description: description || null,
                    priority: priority,
                    category: 'pomodoro',
                    completed: false
                })
                .select()
                .single();
                
            if (error) throw error;
            
            newTask.id = savedTask.id;
            todoList.unshift(savedTask);
        }
        
        // Select the new task
        currentTask = newTask;
        
        // Update displays
        displayTodoList();
        updateCurrentTaskDisplay();
        
        // Close modal and clear form
        const modal = bootstrap.Modal.getInstance(document.getElementById('customTaskModal'));
        modal.hide();
        clearTaskForm();
        
        utils.showAlert('สร้างและเลือกงานเรียบร้อยแล้ว', 'success');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการสร้างงาน:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการสร้างงาน: ' + error.message, 'error');
    }
}

function clearTaskForm() {
    document.getElementById('newTaskName').value = '';
    document.getElementById('newTaskDescription').value = '';
    document.getElementById('newTaskPriority').value = 'normal';
    document.getElementById('addToTodoList').checked = false;
}

async function refreshTodos() {
    const refreshBtn = document.querySelector('button[onclick="refreshTodos()"]');
    const originalHtml = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinning"></i> รีเฟรช';
    refreshBtn.disabled = true;
    
    await loadTodoList();
    
    setTimeout(() => {
        refreshBtn.innerHTML = originalHtml;
        refreshBtn.disabled = false;
    }, 1000);
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'danger';
        case 'low': return 'secondary';
        default: return 'primary';
    }
}

function getPriorityText(priority) {
    switch (priority) {
        case 'high': return 'สูง';
        case 'low': return 'ต่ำ';
        default: return 'ปกติ';
    }
}

// Navigation functions
function showProfile() {
    utils.redirect('settings.html');
}

console.log('✅ หน้า Pomodoro โหลดเสร็จแล้ว');
