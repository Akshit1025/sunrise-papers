// src/pages/HomePage.js

import React from 'react';
// No need to import styles.js, as styles are now in App.css

const HomePage = () => (
  <div className="my-4"> {/* Add some vertical margin using Bootstrap utility class */}
    <h2 className="page-title text-primary">Welcome to Our Company!</h2> {/* Use Bootstrap text-primary for color */}
    <p className="paragraph lead"> {/* Use Bootstrap lead class for larger text */}
      We are a leading provider of innovative solutions, dedicated to helping businesses thrive in the digital age. Our mission is to deliver exceptional quality and value to our clients, fostering long-term partnerships built on trust and mutual success.
    </p>
    <p className="paragraph">
      Explore our products and learn more about how we can help you achieve your goals.
    </p>
  </div>
);

export default HomePage;
