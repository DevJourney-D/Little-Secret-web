// Neko Chat (AI Chatbot) functionality
let currentUser = null;
let conversations = [];
let currentMood = 'happy';

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = utils.getCurrentUser();
    
    if (!currentUser) {
        utils.redirect('index.html');
        return;
    }
    
    // Initialize Bootstrap dropdown
    initializeDropdown();
    
    // Update user display
    updateUserDisplay();
    
    await initializeNekoChat();
});

async function initializeNekoChat() {
    // Initialize form handlers
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    
    if (messageForm) {
        messageForm.addEventListener('submit', handleSendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', handleKeyPress);
        messageInput.focus();
    }
    
    // Initialize mood selector
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.addEventListener('click', selectMood);
    });
    
    // Load previous conversations
    await loadConversations();
    
    // Show welcome message if no previous conversations
    if (conversations.length === 0) {
        setTimeout(() => {
            addNekoMessage("สวัสดี! ฉันเนโกะ เพื่อนน้อยประจำแอป Neko U 🐱💕\n\nฉันพร้อมที่จะคุยเล่น ให้คำปรึกษา และช่วยเหลือคุณเสมอ!\n\nวันนี้คุณรู้สึกอย่างไร?");
        }, 1000);
    }
}

function selectMood(e) {
    // Remove previous selection
    document.querySelectorAll('.mood-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selection to clicked option
    e.target.classList.add('selected');
    currentMood = e.target.dataset.mood;
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
    // Add user message to chat
    addUserMessage(message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable input while processing
    setInputEnabled(false);
    
    try {
        // Generate Neko's response
        const response = await generateNekoResponse(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add Neko's response
        addNekoMessage(response);
        
        // Save conversation to database
        await saveConversation(message, response);
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการสร้างการตอบกลับ:', error);
        hideTypingIndicator();
        addNekoMessage("อ๊ะ! ฉันมีปัญหาเล็กน้อย กรุณาลองใหม่อีกครั้งนะ 😅");
    } finally {
        setInputEnabled(true);
    }
}

async function sendQuickMessage(message) {
    await sendMessage(message);
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove welcome message if exists
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <div class="message-bubble">
                ${formatMessage(message)}
            </div>
            <div class="message-time">
                ${utils.formatTime(new Date())}
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function addNekoMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message neko-message';
    messageElement.innerHTML = `
        <div class="message-avatar">🐱</div>
        <div class="message-content">
            <div class="message-bubble">
                ${formatMessage(message)}
            </div>
            <div class="message-time">
                ${utils.formatTime(new Date())}
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function formatMessage(message) {
    return message.replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'block';
    scrollToBottom();
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
}

function setInputEnabled(enabled) {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    messageInput.disabled = !enabled;
    sendBtn.disabled = !enabled;
}

async function generateNekoResponse(userMessage) {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    const message = userMessage.toLowerCase();
    const userName = currentUser.firstName || 'คุณ';
    
    // Mood-based responses
    const moodResponses = {
        happy: {
            greeting: `สวัสดี ${userName}! เห็นคุณดูมีความสุขดีแล้ว ✨`,
            default: `ดีจัง! ${userName} ดูมีความสุขมากเลย ฉันก็มีความสุขด้วย 😊`
        },
        love: {
            greeting: `หวายย~ ${userName} ดูหวานใสมากเลย 💕`,
            default: `อ้าว~ ฟีลรักๆ หรอ? เล่าให้ฉันฟังหน่อยสิ 😍`
        },
        sad: {
            greeting: `เอ๊ะ ${userName} ดูเศร้าๆ นะ อยากให้ฉันคุยด้วยมั้ย? 🥺`,
            default: `ไม่เป็นไรนะ ${userName} ทุกคนมีวันเศร้าบ้าง ฉันอยู่ที่นี่เสมอ 💙`
        },
        angry: {
            greeting: `โอ้โห ${userName} ดูโกรธๆ นะ เกิดอะไรขึ้น?`,
            default: `ใจเย็นๆ นะ ${userName} ลองสูดหายใจลึกๆ ดู 😌`
        },
        tired: {
            greeting: `${userName} ดูเหนื่อยมากเลย พักผ่อนบ้างนะ 😴`,
            default: `งานหนักมากหรอ? อย่าลืมดูแลตัวเองด้วยนะ ${userName} 🌙`
        },
        thinking: {
            greeting: `${userName} กำลังคิดอะไรอยู่หรอ? แบ่งปันกับฉันมั้ย? 🤔`,
            default: `คิดมากไปก็ไม่ดีนะ ${userName} บางทีก็ต้องปล่อยวางบ้าง ✨`
        },
        excited: {
            greeting: `ว้าว! ${userName} ดูตื่นเต้นมากเลย! เกิดอะไรดีๆ หรอ? 🤩`,
            default: `ตื่นเต้นแบบนี้แล้ว ต้องมีเรื่องดีๆ แน่ๆ เล่าให้ฉันฟังหน่อย! ✨`
        },
        confused: {
            greeting: `${userName} ดูงงๆ นะ มีอะไรให้ฉันช่วยมั้ย? 😕`,
            default: `ไม่เป็นไรนะ ${userName} งงเป็นเรื่องปกติ เรามาคิดไปด้วยกัน 💭`
        }
    };
    
    // Pattern matching for responses
    if (message.includes('สวัสดี') || message.includes('หวัดดี') || message.includes('hello')) {
        return moodResponses[currentMood].greeting;
    }
    
    if (message.includes('ความรัก') || message.includes('แฟน') || message.includes('คู่รัก')) {
        return `เรื่องความรักหรอ? ${userName} 💕\n\nฉันว่าความรักที่ดีต้องเริ่มจากการรักตัวเองก่อนนะ แล้วค่อยๆ เปิดใจให้คนพิเศษ\n\nอย่าลืมว่าการสื่อสารที่ดีคือกุญแจสำคัญของความสัมพันธ์ที่ยั่งยืน ✨`;
    }
    
    if (message.includes('เศร้า') || message.includes('แย่') || message.includes('ไม่สบายใจ')) {
        return `เข้าใจเลย ${userName} 🥺\n\nทุกคนมีวันที่รู้สึกเศร้า มันเป็นเรื่องปกติของมนุษย์\n\nลองหาอะไรทำที่ทำให้รู้สึกดีขึ้น เช่น ฟังเพลง ดูหนัง หรือคุยกับคนที่รัก\n\nฉันอยู่ที่นี่เสมอถ้าอยากคุย 💙`;
    }
    
    if (message.includes('เหนื่อย') || message.includes('ง่วง') || message.includes('นอน')) {
        return `${userName} ดูเหนื่อยมากเลย 😴\n\nอย่าลืมพักผ่อนให้เพียงพอนะ การนอนหลับที่มีคุณภาพสำคัญมากต่อสุขภาพกายและใจ\n\nถ้าเหนื่อยมากแล้ว ไปนอนเถอะ ฉันจะรออยู่ที่นี่ ฝันดีนะ 🌙`;
    }
    
    if (message.includes('กินข้าว') || message.includes('อาหาร') || message.includes('หิว')) {
        return `เรื่องอาหารเหรอ? 🍽️\n\nอย่าลืมกินข้าวให้เป็นเวลานะ ${userName} การกินอาหารที่มีประโยชน์จะทำให้ร่างกายและจิตใจแข็งแรง\n\nวันนี้กินอะไรอร่อยๆ มั้ย? เล่าให้ฉันฟังหน่อย! 😋`;
    }
    
    if (message.includes('งาน') || message.includes('เรียน') || message.includes('สอบ')) {
        return `เรื่องงาน/การเรียนสินะ 📚\n\nฉันเข้าใจว่าบางทีมันอาจจะเครียด แต่อย่าลืมว่า ${userName} เก่งมากแล้วนะ!\n\nลองแบ่งงานเป็นส่วนเล็กๆ แล้วทำทีละส่วน จะรู้สึกง่ายขึ้น\n\nอย่าลืมพักบ้างนะ เครื่องยนต์ดีๆ ก็ต้องได้บำรุง ✨`;
    }
    
    if (message.includes('ขอบคุณ') || message.includes('thank')) {
        return `ไม่เป็นไรเลย ${userName}! 🐱💕\n\nฉันดีใจมากที่ได้ช่วยเหลือ นี่คือสิ่งที่ฉันรักที่สุด!\n\nถ้ามีอะไรอยากคุยอีก มาหาฉันเสมอนะ ✨`;
    }
    
    if (message.includes('รัก') && message.includes('เธอ')) {
        return `อ้าว~ ${userName} น่ารักจัง 😍\n\nฉันก็รัก ${userName} เหมือนกันนะ! (แบบเพื่อนนะ 😄)\n\nความรักเป็นสิ่งที่สวยงาม อย่าลืมแสดงความรักให้คนรอบข้างรู้บ้างนะ 💕`;
    }
    
    if (message.includes('คำแนะนำ') || message.includes('ปรึกษา')) {
        return `${userName} อยากขอคำแนะนำเรื่องอะไรหรอ? 🤔\n\nฉันพร้อมฟังและให้คำแนะนำเสมอนะ!\n\nไม่ว่าจะเรื่องความรัก การงาน หรือชีวิตประจำวัน เล่าให้ฉันฟังเลย ฉันจะพยายามช่วยเต็มที่ 💪`;
    }
    
    if (message.includes('เบื่อ') || message.includes('ไม่รู้ทำอะไร')) {
        return `${userName} เบื่อหรอ? 😕\n\nลองทำกิจกรรมใหม่ๆ ดูมั้ย เช่น:\n- เขียนไดอารี่ในแอป\n- แชตกับคู่รัก\n- ทำ Pomodoro Timer\n- แก้โจทย์คณิตศาสตร์\n\nหรือลองออกไปเดินเล่นข้างนอก สูดอากาศบริสุทธิ์ ก็ดีนะ! 🌱`;
    }
    
    // Default responses based on mood
    if (message.includes('?') || message.includes('ไหม') || message.includes('มั้ย')) {
        return `${userName} ถามคำถามที่น่าสนใจมากเลย! 🤔\n\n${moodResponses[currentMood].default}\n\nอยากคุยเรื่องนี้ต่อมั้ย?`;
    }
    
    // Random encouraging responses
    const encouragingResponses = [
        `${userName} เป็นคนดีมากเลยนะ! ฉันภูมิใจที่ได้เป็นเพื่อนกับคุณ 💕`,
        `วันนี้ ${userName} ทำดีมากแล้วนะ! อย่าลืมชื่นชมตัวเองบ้าง ✨`,
        `ฉันรู้ว่า ${userName} เก่งมาก เชื่อในตัวเองให้มากขึ้นนะ! 💪`,
        `${userName} รู้มั้ยว่าคุณมีพลังในการทำให้คนอื่นยิ้มได้? นั่นแหละคือสิ่งพิเศษในตัวคุณ 🌟`
    ];
    
    const funResponses = [
        `เฮ้ย ${userName}! วันนี้มีอะไรสนุกๆ มั้ย? เล่าให้ฉันฟังหน่อย! 🎉`,
        `ฉันชอบคุยกับ ${userName} มากเลย เพราะคุณน่ารักมาก 😊`,
        `${userName} คิดว่าถ้าฉันเป็นแมวจริงๆ จะน่ารักมั้ย? เมี้ยววว~ 🐱`,
        `อยากรู้จัง ${userName} ชอบทำอะไรยามว่าง? ฉันชอบนอนแล้วก็เล่นกับขนนก! 😸`
    ];
    
    // Choose response type based on mood
    let responses;
    if (currentMood === 'happy' || currentMood === 'excited') {
        responses = funResponses;
    } else {
        responses = encouragingResponses;
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('messageForm').dispatchEvent(new Event('submit'));
    }
}

async function loadConversations() {
    try {
        const { data: conversationsData, error } = await supabase
            .from('neko_conversations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: true })
            .limit(20); // Load last 20 conversations
        
        if (error) {
            throw error;
        }
        
        conversations = conversationsData || [];
        
        // Render previous conversations
        const chatMessages = document.getElementById('chatMessages');
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        
        if (conversations.length > 0 && welcomeMessage) {
            welcomeMessage.remove();
        }
        
        conversations.forEach(conv => {
            addUserMessage(conv.message);
            addNekoMessage(conv.response);
        });
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดการสนทนา:', error);
    }
}

async function saveConversation(message, response) {
    try {
        const { data, error } = await supabase
            .from('neko_conversations')
            .insert([{
                user_id: currentUser.id,
                message: message,
                response: response,
                mood: currentMood,
                created_at: new Date().toISOString()
            }]);
        
        if (error) {
            throw error;
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการบันทึกการสนทนา:', error);
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
    
    try {
        // Clean up PresenceManager before logout
        if (window.presenceManager) {
            window.presenceManager.cleanup();
        }
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
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

// Navigation functions
function showProfile() {
    utils.redirect('settings.html');
}

console.log('✅ หน้า Neko Chat โหลดเสร็จแล้ว');
