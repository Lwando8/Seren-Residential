import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "serenresidential-app.firebaseapp.com",
  projectId: "serenresidential-app",
  storageBucket: "serenresidential-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 