// src/App.js

import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Import Firebase config and instances
import { auth } from './firebaseConfig.js'; // Added .js extension back
// Import main CSS file
import './App.css';

// Import components and pages (added .js extension back for local JS files)
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import HomePage from './pages/HomePage.js';
import AboutPage from './pages/AboutPage.js';
import ProductsPage from './pages/ProductsPage.js';
import ContactPage from './pages/ContactPage.js';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to sign in anonymously. This is a simple way to get a userId
        // for Firestore security rules that require authentication.
        await signInAnonymously(auth);
        console.log("Signed in anonymously.");

        // Set up an authentication state listener to update userId
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase user ID:", user.uid);
          } else {
            console.log("No user signed in.");
            setUserId(null); // Clear userId if no user is signed in
          }
          setAuthReady(true); // Mark authentication as ready regardless of user status
        });
      } catch (error) {
        console.error("Error during initial Firebase authentication:", error);
        setAuthReady(true); // Ensure authReady is set to true even if an error occurs
      }
    };

    initializeAuth();
  }, []); // The empty dependency array ensures this effect runs only once on component mount

  return (
    <div className="container">
      <Navbar setCurrentPage={setCurrentPage} userId={userId} />
      <div className="main-content">
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage />;
            case 'about':
              return <AboutPage />;
            case 'products':
              return <ProductsPage authReady={authReady} />;
            case 'contact':
              return <ContactPage userId={userId} authReady={authReady} />;
            default:
              return <HomePage />; // Default to HomePage if currentPage is unrecognized
          }
        })()}
      </div>
      <Footer />
    </div>
  );
};

export default App;
