// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseConfig.js"; // Import db

const HomePage = () => {
  const [categories, setCategories] = useState([]); // Renamed from 'products' to 'categories'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Fetch categories for the homepage display

  useEffect(() => {
    const categoriesCollectionPath = "categories"; // Change to 'categories' collection
    const q = query(collection(db, categoriesCollectionPath));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const categoriesList = []; // Renamed from 'productsList'
        snapshot.forEach((doc) => {
          categoriesList.push({ id: doc.id, ...doc.data() });
        });
        // Sort categories by 'order' field, then by name if order is same/missing
        categoriesList.sort(
          (a, b) =>
            (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)
        );
        setCategories(categoriesList); // Set categories state
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching homepage categories:", err);
        setError(
          "Failed to load categories for homepage. Please try again later."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* 1. Carousel Section (Full Width) */}
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
              src="images/home/product-banner.jpeg"
              className="d-block w-100 carousel-img"
              alt="Quality Paper Products"
            />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h5 className="carousel-title animate__animated animate__fadeInUp">
                Crafting Tomorrow's Solutions Today
              </h5>
              <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
                Explore our sustainable and high-quality paper products for
                every need.
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
              src="images/home/about-us-banner.jpeg"
              className="d-block w-100 carousel-img"
              alt="Sustainable Paper Solutions"
            />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h5 className="carousel-title animate__animated animate__fadeInUp">
                Innovation in Every Sheet
              </h5>
              <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
                Leading the way in eco-friendly paper trading with advanced
                solutions.
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
              src="images/home/contact-us-banner.png"
              className="d-block w-100 carousel-img"
              alt="Your Trusted Paper Partner"
            />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h5 className="carousel-title animate__animated animate__fadeInUp">
                Partner with Confidence
              </h5>
              <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
                Reliable supply and exceptional service tailored to your
                business needs.
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
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
      {/* 2. About Company Section */}
      <section className="about-company-section py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 order-lg-2">
              {/* Image column */}
              <img
                src="images/home/about-home-img.png"
                alt="Quality Paper Rolls Trading"
                className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
              />
            </div>
            <div className="col-12 col-lg-6 order-lg-1">
              {/* Text content column */}
              <h2
                className="page-title text-start animate__animated animate__fadeInLeft"
                style={{
                  color: "var(--sp-dark-gray)",
                  borderBottom: "none",
                  paddingBottom: "0",
                }}
              >
                Welcome to Sunrise Papers
              </h2>
              <p className="paragraph lead animate__animated animate__fadeInLeft">
                Founded in 1995, Sunrise Papers has grown into a trusted name in
                the import and wholesale trade of premium carbonless papers and
                food-grade papers. With over three decades of experience, we are
                proud to be recognised for our consistent quality, reliability,
                and service excellence.
              </p>
              <p className="paragraph animate__animated animate__fadeInLeft">
                At the heart of our business is a deep commitment to building
                long-term relationships. Our loyal clientele is a reflection of
                our integrity, responsiveness, and client-first approach. Every
                product we offer is carefully selected to meet the evolving
                needs of our customers, ensuring quality at every step.
              </p>
              <Link
                to="/about"
                className="btn btn-dark btn-lg rounded-pill mt-4 animate__animated animate__fadeInLeft"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* 3. Our Core Strengths Section */}
      <div className="featured-section bg-light py-5">
        <div className="container">
          <h2 className="page-title text-center mb-5">Our Core Strengths</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card text-center p-4 rounded-3 shadow-sm h-100">
                <i className="fas fa-leaf fa-3x mb-3 text-success"></i>
                <h4 className="feature-title fw-bold">Sustainable Sourcing</h4>
                <p className="feature-description">
                  Committed to eco-friendly practices and responsible paper
                  sourcing.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center p-4 rounded-3 shadow-sm h-100">
                <i className="fas fa-truck fa-3x mb-3 text-primary"></i>
                <h4 className="feature-title fw-bold">
                  Efficient Supply Chain
                </h4>
                <p className="feature-description">
                  Streamlining global logistics for timely paper product
                  delivery.
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
                  Building strong relationships through exceptional service and
                  support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Our Product Categories Section (Updated from 'Our Products Section') */}
      <section className="homepage-products-section py-5 bg-white">
        {/* Changed to bg-white for uniformity */}
        <div className="container">
          <h2 className="page-title text-center mb-5">
            Explore Our Product Categories
          </h2>
          {/* Updated title */}
          {loading ? (
            <div className="loading-text text-center d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading categories...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center message-box">
              {error}
            </div>
          ) : categories.length === 0 ? (
            <div className="alert alert-info text-center message-box">
              No product categories available yet. Check back soon!
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {categories.map(
                  (
                    category /* Changed from 'products.map' to 'categories.map' */
                  ) => (
                    <div
                      key={category.id}
                      className="col animate__animated animate__fadeInUp"
                    >
                      {/* Use category-card-link and category-card styles from ProductsPage.css */}

                      <Link
                        to={`/products/${category.slug}`}
                        className="category-card-link text-decoration-none"
                      >
                        <div className="category-card card h-100 rounded-3 shadow-sm overflow-hidden">
                          {/* Use category-card */}
                          <img
                            src={
                              category.image_url ||
                              "https://placehold.co/600x400/dddddd/333333?text=Category+Image"
                            } /* Use category.image_url */
                            alt={category.name}
                            className="card-img-top category-image" /* Use category-image */
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/600x400/dddddd/333333?text=Image+Error";
                            }}
                          />

                          <div className="card-body text-center">
                            <h5 className="card-title category-title mb-2">
                              {category.name}
                            </h5>
                            {/* Use category-title */}
                            <p className="card-text category-description">
                              {category.description}
                            </p>
                            {/* Use category-description */}
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                )}
              </div>
              {/* "View All Categories" button */}
              {!loading && categories.length > 3 && (
                <div className="text-center mt-5">
                  <Link
                    to="/products"
                    className="btn btn-dark btn-lg rounded-pill"
                    style={{
                      backgroundColor: "var(--sp-dark-primary)",
                      borderColor: "var(--sp-dark-primary)",
                      color: "var(--sp-white)",
                    }}
                  >
                    View All Categories
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
