# 🌟 Little Secret API Documentation
**Base URL:** `https://little-secret-api.vercel.app/api`

## 📋 สถานะระบบ
✅ **Deployed & Ready** - API พร้อมใช้งาน 100%
✅ **Authentication** - JWT Token System
✅ **Database** - PostgreSQL (Supabase)
✅ **All Endpoints Tested** - ทุก API ทำงานได้

---

## 🔐 Authentication System

### การสมัครสมาชิก
```javascript
POST /api/users
Content-Type: application/json

{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "displayName": "string (required)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}

// Response
{
  "success": true,
  "message": "สร้างผู้ใช้สำเร็จ",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "createdAt": "timestamp"
  }
}
```

### การเข้าสู่ระบบ
```javascript
POST /api/users/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

// Response
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "displayName": "string"
    }
  }
}
```

---

## 👤 User Management

### ดึงข้อมูลผู้ใช้
```javascript
GET /api/users/{userId}
Authorization: Bearer {token}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "firstName": "string",
    "lastName": "string",
    "avatarUrl": "string",
    "isOnline": boolean,
    "lastSeen": "timestamp"
  }
}
```

### อัพเดทข้อมูลผู้ใช้
```javascript
PUT /api/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "displayName": "string",
  "firstName": "string", 
  "lastName": "string",
  "avatarUrl": "string"
}
```

---

## 💕 Partner System (ระบบคู่รัก)

### สร้างรหัสเชื่อมต่อคู่รัก
```javascript
POST /api/users/{userId}/generate-partner-code
Authorization: Bearer {token}

// Response
{
  "success": true,
  "message": "สร้างรหัสเชื่อมต่อสำเร็จ",
  "data": {
    "partner_code": "8_DIGIT_CODE",
    "expires_at": "timestamp"
  }
}
```

### เชื่อมต่อกับคู่รัก
```javascript
POST /api/users/{userId}/connect-partner
Authorization: Bearer {token}
Content-Type: application/json

{
  "partnerCode": "8_DIGIT_CODE"
}

// Response
{
  "success": true,
  "message": "เชื่อมต่อกับคู่รักสำเร็จ",
  "data": {
    "partnerId": "uuid",
    "partnerName": "string"
  }
}
```

---

## 📖 Diary System

### สร้างไดอารี่
```javascript
POST /api/{userId}/diaries
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string (required)",
  "content": "string (required)",
  "mood": "happy|sad|excited|calm|angry|love|grateful", 
  "category": "daily|travel|relationship|work|personal",
  "isSharedWithPartner": boolean,
  "tags": ["string"]
}

// Response
{
  "success": true,
  "message": "สร้างไดอารี่สำเร็จ",
  "data": {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "mood": "string",
    "category": "string",
    "isSharedWithPartner": boolean,
    "createdAt": "timestamp"
  }
}
```

### ดึงรายการไดอารี่
```javascript
GET /api/{userId}/diaries
Authorization: Bearer {token}

// Query Parameters
?page=1&limit=10&mood=happy&category=daily&shared=true

// Response
{
  "success": true,
  "data": {
    "diaries": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### ดึงไดอารี่เฉพาะ
```javascript
GET /api/{userId}/diaries/{diaryId}
Authorization: Bearer {token}
```

### แก้ไขไดอารี่
```javascript
PUT /api/{userId}/diaries/{diaryId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "content": "string", 
  "mood": "string",
  "category": "string",
  "isSharedWithPartner": boolean
}
```

### ลบไดอารี่
```javascript
DELETE /api/{userId}/diaries/{diaryId}
Authorization: Bearer {token}
```

---

## ✅ Todo System

### สร้าง Todo
```javascript
POST /api/{userId}/todos
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string (required)",
  "description": "string",
  "priority": "low|normal|high|urgent",
  "category": "personal|work|relationship|health",
  "dueDate": "YYYY-MM-DD",
  "sharedWithPartner": boolean,
  "assignedToPartner": boolean
}

// Response
{
  "success": true,
  "message": "สร้างรายการสำเร็จ",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "pending",
    "priority": "string",
    "completed": false,
    "createdAt": "timestamp"
  }
}
```

### ดึงรายการ Todo
```javascript
GET /api/{userId}/todos
Authorization: Bearer {token}

