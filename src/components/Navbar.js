// src/components/Navbar.js

import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Navbar = () => {
  const handleNavLinkClick = () => {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#mainNavbarContent");
    if (
      navbarToggler &&
      navbarCollapse &&
      navbarCollapse.classList.contains("show")
    ) {
      navbarToggler.click(); // Close the navbar if it's open
    }
  };
  return (
    <>
      {/* Top Bar */}
      <div className="top-bar bg-light py-2 d-none d-lg-block">
        {" "}
        {/* Hidden on small screens */}
        <div className="container d-flex justify-content-between align-items-center">
          <div className="contact-info text-muted small">
            <a
              href="mailto:dineshgupta@sunrisepapers.co.in"
              className="text-muted text-decoration-none"
            >
              <i className="fas fa-envelope me-2"></i>
              dineshgupta@sunrisepapers.co.in
            </a>
            <i className="fas fa-phone ms-4 me-2"></i>
            <a
              href="tel:+919555509507"
              className="text-muted text-decoration-none"
            >
              +91 95555 09507
            </a>
            <span className="text-muted mx-1">/</span>
            <a
              href="tel:+919810087126"
              className="text-muted text-decoration-none"
            >
              +91 98100 87126
            </a>
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
              href="https://github.com/Akshit1025/sunrise-papers"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://wa.me/919810087126"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-whatsapp"></i>
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
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm custom-main-navbar mb-0">
        <div className="container-fluid">
          {/* Company logo */}
          <Link
            className="navbar-brand p-0 border-0 bg-transparent d-flex align-items-center ps-3 ps-md-4 ps-lg-5"
            onClick={handleNavLinkClick} // Close navbar on link click
            to="/" // Navigate to home page
          >
            <img
              src="/images/logo-no-bg.png" // Path to your logo image in public/images/
              alt="Sunrise Papers Logo"
              style={{ height: "50px", marginRight: "10px" }} // Adjusted height
            />
            {/* You can add text 'Sunrise Papers' here if your logo is icon-only and you want the name to appear beside it */}
            <span className="logo-text fw-bold">Sunrise Papers</span>
          </Link>

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
                <Link
                  className="nav-link nav-button"
                  onClick={handleNavLinkClick} // Close navbar on link click
                  to="/" // Navigate to home page
                >
                  <i className="fas fa-home me-2"></i>Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link nav-button"
                  onClick={handleNavLinkClick} // Close navbar on link click
                  to="/about" // Navigate to about page
                >
                  <i className="fas fa-info-circle me-2"></i>About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link nav-button"
                  onClick={handleNavLinkClick} // Close navbar on link click
                  to="/products" // Navigate to products page
                >
                  <i className="fas fa-box me-2"></i>Products
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link nav-button"
                  to="/contact" // Navigate to contact page
                  onClick={handleNavLinkClick} // Close navbar on link click
                >
                  <i className="fas fa-envelope me-2"></i>Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
