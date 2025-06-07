// src/components/Footer.js

import React from 'react';
// No need to import styles.js, as styles are now in App.css

const Footer = () => (
  // Use Bootstrap padding and text alignment classes, combined with custom 'footer' class
  <footer className="footer py-3 mt-4 text-center text-light rounded-3">
    © {new Date().getFullYear()} Company Name. All rights reserved.
  </footer>
);

export default Footer;
