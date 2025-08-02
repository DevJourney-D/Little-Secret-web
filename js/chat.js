// Chat functionality with UserInfoManager
let currentUser = null;
let partnerInfo = null;
let messages = [];
let typingTimeout = null;
let messagesSubscription = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('💬 เริ่มต้นแชท...');
        
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
        
        await initializeChat();
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นแชท:', error);
    }
});

async function initializeChat() {
    try {
        // Check if user has partner
        if (!partnerInfo || !currentUser.partner_id) {
            showNoPartnerMessage();
            return;
        }
        
        // Update UI with partner info
        updatePartnerDisplay();
        
        // Show chat interface
        document.getElementById('chatInputContainer').style.display = 'block';
        
        // Initialize form handlers
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('messageInput');
        const emojiBtn = document.getElementById('emojiBtn');
        
        if (messageForm) {
            messageForm.addEventListener('submit', handleSendMessage);
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', handleTyping);
            messageInput.addEventListener('keypress', handleKeyPress);
        }
        
        if (emojiBtn) {
            emojiBtn.addEventListener('click', toggleEmojiPicker);
        }
        
        // Load messages (จำกัดการโหลดเฉพาะครั้งแรก)
        await loadMessages();
        
        // Setup real-time subscription
        setupRealTimeSubscription();
        
        console.log('✅ แชทเริ่มต้นสำเร็จ');
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้นแชท:', error);
    }
}
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!e.target.closest('.emoji-picker') && !e.target.closest('#emojiBtn')) {
            emojiPicker.classList.remove('show');
        }
    });
    
    // Load messages and setup real-time subscription
    await loadMessages();
    setupRealtimeSubscription();
    
    // Focus on input
    messageInput.focus();

function showNoPartnerMessage() {
    document.getElementById('noPartnerMessage').style.display = 'block';
    document.getElementById('chatMessages').style.display = 'none';
    document.getElementById('chatInputContainer').style.display = 'none';
}

function updatePartnerDisplay() {
    const partnerName = document.getElementById('partnerName');
    const statusIndicator = document.getElementById('statusIndicator');
    
    if (partnerInfo) {
        partnerName.textContent = `${partnerInfo.firstName} ${partnerInfo.lastName}`;
        // TODO: Implement real-time online status
        statusIndicator.className = 'status-indicator offline';
    }
}

async function loadMessages() {
    try {
        // ตรวจสอบว่ามีคู่รักก่อน
        if (!currentUser.partnerId || !partnerInfo) {
            messages = [];
            renderMessages();
            return;
        }
        
        const { data: messagesData, error } = await supabase
            .from('chat_messages')
            .select(`
                *,
                sender:users!chat_messages_sender_id_fkey(first_name, last_name, display_name, avatar_url),
                receiver:users!chat_messages_receiver_id_fkey(first_name, last_name, display_name, avatar_url)
            `)
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.partner_id}),and(sender_id.eq.${currentUser.partner_id},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        // เพิ่มการตรวจสอบความปลอดภัยใน frontend
        const secureMessages = SecurityUtils.filterChatMessages(messagesData || [], currentUser, partnerInfo);
        messages = secureMessages;
        renderMessages();
        scrollToBottom();
        
        // Mark messages as read
        await markMessagesAsRead();
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดข้อความ:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการโหลดข้อความ', 'error');
    }
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <i class="bi bi-chat-heart"></i>
                <h6>เริ่มการสนทนา</h6>
                <p>ส่งข้อความแรกให้คู่รักกันเถอะ!</p>
            </div>
        `;
        return;
    }
    
    const messagesHTML = messages.map((message, index) => {
        const isMyMessage = message.sender_id === currentUser.id;
        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
        
        return `
            <div class="message ${isMyMessage ? 'my-message' : 'partner-message'}">
                ${showAvatar ? `
                    <div class="message-avatar">
                        ${isMyMessage ? '👤' : '💕'}
                    </div>
                ` : '<div class="message-avatar" style="visibility: hidden;">💕</div>'}
                <div class="message-content">
                    <div class="message-bubble">
                        ${formatMessage(message.message)}
                    </div>
                    <div class="message-time">
                        ${utils.formatTime(message.created_at)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = messagesHTML;
}

function formatMessage(message) {
    // Convert line breaks to <br>
    return message.replace(/\n/g, '<br>');
}