// Query Parameters
?status=pending&priority=high&category=personal&shared=true&assigned=false

// Response
{
  "success": true,
  "data": {
    "todos": [...],
    "stats": {
      "total": 10,
      "pending": 7,
      "completed": 3,
      "overdue": 1
    }
  }
}
```

### อัพเดท Todo
```javascript
PUT /api/{userId}/todos/{todoId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "status": "pending|in_progress|completed|cancelled",
  "priority": "low|normal|high|urgent",
  "completed": boolean
}
```

### ลบ Todo
```javascript
DELETE /api/{userId}/todos/{todoId}
Authorization: Bearer {token}
```

---

## 🍅 Pomodoro System

### สร้าง Pomodoro Session
```javascript
POST /api/{userId}/pomodoro
Authorization: Bearer {token}
Content-Type: application/json

{
  "duration": 25, // minutes
  "type": "work|break|long_break",
  "task": "string",
  "category": "work|study|personal"
}

// Response
{
  "success": true,
  "message": "เริ่ม Pomodoro สำเร็จ",
  "data": {
    "id": "uuid",
    "duration": 25,
    "type": "work",
    "task": "string",
    "startTime": "timestamp",
    "endTime": "timestamp",
    "status": "active"
  }
}
```

### ดึงรายการ Pomodoro
```javascript
GET /api/{userId}/pomodoro
Authorization: Bearer {token}

// Query Parameters
?date=2024-08-03&type=work&status=completed

// Response
{
  "success": true,
  "data": {
    "sessions": [...],
    "stats": {
      "totalSessions": 5,
      "totalMinutes": 125,
      "completedToday": 3
    }
  }
}
```

### จบ Pomodoro Session
```javascript
PUT /api/{userId}/pomodoro/{sessionId}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "actualDuration": 25,
  "notes": "string"
}
```

---

## 🧮 Math System

### สร้างโจทย์คณิต
```javascript
POST /api/{userId}/math
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "addition|subtraction|multiplication|division",
  "difficulty": "easy|medium|hard",
  "problem": "string",
  "answer": "string",
  "category": "arithmetic|algebra|geometry"
}
```

### ดึงโจทย์คณิต
```javascript
GET /api/{userId}/math
Authorization: Bearer {token}

// Query Parameters
?type=addition&difficulty=easy&limit=10

// Response
{
  "success": true,
  "data": {
    "problems": [...],
    "stats": {
      "totalSolved": 50,
      "correctAnswers": 45,
      "accuracy": 90
    }
  }
}
```

### ส่งคำตอบ
```javascript
POST /api/{userId}/math/{problemId}/solve
Authorization: Bearer {token}
Content-Type: application/json

{
  "userAnswer": "string",
  "timeSpent": 30 // seconds
}

// Response
{
  "success": true,
  "data": {
    "correct": boolean,
    "correctAnswer": "string",
    "explanation": "string",
    "points": 10
  }
}
```

---

## 🐱 Neko Chat (AI Chat)

### ส่งข้อความหา AI
```javascript
POST /api/{userId}/neko-chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "string",
  "context": "casual|advice|emotional_support"
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "userMessage": "string",
    "aiResponse": "string",
    "mood": "friendly|supportive|playful",
    "timestamp": "timestamp"
  }
}
```

### ดึงประวัติแชท AI
```javascript
GET /api/{userId}/neko-chat
Authorization: Bearer {token}

// Query Parameters
?limit=20&page=1

// Response
{
  "success": true,
  "data": {
    "conversations": [...],
    "pagination": { ... }
  }
}
```

---

## 💬 Chat System (คู่รัก)

### ส่งข้อความหาคู่รัก
```javascript
POST /api/{userId}/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "string",
  "type": "text|image|voice|sticker",
  "replyTo": "uuid" // optional
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "string",
    "type": "text",
    "senderId": "uuid",
    "receiverId": "uuid",
    "timestamp": "timestamp",
    "isRead": false
  }
}
```

### ดึงข้อความกับคู่รัก
```javascript
GET /api/{userId}/messages/{partnerId}
Authorization: Bearer {token}

// Query Parameters
?limit=50&page=1&before=timestamp

