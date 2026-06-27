// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// ==================== Student Operations ====================
export async function getStudents() {
  try {
    const studentsCollection = collection(db, "students");
    const snapshot = await getDocs(studentsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

export async function getStudentById(studentId) {
  try {
    const studentsCollection = collection(db, "students");
    const q = query(studentsCollection, where("studentId", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? snapshot.docs[0].data() : null;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
}

export async function addStudent(studentData) {
  try {
    const docRef = await addDoc(collection(db, "students"), {
      ...studentData,
      createdAt: new Date().toISOString(),
      status: "active"
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
}

// ==================== Classroom Operations ====================
export async function getClassrooms() {
  try {
    const classroomsCollection = collection(db, "classrooms");
    const snapshot = await getDocs(classroomsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
}

export async function getClassroomById(classroomId) {
  try {
    const docRef = doc(db, "classrooms", classroomId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching classroom:", error);
    throw error;
  }
}

// ==================== Attendance Operations ====================
export async function recordAttendance(attendanceData) {
  try {
    const docRef = await addDoc(collection(db, "attendance"), {
      ...attendanceData,
      checkInTime: new Date().toISOString(),
      status: "checked-in"
    });
    return docRef.id;
  } catch (error) {
    console.error("Error recording attendance:", error);
    throw error;
  }
}

export async function getAttendanceByStudent(studentId, classroomId) {
  try {
    const attendanceCollection = collection(db, "attendance");
    const q = query(
      attendanceCollection,
      where("studentId", "==", studentId),
      where("classroomId", "==", classroomId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
}

export async function getAttendanceByClassroom(classroomId, date) {
  try {
    const attendanceCollection = collection(db, "attendance");
    const q = query(
      attendanceCollection,
      where("classroomId", "==", classroomId),
      where("date", "==", date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
}

export async function updateAttendance(attendanceId, updateData) {
  try {
    const docRef = doc(db, "attendance", attendanceId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
}

// ==================== Class Operations ====================
export async function getClasses() {
  try {
    const classesCollection = collection(db, "classes");
    const snapshot = await getDocs(classesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
}

export async function getClassById(classId) {
  try {
    const docRef = doc(db, "classes", classId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching class:", error);
    throw error;
  }
}

// ==================== Authentication Operations ====================
export async function registerUser(email, password, userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Store additional user data in Firestore
    const userDocRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userDocRef, {
      ...userData,
      email: email,
      uid: userCredential.user.uid,
      createdAt: new Date().toISOString()
    });
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}
