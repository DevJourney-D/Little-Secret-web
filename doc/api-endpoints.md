# Neko U API Endpoints Documentation

**Base URL**: `https://little-secret-api.vercel.app`

## 🌟 General
- **Health Check**: `GET /api/health`

## 👤 User Management (`/api/users`)

### Public Endpoints (No Auth Required)
- **Register**: `POST /api/users`
- **Login**: `POST /api/users/login`
- **Check Email**: `GET /api/users/email/:email`
- **Check Username**: `GET /api/users/username/:username`

### Protected Endpoints (Auth Required)
- **Get User by ID**: `GET /api/users/:userId`
- **Update User**: `PUT /api/users/:userId`
- **Delete User**: `DELETE /api/users/:userId`
- **Set Online Status**: `PATCH /api/users/:userId/status`
- **Update Preferences**: `PUT /api/users/:userId/preferences`
- **Generate Partner Code**: `POST /api/users/:userId/generate-partner-code`
- **Connect with Partner**: `POST /api/users/:userId/connect-partner`
- **Search Users**: `GET /api/users/:currentUserId/search`
- **Get Activity Logs**: `GET /api/users/:userId/activity-logs`

## 📝 Diary Management (`/api/:userId/diaries`)

### CRUD Operations
- **Create Diary**: `POST /api/:userId/diaries`
- **Get User Diaries**: `GET /api/:userId/diaries`
- **Get Diary by ID**: `GET /api/:userId/diaries/:diaryId`
- **Update Diary**: `PUT /api/:userId/diaries/:diaryId`
- **Delete Diary**: `DELETE /api/:userId/diaries/:diaryId`

### Special Features
- **Get Shared Diaries**: `GET /api/:userId/diaries/shared`
- **Get Recent Diaries**: `GET /api/:userId/diaries/recent`
- **Get Diary Stats**: `GET /api/:userId/diaries/stats`
- **Export Diaries**: `GET /api/:userId/diaries/export`
- **Add Reaction**: `POST /api/:userId/diaries/:diaryId/reaction`

### Filtering & Search
- **Get by Category**: `GET /api/:userId/diaries/category/:category`
- **Get by Mood**: `GET /api/:userId/diaries/mood/:mood`
- **Search Diaries**: `GET /api/:userId/diaries/search`

## 💬 Chat Management (`/api/:userId/messages`)

### Messaging
- **Send Message**: `POST /api/:userId/messages`
- **Get Messages**: `GET /api/:userId/messages/:partnerId`
- **Get Latest Messages**: `GET /api/:userId/messages/latest`
- **Update Message**: `PUT /api/:userId/messages/:messageId`
- **Delete Message**: `DELETE /api/:userId/messages/:messageId`

### Message Features
- **Get Unread Count**: `GET /api/:userId/messages/unread-count`
- **Mark as Read**: `POST /api/:userId/messages/mark-read`
- **Add Reaction**: `POST /api/:userId/messages/:messageId/reaction`
- **Remove Reaction**: `DELETE /api/:userId/messages/:messageId/reaction`

### Analytics & Export
- **Get Chat Stats**: `GET /api/:userId/messages/stats`
- **Get Chat Media**: `GET /api/:userId/messages/media`
- **Export Messages**: `GET /api/:userId/messages/export`
- **Get Conversation Summary**: `GET /api/:userId/messages/summary`
- **Search Messages**: `GET /api/:userId/messages/search`

## ✅ Todo Management (`/api/:userId/todos`)

### CRUD Operations
- **Create Todo**: `POST /api/:userId/todos`
- **Get User Todos**: `GET /api/:userId/todos`
- **Get Todo by ID**: `GET /api/:userId/todos/:todoId`
- **Update Todo**: `PUT /api/:userId/todos/:todoId`
- **Delete Todo**: `DELETE /api/:userId/todos/:todoId`

