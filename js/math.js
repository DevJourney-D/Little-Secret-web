// Math Problems functionality
let currentUser = null;
let currentProblem = null;
let problemStartTime = null;
let correctCount = 0;
let incorrectCount = 0;
let totalProblems = 0;
let bestTime = null;
let recentProblems = [];

// Settings
let difficulty = 'easy';
let activeOperations = ['+', '-'];
let difficultyRanges = {
    easy: { min: 1, max: 10 },
    medium: { min: 1, max: 50 },
    hard: { min: 1, max: 100 }
};

// Pre-defined problems for each difficulty level (100 each)
const predefinedProblems = {
    easy: {
        '+': [],
        '-': [],
        '*': [],
        '/': []
    },
    medium: {
        '+': [],
        '-': [],
        '*': [],
        '/': []
    },
    hard: {
        '+': [],
        '-': [],
        '*': [],
        '/': []
    }
};

// Generate predefined problems
function generatePredefinedProblems() {
    console.log('🎯 กำลังสร้างโจทย์คณิตศาสตร์...');
    
    // Easy problems (1-10)
    generateProblemsForDifficulty('easy', 1, 10, 25);
    
    // Medium problems (1-50)
    generateProblemsForDifficulty('medium', 1, 50, 25);
    
    // Hard problems (1-100)
    generateProblemsForDifficulty('hard', 1, 100, 25);
    
    // Count total problems
    let totalProblems = 0;
    Object.keys(predefinedProblems).forEach(level => {
        Object.keys(predefinedProblems[level]).forEach(op => {
            totalProblems += predefinedProblems[level][op].length;
        });
    });
    
    console.log(`✅ สร้างโจทย์เสร็จแล้ว: ${totalProblems} ข้อ`);
    console.log('📊 แจกแจงโจทย์:');
    Object.keys(predefinedProblems).forEach(level => {
        const levelTotal = Object.keys(predefinedProblems[level]).reduce((sum, op) => 
            sum + predefinedProblems[level][op].length, 0);
        console.log(`   ${level}: ${levelTotal} ข้อ`);
    });
}

