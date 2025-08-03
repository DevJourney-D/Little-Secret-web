// Dashboard functionality with UserInfoManager
let currentUser = null;
let partnerInfo = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🏠 เริ่มต้นแดชบอร์ด...');
        
        // เพิ่ม loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '🐱 กำลังโหลด...';
        loadingIndicator.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:white;padding:20px;border-radius:10px;box-shadow:0 5px 15px rgba(0,0,0,0.3);';
        document.body.appendChild(loadingIndicator);
        
        // ตรวจสอบการเข้าสู่ระบบ
        console.log('🔍 ตรวจสอบการเข้าสู่ระบบ...');
        const isLoggedIn = await nekouAuth.isAuthenticated();
        
        console.log('🔐 ผลการตรวจสอบการล็อกอิน:', isLoggedIn);
        
        if (!isLoggedIn) {
            console.log('❌ ไม่ได้เข้าสู่ระบบ - redirect ไปหน้าล็อกอิน');
            
            // ลบ loading indicator
            loadingIndicator.remove();
            
            // แสดงข้อความแจ้งเตือน
            if (typeof showAlert === 'function') {
                showAlert('กรุณาเข้าสู่ระบบก่อนใช้งาน', 'warning');
            }
            
            // Redirect to login หลังจาก delay เล็กน้อย
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            return;
        }

        console.log('✅ เข้าสู่ระบบแล้ว - เริ่มโหลดแดชบอร์ด');

        await initializeDashboard();
        
        // ลบ loading indicator
        loadingIndicator.remove();
        
        // Initialize other components
        initializeDropdown();
        updateDateTime();
        
        // อัปเดตเวลาทุกนาที
        setInterval(updateDateTime, 60000);
        
        // อัปเดตสถานะออนไลน์ของคู่รักทุก 5 นาที (ลดการโหลดอัตโนมัติ)
        setInterval(updatePartnerStatus, 5 * 60 * 1000);
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นแดชบอร์ด:', error);
        showErrorMessage('เกิดข้อผิดพลาดในการโหลดแดชบอร์ด');
    }
});

// Debug function สำหรับตรวจสอบ session
function debugSession() {
    const session = utils.getCurrentUser();
    console.log('🔍 Debug Session:', {
        hasSession: !!session,
        sessionData: session,
        isExpired: session ? (new Date() > new Date(session.expiresAt)) : 'N/A',
        timeLeft: session ? Math.round((new Date(session.expiresAt) - new Date()) / 1000 / 60) + ' นาที' : 'N/A'
    });
    return session;
}

// เพิ่มฟังก์ชัน debug ให้ window สำหรับการ debug
window.debugSession = debugSession;

