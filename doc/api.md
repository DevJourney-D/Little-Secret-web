## API Endpoints

**Base URL**: `https://little-secret-api.vercel.app`

### 🌟 General
- `GET /api/health` — API health check

### 🔐 Authentication & User Management

#### Public Endpoints (No Auth Required)
- `POST /api/users` — Register new user
- `POST /api/users/login` — User login
- `GET /api/users/email/:email` — Check if email exists
- `GET /api/users/username/:username` — Check if username exists
- `GET /api/users/availability/username/:username` — Check username availability (legacy)
- `GET /api/users/availability/email/:email` — Check email availability (legacy)

#### Frontend Compatibility Routes
- `POST /auth/register` — User registration (frontend compatibility)
- `POST /auth/login` — User login (frontend compatibility)
- `GET /auth/check/username/:username` — Check username availability (frontend compatibility)
- `GET /auth/check/email/:email` — Check email availability (frontend compatibility)

#### Protected Endpoints (Auth Required)
- `GET /api/users/:userId` — Get user profile
- `PUT /api/users/:userId` — Update user profile
- `DELETE /api/users/:userId` — Delete user account
- `PATCH /api/users/:userId/status` — Set online status
- `PUT /api/users/:userId/preferences` — Update user preferences

#### Partner System
- `POST /api/users/:userId/generate-partner-code` — Generate partner connection code
- `POST /api/users/:userId/connect-partner` — Connect with partner using code
- `POST /api/users/:userId/partner` — Connect with partner (legacy)
- `DELETE /api/users/:userId/partner` — Disconnect from partner
- `GET /api/users/:currentUserId/search` — Search for users
- `GET /api/users/:userId/activity-logs` — Get user activity logs

### 📝 Diary Management
- `GET /api/:userId/diaries` — Get all user diaries
- `POST /api/:userId/diaries` — Create new diary entry
- `GET /api/:userId/diaries/:diaryId` — Get specific diary entry
- `PUT /api/:userId/diaries/:diaryId` — Update diary entry
- `DELETE /api/:userId/diaries/:diaryId` — Delete diary entry

#### Special Features
- `GET /api/:userId/diaries/shared` — Get diaries shared with partner
- `GET /api/:userId/diaries/recent` — Get recent diary entries
- `GET /api/:userId/diaries/stats` — Get diary statistics
- `POST /api/:userId/diaries/:diaryId/react` — Add reaction to diary (legacy)
- `POST /api/:userId/diaries/:diaryId/reaction` — Add reaction to diary
- `GET /api/:userId/diaries/export` — Export diary data

#### Filtering & Search
- `GET /api/:userId/diaries/category/:category` — Get diaries by category
- `GET /api/:userId/diaries/mood/:mood` — Get diaries by mood
- `GET /api/:userId/diaries/search?q=query` — Search diary content

### 💬 Chat Management
- `GET /api/:userId/messages` — Get all chat messages (legacy)
- `POST /api/:userId/messages` — Send new message (legacy)
- `GET /api/:userId/messages/:messageId` — Get message by ID (legacy)
- `DELETE /api/:userId/messages/:messageId` — Delete message (legacy)
- `POST /api/:userId/messages/:messageId/react` — React to message (legacy)

#### Modern Chat Endpoints
- `POST /api/:userId/chat` — Send message to partner
- `GET /api/:userId/messages/:partnerId` — Get messages with specific partner
- `PUT /api/:userId/chat/:messageId/read` — Mark message as read

### ✅ Todo Management
- `GET /api/:userId/todos` — Get all user todos
- `POST /api/:userId/todos` — Create new todo item
- `GET /api/:userId/todos/:todoId` — Get specific todo
- `PUT /api/:userId/todos/:todoId` — Update todo item
- `DELETE /api/:userId/todos/:todoId` — Delete todo item

#### Todo Features
- `PATCH /api/:userId/todos/:todoId/toggle` — Toggle todo completion status
- `GET /api/:userId/todos/shared` — Get todos shared with partner
- `GET /api/:userId/todos/upcoming` — Get upcoming todos
- `GET /api/:userId/todos/stats` — Get todo statistics
- `GET /api/:userId/todos/reminders` — Get todos with reminders
- `GET /api/:userId/todos/summary` — Get todo summary
- `GET /api/:userId/todos/export` — Export todo data

#### Filtering & Search
- `GET /api/:userId/todos/category/:category` — Get todos by category
- `GET /api/:userId/todos/priority/:priority` — Get todos by priority
- `GET /api/:userId/todos/status/:status` — Get todos by status
- `GET /api/:userId/todos/search?q=query` — Search todo content

