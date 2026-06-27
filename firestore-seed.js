/**
 * Firestore Seed Data Script
 * ใช้สำหรับเพิ่มข้อมูลตัวอย่างลงใน Firestore
 * 
 * Usage:
 * node firestore-seed.js
 */

import admin from 'firebase-admin';
import seedData from './firestore-seed-data.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('🔄 กำลังเพิ่มข้อมูลไปยัง Firestore...');

    // Seed Students
    if (seedData.collections.students && seedData.collections.students.length > 0) {
      console.log('📚 เพิ่มข้อมูลนักศึกษา...');
      for (const student of seedData.collections.students) {
        const { id, ...data } = student;
        await db.collection('students').doc(id).set(data);
        console.log(`  ✓ เพิ่ม ${student.name}`);
      }
    }

    // Seed Classrooms
    if (seedData.collections.classrooms && seedData.collections.classrooms.length > 0) {
      console.log('🏛️  เพิ่มข้อมูลห้องเรียน...');
      for (const classroom of seedData.collections.classrooms) {
        const { id, ...data } = classroom;
        await db.collection('classrooms').doc(id).set(data);
        console.log(`  ✓ เพิ่ม ${classroom.name}`);
      }
    }

    // Seed Classes
    if (seedData.collections.classes && seedData.collections.classes.length > 0) {
      console.log('📖 เพิ่มข้อมูลวิชา...');
      for (const cls of seedData.collections.classes) {
        const { id, ...data } = cls;
        await db.collection('classes').doc(id).set(data);
        console.log(`  ✓ เพิ่ม ${cls.name}`);
      }
    }

    // Seed Teachers
    if (seedData.collections.teachers && seedData.collections.teachers.length > 0) {
      console.log('👨‍🏫 เพิ่มข้อมูลอาจารย์...');
      for (const teacher of seedData.collections.teachers) {
        const { id, ...data } = teacher;
        await db.collection('teachers').doc(id).set(data);
        console.log(`  ✓ เพิ่ม ${teacher.name}`);
      }
    }

    // Seed Attendance (optional - can be sparse)
    if (seedData.collections.attendance && seedData.collections.attendance.length > 0) {
      console.log('📅 เพิ่มข้อมูลการเช็คอิน...');
      for (const attendance of seedData.collections.attendance) {
        const { id, ...data } = attendance;
        await db.collection('attendance').doc(id).set(data);
        console.log(`  ✓ เพิ่มการเช็คอิน ${attendance.studentName}`);
      }
    }

    console.log('\n✅ เพิ่มข้อมูลเสร็จสิ้นแล้ว!');
    process.exit(0);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
