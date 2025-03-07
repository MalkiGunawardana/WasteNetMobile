import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIAIM5Lolv1f0KA_8BmetnPFaIaudj-Wk",
  authDomain: "wastenet-82658.firebaseapp.com",
  projectId: "wastenet-82658",
  storageBucket: "wastenet-82658.firebasestorage.app",
  messagingSenderId: "810828947710",
  appId: "1:810828947710:web:1a77a9764f2a9dca51c5af",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
