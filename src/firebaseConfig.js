// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration from environment variables
// These variables are injected during the build process from your .env file
// They must be prefixed with REACT_APP_ in a Create React App setup
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// --- Initialize Firebase services ---
// Initialize the main Firebase app instance
const app = initializeApp(firebaseConfig);

// Get the Analytics instance
const analytics = getAnalytics(app);

// Get the Firestore database instance
const db = getFirestore(app);

// Get the Authentication instance
const auth = getAuth(app);

// Export the initialized Firebase instances for use throughout your application
export { app, db, auth, analytics };
