import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBIFamaMJOk4UjWBPTMVXM5sXKJRCF9wJs",
  authDomain: "interview-preparation-ap-aa6d6.firebaseapp.com",
  projectId: "interview-preparation-ap-aa6d6",
  storageBucket: "interview-preparation-ap-aa6d6.appspot.com", // ✅ FIXED
  messagingSenderId: "630863414235",
  appId: "1:630863414235:web:762536b6a1f99c6ba0ddfe",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
