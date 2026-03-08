import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // 🌟 ต้องเพิ่มบรรทัดนี้เพื่อใช้ฐานข้อมูล

// เอาค่าของคุณจากเว็บ Firebase มาใส่ตรงนี้
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🌟 ส่งออกตัวแปร auth (สำหรับ Login) และ db (สำหรับเก็บข้อมูล) เพื่อเอาไปใช้หน้าอื่นๆ
export const auth = getAuth(app);
export const db = getFirestore(app);