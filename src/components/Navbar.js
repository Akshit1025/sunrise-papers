// src/components/Navbar.js

import React from 'react';
// No need to import styles.js, as styles are now in App.css

const Navbar = ({ setCurrentPage, userId }) => {
  return (
    <div className="header">
      <div className="logo">Company Name</div>
      <nav className="nav">
        <button className="nav-button" onClick={() => setCurrentPage('home')}>
          Home
        </button>
        <button className="nav-button" onClick={() => setCurrentPage('about')}>
          About
        </button>
        {/* Changed Services button to Products button */}
        <button className="nav-button" onClick={() => setCurrentPage('products')}>
          Products
        </button>
        <button className="nav-button" onClick={() => setCurrentPage('contact')}>
          Contact
        </button>
      </nav>
      {userId && (
        <div className="auth-info">
          Signed in as: <strong>{userId}</strong>
        </div>
      )}
    </div>
  );
};

export default Navbar;