async function handleSendMessage(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    await sendMessage(message);
    messageInput.value = '';
    messageInput.focus();
}

async function sendMessage(message) {
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([{
                sender_id: currentUser.id,
                receiver_id: currentUser.partner_id,
                message: message,
                message_type: 'text',
                read: false,
                created_at: new Date().toISOString()
            }])
            .select(`
                *,
                sender:users!chat_messages_sender_id_fkey(first_name, last_name, display_name, avatar_url),
                receiver:users!chat_messages_receiver_id_fkey(first_name, last_name, display_name, avatar_url)
            `)
            .single();
        
        if (error) {
            throw error;
        }
        
        // Message will be added via real-time subscription
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการส่งข้อความ:', error);
        utils.showAlert('เกิดข้อผิดพลาดในการส่งข้อความ', 'error');
    }
}

async function sendQuickMessage(message) {
    await sendMessage(message);
}

function insertEmoji(emoji) {
    const messageInput = document.getElementById('messageInput');
    const currentValue = messageInput.value;
    const cursorPos = messageInput.selectionStart;
    
    const newValue = currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
    messageInput.value = newValue;
    
    // Set cursor position after emoji
    messageInput.focus();
    messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    
    // Hide emoji picker
    document.getElementById('emojiPicker').classList.remove('show');
}

function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPicker.classList.toggle('show');
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('messageForm').dispatchEvent(new Event('submit'));
    }
}

function handleTyping() {
    // TODO: Implement typing indicator for real-time
    // This would require real-time communication setup
    
    // Clear existing timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    typingTimeout = setTimeout(() => {
        // Stop typing indicator
    }, 1000);
}

async function markMessagesAsRead() {
    try {
        const { error } = await supabase
            .from('chat_messages')
            .update({ read: true })
            .eq('receiver_id', currentUser.id)
            .eq('sender_id', currentUser.partnerId)
            .eq('read', false);
        
        if (error) {
            console.error('❌ ข้อผิดพลาดในการทำเครื่องหมายอ่านแล้ว:', error);
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการทำเครื่องหมายอ่านแล้ว:', error);
    }
}

function setupRealtimeSubscription() {
    // Subscribe to new messages
    messagesSubscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.partner_id}),and(sender_id.eq.${currentUser.partner_id},receiver_id.eq.${currentUser.id}))`
        }, (payload) => {
            handleNewMessage(payload.new);
        })
        .subscribe();
}

async function handleNewMessage(newMessage) {
    try {
        // Get sender and receiver info
        const { data: senderData } = await supabase
            .from('users')
            .select('first_name, last_name, display_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
        
        const { data: receiverData } = await supabase
            .from('users')
            .select('first_name, last_name, display_name, avatar_url')
            .eq('id', newMessage.receiver_id)
            .single();
        
        // Add sender and receiver info to message
        newMessage.sender = senderData;
        newMessage.receiver = receiverData;
        
        // Add to messages array
        messages.push(newMessage);
        
        // Re-render messages
        renderMessages();
        scrollToBottom();
        
        // Mark as read if I'm the receiver
        if (newMessage.receiver_id === currentUser.id) {
            await markMessagesAsRead();
        }
        
        // Show notification if page is not visible
        if (document.hidden && newMessage.sender_id !== currentUser.id) {
            showNotification(newMessage);
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการจัดการข้อความใหม่:', error);
    }
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('🐱💕 Neko U - ข้อความใหม่', {
            body: `${partnerInfo.firstName}: ${message.message}`,
            icon: '/favicon.ico',
            tag: 'neko-u-message',
            silent: false,
            requireInteraction: false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    } else if ('Notification' in window && Notification.permission === 'default') {
        // Request permission if not granted
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(message);
            }
        });
    }
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    
    // Cleanup subscriptions
    if (messagesSubscription) {
        messagesSubscription.unsubscribe();
    }
    
    try {
        await supabase.auth.signOut();
        utils.clearUserSession();
        utils.redirect('index.html');
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการออกจากระบบ:', error);
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            utils.showToast('เปิดการแจ้งเตือนข้อความแล้ว! 🔔', 'success');
        }
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (messagesSubscription) {
        messagesSubscription.unsubscribe();
    }
});

// Handle visibility change for marking messages as read
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        markMessagesAsRead();
    }
});

console.log('✅ หน้าแชทโหลดเสร็จแล้ว');