async function initializeDashboard() {
    try {
        console.log('🚀 เริ่มต้นแดชบอร์ดด้วย UserInfoManager...');
        
        // แสดง loading indicator
        showLoadingState(true);
        
        // ตรวจสอบ session อีกรอบ
        const userSession = utils.getCurrentUser();
        if (!userSession) {
            console.log('❌ ไม่มี session ใน localStorage');
            throw new Error('ไม่พบข้อมูล session');
        }
        
        console.log('📋 พบ session:', {
            id: userSession.id,
            username: userSession.username,
            expiresAt: userSession.expiresAt
        });
        
        // ดึงข้อมูลผู้ใช้และคู่รักจาก cache
        const [user, partner] = await Promise.all([
            userInfo.getCurrentUser(),
            userInfo.getPartnerInfo()
        ]);
        
        currentUser = user;
        partnerInfo = partner;
        
        if (currentUser) {
            console.log('✅ ผู้ใช้ล็อกอิน:', currentUser.display_name || currentUser.username);
            
            // อัปเดตการแสดงผลผู้ใช้
            updateUserDisplay();
            
            // อัปเดตข้อมูลคู่รัก
            await displayPartnerInfo();
            
            // โหลดสถิติต่างๆ
            await loadDashboardStats();
            
            // โหลดกิจกรรมล่าสุด
            await loadRecentActivity();
            
            // ซ่อน loading indicator
            showLoadingState(false);
            
            console.log('✅ แดชบอร์ดโหลดเสร็จแล้ว');
            
        } else {
            console.log('❌ ไม่มีข้อมูลผู้ใช้');
            throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นแดชบอร์ด:', error);
        showLoadingState(false);
        
        // แสดงข้อความผิดพลาด
        utils.showAlert('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้: ' + error.message, 'error');
        
        // ถ้าเป็นปัญหาเรื่อง session ให้ redirect ไปหน้าล็อกอิน
        if (error.message.includes('session') || error.message.includes('ผู้ใช้')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

function updateUserDisplay() {
    if (!currentUser) return;
    
    try {
        // อัปเดตชื่อผู้ใช้ในหลายจุด
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            const displayName = currentUser.display_name || currentUser.username || 'ผู้ใช้';
            userNameElement.textContent = displayName;
        }
        
        console.log('👤 อัปเดตการแสดงผลผู้ใช้เรียบร้อย');
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการอัปเดตการแสดงผลผู้ใช้:', error);
    }
}

// Show/Hide loading state
function showLoadingState(show) {
    const loadingElements = document.querySelectorAll('.loading-placeholder');
    const contentElements = document.querySelectorAll('.dashboard-content');
    
    if (show) {
        // Show loading placeholders
        loadingElements.forEach(el => el.style.display = 'block');
        contentElements.forEach(el => el.style.opacity = '0.5');
    } else {
        // Hide loading placeholders
        loadingElements.forEach(el => el.style.display = 'none');
        contentElements.forEach(el => el.style.opacity = '1');
    }
}

async function displayPartnerInfo() {
    try {
        const partnerInfoCard = document.getElementById('partnerInfoCard');
        const pairingCard = document.getElementById('pairingCard');
        
        if (partnerInfo) {
            console.log('💕 แสดงข้อมูลคู่รัก:', partnerInfo.display_name);
            
            // Show partner info, hide pairing card
            if (partnerInfoCard) partnerInfoCard.style.display = 'block';
            if (pairingCard) pairingCard.style.display = 'none';
            
            // Update partner name and additional info
            const partnerNameElement = document.getElementById('partnerName');
            const partnerNicknameElement = document.getElementById('partnerNickname');
            const partnerSinceElement = document.getElementById('partnerSince');
            
            if (partnerNameElement) {
                const partnerDisplayName = partnerInfo.display_name || 
                    `${partnerInfo.first_name || ''} ${partnerInfo.last_name || ''}`.trim() || 
                    partnerInfo.username || 'คู่รัก';
                partnerNameElement.textContent = partnerDisplayName;
            }
            
            // แสดงชื่อเล่น
            if (partnerNicknameElement) {
                const nickname = partnerInfo.nickname || partnerInfo.display_name || 'ไม่มีชื่อเล่น';
                partnerNicknameElement.innerHTML = `
                    <i class="bi bi-heart text-danger me-1"></i>
                    <span class="text-muted">ชื่อเล่น: </span>
                    <span>${nickname}</span>
                `;
            }
            
            // แสดงวันที่เชื่อมต่อ
            if (partnerSinceElement && partnerInfo.created_at) {
                const joinDate = new Date(partnerInfo.created_at);
                const timeAgo = getTimeAgo(joinDate);
                partnerSinceElement.textContent = timeAgo;
            }
            
            // อัปเดต partner avatar ด้วยรูปจริงหรือ initial
            const partnerAvatar = document.querySelector('.partner-avatar');
            if (partnerAvatar) {
                if (partnerInfo.avatar_url) {
                    partnerAvatar.innerHTML = `<img src="${partnerInfo.avatar_url}" alt="Partner Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                } else {
                    const initial = (partnerInfo.first_name || partnerInfo.username || 'P').charAt(0).toUpperCase();
                    partnerAvatar.innerHTML = `<span style="font-size: 2.5rem; font-weight: bold;">${initial}</span>`;
                }
            }
            
            // ตรวจสอบสถานะออนไลน์
            updatePartnerStatus();
            
        } else {
            console.log('💔 ยังไม่มีคู่รัก');
            
            // Hide partner info, show pairing card
            if (partnerInfoCard) partnerInfoCard.style.display = 'none';
            if (pairingCard) pairingCard.style.display = 'block';
            
            // แสดงรหัสคู่รักของผู้ใช้
            const myPartnerCodeElement = document.getElementById('myPartnerCode');
            if (myPartnerCodeElement && currentUser && currentUser.partner_code) {
                myPartnerCodeElement.textContent = currentUser.partner_code;
            }
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการแสดงข้อมูลคู่รัก:', error);
    }
}

async function updatePartnerStatus() {
    try {
        if (!partnerInfo) return;
        
        // ดึงสถานะออนไลน์ล่าสุด
        const { data: partnerData, error } = await supabase
            .from('users')
            .select('is_online, last_seen')
            .eq('id', partnerInfo.id)
            .single();
            
        if (error) {
            console.error('Error fetching partner status:', error);
            return;
        }
        
        const statusElement = document.getElementById('partnerStatus');
        
        if (statusElement && partnerData) {
            if (partnerData.is_online) {
                statusElement.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size: 0.6rem;"></i>ออนไลน์';
                statusElement.className = 'partner-status online';
            } else {
                statusElement.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size: 0.6rem;"></i>ออฟไลน์';
                statusElement.className = 'partner-status offline';
                
                // แสดงเวลาที่เห็นล่าสุด
                if (partnerData.last_seen) {
                    const lastSeenDate = new Date(partnerData.last_seen);
                    const timeAgo = getTimeAgo(lastSeenDate);
                    statusElement.title = `เห็นล่าสุด: ${timeAgo}`;
                }
            }
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการตรวจสอบสถานะคู่รัก:', error);
    }
}

async function loadDashboardStats() {
    try {
        console.log('📊 โหลดสถิติแดชบอร์ด...');
        
        if (!currentUser) return;
        
        // ดึงข้อมูลสถิติจากฐานข้อมูล
        const [diaryCount, todoCount, chatCount, mathStats, pomodoroStats, additionalStats] = await Promise.all([
            getDiaryCount(),
            getTodoCount(),
            getChatCount(),
            getMathStats(),
            getPomodoroStats(),
            getAdditionalStats()
        ]);
        
        // แสดงสถิติ
        displayStats({
            diaryCount,
            todoCount,
            chatCount,
            mathStats,
            pomodoroStats,
            additionalStats,
            daysSinceJoined: calculateDaysSinceJoined()
        });
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดสถิติ:', error);
    }
}

async function getDiaryCount() {
    try {
        const { count, error } = await supabase
            .from('diary_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('ข้อผิดพลาดในการนับไดอารี่:', error);
        return 0;
    }
}

async function getTodoCount() {
    try {
        const { count, error } = await supabase
            .from('todos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id)
            .eq('completed', false);
            
        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('ข้อผิดพลาดในการนับ Todo:', error);
        return 0;
    }
}

async function getChatCount() {
    try {
        const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', currentUser.id);
            
        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('ข้อผิดพลาดในการนับข้อความแชต:', error);
        return 0;
    }
}

async function getMathStats() {
    try {
        // ดึงข้อมูลคณิตศาสตร์ทั้งหมด
        const { data: mathData, error } = await supabase
            .from('math_sessions')
            .select('score, total_problems')
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        if (!mathData || mathData.length === 0) {
            return { accuracy: 0, totalProblems: 0 };
        }
        
        // คำนวณความแม่นยำรวม
        let totalCorrect = 0;
        let totalProblems = 0;
        
        mathData.forEach(session => {
            totalCorrect += session.score || 0;
            totalProblems += session.total_problems || 0;
        });
        
        const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;
        
        return {
            accuracy,
            totalProblems
        };
        
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงสถิติคณิตศาสตร์:', error);
        return { accuracy: 0, totalProblems: 0 };
    }
}

async function getPomodoroStats() {
    try {
        // ดึงข้อมูล Pomodoro sessions
        const { data: pomodoroData, error } = await supabase
            .from('pomodoro_sessions')
            .select('duration_minutes, completed')
            .eq('user_id', currentUser.id)
            .eq('completed', true);
            
        if (error) throw error;
        
        if (!pomodoroData || pomodoroData.length === 0) {
            return { totalSessions: 0, totalHours: 0 };
        }
        
        const totalSessions = pomodoroData.length;
        const totalMinutes = pomodoroData.reduce((sum, session) => sum + (session.duration_minutes || 25), 0);
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // ปัดเศษ 1 ตำแหน่ง
        
        return {
            totalSessions,
            totalHours
        };
        
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงสถิติ Pomodoro:', error);
        return { totalSessions: 0, totalHours: 0 };
    }
}

async function getAdditionalStats() {
    try {
        // ดึงจำนวน Todo ที่เสร็จแล้ว
        const { count: completedTodos, error: todoError } = await supabase
            .from('todos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id)
            .eq('completed', true);
            
        if (todoError) throw todoError;
        
        // ดึงจำนวนข้อความจากคู่รัก
        let partnerChatCount = 0;
        if (partnerInfo) {
            const { count, error: chatError } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('sender_id', partnerInfo.id);
                
            if (!chatError) {
                partnerChatCount = count || 0;
            }
        }
        
        return {
            completedTodos: completedTodos || 0,
            partnerChatCount
        };
        
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงสถิติเพิ่มเติม:', error);
        return {
            completedTodos: 0,
            partnerChatCount: 0
        };
    }
}

function calculateDaysSinceJoined() {
    if (!currentUser || !currentUser.created_at) return 0;
    
    const joinDate = new Date(currentUser.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function displayStats(stats) {
    try {
        console.log('📊 แสดงสถิติ:', stats);
        
        // อัปเดตจำนวนไดอารี่
        const diaryCountElement = document.getElementById('diaryCount');
        if (diaryCountElement) {
            diaryCountElement.innerHTML = `<span class="stats-number">${stats.diaryCount || 0}</span>`;
        }
        
        // อัปเดตจำนวน Todo ที่เหลือ
        const todoCountElement = document.getElementById('todoCount');
        if (todoCountElement) {
            todoCountElement.innerHTML = `<span class="stats-number">${stats.todoCount || 0}</span>`;
        }
        
        // อัปเดตจำนวนข้อความแชตที่ส่ง
        const chatCountElement = document.getElementById('chatCount');
        if (chatCountElement) {
            chatCountElement.innerHTML = `<span class="stats-number">${stats.chatCount || 0}</span>`;
        }
        
        // อัปเดตสถิติคณิตศาสตร์
        if (stats.mathStats) {
            const mathAccuracyElement = document.getElementById('mathAccuracy');
            if (mathAccuracyElement) {
                mathAccuracyElement.innerHTML = `<span class="stats-number">${stats.mathStats.accuracy}%</span>`;
            }
            
            const mathProblemsElement = document.getElementById('totalMathProblems');
            if (mathProblemsElement) {
                mathProblemsElement.innerHTML = `<span class="stats-number">${stats.mathStats.totalProblems}</span>`;
            }
        }
        
        // อัปเดตสถิติ Pomodoro
        if (stats.pomodoroStats) {
            const pomodoroSessionsElement = document.getElementById('pomodoroSessions');
            if (pomodoroSessionsElement) {
                pomodoroSessionsElement.innerHTML = `<span class="stats-number">${stats.pomodoroStats.totalSessions}</span>`;
            }
            
            const pomodoroHoursElement = document.getElementById('pomodoroHours');
            if (pomodoroHoursElement) {
                pomodoroHoursElement.innerHTML = `<span class="stats-number">${stats.pomodoroStats.totalHours}</span>`;
            }
        }
        
        // อัปเดตสถิติเพิ่มเติม
        if (stats.additionalStats) {
            const completedTodosElement = document.getElementById('completedTodos');
            if (completedTodosElement) {
                completedTodosElement.innerHTML = `<span class="stats-number">${stats.additionalStats.completedTodos}</span>`;
            }
            
            const partnerChatCountElement = document.getElementById('partnerChatCount');
            if (partnerChatCountElement) {
                partnerChatCountElement.innerHTML = `<span class="stats-number">${stats.additionalStats.partnerChatCount}</span>`;
            }
        }
        
        // อัปเดตจำนวนวันที่ใช้งาน
        const daysTogether = document.getElementById('daysTogether');
        if (daysTogether) {
            daysTogether.innerHTML = `<span class="stats-number">${stats.daysSinceJoined || 0}</span>`;
        }
        
        console.log('✅ อัปเดตสถิติเสร็จแล้ว');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการแสดงสถิติ:', error);
    }
}

// ฟังก์ชันโหลดข้อมูลล่าสุดจากฐานข้อมูล
async function loadRecentActivity() {
    try {
        console.log('📋 โหลดกิจกรรมล่าสุด...');
        
        if (!currentUser) return;
        
        // ดึงไดอารี่ล่าสุด
        const { data: recentDiary, error: diaryError } = await supabase
            .from('diary_entries')
            .select('title, created_at')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(3);
            
        // ดึง Todo ล่าสุด
        const { data: recentTodos, error: todoError } = await supabase
            .from('todos')
            .select('title, completed, created_at')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(3);
            
        // ดึงข้อความแชตล่าสุด
        const { data: recentMessages, error: chatError } = await supabase
            .from('chat_messages')
            .select('message, sender_id, created_at')
            .or(`sender_id.eq.${currentUser.id}${partnerInfo ? `,sender_id.eq.${partnerInfo.id}` : ''}`)
            .order('created_at', { ascending: false })
            .limit(5);
        
        // แสดงกิจกรรมล่าสุด
        displayRecentActivity({
            diary: recentDiary || [],
            todos: recentTodos || [],
            messages: recentMessages || []
        });
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดกิจกรรมล่าสุด:', error);
    }
}

function displayRecentActivity(activities) {
    try {
        console.log('📋 แสดงกิจกรรมล่าสุด:', activities);
        
        // สร้าง HTML สำหรับแสดงกิจกรรมล่าสุด
        const activityHtml = `
            <div class="recent-activity" style="margin-top: 20px;">
                <h6 class="mb-3">🔥 กิจกรรมล่าสุด</h6>
                
                ${activities.diary.length > 0 ? `
                    <div class="activity-section mb-3">
                        <small class="text-muted">📖 ไดอารี่ล่าสุด:</small>
                        ${activities.diary.map(entry => `
                            <div class="activity-item">
                                <span class="fw-bold">${entry.title}</span>
                                <small class="text-muted ms-2">${getTimeAgo(new Date(entry.created_at))}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${activities.todos.length > 0 ? `
                    <div class="activity-section mb-3">
                        <small class="text-muted">✅ งานล่าสุด:</small>
                        ${activities.todos.map(todo => `
                            <div class="activity-item">
                                <span class="${todo.completed ? 'text-success' : ''}">${todo.title}</span>
                                <small class="text-muted ms-2">${getTimeAgo(new Date(todo.created_at))}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${activities.messages.length > 0 ? `
                    <div class="activity-section">
                        <small class="text-muted">💬 ข้อความล่าสุด:</small>
                        ${activities.messages.slice(0, 2).map(msg => `
                            <div class="activity-item">
                                <span class="${msg.sender_id === currentUser.id ? 'text-primary' : 'text-success'}">${msg.message.substring(0, 30)}${msg.message.length > 30 ? '...' : ''}</span>
                                <small class="text-muted ms-2">${getTimeAgo(new Date(msg.created_at))}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // แทรกกิจกรรมล่าสุดลงในหน้า
        const activityContainer = document.getElementById('recentActivityContainer');
        if (activityContainer) {
            activityContainer.innerHTML = activityHtml;
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการแสดงกิจกรรม:', error);
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH');
}

// ฟังก์ชันสำหรับการออกจากระบบ
async function handleLogout() {
    // สร้าง Modal สวยงามสำหรับยืนยันการออกจากระบบ
    const modalHtml = `
        <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
                    <div class="modal-header border-0 pb-0" style="background: linear-gradient(135deg, #ff6b6b, #ff8e8e); border-radius: 20px 20px 0 0; color: white;">
                        <div class="w-100 text-center">
                            <div style="font-size: 3rem; margin-bottom: 10px;">👋</div>
                            <h4 class="modal-title mb-2" id="logoutModalLabel">
                                ออกจากระบบ
                            </h4>
                            <p class="mb-0 opacity-90" style="font-size: 0.9rem;">
                                คุณต้องการออกจากระบบหรือไม่?
                            </p>
                        </div>
                        <button type="button" class="btn-close btn-close-white position-absolute" 
                                data-bs-dismiss="modal" aria-label="Close" 
                                style="top: 15px; right: 20px;"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="text-center mb-4">
                            <div class="d-flex align-items-center justify-content-center mb-3">
                                <div class="bg-light rounded-circle p-3 me-3">
                                    <i class="bi bi-power text-danger" style="font-size: 1.5rem;"></i>
                                </div>
                                <div class="text-start">
                                    <h6 class="mb-1 text-dark">ออกจากระบบอุปกรณ์นี้</h6>
                                    <small class="text-muted">คุณจะถูกนำไปหน้าเข้าสู่ระบบ</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="button" class="btn btn-danger" id="confirmLogoutBtn"
                                    style="border-radius: 15px; padding: 12px; font-weight: 600; font-size: 1rem;">
                                <i class="bi bi-box-arrow-right me-2"></i>
                                ยืนยันออกจากระบบ
                            </button>
                            
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"
                                    style="border-radius: 15px; padding: 12px; font-weight: 600; font-size: 1rem;">
                                <i class="bi bi-arrow-left me-2"></i>
                                ยกเลิก
                            </button>
                        </div>
                        
                        <div class="mt-4 p-3 bg-light rounded-3">
                            <div class="d-flex align-items-start">
                                <i class="bi bi-info-circle text-info me-2 mt-1"></i>
                                <div>
                                    <small class="text-muted">
                                        เมื่อออกจากระบบแล้ว คุณจะต้องเข้าสู่ระบบใหม่เพื่อใช้งานต่อ
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // ลบ modal เก่าถ้ามี
    const existingModal = document.getElementById('logoutModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // เพิ่ม modal ใหม่
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // แสดง modal
    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
    
    // จัดการการยืนยันออกจากระบบ
    document.getElementById('confirmLogoutBtn').addEventListener('click', async () => {
        try {
            // แสดง loading
            const confirmBtn = document.getElementById('confirmLogoutBtn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinning me-2"></i>กำลังออกจากระบบ...';
            
            // ออกจากระบบ
            await userInfo.logout();
            
            // ปิด modal
            modal.hide();
            
        } catch (error) {
            console.error('ข้อผิดพลาดในการออกจากระบบ:', error);
            
            // แสดงข้อผิดพลาด
            utils.showAlert('เกิดข้อผิดพลาดในการออกจากระบบ: ' + error.message, 'error');
            
            // รีเซ็ตปุ่ม
            const confirmBtn = document.getElementById('confirmLogoutBtn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i>ยืนยันออกจากระบบ';
        }
    });
}

// ฟังก์ชันออกจากระบบปกติ (เรียกจาก HTML)
function logout() {
    handleLogout();
}

// ฟังก์ชันสำหรับรีเฟรชข้อมูล (เรียกใช้แบบ manual เท่านั้น)
async function refreshDashboard() {
    try {
        console.log('🔄 รีเฟรชแดชบอร์ด...');
        
        showLoadingState(true);
        
        // รีเฟรชข้อมูลผู้ใช้
        await userInfo.refreshUserData();
        
        // รีโหลดแดชบอร์ด
        await initializeDashboard();
        
        console.log('✅ รีเฟรชเสร็จแล้ว');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการรีเฟรช:', error);
    } finally {
        showLoadingState(false);
    }
}

// ฟังก์ชันรีเฟรชเฉพาะสถิติ (เรียกใช้เมื่อจำเป็น)
async function refreshStats() {
    try {
        console.log('📊 รีเฟรชสถิติ...');
        await loadDashboardStats();
        console.log('✅ รีเฟรชสถิติเสร็จแล้ว');
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการรีเฟรชสถิติ:', error);
    }
}

// Utility Functions
function initializeDropdown() {
    // Bootstrap dropdown initialization
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(dropdown => {
        new bootstrap.Dropdown(dropdown);
    });
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('th-TH', options);
    }
}

async function getMathStats() {
    try {
        const { data: mathData, error } = await supabase
            .from('math_problems')
            .select('is_correct, time_spent, solved_at')
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        const totalProblems = mathData?.length || 0;
        const correctAnswers = mathData?.filter(p => p.is_correct === true).length || 0;
        const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems * 100).toFixed(1) : 0;
        
        return {
            totalProblems,
            correctAnswers,
            accuracy: parseFloat(accuracy)
        };
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงสถิติคณิตศาสตร์:', error);
        return { totalProblems: 0, correctAnswers: 0, accuracy: 0 };
    }
}

async function getPomodoroStats() {
    try {
        const { data: pomodoroData, error } = await supabase
            .from('pomodoro_sessions')
            .select('duration_minutes, completed, task_description')
            .eq('user_id', currentUser.id)
            .eq('completed', true);
            
        if (error) throw error;
        
        const totalSessions = pomodoroData?.length || 0;
        const totalMinutes = pomodoroData?.reduce((total, session) => total + (session.duration_minutes || 25), 0) || 0;
        const totalHours = (totalMinutes / 60).toFixed(1);
        
        return {
            totalSessions,
            totalMinutes,
            totalHours: parseFloat(totalHours)
        };
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงสถิติ Pomodoro:', error);
        return { totalSessions: 0, totalMinutes: 0, totalHours: 0 };
    }
}

function showErrorMessage(message) {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

// Export functions for global use
window.dashboardFunctions = {
    handleLogout,
    refreshDashboard,
    refreshStats,
    updatePartnerStatus,
    loadDashboardStats
};

console.log('✅ Dashboard script โหลดเสร็จแล้ว');
