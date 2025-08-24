// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, doc, getDoc } from "firebase/firestore"; // Import doc and getDoc
import { db } from "../firebaseConfig.js"; // Import db

// Define a default structure for the homepage content (copy from ContentManagement.js)
const defaultHomepageContent = {
  carouselItems: [
    {
      image_url: "images/home/product-banner.jpeg",
      title: "Crafting Tomorrow's Solutions Today",
      text: "Explore our sustainable and high-quality paper products...",
      link_text: "Discover Products",
      link_url: "/products",
    },
    {
      image_url: "images/home/about-us-banner.jpeg",
      title: "Innovation in Every Sheet",
      text: "Leading the way in eco-friendly paper trading...",
      link_text: "Learn More",
      link_url: "/about",
    },
    {
      image_url: "images/home/contact-us-banner.png",
      title: "Partner with Confidence",
      text: "Reliable supply and exceptional service...",
      link_text: "Contact Us",
      link_url: "/contact",
    },
    // Add more default items if you have them
  ],
  sections: [
    {
      name: "aboutCompany",
      title: "Welcome to Sunrise Papers",
      paragraphs: [
        "Founded in 1995, Sunrise Papers has grown into a trusted name...",
        "At the heart of our business is a deep commitment...",
      ],
      image_url: "images/home/about-home-img.png",
    },
    {
      name: "coreStrengths",
      title: "Our Core Strengths",
      features: [
        {
          icon_class: "fas fa-leaf",
          title: "Sustainable Sourcing",
          description:
            "Committed to eco-friendly practices and responsible paper sourcing.",
        },
        {
          icon_class: "fas fa-truck",
          title: "Efficient Supply Chain",
          description:
            "Streamlining global logistics for timely paper product delivery.",
        },
        {
          icon_class: "fas fa-handshake",
          title: "Customer-Centric Approach",
          description:
            "Building strong relationships through exceptional service and support.",
        },
      ],
    },
    {
      name: "productCategories", // Represents the section that lists categories
      title: "Explore Our Product Categories",
      // The categories themselves are managed in Categories.js
      // We'll just manage the section title here.
    },
    // Define other homepage sections here if needed
  ],
  // Add other top-level homepage content fields here
};

