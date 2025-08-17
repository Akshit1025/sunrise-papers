// src/App.js
import React, { useState, useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { Routes, Route, useLocation } from "react-router-dom";

import { auth } from "./firebaseConfig";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ContactPage from "./pages/ContactPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously.");

        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase user ID:", user.uid);
          } else {
            setUserId(null);
          }
          setAuthReady(true);
        });
      } catch (error) {
        console.error("Error during initial Firebase authentication:", error);
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Always keep loader for at least 3s
    const timer = setTimeout(() => {
      if (authReady) {
        // Trigger fade-out after 3s
        setFadeOut(true);

        // Remove preloader after fade-out finishes (1s CSS transition)
        setTimeout(() => setShowPreloader(false), 1000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [authReady]);

  useEffect(() => {
    // If auth wasn't ready at 3s, wait until it becomes ready
    if (authReady) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setShowPreloader(false), 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authReady]);

  if (showPreloader) {
    return (
      <div className={`preloader-container ${fadeOut ? "fade-out" : ""}`}>
        <div className="loader">
          <img
            src="https://sunrise-papers.vercel.app/images/logo-no-shadow.png"
            alt="Sunrise Papers Logo"
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
    <div className={`app-wrapper fade-in`}>
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
