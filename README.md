# 🐱💕 Neko U - Couple Diary Application

## การแก้ไขระบบล่าสุด (5 สิงหาคม 2568)

### ✅ สิ่งที่แก้ไขแล้ว

#### 1. แก้ไขระบบการลงทะเบียนแบบครบถ้วน ✨ NEW!
- **ปรับปรุงไฟล์ `js/register.js`** ให้มีการจัดการที่สมบูรณ์
- **เพิ่ม Debug Logging** แบบละเอียดเพื่อติดตามการทำงาน
- **แก้ไข Event Handling** ของปุ่มลงทะเบียนให้ทำงานได้ถูกต้อง
- **เพิ่ม API Functions** พร้อม fallback mechanisms
- **ปรับปรุงการตรวจสอบ Form Elements** ก่อนใช้งาน
- **เพิ่มการตรวจสอบ API_BASE_URL** แบบ dynamic

#### 2. ไฟล์ JavaScript ที่ใช้สำหรับการลงทะเบียน
**ไฟล์หลัก:** `js/register.js` (เวอร์ชันที่แก้ไขแล้ว)
- ✅ Event listeners สำหรับฟอร์ม
- ✅ Real-time validation (อีเมล, ชื่อผู้ใช้, รหัสผ่าน)
- ✅ API integration พร้อม error handling
- ✅ Loading states และ user feedback
- ✅ Debug logging สำหรับ troubleshooting

#### 3. อัปเดต Backend URL
- เปลี่ยน API URL เป็น `https://little-secret-api.vercel.app`
- อัปเดตการตั้งค่าใน `js/config.js`

#### 2. แก้ไขระบบการลงทะเบียน (เดิม)
- เพิ่มฟิลด์ `วันเกิด` ในฟอร์มลงทะเบียน
- อัปเดต validation ให้รองรับฟิลด์ใหม่
- ปรับ API endpoints ให้ตรงกับโครงสร้างฐานข้อมูล:
  - `/api/auth/register` สำหรับลงทะเบียน
  - `/api/auth/login` สำหรับเข้าสู่ระบบ
  - `/api/auth/check-username` สำหรับตรวจสอบชื่อผู้ใช้
  - `/api/auth/check-email` สำหรับตรวจสอบอีเมล

#### 4. แก้ไข File Paths ทั้งหมด
- แก้ไข CSS paths: `css/` → `../css/`
- แก้ไข JS paths: `js/` → `../js/`
- แก้ไข navigation links ให้ถูกต้อง
- อัปเดต root index.html ให้เปลี่ยนเส้นทางไป `html/index.html`

#### 5. สร้างไฟล์ JavaScript ใหม่ (เดิม)
- `js/login.js` - จัดการหน้าเข้าสู่ระบบ
- `js/register.js` - จัดการหน้าลงทะเบียนพร้อม validation

#### 6. โครงสร้างฐานข้อมูลที่รองรับ
ตามไฟล์ `doc/complete_fresh_database.sql`:
- ตาราง `users` พร้อมฟิลด์ครบถ้วน
- ตาราง `relationships` สำหรับการจับคู่
- ตาราง `diary_entries`, `chat_messages`, `todos` และอื่นๆ
- Row Level Security (RLS) และ Indexes

### 📁 โครงสร้างไฟล์

```
LveU-web/
├── index.html                 # หน้าเปลี่ยนเส้นทาง
├── test.html                 # หน้าทดสอบระบบ
├── html/                     # หน้าเว็บหลัก
│   ├── index.html            # หน้าเข้าสู่ระบบ
│   ├── register.html         # หน้าลงทะเบียน
│   ├── dashboard.html        # หน้าหลัก
│   ├── chat.html            # หน้าแชท
│   ├── diary.html           # หน้าไดอารี่
│   └── ...
├── js/                      # JavaScript files
│   ├── config.js            # การตั้งค่า API
│   ├── auth.js              # ระบบ authentication
│   ├── login.js             # หน้าเข้าสู่ระบบ
│   ├── register.js          # หน้าลงทะเบียน
│   └── ...
├── css/                     # CSS files
├── assets/                  # ไฟล์รูปภาพและ icons
└── doc/                     # เอกสาร
    └── complete_fresh_database.sql
```

