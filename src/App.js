// src/App.js

import React, { useState, useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"; // Removed signInWithCustomToken
import { Routes, Route } from "react-router-dom"; // Import Routes and Route for routing

// Import Firebase config and instances
import { auth } from "./firebaseConfig"; // Removed .js extension
// Import main CSS file
import "./App.css"; // App.css will be loaded after Bootstrap

// Import components and pages (no .js extension)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ContactPage from "./pages/ContactPage";

const App = () => {
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
    <div className="app-wrapper">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/products"
          element={<ProductsPage authReady={authReady} />}
        />
        <Route
          path="/contact"
          element={<ContactPage userId={userId} authReady={authReady} />}
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
