// src/components/Navbar.js

import React from "react";

const Navbar = ({ setCurrentPage }) => {
  return (
    <>
      {/* Top Bar */}
      <div className="top-bar bg-light py-2 d-none d-lg-block">
        {" "}
        {/* Hidden on small screens */}
        <div className="container d-flex justify-content-between align-items-center">
          <div className="contact-info text-muted small">
            <i className="fas fa-envelope me-2"></i>info@sunrisepapers.com
            <i className="fas fa-phone-alt ms-4 me-2"></i>+1 (234) 5678 9101
          </div>
          <div className="social-icons">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm custom-main-navbar">
        <div className="container-fluid">
          {/* Company logo */}
          <button
            className="navbar-brand p-0 border-0 bg-transparent d-flex align-items-center ps-3 ps-md-4 ps-lg-5"
            onClick={() => setCurrentPage("home")}
          >
            <img
              src="/images/logo.png" // Path to your logo image in public/images/
              alt="Sunrise Papers Logo"
              style={{ height: "50px", marginRight: "10px" }} // Adjusted height
            />
            {/* You can add text 'Sunrise Papers' here if your logo is icon-only and you want the name to appear beside it */}
            <span className="logo-text fw-bold">Sunrise Papers</span>
          </button>

          {/* Toggler for mobile navigation */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbarContent"
            aria-controls="mainNavbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar links */}
          <div className="collapse navbar-collapse" id="mainNavbarContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 main-nav-links">
              {" "}
              {/* ms-auto pushes links to the right */}
              <li className="nav-item">
                <button
                  className="nav-link nav-button"
                  onClick={() => setCurrentPage("home")}
                >
                  Home
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link nav-button"
                  onClick={() => setCurrentPage("about")}
                >
                  About
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link nav-button"
                  onClick={() => setCurrentPage("products")}
                >
                  Products
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link nav-button"
                  onClick={() => setCurrentPage("contact")}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
