// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1MzzRhfZmv3laUMqCYfL4515aMlKqA3Y",
  authDomain: "wizlearn-92899.firebaseapp.com",
  projectId: "wizlearn-92899",
  storageBucket: "wizlearn-92899.appspot.com",
  messagingSenderId: "380341162875",
  appId: "1:380341162875:web:5e14339f9f0f25f6bf23de",
  measurementId: "G-TS5M8SVFYN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app)
export const storage = getStorage(app)

// const analytics = getAnalytics(app);