function generateProblemsForDifficulty(level, min, max, count) {
    const problems = predefinedProblems[level];
    
    // Addition problems - various patterns
    for (let i = 0; i < count; i++) {
        let num1, num2;
        
        if (i < count / 4) {
            // Pattern 1: Simple sequential additions
            num1 = Math.floor(i * max / count) + min;
            num2 = Math.floor(Math.random() * 5) + 1;
        } else if (i < count / 2) {
            // Pattern 2: Even numbers
            num1 = (Math.floor(Math.random() * (max/2)) + 1) * 2;
            num2 = (Math.floor(Math.random() * (max/2)) + 1) * 2;
        } else if (i < 3 * count / 4) {
            // Pattern 3: Round numbers (ending in 0 or 5)
            const base1 = Math.floor(Math.random() * (max/10)) + 1;
            const base2 = Math.floor(Math.random() * (max/10)) + 1;
            num1 = base1 * (Math.random() > 0.5 ? 10 : 5);
            num2 = base2 * (Math.random() > 0.5 ? 10 : 5);
        } else {
            // Pattern 4: Random numbers
            num1 = Math.floor(Math.random() * max) + min;
            num2 = Math.floor(Math.random() * max) + min;
        }
        
        if (num1 > max) num1 = max;
        if (num2 > max) num2 = max;
        
        problems['+'].push({
            num1,
            num2,
            answer: num1 + num2,
            display: `${num1} + ${num2}`
        });
    }
    
    // Subtraction problems - ensure positive results with variety
    for (let i = 0; i < count; i++) {
        let num1, num2;
        
        if (i < count / 3) {
            // Pattern 1: Large number minus small number
            num1 = Math.floor(Math.random() * max) + Math.floor(max/2);
            num2 = Math.floor(Math.random() * Math.floor(max/3)) + 1;
        } else if (i < 2 * count / 3) {
            // Pattern 2: Close numbers (difference < 10)
            num1 = Math.floor(Math.random() * max) + min;
            num2 = Math.floor(Math.random() * Math.min(10, num1)) + 1;
        } else {
            // Pattern 3: Any valid subtraction
            num1 = Math.floor(Math.random() * max) + min;
            num2 = Math.floor(Math.random() * num1) + 1;
        }
        
        if (num1 > max) num1 = max;
        if (num2 >= num1) num2 = num1 - 1;
        
        problems['-'].push({
            num1,
            num2,
            answer: num1 - num2,
            display: `${num1} - ${num2}`
        });
    }
    
    // Multiplication problems - use appropriate ranges
    for (let i = 0; i < count; i++) {
        const maxMult = level === 'easy' ? 5 : level === 'medium' ? 12 : 15;
        let num1, num2;
        
        if (i < count / 4) {
            // Pattern 1: Multiplication tables (1-12)
            num1 = Math.floor(Math.random() * Math.min(12, maxMult)) + 1;
            num2 = Math.floor(Math.random() * Math.min(12, maxMult)) + 1;
        } else if (i < count / 2) {
            // Pattern 2: One number is small (good for learning)
            num1 = Math.floor(Math.random() * maxMult) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
        } else if (i < 3 * count / 4) {
            // Pattern 3: Powers of 2, 5, 10
            const powers = [2, 5, 10];
            num1 = powers[Math.floor(Math.random() * powers.length)];
            num2 = Math.floor(Math.random() * maxMult) + 1;
        } else {
            // Pattern 4: Random within range
            num1 = Math.floor(Math.random() * maxMult) + 1;
            num2 = Math.floor(Math.random() * maxMult) + 1;
        }
        
        problems['*'].push({
            num1,
            num2,
            answer: num1 * num2,
            display: `${num1} × ${num2}`
        });
    }
    
    // Division problems - ensure whole number results with variety
    for (let i = 0; i < count; i++) {
        let answer, num2, num1;
        
        if (i < count / 4) {
            // Pattern 1: Small quotients
            answer = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            num1 = answer * num2;
        } else if (i < count / 2) {
            // Pattern 2: Division by common divisors (2, 3, 4, 5, 10)
            const divisors = [2, 3, 4, 5, 10];
            num2 = divisors[Math.floor(Math.random() * divisors.length)];
            answer = Math.floor(Math.random() * (level === 'easy' ? 10 : level === 'medium' ? 20 : 30)) + 1;
            num1 = answer * num2;
        } else if (i < 3 * count / 4) {
            // Pattern 3: Perfect squares divided by their roots
            const roots = [2, 3, 4, 5, 6, 7, 8, 9, 10];
            const root = roots[Math.floor(Math.random() * roots.length)];
            if (level === 'easy' && root <= 5) {
                num1 = root * root;
                num2 = root;
                answer = root;
            } else if (level === 'medium' && root <= 8) {
                num1 = root * root;
                num2 = root;
                answer = root;
            } else if (level === 'hard') {
                num1 = root * root;
                num2 = root;
                answer = root;
            } else {
                // Fallback to simple division
                answer = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 5) + 1;
                num1 = answer * num2;
            }
        } else {
            // Pattern 4: Random valid division
            const maxDiv = level === 'easy' ? 10 : level === 'medium' ? 25 : 50;
            answer = Math.floor(Math.random() * maxDiv) + 1;
            num2 = Math.floor(Math.random() * 15) + 1;
            num1 = answer * num2;
        }
        
        problems['/'].push({
            num1,
            num2,
            answer,
            display: `${num1} ÷ ${num2}`
        });
    }
}

// Wait for dependencies to load
async function waitForDependencies() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
        if (window.nekouAuth && window.api) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.warn('⚠️ Some dependencies not loaded, continuing anyway');
    return false;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 เริ่มโหลดหน้า Math Game...');
    
    // Wait for dependencies
    const dependenciesLoaded = await waitForDependencies();
    
    try {
        if (dependenciesLoaded && window.nekouAuth) {
            // Check if user is authenticated
            if (nekouAuth.isAuthenticated()) {
                currentUser = nekouAuth.getUser();
                console.log('👤 พบข้อมูลผู้ใช้:', currentUser);
            } else {
                console.log('⚠️ ผู้ใช้ยังไม่ได้เข้าสู่ระบบ กำลังเปลี่ยนเส้นทาง...');
                window.location.href = '/index.html';
                return;
            }
        } else {
            console.warn('⚠️ Dependencies ไม่พร้อม');
            window.location.href = '/index.html';
            return;
        }

        // Initialize Bootstrap dropdown
        initializeDropdown();

        // Update user display
        updateUserDisplay();

        await initializeMath();

        console.log('🎮 หน้า Math Game โหลดเสร็จแล้ว!');
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้น:', error);
        // Fallback: redirect to login
        window.location.href = '/index.html';
    }
});