const HomePage = () => {
  const [categories, setCategories] = useState([]); // Fetch categories for the homepage display
  const [loadingCategories, setLoadingCategories] = useState(true); // Separate loading state for categories
  const [errorCategories, setErrorCategories] = useState(null); // Separate error state for categories

  // --- Add state for fetched homepage content, and its loading/error states ---
  const [homepageContent, setHomepageContent] = useState(
    defaultHomepageContent
  );
  const [loadingContent, setLoadingContent] = useState(true); // Loading state for siteContent/homepage
  const [errorContent, setErrorContent] = useState(null); // Error state for siteContent/homepage

  // Fetch categories for the products section (using onSnapshot for real-time updates)
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
        setLoadingCategories(false); // Set categories loading to false
        setErrorCategories(null); // Clear categories error
      },
      (err) => {
        console.error("Error fetching homepage categories:", err);
        setErrorCategories(
          "Failed to load categories for homepage. Please try again later."
        );
        setLoadingCategories(false); // Set categories loading to false
      }
    );

    return () => unsubscribe(); // Cleanup the subscription
  }, []);

  // --- New useEffect to fetch homepage content (using getDoc - no real-time needed here) ---
  useEffect(() => {
    const fetchHomepageContent = async () => {
      setLoadingContent(true);
      setErrorContent(null);
      try {
        const docRef = doc(db, "siteContent", "homepage"); // Fetch the "homepage" document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Merge with default to ensure all fields are present
          setHomepageContent({
            ...defaultHomepageContent, // Start with defaults
            ...docSnap.data(), // Overlay fetched data
            carouselItems: Array.isArray(docSnap.data().carouselItems)
              ? docSnap.data().carouselItems
              : defaultHomepageContent.carouselItems,
            sections: Array.isArray(docSnap.data().sections)
              ? docSnap.data().sections.map((fetchedSection) => {
                  const defaultSection = defaultHomepageContent.sections.find(
                    (ds) => ds.name === fetchedSection.name
                  );
                  return {
                    ...defaultSection, // Start with default section's structure and defaults
                    ...fetchedSection, // Overlay fetched section data
                    // Explicitly handle merging arrays within sections
                    paragraphs: Array.isArray(fetchedSection.paragraphs)
                      ? fetchedSection.paragraphs
                      : defaultSection?.paragraphs || [],
                    features: Array.isArray(fetchedSection.features)
                      ? fetchedSection.features
                      : defaultSection?.features || [],
                    // Add similar checks for any other arrays within homepage sections
                  };
                })
              : defaultHomepageContent.sections, // Fallback to default sections if fetched is not an array
          });
        } else {
          // Document does not exist, use default content
          setHomepageContent(defaultHomepageContent);
        }
      } catch (e) {
        console.error("Error fetching Homepage site content:", e);
        setErrorContent("Failed to load homepage content.");
        setHomepageContent(defaultHomepageContent); // Fallback to default on error
      } finally {
        setLoadingContent(false);
      }
    };

    fetchHomepageContent();
  }, []); // Empty dependency array runs once on mount

  // Helper function to find a section by name
  const findSection = (name) =>
    homepageContent.sections.find((s) => s.name === name);

  return (
    <>
      {/* 1. Carousel Section (Full Width) - Use fetched carouselItems */}
      {loadingContent || errorContent ? (
        // Show a basic placeholder or loading state for the carousel while fetching content
        <div
          style={{
            height: "500px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loadingContent ? "Loading Hero..." : "Error loading Hero"}
        </div>
      ) : (
        <div
          id="heroCarousel"
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
        >
          {homepageContent.carouselItems &&
            homepageContent.carouselItems.length > 0 && (
              <div className="carousel-indicators">
                {homepageContent.carouselItems.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    data-bs-target="#heroCarousel"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-current={index === 0 ? "true" : undefined}
                    aria-label={`Slide ${index + 1}`}
                  ></button>
                ))}
              </div>
            )}

          <div className="carousel-inner">
            {homepageContent.carouselItems &&
              homepageContent.carouselItems.map((item, index) => (
                <div
                  key={index}
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                  data-bs-interval="5000"
                >
                  <img
                    src={
                      item.image_url ||
                      "https://placehold.co/1920x800?text=Carousel+Image"
                    } // Fallback image
                    className="d-block w-100 carousel-img"
                    alt={item.title || `Carousel Image ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/1920x800?text=Image+Error";
                    }} // Error fallback
                  />
                  <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
                    {item.title && (
                      <h5 className="carousel-title animate__animated animate__fadeInUp">
                        {item.title}
                      </h5>
                    )}
                    {item.text && (
                      <p className="carousel-text animate__animated animate__fadeInUp animate__delay-1s">
                        {item.text}
                      </p>
                    )}
                    {item.link_url && item.link_text && (
                      <Link
                        to={item.link_url}
                        className="btn btn-light btn-lg carousel-btn animate__animated animate__fadeInUp animate__delay-2s"
                      >
                        {item.link_text}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {/* Carousel Controls - Show only if there's more than one item */}
          {homepageContent.carouselItems &&
            homepageContent.carouselItems.length > 1 && (
              <>
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
              </>
            )}
        </div>
      )}

      {/* 2. About Company Section - Use fetched content */}
      {loadingContent ? (
        <div className="text-center py-5">Loading About Company section...</div>
      ) : errorContent ? (
        <div className="alert alert-danger text-center message-box py-5">
          {errorContent}
        </div>
      ) : (
        findSection("aboutCompany") && (
          <section className="about-company-section py-5">
            <div className="container">
              <div className="row align-items-center g-5">
                <div className="col-12 col-lg-6 order-lg-2">
                  {/* Image column */}
                  <img
                    src={
                      findSection("aboutCompany").image_url ||
                      "images/home/about-home-img.png"
                    }
                    alt={findSection("aboutCompany").title || "About Company"}
                    className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/600x400?text=Image+Error";
                    }} // Error fallback
                  />
                </div>
                <div className="col-12 col-lg-6 order-lg-1">
                  {/* Text content column */}
                  <h2 className="page-title text-start animate__animated animate__fadeInLeft">
                    {findSection("aboutCompany").title ||
                      "Welcome to Sunrise Papers"}
                  </h2>
                  {(findSection("aboutCompany").paragraphs || []).map(
                    (para, index) => (
                      <p
                        key={index}
                        className={`paragraph ${
                          index === 0 ? "lead" : ""
                        } animate__animated animate__fadeInLeft animate__delay-${
                          index * 0.5
                        }s`}
                      >
                        {para}
                      </p>
                    )
                  )}
                  {/* Assuming you want a static "Learn More" link here */}
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
        )
      )}

      {/* 3. Our Core Strengths Section - Use fetched content */}
      {loadingContent ? (
        <div className="text-center py-5">
          Loading Core Strengths section...
        </div>
      ) : errorContent ? (
        <div className="alert alert-danger text-center message-box py-5">
          {errorContent}
        </div>
      ) : (
        findSection("coreStrengths") && (
          <div className="featured-section bg-light py-5">
            <div className="container">
              <h2 className="page-title text-center mb-5">
                {findSection("coreStrengths").title || "Our Core Strengths"}
              </h2>
              {findSection("coreStrengths").features &&
                findSection("coreStrengths").features.length > 0 && (
                  <div className="row g-4">
                    {findSection("coreStrengths").features.map(
                      (feature, index) => (
                        <div key={index} className="col-md-4">
                          <div className="feature-card text-center p-4 rounded-3 shadow-sm h-100 animate__animated animate__fadeInUp">
                            {feature.icon_class && (
                              <i
                                className={`${feature.icon_class} fa-3x mb-3 text-primary`}
                              ></i> // Use a generic text-primary or define specific colors in CSS
                            )}
                            {feature.title && (
                              <h4 className="feature-title fw-bold">
                                {feature.title}
                              </h4>
                            )}
                            {feature.description && (
                              <p className="feature-description">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              {(!findSection("coreStrengths").features ||
                findSection("coreStrengths").features.length === 0) && (
                <div className="text-center text-muted">
                  No features available.
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* 4. Our Product Categories Section - Use fetched title and existing category data */}
      {/* Loading/error for categories is handled separately */}
      <section className="homepage-products-section py-5 bg-white">
        <div className="container">
          {loadingContent ? (
            <div className="text-center py-5">
              Loading Product Categories title...
            </div>
          ) : errorContent ? (
            <div className="alert alert-danger text-center message-box py-5">
              {errorContent}
            </div>
          ) : (
            findSection("productCategories") && (
              <h2 className="page-title text-center mb-5">
                {findSection("productCategories").title ||
                  "Explore Our Product Categories"}
              </h2>
            )
          )}

          {loadingCategories ? (
            <div className="loading-text text-center d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading categories...</span>
              </div>
            </div>
          ) : errorCategories ? (
            <div className="alert alert-danger text-center message-box">
              {errorCategories}
            </div>
          ) : categories.length === 0 ? (
            <div className="alert alert-info text-center message-box">
              No product categories available yet. Check back soon!
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {categories.slice(0, 3).map((category) => (
                  <div
                    key={category.id}
                    className="col animate__animated animate__fadeInUp"
                  >
                    <Link
                      to={`/products/${category.slug}`}
                      className="category-card-link text-decoration-none"
                    >
                      <div className="category-card card h-100 rounded-3 shadow-sm overflow-hidden">
                        <img
                          src={
                            category.image_url ||
                            "https://placehold.co/600x400/dddddd/333333?text=Category+Image"
                          }
                          alt={category.name}
                          className="card-img-top category-image"
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
                          <p className="card-text category-description">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {/* "View All Categories" button */}
              {!loadingCategories && categories.length > 3 && (
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
