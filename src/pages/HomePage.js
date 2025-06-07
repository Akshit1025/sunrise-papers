// src/pages/HomePage.js

import React from 'react';

const HomePage = () => (
  <div className="my-4">
    {/* Using custom CSS variables for color */}
    <h2 className="page-title" style={{color: 'var(--sp-dark-gray)'}}>Welcome to Sunrise Papers!</h2>
    <p className="paragraph lead">
      We are a leading provider of innovative solutions, dedicated to helping businesses thrive in the digital age. Our mission is to deliver exceptional quality and value to our clients, fostering long-term partnerships built on trust and mutual success.
    </p>
    <p className="paragraph">
      Explore our products and learn more about how we can help you achieve your goals.
    </p>
  </div>
);

export default HomePage;
