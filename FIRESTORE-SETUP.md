# 🔥 Firestore Setup Guide - ระบบเช็คอินนักศึกษา GPS

## 📋 สารบัญ
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Firestore Database Structure](#firestore-database-structure)
4. [Seed Data](#seed-data)
5. [Integration](#integration)
6. [API Functions](#api-functions)

---

## Prerequisites

### ต้องมี:
- Firebase Project (สร้างได้ที่ https://console.firebase.google.com)
- Node.js v14+ (สำหรับ seed script)
- Firebase Admin SDK

### Install Dependencies:
```bash
npm install firebase
npm install firebase-admin --save-dev
```

---

## Firebase Setup

### Step 1: สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. คลิก "Create a new project"
3. ตั้งชื่อ project (เช่น `gps-checkin-system`)
4. เลือก region ที่ใกล้ที่สุด
5. Enable Google Analytics (optional)

### Step 2: Firestore Setup

1. ไปที่ "Firestore Database"
2. คลิก "Create database"
3. เลือก "Start in production mode"
4. เลือก location (ควร asia-southeast1 สำหรับประเทศไทย)

### Step 3: สร้าง Web App

1. ไปที่ Project Settings
2. ไปที่แท็บ "Your apps"
3. คลิก "Add app" → เลือก Web (</> icon)
4. ตั้งชื่อแอป
5. Copy configuration

### Step 4: Update Configuration

แก้ไข `firebaseConfig.json`:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

---

## Firestore Database Structure

### Collections Overview

```
Firestore Database
├── students/
│   ├── 001
│   ├── 002
│   └── ...
├── classrooms/
│   ├── room001
│   ├── room002
│   └── ...
├── classes/
│   ├── class001
│   └── ...
├── teachers/
│   ├── T001
│   └── ...
├── attendance/
│   ├── att001
│   ├── att002
│   └── ...
└── users/ (Auth integration)
    ├── uid001
    └── uid002
```

### Collection Schemas

#### 1. **students** Collection
```json
{
  "id": "001",
  "name": "นายสมชาย อินทรพันธ์",
  "studentId": "6501001",
  "class": "ประเมินคณภาพ 1",
  "email": "somchai@university.ac.th",
  "phone": "0812345601",
  "createdAt": "2026-06-01T00:00:00Z",
  "status": "active"
}
```

#### 2. **classrooms** Collection
```json
{
  "id": "room001",
  "name": "ห้อง 101 - อาคารวิทยาศาสตร์",
  "building": "อาคารวิทยาศาสตร์",
  "floor": 1,
  "latitude": 14.7995,
  "longitude": 100.6534,
  "radius": 500,
  "capacity": 40,
  "createdAt": "2026-06-01T00:00:00Z"
}
```

#### 3. **classes** Collection
```json
{
  "id": "class001",
  "name": "ประเมินคณภาพ 1",
  "semester": "1/2569",
  "year": 2569,
  "instructors": ["T001"],
  "students": ["001", "002", "003"],
  "schedule": {
    "monday": "09:00-11:00",
    "wednesday": "13:00-15:00"
  },
  "classroom": "room001",
  "createdAt": "2026-06-01T00:00:00Z"
}
```

#### 4. **teachers** Collection
```json
{
  "id": "T001",
  "name": "อ.ดร. วิจารณ์ ศรีสวัสดิ์",
  "email": "wichar@university.ac.th",
  "phone": "0861234567",
  "department": "วิทยาศาสตร์ประยุกต์",
  "createdAt": "2026-06-01T00:00:00Z",
  "status": "active"
}
```

#### 5. **attendance** Collection
```json
{
  "id": "att001",
  "studentId": "001",
  "studentName": "นายสมชาย อินทรพันธ์",
  "classId": "class001",
  "classroomId": "room001",
  "classroomName": "ห้อง 101 - อาคารวิทยาศาสตร์",
  "date": "2026-06-27",
  "checkInTime": "2026-06-27T09:15:30Z",
  "checkOutTime": null,
  "latitude": 14.7995,
  "longitude": 100.6534,
  "distance": 25,
  "accuracy": 12.5,
  "status": "checked-in",
  "ipAddress": "192.168.1.100"
}
```

---

## Seed Data

### วิธี 1: Manual Upload (ผ่าน Firebase Console)

1. เปิด Firestore Database
2. คลิก "Start collection"
3. ตั้งชื่อ "students"
4. เพิ่ม document โดยใช้ข้อมูลจาก `firestore-seed-data.json`

### วิธี 2: Node.js Script (แนะนำ)

#### ขั้นที่ 1: Setup Service Account

1. ไปที่ Firebase Console → Project Settings
2. ไปที่แท็บ "Service Accounts"
3. คลิก "Generate New Private Key"
4. Save ไฟล์เป็น `service-account-key.json` ในโฟลเดอร์โปรเจค

#### ขั้นที่ 2: Run Seed Script

```bash
# Install firebase-admin
npm install firebase-admin

# Run seed script
node firestore-seed.js
```

Output:
```
🔄 กำลังเพิ่มข้อมูลไปยัง Firestore...
📚 เพิ่มข้อมูลนักศึกษา...
  ✓ เพิ่ม นายสมชาย อินทรพันธ์
  ✓ เพิ่ม นางสาวจันทร์เพ็ญ ใจสว่าง
...
✅ เพิ่มข้อมูลเสร็จสิ้นแล้ว!
```

---

## Integration

### HTML Setup with Firestore

```html
<!-- Add Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>

<!-- Your Firebase config and app -->
<script src="firebaseService.js"></script>
<script src="app-firestore.js"></script>
```

---

## API Functions

### Student Functions

```javascript
// Get all students
const students = await getStudents();

// Get specific student
const student = await getStudentById("6501001");

// Add new student
const studentId = await addStudent({
  name: "นาย... ...",
  studentId: "6501006",
  email: "...",
  phone: "..."
});
```

### Classroom Functions

```javascript
// Get all classrooms
const classrooms = await getClassrooms();

// Get specific classroom
const classroom = await getClassroomById("room001");
```

### Attendance Functions

```javascript
// Record attendance
const attId = await recordAttendance({
  studentId: "001",
  classroomId: "room001",
  latitude: 14.7995,
  longitude: 100.6534,
  distance: 25,
  accuracy: 12.5
});

// Get attendance by student
const records = await getAttendanceByStudent("001", "room001");

// Get attendance by classroom
const dailyAttendance = await getAttendanceByClassroom("room001", "2026-06-27");

// Update attendance
await updateAttendance("att001", {
  checkOutTime: new Date().toISOString(),
  status: "checked-out"
});
```

### Authentication Functions

```javascript
// Register user
const user = await registerUser("user@email.com", "password", {
  role: "student",
  studentId: "001"
});

// Login
const user = await loginUser("user@email.com", "password");

// Logout
await logoutUser();
```

---

## Firestore Security Rules

### Production Rules (แนะนำ)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students: Only their own data
    match /students/{studentId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    // Classrooms: Read only
    match /classrooms/{classroomId} {
      allow read: if request.auth.uid != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Attendance: Only logged in users can write
    match /attendance/{attendanceId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "teacher";
    }
    
    // Teachers: Read only
    match /teachers/{teacherId} {
      allow read: if request.auth.uid != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Classes: Read only
    match /classes/{classId} {
      allow read: if request.auth.uid != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

### Development Rules (สำหรับ testing)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **หมายเหตุ**: ใช้เฉพาะใน development mode เท่านั้น!

---

## Troubleshooting

### ❌ "Permission denied" Error
- ตรวจสอบ Security Rules
- ปรับ rules สำหรับ development

### ❌ "Document not found"
- ตรวจสอบชื่อ collection และ document ID
- ใช้ Firebase Console เพื่อยืนยันข้อมูล

### ❌ Seed script ไม่ทำงาน
- ตรวจสอบ `service-account-key.json` ถูกต้อง
- ลองแล้ว `node firestore-seed.js` อีกครั้ง

---

## สรุป

✅ Firebase Project สร้างเสร็จ
✅ Firestore Database สร้างเสร็จ
✅ Seed Data เพิ่มแล้ว
✅ Security Rules ตั้งค่าเสร็จ
✅ Frontend integration พร้อม

**ตอนนี้ระบบของคุณสามารถใช้ Firestore จริงได้แล้ว!** 🎉
