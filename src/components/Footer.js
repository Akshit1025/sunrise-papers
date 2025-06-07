// src/components/Footer.js

import React from 'react';
// No need to import styles.js, as styles are now in App.css

const Footer = () => (
  <footer className="footer">
    © {new Date().getFullYear()} Company Name. All rights reserved.
  </footer>
);

export default Footer;
