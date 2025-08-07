// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7S8JDdjW4VotslPVgLEFOi1X_oRCs0u0",
  authDomain: "stock-management-1823d.firebaseapp.com",
  projectId: "stock-management-1823d",
  storageBucket: "stock-management-1823d.firebasestorage.app",
  messagingSenderId: "226717060855",
  appId: "1:226717060855:web:6ee35a731ea6a6c5f14df2",
  measurementId: "G-K5LW7VMNPR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);