### 🚀 วิธีใช้งาน

#### 1. ทดสอบระบบการลงทะเบียน 🆕
**ไฟล์สำหรับทดสอบ:** `test-register.html`
- ตรวจสอบการตั้งค่า API
- ตรวจสอบการเชื่อมต่อ Backend  
- ทดสอบปุ่มลงทะเบียน
- ดู Debug Console Messages

**วิธีการ:**
1. เปิดไฟล์ `test-register.html` ในเบราว์เซอร์
2. คลิก "🚀 เปิดหน้าลงทะเบียน"
3. เปิด Developer Console (กด F12)
4. กรอกข้อมูลและกดปุ่มลงทะเบียน
5. ดู debug messages ใน console

#### 2. ทดสอบระบบทั่วไป
เปิด `test.html` เพื่อตรวจสอบ:
- การตั้งค่า API
- การเชื่อมต่อ Backend
- ระบบ Authentication
- โครงสร้างไฟล์

#### 3. เข้าสู่ระบบ
- เปิด `index.html` (เปลี่ยนเส้นทางอัตโนมัติ)
- หรือเปิด `html/index.html` โดยตรง
- กรอกชื่อผู้ใช้และรหัสผ่าน

#### 4. ลงทะเบียน
- คลิก "สมัครสมาชิก" ในหน้าเข้าสู่ระบบ
- กรอกข้อมูลครบถ้วน:
  - ชื่อ-นามสกุล
  - ชื่อเล่น
  - อีเมล (ใช้งานจริง)
  - ชื่อผู้ใช้ (3-20 ตัวอักษร)
  - รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
  - เพศ
  - วันเกิด
  - รหัสคู่ (ถ้ามี)

### 🔧 ข้อมูลเทคนิค

#### API Endpoints
```javascript
// Authentication
POST /api/auth/register     // ลงทะเบียน
POST /api/auth/login        // เข้าสู่ระบบ
GET  /api/auth/check-username?username=xxx
GET  /api/auth/check-email?email=xxx

// Users
GET  /api/users/{id}        // ข้อมูลผู้ใช้
PUT  /api/users/{id}        // อัปเดตข้อมูล

// Diary, Chat, Todo endpoints อื่นๆ
```

#### Database Schema
ฟิลด์สำคัญในตาราง `users`:
- `email`, `username` (unique)
- `first_name`, `last_name`, `nickname`
- `gender`, `birth_date`
- `partner_id`, `partner_code`
- `avatar_url`, `bio`
- `notification_settings`, `privacy_settings`

### 🔒 Security Features
- Password strength validation
- Email format validation
- Username availability check
- Age validation (อย่างน้อย 13 ปี)
- XSS protection
- CSRF protection

### 📱 Responsive Design
- รองรับ mobile และ desktop
- Bootstrap 5.3.0
- Smooth animations
- Loading states

### 🐛 การแก้ไขปัญหา

#### ปัญหา API Connection
1. ตรวจสอบ URL ใน `js/config.js`
2. ตรวจสอบ CORS settings ใน backend
3. ดู console logs สำหรับ error messages

#### ปัญหา File Paths
1. ตรวจสอบ relative paths ใน HTML files
2. ใช้ developer tools เพื่อดู 404 errors
3. รัน script `scripts/fix-paths.sh` อีกครั้ง

#### ปัญหา Database
1. ตรวจสอบ SQL schema ใน `doc/complete_fresh_database.sql`
2. ตรวจสอบ table permissions
3. ตรวจสอบ RLS policies

### 📞 Support
หากพบปัญหา:
1. เปิด `test.html` เพื่อดูสถานะระบบ
2. ตรวจสอบ browser console
3. ตรวจสอบ network tab ใน developer tools

---
💕 **Neko U Team** - Making couples closer through technology
# Little-Secret-web
# Little-Secret-web
