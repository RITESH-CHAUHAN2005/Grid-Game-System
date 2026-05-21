import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-mhDMZKarPH5gac-WU3vSdgnwljZfK0I",
  authDomain: "grid-project-1d664.firebaseapp.com",
  projectId: "grid-project-1d664",
  storageBucket: "grid-project-1d664.firebasestorage.app",
  messagingSenderId: "40209899823",
  appId: "1:40209899823:web:e2ce3a736fd06ecb3d41da",
  measurementId: "G-QPBH8ZNJSG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (typeof window !== "undefined") {
  try {
    getAnalytics(app);
  } catch {
    // Ignore analytics initialization errors in non-supported environments
  }
}

export { app, db };