### Todo Features
- **Toggle Completed**: `PATCH /api/:userId/todos/:todoId/toggle`
- **Get Shared Todos**: `GET /api/:userId/todos/shared`
- **Get Upcoming Todos**: `GET /api/:userId/todos/upcoming`
- **Get Todo Stats**: `GET /api/:userId/todos/stats`
- **Get Todos with Reminders**: `GET /api/:userId/todos/reminders`
- **Get Todo Summary**: `GET /api/:userId/todos/summary`
- **Export Todos**: `GET /api/:userId/todos/export`

### Filtering & Search
- **Get by Category**: `GET /api/:userId/todos/category/:category`
- **Get by Priority**: `GET /api/:userId/todos/priority/:priority`
- **Get by Status**: `GET /api/:userId/todos/status/:status`
- **Search Todos**: `GET /api/:userId/todos/search`

## 🍅 Pomodoro Management (`/api/:userId/pomodoro`)

### Session Management
- **Start Session**: `POST /api/:userId/pomodoro/start`
- **Get Current Session**: `GET /api/:userId/pomodoro/current`
- **Complete Session**: `POST /api/:userId/pomodoro/:sessionId/complete`
- **Cancel Session**: `DELETE /api/:userId/pomodoro/:sessionId/cancel`
- **Update Session**: `PUT /api/:userId/pomodoro/:sessionId`
- **Add Interruption**: `POST /api/:userId/pomodoro/:sessionId/interrupt`

### Analytics & History
- **Get Session History**: `GET /api/:userId/pomodoro/history`
- **Get Pomodoro Stats**: `GET /api/:userId/pomodoro/stats`
- **Get Productivity Trend**: `GET /api/:userId/pomodoro/trend`
- **Get Best Sessions**: `GET /api/:userId/pomodoro/best`
- **Get Pomodoro Summary**: `GET /api/:userId/pomodoro/summary`
- **Export Sessions**: `GET /api/:userId/pomodoro/export`

### Filtering & Search
- **Get by Type**: `GET /api/:userId/pomodoro/type/:sessionType`
- **Search Sessions**: `GET /api/:userId/pomodoro/search`

### Presets
- **Create Preset**: `POST /api/:userId/pomodoro/presets`

## 🧮 Math Learning (`/api/:userId/math`)

### Problem Management
- **Generate Problem**: `POST /api/:userId/math/generate`
- **Submit Answer**: `POST /api/:userId/math/submit`
- **Generate Review Problems**: `POST /api/:userId/math/review`

### History & Analytics
- **Get Math History**: `GET /api/:userId/math/history`
- **Get Math Stats**: `GET /api/:userId/math/stats`
- **Get Incorrect Problems**: `GET /api/:userId/math/incorrect`
- **Get Learning Trend**: `GET /api/:userId/math/trend`
- **Delete Math History**: `DELETE /api/:userId/math/history`

## 🐱 Neko Chat (`/api/:userId/neko`)

### Chat Features
- **Chat with Neko**: `POST /api/:userId/neko/chat`
- **Get Conversation History**: `GET /api/:userId/neko/conversations`
- **Get Conversation Stats**: `GET /api/:userId/neko/stats`
- **Get Daily Advice**: `GET /api/:userId/neko/advice`
- **Get Morning Greeting**: `GET /api/:userId/neko/greeting`

### Management
- **Delete Conversation**: `DELETE /api/:userId/neko/conversation/:conversationId`
- **Clear All Conversations**: `DELETE /api/:userId/neko/conversations`
- **Update Neko Mode**: `PUT /api/:userId/neko/mode`

## 📊 Dashboard (`/api/:userId/dashboard`)

### Summary Data
- **Get Dashboard Data**: `GET /api/:userId/dashboard`
  - Returns combined stats from all modules (diary, todo, pomodoro, chat)

---

## 🔐 Authentication

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

## 🛠️ CORS Configuration
**Allowed Origins:**
- `https://little-secret.vercel.app`
- `https://neko-u.vercel.app`
- `https://our-little-secret-app.vercel.app`
- `http://127.0.0.1:5500` (development)
- `http://localhost:5500` (development)
- `http://127.0.0.1:8080` (development)
- `http://localhost:8080` (development)

**Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
**Allowed Headers:** `Content-Type`, `Authorization`, `X-Requested-With`
**Credentials:** `true`