### 🍅 Pomodoro Management
- `GET /api/:userId/pomodoro` — Get all pomodoro sessions
- `POST /api/:userId/pomodoro` — Create new pomodoro session
- `GET /api/:userId/pomodoro/:sessionId` — Get specific session
- `PUT /api/:userId/pomodoro/:sessionId` — Update session
- `DELETE /api/:userId/pomodoro/:sessionId` — Delete session

#### Session Management
- `POST /api/:userId/pomodoro/start` — Start new pomodoro session
- `GET /api/:userId/pomodoro/current` — Get current active session
- `POST /api/:userId/pomodoro/:sessionId/complete` — Complete session
- `PUT /api/:userId/pomodoro/:sessionId/complete` — Complete session (alternative)
- `DELETE /api/:userId/pomodoro/:sessionId/cancel` — Cancel session
- `POST /api/:userId/pomodoro/:sessionId/interrupt` — Add interruption

#### Analytics & History
- `GET /api/:userId/pomodoro/history` — Get session history
- `GET /api/:userId/pomodoro/stats` — Get pomodoro statistics
- `GET /api/:userId/pomodoro/trend` — Get productivity trend
- `GET /api/:userId/pomodoro/best` — Get best sessions
- `GET /api/:userId/pomodoro/summary` — Get pomodoro summary
- `GET /api/:userId/pomodoro/export` — Export session data

#### Filtering & Search
- `GET /api/:userId/pomodoro/type/:sessionType` — Get sessions by type
- `GET /api/:userId/pomodoro/search?q=query` — Search sessions

#### Presets
- `POST /api/:userId/pomodoro/presets` — Create session preset

### 🧮 Math Learning
- `GET /api/:userId/math` — Get math problems
- `POST /api/:userId/math` — Create new math problem
- `GET /api/:userId/math/:problemId` — Get specific problem
- `PUT /api/:userId/math/:problemId` — Update problem
- `DELETE /api/:userId/math/:problemId` — Delete problem

#### Problem Solving
- `POST /api/:userId/math/:problemId/solve` — Submit answer to problem
- `GET /api/:userId/math/stats` — Get math learning statistics
- `GET /api/:userId/math/progress` — Get learning progress

### 🐱 Neko AI Chat
- `POST /api/:userId/neko` — Send message to Neko AI (legacy)
- `GET /api/:userId/neko/history` — Get Neko AI chat history (legacy)

#### Modern Neko Chat
- `POST /api/:userId/neko-chat` — Chat with Neko AI
- `GET /api/:userId/neko-chat` — Get conversation history
- `GET /api/:userId/neko/conversations` — Get conversation list
- `GET /api/:userId/neko/stats` — Get conversation statistics
- `GET /api/:userId/neko/advice` — Get daily advice from Neko
- `GET /api/:userId/neko/greeting` — Get morning greeting from Neko

#### Management
- `DELETE /api/:userId/neko/conversation/:conversationId` — Delete conversation
- `DELETE /api/:userId/neko/conversations` — Clear all conversations
- `PUT /api/:userId/neko/mode` — Update Neko chat mode

### 📊 Dashboard
- `GET /api/:userId/dashboard` — Get comprehensive dashboard data
  - Returns combined statistics from all modules (diary, todo, pomodoro, chat)

---

## 🔐 Authentication & Headers

### Headers Required for Protected Routes:
```javascript
{
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

### Rate Limiting:
- **Limit**: 100 requests per 15 minutes per IP
- **Applies to**: All `/api/*` routes

---

## 📋 Common Response Format

### Success Response:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Optional detailed error info"
}
```

---

## 🛠️ Frontend Integration

### JavaScript API Helper Usage:
```javascript
// Using the global API object
const user = await api.auth.login(username, password);
const diaries = await api.diary.getAll(userId);
const todos = await api.todo.getAll(userId);

// Using the NekoUAPI class
const result = await nekoAPI.getDashboardData(userId);
```

### Cookie Management:
- Authentication uses JWT tokens stored in cookies
- Cookies: `nekouToken` (JWT), `nekouUser` (user data)
- Auto-logout after 5 minutes of inactivity

---

## 🌐 CORS Configuration

**Allowed Origins:**
- `https://little-secret.vercel.app`
- `https://neko-u.vercel.app`
- `https://our-little-secret-app.vercel.app`
- `http://127.0.0.1:5500` (development)
- `http://localhost:5500` (development)
- `http://127.0.0.1:8080` (development)
- `http://localhost:8080` (development)

**Methods:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`  
**Headers:** `Content-Type`, `Authorization`, `X-Requested-With`  
**Credentials:** `true`