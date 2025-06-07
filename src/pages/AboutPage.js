// src/pages/AboutPage.js

import React from "react";

const AboutPage = () => (
  <div className="my-4">
    {/* Using custom CSS variables for color */}
    <h2 className="page-title" style={{ color: "var(--sp-dark-gray)" }}>
      About Us
    </h2>
    <p className="paragraph">
      Founded in 20XX, our company started with a vision to revolutionize the
      industry by combining cutting-edge technology with unparalleled customer
      service. We believe in continuous innovation, ethical practices, and
      fostering a collaborative environment.
    </p>
    <p className="paragraph">
      Our team comprises highly skilled professionals with diverse backgrounds,
      united by a passion for excellence and a commitment to solving complex
      challenges. We pride ourselves on our adaptability and ability to deliver
      tailored solutions that meet the unique needs of each client.
    </p>
    <p className="paragraph">
      We are constantly evolving, embracing new technologies and methodologies
      to stay at the forefront of our field. Our success is directly tied to the
      success of our clients, and we are dedicated to helping them achieve their
      strategic objectives.
    </p>
  </div>
);

export default AboutPage;
