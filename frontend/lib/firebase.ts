import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdHZbCPr7uz4XzpBaQfIy2WjKxMrbbTRU",
  authDomain: "supperapp-f0f5e.firebaseapp.com",
  projectId: "supperapp-f0f5e",
  storageBucket: "supperapp-f0f5e.firebasestorage.app",
  messagingSenderId: "934639133267",
  appId: "1:934639133267:web:75b8423d6976f6af9cdca6",
  measurementId: "G-1933S7DPQG"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is only supported in browser environments
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
