# 📱 ระบบเช็คอินนักศึกษา GPS - Firestore Integration

## 📦 ไฟล์ที่สร้างขึ้น

### 1. Configuration Files
| ไฟล์ | คำอธิบาย |
|-----|---------|
| `firebaseConfig.json` | Firebase configuration สำหรับเชื่อมต่อ Firestore |
| `firestore-seed-data.json` | ข้อมูลตัวอย่างสำหรับ seed ลงใน Firestore |

### 2. JavaScript Services
| ไฟล์ | คำอธิบาย |
|-----|---------|
| `firebaseService.js` | Firebase/Firestore API functions (ES6 modules) |
| `app.js` | Local JSON version (เดิม) |
| `app-firestore.js` | **Firestore integration version** ✅ |

### 3. HTML Pages
| ไฟล์ | คำอธิบาย |
|-----|---------|
| `index.html` | Local JSON version |
| `index-firestore.html` | **Firestore version** ✅ |

### 4. Setup & Documentation
| ไฟล์ | คำอธิบาย |
|-----|---------|
| `firestore-seed.js` | Node.js script สำหรับ seed data |
| `FIRESTORE-SETUP.md` | **คู่มือ setup Firestore** ✅ |

### 5. Data Files (JSON)
| ไฟล์ | คำอธิบาย |
|-----|---------|
| `students.json` | ข้อมูลนักศึกษา (Local) |
| `classrooms.json` | ข้อมูลห้องเรียน (Local) |
| `attendance.json` | ข้อมูลการเช็คอิน (Local) |

---

## 🚀 Quick Start

### Option 1: Local JSON (ทดสอบเร็ว)
```bash
# เปิดไฟล์นี้ในเบราว์เซอร์
index.html
```

### Option 2: Firestore (Run จริง) ⭐ แนะนำ

#### Step 1: Setup Firebase Project
ทำตามคำแนะนำใน [FIRESTORE-SETUP.md](./FIRESTORE-SETUP.md)

#### Step 2: Update Configuration
แก้ไข `firebaseConfig.json` ด้วย Firebase credentials ของคุณ

#### Step 3: Seed Database
```bash
# Install dependencies
npm install firebase-admin

# Run seed script
node firestore-seed.js
```

#### Step 4: Open Application
```bash
# ใช้ Firestore version
index-firestore.html
```

---

## 📊 Firestore Database Structure

```
Firestore Database
├── students/           📚 นักศึกษา
│   ├── 001
│   ├── 002
│   └── ...
├── classrooms/         🏛️  ห้องเรียน
│   ├── room001
│   ├── room002
│   └── ...
├── classes/            📖 วิชา
│   ├── class001
│   └── ...
├── teachers/           👨‍🏫 อาจารย์
│   ├── T001
│   └── ...
└── attendance/         📅 การเช็คอิน
    ├── att001
    ├── att002
    └── ...
```

---

## 🔑 Features

### นักศึกษา ได้ใช้งาน:
✅ GPS Real-time tracking
✅ Check-in ตรวจสอบระยะห่าง
✅ ดูประวัติการเช็คอิน
✅ แสดงแผนที่ตำแหน่ง

### อาจารย์ ได้ใช้งาน:
✅ ดู Dashboard การเช็คอิน
✅ สรุปสถิติการเข้าเรียน
✅ รายชื่อนักศึกษาและสถานะ
✅ ส่งออก CSV

---

## 📝 Data Models

### Student
```json
{
  "id": "001",
  "name": "นายสมชาย อินทรพันธ์",
  "studentId": "6501001",
  "class": "ประเมินคณภาพ 1",
  "email": "somchai@university.ac.th",
  "phone": "0812345601",
  "status": "active"
}
```

### Classroom
```json
{
  "id": "room001",
  "name": "ห้อง 101",
  "latitude": 14.7995,
  "longitude": 100.6534,
  "radius": 500,
  "capacity": 40
}
```

### Attendance
```json
{
  "studentId": "001",
  "classroomId": "room001",
  "date": "2026-06-27",
  "checkInTime": "2026-06-27T09:15:30Z",
  "latitude": 14.7995,
  "longitude": 100.6534,
  "distance": 25,
  "accuracy": 12.5,
  "status": "checked-in"
}
```

---

## 🔐 Security Rules

### Production (Recommended)
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    match /classrooms/{classroomId} {
      allow read: if request.auth.uid != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    match /attendance/{attendanceId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "teacher";
    }
  }
}
```

### Development (Testing Only)
⚠️ ห้ามใช้ใน production!
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## API Functions

### Load Data
```javascript
// Auto load from JSON or Firestore
loadData()
```

### GPS Operations
```javascript
// Start continuous GPS tracking
startGPSTracking()

// Refresh location
refreshLocation()

// Calculate distance
calculateDistance(lat1, lon1, lat2, lon2)
```

### Check-in Operations
```javascript
// Perform check-in
performCheckIn()

// Get student history
updateStudentHistory()

// Load attendance data for teacher
loadAttendanceData()

// Export to CSV
exportAttendance()
```

### Firestore Operations
```javascript
// Get all students
const students = await db.collection('students').get()

// Record attendance
await db.collection('attendance').add(checkInRecord)

// Query attendance by date
await db.collection('attendance')
  .where('classroomId', '==', classroomId)
  .where('date', '==', today)
  .get()
```

---

## 🛠️ Troubleshooting

### ❌ Firebase not initialized
- ตรวจสอบ `firebaseConfig.json` ถูกต้อง
- ตรวจสอบ Firebase SDK loaded ในหน้า

### ❌ Permission denied
- ตรวจสอบ Security Rules ใน Firestore
- ใช้ Development rules ก่อน

### ❌ GPS not working
- ตรวจสอบ HTTPS หรือ localhost
- ตรวจสอบ browser permissions

### ❌ Data not showing
- ตรวจสอบว่า seed data เพิ่มแล้ว
- ลองรีเฟรชหน้า
- ตรวจสอบ Browser Console สำหรับ errors

---

## 📦 Project Structure

```
bug-page/
├── index.html              (Local version)
├── index-firestore.html    (Firestore version) ⭐
├── app.js                  (Local logic)
├── app-firestore.js        (Firestore logic) ⭐
├── firebaseConfig.json     (Firebase config)
├── firebaseService.js      (Firebase API)
├── firestore-seed.js       (Seed script)
├── firestore-seed-data.json (Seed data)
├── students.json           (Local data)
├── classrooms.json         (Local data)
├── attendance.json         (Local data)
├── FIRESTORE-SETUP.md      (Setup guide) ⭐
└── style/
    └── style.css
```

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Leaflet Map Library](https://leafletjs.com/)

---

## ✅ Checklist สำหรับ Production

- [ ] Firebase Project สร้างเสร็จ
- [ ] Firestore Database สร้างเสร็จ
- [ ] firebaseConfig.json updated
- [ ] Seed data เพิ่มแล้ว
- [ ] Security Rules ตั้งค่าเสร็จ
- [ ] Test check-in functionality
- [ ] Test teacher dashboard
- [ ] Test GPS accuracy
- [ ] Test CSV export
- [ ] Test mobile responsiveness

---

## 🎉 Ready to Go!

ระบบของคุณตอนนี้เพร้อมที่จะใช้ Firestore จริงแล้ว!

**เริ่มต้นใช้:**
```bash
# 1. Open Firestore version
open index-firestore.html

# 2. หรือเปิด local version สำหรับทดสอบ
open index.html
```

ทำตามขั้นตอนใน [FIRESTORE-SETUP.md](./FIRESTORE-SETUP.md) สำหรับ setup แบบ full production ✨
