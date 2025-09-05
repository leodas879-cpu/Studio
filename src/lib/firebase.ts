
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "recipeai-n2e5e",
  appId: "1:620252393384:web:9e3dad8f877eb99049b79d",
  storageBucket: "recipeai-n2e5e.firebasestorage.app",
  apiKey: "AIzaSyB_OFmNZBI6OUy5tHXosXmC-_5bbu83cVo",
  authDomain: "recipeai-n2e5e.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "620252393384"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
