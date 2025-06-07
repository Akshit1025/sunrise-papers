// src/components/Navbar.js

import React from 'react';
// No need to import styles.js, as styles are now in App.css

const Navbar = ({ setCurrentPage, userId }) => {
  return (
    // Use Bootstrap navbar classes, and combine with custom 'header' class for specific styling
    <nav className="navbar navbar-expand-lg navbar-light bg-light rounded-3 mb-4 header">
      <div className="container-fluid">
        <a className="navbar-brand logo" href="#" onClick={() => setCurrentPage('home')}>
          Company Name
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 nav"> {/* Use me-auto for left alignment */}
            <li className="nav-item">
              <button className="nav-link nav-button" onClick={() => setCurrentPage('home')}>
                Home
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link nav-button" onClick={() => setCurrentPage('about')}>
                About
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link nav-button" onClick={() => setCurrentPage('products')}>
                Products
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link nav-button" onClick={() => setCurrentPage('contact')}>
                Contact
              </button>
            </li>
          </ul>
          {userId && (
            <div className="auth-info text-muted small mt-2 mt-lg-0 ms-lg-auto"> {/* Use ms-lg-auto for right alignment on large screens */}
              Signed in as: <strong>{userId}</strong>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
