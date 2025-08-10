// src/components/Footer.js

import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Footer = () => {
  return (
    <>
      {/* Main Footer */}
      <footer className="footer py-5">
        <div className="container">
          <div className="row">
            {/* Column 1: Sunrise Papers logo and info */}
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="footer-brand d-flex align-items-center mb-3">
                <img
                  src="/images/logo-no-bg.png" // Changed logo path here
                  alt="Sunrise Papers Logo"
                  className="footer-logo me-3"
                />
                <span className="footer-company-name fw-bold">
                  Sunrise Papers
                </span>
              </div>
              <p className="footer-description">
                Delivering execellence in paper products since 1995. Committed
                to quality and sustainability.
              </p>
              <div className="footer-social-icons mt-4">
                <a
                  href="https://www.linkedin.com/in/dinesh-gupta-57b513374" // Updated LinkedIn URL (example)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link me-3"
                >
                  <i className="fab fa-linkedin"></i>{" "}
                  {/* Changed from fa-twitter to fa-linkedin */}
                </a>
                <a
                  href="https://github.com/Akshit1025/sunrise-papers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link me-3"
                >
                  <i className="fab fa-github"></i>
                </a>
                <a
                  href="https://wa.me/919810087126"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link me-3"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a
                  href="https://g.co/kgs/WDyBz11" // Updated Google Business URL (example)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                >
                  <i className="fab fa-google-plus-g"></i>{" "}
                  {/* Changed from fa-instagram to fa-google-plus-g */}
                </a>
              </div>
            </div>
            {/* Column 2: Quick Links */}
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="footer-heading mb-3">Quick Links</h5>
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
              </ul>
            </div>
            {/* Column 3: Contact Information */}
            <div className="col-md-4">
              <h5 className="footer-heading mb-3">Contact Info</h5>
              <address className="mb-0">
                <p className="footer-contact-item">
                  <i className="fas fa-map-marker-alt me-2 footer-icon"></i>
                  <a
                    href="https://maps.app.goo.gl/zFrzmgSPvqrrL79Z9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none footer-link"
                  >
                    Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka,
                    Delhi, 110078, India
                  </a>
                </p>
                <p className="footer-contact-item">
                  <i className="fas fa-envelope me-2 footer-icon"></i>
                  <a
                    href="mailto:dineshgupta@sunrisepapers.co.in"
                    className="text-decoration-none footer-link"
                  >
                    dineshgupta@sunrisepapers.co.in
                  </a>
                </p>
                <p className="footer-contact-item">
                  <i className="fas fa-phone me-2 footer-icon"></i>
                  <a
                    href="tel:+919555509507"
                    className="text-decoration-none footer-link"
                  >
                    +91 95555 09507
                  </a>
                  &nbsp;|&nbsp;
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
      <div className="bottom-bar py-3 text-center">
        <div className="container d-md-flex justify-content-between align-items-center">
          <small className="mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} Sunrise Papers. All Rights
            Reserved.
          </small>
          <ul className="list-inline mb-0 footer-policy-links">
            <li className="list-inline-item me-3">
              <a
                href="/pdf/privacy-policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none footer-bottom-link"
              >
                Privacy Policy
              </a>
            </li>
            <li className="list-inline-item">
              <a
                href="/pdf/terms-and-conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none footer-bottom-link"
              >
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Footer;
