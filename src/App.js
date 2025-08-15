// src/App.js

import React, { useState, useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { Routes, Route, useLocation } from "react-router-dom"; // Import useLocation

// Import Firebase config and instances
import { auth } from "./firebaseConfig";
// Import main CSS file
import "./App.css";

// Import components and pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ContactPage from "./pages/ContactPage";

// New ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation(); // Get the current path from React Router

  useEffect(() => {
    // Scroll to top whenever the pathname changes (i.e., route changes)
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array: re-run effect when pathname changes

  return null; // This component doesn't render anything itself
};

const App = () => {
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [preloaderVisible, setPreloaderVisible] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to sign in anonymously.
        await signInAnonymously(auth);
        console.log("Signed in anonymously.");

        // Set up an authentication state listener to update userId
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase user ID:", user.uid);
          } else {
            console.log("No user signed in.");
            setUserId(null);
          }
          setAuthReady(true); // Mark authentication as ready regardless of user status
        });
      } catch (error) {
        console.error("Error during initial Firebase authentication:", error);
        setAuthReady(true); // Ensure authReady is set to true even if an error occurs
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (authReady) {
      const timer = setTimeout(() => setPreloaderVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [authReady])

  // New Preloader UI
  if (preloaderVisible) {
    return (
      <div className={`preloader-container ${authReady ? "fade-out" : ""}`}>
        <div className="loader">
          <img
            src="https://sunrise-papers.vercel.app/images/logo-no-bg.png"
            alt="Sunrise Paers Logo"
            className="loader-logo"
          />
          <div className="loader-waves">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-wrapper ${!preloaderVisible ? "fade-in" : ""}`}>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/products"
          element={<ProductsPage authReady={authReady} />}
        />
        <Route
          path="/products/:categorySlug"
          element={<CategoryProductsPage authReady={authReady} />}
        />
        <Route
          path="/product/:productSlug"
          element={<ProductDetailPage authReady={authReady} />}
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
