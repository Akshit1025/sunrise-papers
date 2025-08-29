// src/components/Navbar.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Navbar = () => {
  const [s, setS] = useState({
    contactEmail: "dineshgupta@sunrisepapers.co.in",
    phone1: "+91 95555 09507",
    phone2: "+91 98100 87126",
    linkedinUrl: "https://www.linkedin.com/in/dineshgupta-sunriise",
    whatsappUrl: "https://wa.me/919810087126",
    googleUrl: "https://g.co/kgs/WDyBz11",
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (snap) => {
      if (snap.exists()) setS((p) => ({ ...p, ...snap.data() }));
    });
    return () => unsub();
  }, []);

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
              href={`mailto:${s.contactEmail}`}
              className="text-muted text-decoration-none"
            >
              <i className="fas fa-envelope me-2"></i>
              {s.contactEmail}
            </a>
            <i className="fas fa-phone ms-4 me-2"></i>
            <a
              href={`tel:${s.phone1.replace(/\s+/g, "")}`}
              className="text-muted text-decoration-none"
            >
              {s.phone1}
            </a>
            <span className="text-muted mx-1">/</span>
            <a
              href={`tel:${s.phone2.replace(/\s+/g, "")}`}
              className="text-muted text-decoration-none"
            >
              {s.phone2}
            </a>
          </div>
          <div className="social-icons">
            <a
              href={s.linkedinUrl} // Updated LinkedIn URL (example)
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-linkedin"></i>{" "}
              {/* Changed from fa-twitter to fa-linkedin */}
            </a>
            <a
              href={s.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted me-3"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
            <a
              href={s.googleUrl} // Updated Google Business URL (example)
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link text-muted"
            >
              <i className="fab fa-google-plus-g"></i>{" "}
              {/* Changed from fa-instagram to fa-google-plus-g */}
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
              src="https://res.cloudinary.com/dzrv3ssy5/image/upload/v1756204861/logo-no-bg_hodk6e.png" // Path to your logo image in public/images/
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