async function initializeMath() {
    try {
        // Initialize problem display
        document.getElementById('problemDisplay').innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-calculator fs-1 mb-3"></i><br>
                กดปุ่ม "โจทย์ใหม่" เพื่อเริ่มต้น
            </div>
        `;
        
        // Generate predefined problems
        console.log('🎯 กำลังสร้างโจทย์คณิตศาสตร์...');
        generatePredefinedProblems();
        
        // Load user statistics
        await loadMathStats();
        
        // Initialize form handlers
        const answerInput = document.getElementById('answerInput');
        if (answerInput) {
            answerInput.addEventListener('keypress', handleKeyPress);
        }
        
        // Add event listeners for buttons
        const newProblemBtn = document.getElementById('newProblemBtn');
        if (newProblemBtn) {
            newProblemBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎯 ปุ่มโจทย์ใหม่ถูกกด (event listener)');
                generateProblem();
            });
        }
        
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('💡 ปุ่มคำใบ้ถูกกด (event listener)');
                showHint();
            });
        }
        
        const checkBtn = document.getElementById('checkBtn');
        if (checkBtn) {
            checkBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('✅ ปุ่มตรวจคำตอบถูกกด (event listener)');
                checkAnswer();
            });
        }
        
        // Update display
        updateStatsDisplay();
        
        console.log('✅ หน้าคณิตศาสตร์โหลดเสร็จแล้ว');
        
        // Test function availability
        console.log('🔍 ตรวจสอบฟังก์ชันที่สำคัญ:');
        console.log('  - generateProblem:', typeof generateProblem);
        console.log('  - showHint:', typeof showHint);
        console.log('  - checkAnswer:', typeof checkAnswer);
        console.log('  - activeOperations:', activeOperations);
        console.log('  - difficulty:', difficulty);
        console.log('  - predefinedProblems length:', Object.keys(predefinedProblems).length);
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการเริ่มต้น:', error);
    }
}

function generateProblem() {
    console.log('🎯 กำลังสร้างโจทย์ใหม่...');
    
    // Initialize variables if they don't exist
    if (!activeOperations || activeOperations.length === 0) {
        console.log('⚠️ activeOperations ไม่พร้อม กำลังเริ่มต้นใหม่...');
        activeOperations = ['+', '-']; // Default operations
    }
    
    if (!difficulty) {
        console.log('⚠️ difficulty ไม่พร้อม กำลังเริ่มต้นใหม่...');
        difficulty = 'easy'; // Default difficulty
    }
    
    if (!predefinedProblems || Object.keys(predefinedProblems).length === 0) {
        console.log('⚠️ predefinedProblems ไม่พร้อม กำลังสร้างใหม่...');
        generatePredefinedProblems();
    }
    
    console.log('📊 ตรวจสอบสถานะ:');
    console.log('  - activeOperations:', activeOperations);
    console.log('  - difficulty:', difficulty);
    console.log('  - predefinedProblems keys:', Object.keys(predefinedProblems));
    
    const operation = activeOperations[Math.floor(Math.random() * activeOperations.length)];
    console.log('📊 การดำเนินการที่เลือก:', operation);
    console.log('📈 ระดับความยาก:', difficulty);
    
    // Check if predefined problems exist
    const hasPredefinedProblems = predefinedProblems[difficulty] && 
                                  predefinedProblems[difficulty][operation] && 
                                  predefinedProblems[difficulty][operation].length > 0;
    
    console.log('📚 มีโจทย์เตรียมไว้หรือไม่:', hasPredefinedProblems);
    
    // Always use dynamic generation for now to ensure it works
    console.log('🎲 สร้างโจทย์แบบสุ่ม...');
    
    const range = difficultyRanges[difficulty] || { min: 1, max: 10 };
    let num1, num2, answer;
    
    console.log('🎲 สร้างโจทย์แบบสุ่ม สำหรับระดับ:', difficulty, 'ช่วง:', range);
    
    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * range.max) + range.min;
            num2 = Math.floor(Math.random() * range.max) + range.min;
            answer = num1 + num2;
            break;
            
        case '-':
            num1 = Math.floor(Math.random() * range.max) + range.min;
            if (num1 <= 1) num1 = 2; // Ensure we can subtract
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Ensure positive result
            answer = num1 - num2;
            break;
            
        case '*':
            // For multiplication, use smaller numbers
            const maxMult = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 12 : 15;
            num1 = Math.floor(Math.random() * maxMult) + 1;
            num2 = Math.floor(Math.random() * maxMult) + 1;
            answer = num1 * num2;
            break;
            
        case '/':
            // For division, generate answer first then multiply
            answer = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            num1 = answer * num2;
            break;
            
        default:
            // Fallback to simple addition
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 + num2;
            operation = '+';
    }
    
    currentProblem = {
        num1,
        num2,
        operation,
        answer,
        display: `${num1} ${operation === '*' ? '×' : operation === '/' ? '÷' : operation} ${num2}`,
        source: 'dynamic'
    };
    
    console.log('🎲 สร้างโจทย์ใหม่:', currentProblem);
    
    console.log('✅ โจทย์ที่สร้างแล้ว:', currentProblem);
    
    // Display problem
    const problemDisplay = document.getElementById('problemDisplay');
    if (problemDisplay) {
        problemDisplay.textContent = currentProblem.display;
        console.log('📺 แสดงโจทย์:', currentProblem.display);
    } else {
        console.error('❌ ไม่พบ element problemDisplay');
    }
    
    // Reset input and enable controls
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.value = '';
        answerInput.disabled = false;
        answerInput.focus();
        console.log('⌨️ เปิดใช้งาน input');
    } else {
        console.error('❌ ไม่พบ element answerInput');
    }
    
    const checkBtn = document.getElementById('checkBtn');
    const hintBtn = document.getElementById('hintBtn');
    
    if (checkBtn) {
        checkBtn.disabled = false;
        console.log('🔘 เปิดใช้งานปุ่มตรวจคำตอบ');
    } else {
        console.error('❌ ไม่พบ element checkBtn');
    }
    
    if (hintBtn) {
        hintBtn.disabled = false;
        console.log('💡 เปิดใช้งานปุ่มคำใบ้');
    } else {
        console.error('❌ ไม่พบ element hintBtn');
    }
    
    // Hide feedback
    const feedbackMessage = document.getElementById('feedbackMessage');
    if (feedbackMessage) {
        feedbackMessage.style.display = 'none';
    }
    
    // Start timer
    problemStartTime = Date.now();
    startProblemTimer();
    
    console.log('🎯 สร้างโจทย์เสร็จเรียบร้อย!');
}

function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const userAnswer = parseFloat(answerInput.value);
    
    if (isNaN(userAnswer)) {
        if (typeof utils !== 'undefined' && utils.showAlert) {
            utils.showAlert('กรุณาใส่ตัวเลข', 'warning');
        } else {
            alert('กรุณาใส่ตัวเลข');
        }
        answerInput.focus();
        return;
    }
    
    const timeSpent = (Date.now() - problemStartTime) / 1000;
    const isCorrect = Math.abs(userAnswer - currentProblem.answer) < 0.01; // Handle floating point precision
    
    totalProblems++;
    
    if (isCorrect) {
        correctCount++;
        showFeedback('ถูกต้อง! 🎉', 'correct');
        
        // Update best time
        if (!bestTime || timeSpent < bestTime) {
            bestTime = timeSpent;
        }
    } else {
        incorrectCount++;
        showFeedback(`ไม่ถูกต้อง 😅 คำตอบที่ถูกคือ ${currentProblem.answer}`, 'incorrect');
    }
    
    // Save to recent problems
    addToRecentProblems(currentProblem, userAnswer, isCorrect, timeSpent);
    
    // Save to database
    saveMathProblem(currentProblem, userAnswer, isCorrect, timeSpent);
    
    // Update display
    updateStatsDisplay();
    updateRecentProblems();
    
    // Disable controls
    answerInput.disabled = true;
    document.getElementById('checkBtn').disabled = true;
    document.getElementById('hintBtn').disabled = true;
    
    // Stop timer
    stopProblemTimer();
}

function showFeedback(message, type) {
    const feedbackElement = document.getElementById('feedbackMessage');
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback-message feedback-${type}`;
    feedbackElement.style.display = 'block';
}

function showHint() {
    if (!currentProblem) {
        alert('กรุณาสร้างโจทย์ใหม่ก่อน');
        return;
    }
    
    let hintText = '';
    const { num1, num2, operation, answer } = currentProblem;
    
    switch (operation) {
        case '+':
            hintText = `ลองนับจาก ${num1} แล้วเพิ่มอีก ${num2}\n`;
            hintText += `${num1} + 1 = ${num1 + 1}\n`;
            hintText += `${num1} + 2 = ${num1 + 2}\n`;
            hintText += `...และต่อไปเรื่อยๆ จนครบ ${num2} ครั้ง`;
            break;
            
        case '-':
            hintText = `ลองนับถอยหลังจาก ${num1}\n`;
            hintText += `${num1} - 1 = ${num1 - 1}\n`;
            hintText += `${num1} - 2 = ${num1 - 2}\n`;
            hintText += `...และต่อไปเรื่อยๆ จนครบ ${num2} ครั้ง`;
            break;
            
        case '*':
            hintText = `${num1} × ${num2} หมายถึงเอา ${num1} มา ${num2} ครั้ง\n`;
            hintText += `${num1}`;
            for (let i = 1; i < num2 && i < 5; i++) { // Limit for readability
                hintText += ` + ${num1}`;
            }
            if (num2 > 5) hintText += ` + ... `;
            hintText += `\n= ${answer}`;
            break;
            
        case '/':
            hintText = `${num1} ÷ ${num2} หมายถึง ${num1} แบ่งออกเป็น ${num2} ส่วนเท่าๆ กัน\n`;
            hintText += `หรือถามว่า ${num2} × ? = ${num1}\n`;
            hintText += `คำตอบคือ ${answer}`;
            break;
    }
    
    // Try to use Bootstrap modal first
    try {
        const hintContent = document.getElementById('hintContent');
        const hintModal = document.getElementById('hintModal');
        
        if (hintContent && hintModal && typeof bootstrap !== 'undefined') {
            hintContent.innerHTML = hintText.replace(/\n/g, '<br>');
            const modal = new bootstrap.Modal(hintModal);
            modal.show();
        } else {
            // Fallback to alert if modal not available
            alert('💡 คำใบ้:\n\n' + hintText);
        }
    } catch (error) {
        console.error('Error showing hint modal:', error);
        // Fallback to alert
        alert('💡 คำใบ้:\n\n' + hintText);
    }
}

function setDifficulty(level) {
    difficulty = level;
    
    // Update button states
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-level="${level}"]`).classList.add('active');
}

function toggleOperation(op) {
    const btn = document.querySelector(`[data-op="${op}"]`);
    
    if (activeOperations.includes(op)) {
        // Remove operation
        activeOperations = activeOperations.filter(operation => operation !== op);
        btn.classList.remove('active');
    } else {
        // Add operation
        activeOperations.push(op);
        btn.classList.add('active');
    }
    
    // Ensure at least one operation is selected
    if (activeOperations.length === 0) {
        activeOperations.push('+');
        document.querySelector('[data-op="+"]').classList.add('active');
    }
}

function addToRecentProblems(problem, userAnswer, isCorrect, timeSpent) {
    const recentItem = {
        problem: problem.display,
        userAnswer,
        correctAnswer: problem.answer,
        isCorrect,
        timeSpent: timeSpent.toFixed(1)
    };
    
    recentProblems.unshift(recentItem);
    
    // Keep only last 5 problems
    if (recentProblems.length > 5) {
        recentProblems.pop();
    }
}

function updateRecentProblems() {
    const container = document.getElementById('recentProblems');
    
    if (recentProblems.length === 0) {
        container.innerHTML = '<div class="text-muted">ยังไม่มีโจทย์</div>';
        return;
    }
    
    let html = '';
    recentProblems.forEach(item => {
        const icon = item.isCorrect ? '✅' : '❌';
        const color = item.isCorrect ? 'text-success' : 'text-danger';
        
        html += `
            <div class="small mb-2 ${color}">
                ${icon} ${item.problem} = ${item.userAnswer}
                <br><small class="text-muted">${item.timeSpent}s</small>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateStatsDisplay() {
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('incorrectCount').textContent = incorrectCount;
    document.getElementById('totalProblems').textContent = totalProblems;
    
    const accuracy = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    document.getElementById('bestTime').textContent = bestTime ? bestTime.toFixed(1) + 's' : '-';
}

async function resetStats() {
    let confirmed;
    
    if (typeof utils !== 'undefined' && utils.showConfirm) {
        confirmed = await utils.showConfirm(
            '🔄 รีเซ็ตสถิติ', 
            'คุณแน่ใจหรือไม่ที่จะลบสถิติทั้งหมด? การดำเนินการนี้ไม่สามารถยกเลิกได้',
            'รีเซ็ตเลย',
            'ยกเลิก',
            'warning'
        );
    } else {
        confirmed = confirm('คุณแน่ใจหรือไม่ที่จะลบสถิติทั้งหมด? การดำเนินการนี้ไม่สามารถยกเลิกได้');
    }
    
    if (confirmed) {
        correctCount = 0;
        incorrectCount = 0;
        totalProblems = 0;
        bestTime = null;
        recentProblems = [];
        
        updateStatsDisplay();
        updateRecentProblems();
        
        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast('รีเซ็ตสถิติเรียบร้อยแล้ว! 🔄', 'success');
        } else {
            alert('รีเซ็ตสถิติเรียบร้อยแล้ว!');
        }
    }
}

