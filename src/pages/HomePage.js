// src/pages/HomePage.js

import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => (
  <>
    {/* Carousel Section (Full Width) */}
    <div
      id="heroCarousel"
      className="carousel slide carousel-fade"
      data-bs-ride="carousel"
    >
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide-to="0"
          className="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>
      <div className="carousel-inner">
        {/* Carousel Item 1 */}
        <div className="carousel-item active" data-bs-interval="5000">
          <img
            src="https://placehold.co/1920x600/212529/ffffff?text=Quality+Paper+Products"
            className="d-block w-100 carousel-img"
            alt="Quality Paper Products"
          />
          <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
            <h5 className="carousel-title animate__animated animate__fadeInUp">
              Crafting Tomorrow's Solutions Today
            </h5>
            <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
              Explore our sustainable and high-quality paper products for every
              need.
            </p>
            <Link
              to="/products"
              className="btn btn-light btn-lg carousel-btn animate__animated animate__fadeInUp animate__delay-2s"
            >
              Discover Products
            </Link>
          </div>
        </div>
        {/* Carousel Item 2 */}
        <div className="carousel-item" data-bs-interval="5000">
          <img
            src="https://placehold.co/1920x600/495057/ffffff?text=Sustainable+Paper+Solutions"
            className="d-block w-100 carousel-img"
            alt="Sustainable Paper Solutions"
          />
          <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
            <h5 className="carousel-title animate__animated animate__fadeInUp">
              Innovation in Every Sheet
            </h5>
            <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
              Leading the way in eco-friendly paper manufacturing with advanced
              technology.
            </p>
            <Link
              to="/about"
              className="btn btn-light btn-lg carousel-btn animate__animated animate__fadeInUp animate__delay-2s"
            >
              Learn More
            </Link>
          </div>
        </div>
        {/* Carousel Item 3 */}
        <div className="carousel-item" data-bs-interval="5000">
          <img
            src="https://placehold.co/1920x600/f8f9fa/212529?text=Your+Trusted+Paper+Partner"
            className="d-block w-100 carousel-img"
            alt="Your Trusted Paper Partner"
          />
          <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
            <h5 className="carousel-title animate__animated animate__fadeInUp">
              Partner with Confidence
            </h5>
            <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
              Reliable supply and exceptional service tailored to your business
              needs.
            </p>
            <Link
              to="/contact"
              className="btn btn-light btn-lg carousel-btn animate__animated animate__fadeInUp animate__delay-2s"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      {/* Carousel Controls */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>

    {/* Hero Section below Carousel */}
    <div className="hero-section text-center py-5">
      <div className="container">
        {" "}
        {/* Use Bootstrap container for content within full-width sections */}
        <h1 className="display-4 fw-bold mb-3 hero-title">
          Leading the Way in Sustainable Paper Solutions
        </h1>
        <p className="lead hero-subtitle">
          At Sunrise Papers, we combine cutting-edge technology with
          environmental responsibility to deliver premium paper products that
          meet the highest standards of quality and sustainability.
        </p>
        <Link to="/about" className="btn btn-dark btn-lg mt-4 hero-btn">
          Our Story
        </Link>
      </div>
    </div>

    {/* Existing Welcome Section - Content within a container inside a transparent section */}
    <div className="py-5">
      {" "}
      {/* Added py-5 for vertical spacing */}
      <div className="container">
        {" "}
        {/* Use Bootstrap container for content */}
        <h2
          className="page-title text-center"
          style={{ color: "var(--sp-dark-gray)" }}
        >
          Welcome to Sunrise Papers!
        </h2>
        <p className="paragraph lead text-center">
          {" "}
          {/* Added text-center */}
          We are a leading provider of innovative solutions, dedicated to
          helping businesses thrive in the digital age. Our mission is to
          deliver exceptional quality and value to our clients, fostering
          long-term partnerships built on trust and mutual success.
        </p>
        <p className="paragraph text-center">
          {" "}
          {/* Added text-center */}
          Explore our products and learn more about how we can help you achieve
          your goals.
        </p>
      </div>
    </div>

    {/* Featured Products/Services Section */}
    <div className="featured-section bg-light py-5">
      <div className="container">
        {" "}
        {/* Use Bootstrap container for content */}
        <h2 className="page-title text-center mb-5">Our Core Strengths</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card text-center p-4 rounded-3 shadow-sm h-100">
              <i className="fas fa-leaf fa-3x mb-3 text-success"></i>
              <h4 className="feature-title fw-bold">Sustainable Sourcing</h4>
              <p className="feature-description">
                Committed to eco-friendly practices and responsible forestry.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4 rounded-3 shadow-sm h-100">
              <i className="fas fa-cogs fa-3x mb-3 text-primary"></i>
              <h4 className="feature-title fw-bold">Advanced Manufacturing</h4>
              <p className="feature-description">
                Leveraging modern technology for superior product quality.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4 rounded-3 shadow-sm h-100">
              <i className="fas fa-handshake fa-3x mb-3 text-info"></i>
              <h4 className="feature-title fw-bold">
                Customer-Centric Approach
              </h4>
              <p className="feature-description">
                Building strong relationships through exceptional service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default HomePage;
