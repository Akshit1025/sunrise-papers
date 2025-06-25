// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query } from "firebase/firestore"; // Added Firestore imports
import { db } from "../firebaseConfig.js"; // Import db

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products for the homepage display
  useEffect(() => {
    const productsCollectionPath = "company_products";
    const q = query(collection(db, productsCollectionPath));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList = [];
        snapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsList);
        setLoading(false);
        setError(null);
        console.log("Homepage Products fetched:", productsList);
      },
      (err) => {
        console.error("Error fetching homepage products:", err);
        setError(
          "Failed to load products for homepage. Please try again later."
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
              src="https://placehold.co/1920x600/212529/ffffff?text=Quality+Paper+Products"
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
              src="https://placehold.co/1920x600/495057/ffffff?text=Sustainable+Paper+Solutions"
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
              src="https://placehold.co/1920x600/f8f9fa/212529?text=Your+Trusted+Paper+Partner"
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
              {" "}
              {/* Image column */}
              <img
                src="images/about-home-img.png"
                alt="Quality Paper Rolls Trading"
                className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
              />
            </div>
            <div className="col-12 col-lg-6 order-lg-1">
              {" "}
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
                Established in 1990, Sunrise Papers is a leading import and
                wholesale trading company specializing in Carbonless and Baking
                Paper. Our commitment to providing the highest quality products
                has earned us a distinguished reputation within the industry.
              </p>
              <p className="paragraph animate__animated animate__fadeInLeft">
                Over the years, we have fostered enduring business relationships
                with our valued clients, a testament to our unwavering
                dedication to excellence. Our product selection is meticulously
                curated with a client-centric approach, ensuring the utmost
                satisfaction of our patrons.
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

      {/* 4. Our Products Section */}
      <section className="homepage-products-section py-5 bg-light">
        <div className="container">
          <h2 className="page-title text-center mb-5">Our Products</h2>
          {loading ? (
            <div className="loading-text text-center">Loading products...</div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : products.length === 0 ? (
            <div className="alert alert-info text-center">
              No products available yet. Check back soon!
            </div>
          ) : (
            <>
              {" "}
              {/* Fragment to group products grid and button */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="col animate__animated animate__fadeInUp"
                  >
                    <div className="product-card card h-100 shadow-sm border-0 rounded-lg overflow-hidden">
                      <img
                        src={`https://placehold.co/400x250/212529/ffffff?text=${encodeURIComponent(
                          product.name
                        )}`}
                        alt={product.name}
                        className="card-img-top product-image"
                      />
                      <div className="card-body p-4">
                        <h5
                          className="card-title mb-2 product-title fw-bold"
                          style={{ color: "var(--sp-dark-gray)" }}
                        >
                          {product.name}
                        </h5>
                        <p
                          className="card-text product-description"
                          style={{ color: "var(--sp-medium-gray)" }}
                        >
                          {product.description}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 text-center">
                        <Link
                          to={`/products/${product.id}`}
                          className="btn btn-outline-dark btn-sm product-details-btn"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Conditional rendering for "View All Products" button */}
              {/* {!loading && products.length > 0 && (
                <div className="text-center mt-5">
                  <Link
                    to="/products"
                    className="btn btn-dark btn-lg rounded-pill"
                  >
                    View All Products
                  </Link>
                </div>
              )} */}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