let timerInterval = null;

function startProblemTimer() {
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('problemTimer').textContent = 
            `⏰ ${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopProblemTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
}

async function loadMathStats() {
    try {
        if (!currentUser || !currentUser.id) {
            console.warn('⚠️ ไม่มีข้อมูลผู้ใช้ ไม่สามารถโหลดสถิติได้');
            // Reset stats to default
            totalProblems = 0;
            correctCount = 0;
            incorrectCount = 0;
            bestTime = null;
            return;
        }
        
        const response = await api.math.getAll();
        const data = response.data || [];
        
        if (data.length > 0) {
            console.log('📊 โหลดสถิติสำเร็จ:', data.length, 'โจทย์');
            
            // Calculate statistics
            totalProblems = data.length;
            correctCount = data.filter(p => p.isCorrect || p.is_correct).length;
            incorrectCount = totalProblems - correctCount;
            
            // Find best time
            const timesArray = data
                .filter(p => (p.timeSpent || p.time_spent) > 0)
                .map(p => p.timeSpent || p.time_spent);
            
            if (timesArray.length > 0) {
                bestTime = Math.min(...timesArray);
            }
            
            // Store recent problems
            recentProblems = data.slice(0, 10);
            
            console.log('📊 โหลดสถิติของ', currentUser.firstName, 'เรียบร้อย:', {
                totalProblems,
                correctCount,
                incorrectCount,
                bestTime: bestTime ? bestTime + 's' : 'ยังไม่มี'
            });
        } else {
            console.log('ℹ️', currentUser.firstName, 'ยังไม่มีสถิติวันนี้');
            totalProblems = 0;
            correctCount = 0;
            incorrectCount = 0;
            bestTime = null;
        }
        
        // Update UI stats
        updateStatsDisplay();
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดสถิติ:', error);
        // Show error to user
        if (typeof utils !== 'undefined' && utils.showAlert) {
            utils.showAlert('เกิดข้อผิดพลาดในการโหลดสถิติ', 'error');
        }
    }
}


async function saveMathProblem(problem, userAnswer, isCorrect, timeSpent) {
    if (!currentUser || !currentUser.id) {
        console.warn('⚠️ ไม่มีข้อมูลผู้ใช้ ไม่สามารถบันทึกได้');
        return;
    }
    try {
        console.log('💾 กำลังบันทึกโจทย์สำหรับผู้ใช้:', currentUser.firstName, 'ID:', currentUser.id);
        const mathData = {
            problemText: problem.display,
            correctAnswer: problem.answer.toString(),
            userAnswer: userAnswer.toString(),
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            difficulty: difficulty,
            operation: problem.operation
        };
        const response = await api.math.create(mathData);
        if (response.success) {
            console.log('✅ บันทึกโจทย์คณิตศาสตร์เรียบร้อยแล้ว!');
        } else {
            throw new Error(response.message || 'Failed to save math problem');
        }
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการบันทึกโจทย์คณิตศาสตร์:', error);
        // Show error to user
        if (typeof utils !== 'undefined' && utils.showAlert) {
            utils.showAlert('เกิดข้อผิดพลาดในการบันทึกผลลัพธ์', 'error');
        }
    }
}

async function logout() {
    let confirmed;
    
    if (typeof utils !== 'undefined' && utils.showConfirm) {
        confirmed = await utils.showConfirm(
            '👋 ออกจากระบบ', 
            'คุณแน่ใจหรือไม่ที่จะออกจากระบบ?',
            'ออกจากระบบ',
            'ยกเลิก',
            'warning'
        );
    } else {
        confirmed = confirm('คุณแน่ใจหรือไม่ที่จะออกจากระบบ?');
    }
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Use nekouAuth logout
        if (window.nekouAuth) {
            await nekouAuth.logout();
        } else {
            // Fallback: clear local storage and redirect
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/index.html';
        }
        
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการออกจากระบบ:', error);
        
        if (typeof utils !== 'undefined' && utils.showAlert) {
            utils.showAlert('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
        } else {
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
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
        let displayName;
        
        if (currentUser.isGuest) {
            displayName = '👻 ' + currentUser.firstName;
        } else {
            // Display real user name from authentication
            displayName = currentUser.firstName && currentUser.lastName 
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : currentUser.email || currentUser.username || 'ผู้ใช้';
        }
        
        userName.textContent = displayName;
        console.log('👤 แสดงชื่อผู้ใช้:', displayName);
        
        // Add a note for guest users
        if (currentUser.isGuest) {
            console.log('ℹ️ โหมดผู้เยี่ยมชม: ข้อมูลจะไม่ถูกบันทึก');
        }
    } else {
        console.warn('⚠️ ไม่สามารถแสดงชื่อผู้ใช้ได้');
        if (userName) {
            userName.textContent = 'ไม่พบข้อมูล';
        }
    }
}

// Navigation functions
function showProfile() {
    if (typeof utils !== 'undefined' && utils.redirect) {
        utils.redirect('settings.html');
    } else {
        window.location.href = 'settings.html';
    }
}

// Show available problems info
function showProblemsInfo() {
    let info = '📊 ข้อมูลโจทย์คณิตศาสตร์\n\n';
    
    Object.keys(predefinedProblems).forEach(level => {
        const levelName = level === 'easy' ? 'ง่าย' : level === 'medium' ? 'ปานกลาง' : 'ยาก';
        info += `${levelName}:\n`;
        
        Object.keys(predefinedProblems[level]).forEach(op => {
            const count = predefinedProblems[level][op].length;
            const opName = op === '+' ? 'บวก' : op === '-' ? 'ลบ' : op === '*' ? 'คูณ' : 'หาร';
            info += `  ${opName}: ${count} ข้อ\n`;
        });
        
        const total = Object.keys(predefinedProblems[level]).reduce((sum, op) => 
            sum + predefinedProblems[level][op].length, 0);
        info += `  รวม: ${total} ข้อ\n\n`;
    });
    
    const grandTotal = Object.keys(predefinedProblems).reduce((sum, level) => 
        sum + Object.keys(predefinedProblems[level]).reduce((levelSum, op) => 
            levelSum + predefinedProblems[level][op].length, 0), 0);
    
    info += `🎯 รวมทั้งหมด: ${grandTotal} ข้อ`;
    
    alert(info);
}

console.log('✅ หน้าคณิตศาสตร์โหลดเสร็จแล้ว');

// Make functions globally accessible
window.generateProblem = generateProblem;
window.checkAnswer = checkAnswer;
window.showHint = showHint;
window.setDifficulty = setDifficulty;
window.toggleOperation = toggleOperation;
window.resetStats = resetStats;
window.showProblemsInfo = showProblemsInfo;
window.showProfile = showProfile;
window.logout = logout;
