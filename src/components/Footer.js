// src/components/Footer.js

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { collection, addDoc } from "firebase/firestore"; // For Newsletter Storage
import { db } from "../firebaseConfig"; // Import Firebase configuration

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null); // 'success' or 'error' or null
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    // Basic email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus(null);
    setNewsletterMessage("");

    if (!validateEmail(newsletterEmail)) {
      setNewsletterStatus("error");
      setNewsletterMessage("Please enter a valid email address.");
      setIsSubmitting(false);
      setTimeout(() => {
        setNewsletterStatus(null);
        setNewsletterMessage("");
      }, 3000); // Clear message after 3 seconds
      return;
    }

    try {
      // Store newsletter subscription in Firestore
      await addDoc(collection(db, "newsletter_subscriptions"), {
        email: newsletterEmail,
        timestamp: new Date(),
      });
      setNewsletterStatus("success");
      setNewsletterMessage("Thank you for subscribing to our newsletter!");
      setNewsletterEmail(""); // Clear the input field
    } catch (error) {
      console.error("Error subscribing to newsletter: ", error);
      setNewsletterStatus("error");
      setNewsletterMessage("Failed to subscribe. Please try again later.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setNewsletterStatus(null);
        setNewsletterMessage("");
      }, 3000); // Clear message after 3 seconds
    }
  };

  return (
    <>
      {/* Newsletter Section - Above the Main Footer */}
      <div className="newsletter-section bg-dark py-5">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
              <h3 className="newsletter-heading text-white fw-bold">
                SUBSCRIBE TO OUR NEWSLETTER
              </h3>
              <p className="text-white-50 mb-0">
                Get the latest updates from Sunrise Papers.
              </p>
            </div>
            <div className="col-lg-7">
              <form
                className="d-flex newsletter-form"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  type="email"
                  className="form-control newsletter-input"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary newsletter-button ms-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
              {newsletterStatus && (
                <div
                  className={`newsletter-message mt-3 text-center text-lg-start ${
                    newsletterStatus === "success"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {newsletterMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="footer bg-dark py-5 text-white-50">
        <div className="container">
          <div className="row">
            {/* Column 1: Sunrise Papers logo and info */}
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="footer-brand d-flex align-items-center mb-3">
                <img
                  src="/images/logo.png"
                  alt="Sunrise Papers Logo"
                  className="footer-logo me-3"
                />
                <span className="footer-company-name fw-bold text-white">
                  Sunrise Papers
                </span>
              </div>
              <p className="footer-description">
                Delivering execellence in paper products since 1990. Committed
                to quality and sustainability.
              </p>
            </div>
            {/* Column 2: Quick Links */}
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="footer-heading text-white mb-3">Quick Links</h5>
              <ul className="list-unstyled footer-links">
                <li>
                  <Link to="/" className="footer-link text-decoration-none">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="footer-link text-decoration-none"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="footer-link text-decoration-none"
                  >
                    Our Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="footer-link text-decoration-none"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="footer-link text-decoration-none"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    className="footer-link text-decoration-none"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            {/* Column 3: Contact Information */}
            <div className="col-md-4">
              <h5 className="footer-heading text-white mb-3">Contact Info</h5>
              <address className="mb-0">
                <p className="footer-contact-item">
                  <i className="fas fa-map-marker-alt me-2 footer-icon"></i>
                  Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka, New
                  Delhi, 110078, India
                </p>
                <p className="footer-contact-item">
                  <i className="fas fa-envelope me-2 footer-icon"></i>
                  <a
                    href="mailto:info@sunrisepapers.com"
                    className="text-decoration-none footer-link"
                  >
                    info@sunrisepapers.com
                  </a>
                </p>
                <p className="footer-contact-item">
                  <i className="fas fa-phone-alt me-2 footer-icon"></i>
                  <a
                    href="tel:+919810087126"
                    className="text-decoration-none footer-link"
                  >
                    +91 98100 87126
                  </a>
                </p>
              </address>
            </div>
          </div>
        </div>
      </footer>
      {/* Bottom Copyright Bar */}
      <div className="bottom-bar bg-dark py-3 text-center text-white-50 border-top border-secondary opacity-75">
        <div className="container">
          <small>&copy; {new Date().getFullYear()} Sunrise Papers. All Rights Reserved.</small>
        </div>
      </div>
    </>
  );
};

export default Footer;