// Response
{
  "success": true,
  "data": {
    "messages": [...],
    "pagination": { ... }
  }
}
```

### อ่านข้อความ
```javascript
PUT /api/{userId}/chat/{messageId}/read
Authorization: Bearer {token}
```

---

## 📊 Dashboard

### ดึงข้อมูลสรุป Dashboard
```javascript
GET /api/{userId}/dashboard
Authorization: Bearer {token}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "displayName": "string",
      "avatarUrl": "string"
    },
    "stats": {
      "diaryEntries": 15,
      "todosCompleted": 8,
      "pomodoroSessions": 12,
      "mathProblems": 25,
      "chatMessages": 50
    },
    "recentActivity": [
      {
        "type": "diary|todo|pomodoro|math|chat",
        "action": "created|completed|updated",
        "description": "string",
        "timestamp": "timestamp"
      }
    ],
    "partner": {
      "id": "uuid",
      "displayName": "string",
      "avatarUrl": "string",
      "isOnline": boolean,
      "lastSeen": "timestamp"
    },
    "todayStats": {
      "diariesCreated": 2,
      "todosCompleted": 3,
      "pomodoroMinutes": 75,
      "mathProblems": 5
    }
  }
}
```

---

## 🏥 Health Check

### ตรวจสอบสถานะ API
```javascript
GET /api/health

// Response
{
  "success": true,
  "message": "API is working properly",
  "timestamp": "timestamp",
  "version": "1.0.0"
}
```

---

## 🔧 Technical Details

### Headers ที่ต้องใช้
```javascript
// สำหรับ API ที่ต้อง Authentication
Authorization: Bearer {jwt_token}

// สำหรับส่งข้อมูล JSON
Content-Type: application/json

// สำหรับ CORS
Origin: your-frontend-domain.com
```

### Error Responses
```javascript
// Unauthorized (401)
{
  "success": false,
  "message": "Access Token ไม่ถูกต้อง"
}

// Not Found (404) 
{
  "success": false,
  "message": "ไม่พบข้อมูลที่ต้องการ"
}

// Validation Error (400)
{
  "success": false,
  "message": "ข้อมูลไม่ถูกต้อง",
  "errors": {
    "field": "error_message"
  }
}

// Server Error (500)
{
  "success": false,
  "message": "เกิดข้อผิดพลาดในระบบ"
}
```

### Rate Limiting
- **Limit:** 100 requests per minute per IP
- **Headers:** 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 99` 
  - `X-RateLimit-Reset: timestamp`

---

## 🚀 Quick Start Example

```javascript
// 1. สมัครสมาชิก
const registerResponse = await fetch('https://little-secret-api.vercel.app/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myusername',
    email: 'user@example.com', 
    password: 'mypassword',
    displayName: 'My Display Name'
  })
});

// 2. เข้าสู่ระบบ
const loginResponse = await fetch('https://little-secret-api.vercel.app/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myusername',
    password: 'mypassword'
  })
});

const { data } = await loginResponse.json();
const token = data.token;
const userId = data.user.id;

// 3. สร้างไดอารี่
const diaryResponse = await fetch(`https://little-secret-api.vercel.app/api/${userId}/diaries`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'วันนี้ดีมาก',
    content: 'วันนี้เป็นวันที่ดี มีความสุขมาก',
    mood: 'happy',
    category: 'daily'
  })
});

// 4. ดึงข้อมูล Dashboard
const dashboardResponse = await fetch(`https://little-secret-api.vercel.app/api/${userId}/dashboard`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📝 Important Notes

1. **JWT Tokens** มีอายุ 7 วัน ต้องเก็บไว้ใน localStorage หรือ sessionStorage
2. **User IDs** ใช้ UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
3. **Timestamps** ใช้ ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
4. **Priority levels:** `low`, `normal`, `high`, `urgent` เท่านั้น
5. **Mood options:** `happy`, `sad`, `excited`, `calm`, `angry`, `love`, `grateful`
6. **API มี Rate Limiting** 100 requests/minute
7. **CORS enabled** สำหรับทุกโดเมน
8. **Database** ใช้ PostgreSQL บน Supabase

---

## 🎯 Status: **READY FOR FRONTEND INTEGRATION** ✅

ระบบ API พร้อมใช้งาน 100% - สามารถเริ่มพัฒนาหน้าบ้านได้เลย!
