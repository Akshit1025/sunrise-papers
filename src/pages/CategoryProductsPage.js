// src/pages/CategoryProductsPage.js

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig"; // Import db directly
import "./ProductsPage.css"; // Shared CSS for product-related pages
// Import the new CSS file if you create it instead of using ProductsPage.css
// import "./CategoryDetails.css";
import QuoteModal from "../components/QuoteModal";

const CategoryProductsPage = ({ authReady }) => {
  const { categorySlug } = useParams(); // Extracts the 'categorySlug' from the URL (e.g., 'food-grade-papers')
  const [products, setProducts] = useState([]); // State to store the products belonging to the current category
  const [categoryData, setCategoryData] = useState(null); // State to store all details of the current category (name, description, benefits, galleryImages, videos, etc.)
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to store any error messages
  const [formDefinitions, setFormDefinitions] = useState({});
  const [loadingDefinitions, setLoadingDefinitions] = useState(true);
  const [definitionError, setDefinitionError] = useState(null);

  // State for the Quote Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const handleShowQuoteModal = () => setShowQuoteModal(true);
  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
  };

  // useEffect hook to fetch data when the component mounts or dependencies change
  useEffect(() => {
    const fetchCategoryAndProductsAndDefinition = async () => {
      // If Firebase authentication is not yet ready, keep loading state and return
      if (!authReady) {
        setLoading(true);
        setLoadingDefinitions(true);
        return;
      }

      try {
        setLoading(true); // Set loading to true at the start of fetch operation
        setLoadingDefinitions(true);
        setError(null); // Clear any previous errors
        setDefinitionError(null);
        setCategoryData(null); // Clear previous category data
        setProducts([]); // Clear previous products
        setFormDefinitions({});

        // --- Step 1: Fetch Category Details ---
        // Keep this query as is, we need the category data even if it's hidden
        const categoriesCollectionRef = collection(db, "categories");
        const categoryQuery = query(
          categoriesCollectionRef,
          where("slug", "==", categorySlug),
          limit(1)
        );
        const categorySnapshot = await getDocs(categoryQuery);

        let fetchedCategoryData = null;
        if (!categorySnapshot.empty) {
          fetchedCategoryData = categorySnapshot.docs[0].data();

          // *** Add a check if the category itself is visible before setting state ***
          if (fetchedCategoryData.isVisible === true) {
            // Only set and display category data if it's visible
            setCategoryData(fetchedCategoryData); // Store the fetched category data in state

            // --- Step 2: Conditionally Fetch Products for this Category ---
            // Only fetch products if the category is marked as having sub-products AND isVisible
            if (fetchedCategoryData.hasSubProducts) {
              const productsCollectionRef = collection(db, "products");
              // *** Modify the products query to filter by isVisible ***
              const productsQuery = query(
                productsCollectionRef,
                where("category_slug", "==", categorySlug),
                where("isVisible", "==", true) // Only fetch visible products
              );
              const productsSnapshot = await getDocs(productsQuery);
              const fetchedProducts = productsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setProducts(fetchedProducts);
            } else {
              setProducts([]);
            }
            setError(null); // Clear any errors if category was fetched successfully
          } else {
            // Category is found but is hidden
            setError(`Category "${categorySlug}" is currently hidden.`);
            setCategoryData(null); // Clear category data if hidden
            setProducts([]); // Ensure no products are shown for a hidden category
          }
        } else {
          // If no category found for the given slug, set an error and stop loading
          setError(`Category "${categorySlug}" not found.`);
          setCategoryData(null); // Ensure category data is null if not found
          setProducts([]); // Ensure no products are shown if category not found
        }

        // --- Step 3: Fetch Form Definition (fetch regardless of category visibility) ---
        // You might still want to fetch the form definition even if the category is hidden,
        // in case you have a separate way to use the form.
        // If not, you could wrap this in the `if (fetchedCategoryData.isVisible === true)` block above.
        try {
          const definitionRef = doc(db, "quoteFormDefinitions", categorySlug);
          const definitionDocSnap = await getDoc(definitionRef);

          if (definitionDocSnap.exists()) {
            const fetchedDefinitionData = definitionDocSnap.data(); // Capture data
            // Set the state with the fetched data
            setFormDefinitions({ [categorySlug]: fetchedDefinitionData });
          } else {
            setFormDefinitions({}); // Set to empty object
          }
          setDefinitionError(null); // Clear definition error if fetch was successful (even if doc doesn't exist)
        } catch (defErr) {
          console.error(
            `ERROR during form definition fetch for ${categorySlug}:`, // More specific error log
            defErr
          );
          setDefinitionError("Failed to load form configuration.");
          setFormDefinitions({}); // Set to empty object on error
        } finally {
          setLoadingDefinitions(false);
        }
      } catch (err) {
        // Catch and log any errors during the fetch process
        console.error(
          `Error fetching data for category "${categorySlug}":`,
          err
        );
        // Set a user-friendly error message
        setError(
          `Failed to load category details or products. Please try again later. (Error: ${err.message})`
        );
        setCategoryData(null); // Ensure category data is null on error
        setProducts([]); // Ensure products are empty on error
        setFormDefinitions({});
        setLoadingDefinitions(false);
      } finally {
        setLoading(false); // Always set loading to false after fetch attempt (success or failure)
      }
    };

    // Only run the fetch operation if categorySlug is available and authReady is true
    if (categorySlug && authReady) {
      fetchCategoryAndProductsAndDefinition();
    } else if (!authReady) {
      // Reset loading if auth becomes not ready after initial load
      setLoading(true);
      setLoadingDefinitions(true);
    }
  }, [authReady, categorySlug, db]);

  // Effect to handle loading state when authReady changes
  useEffect(() => {
    if (authReady && loading) {
      // If auth becomes ready and we were still loading, trigger fetch
      // (This covers the case where authReady is false initially)
      const fetchOnAuthReady = async () => {
        /* logic is in the other effect */
      };
      fetchOnAuthReady(); // Re-trigger the fetch in the main effect
    }
    if (!authReady) {
      // If auth becomes not ready, ensure loading state is true
      setLoading(true);
    }
  }, [authReady, loading]); // Depend on authReady and loading

  // Create an array of multimedia items for the carousel (only for !hasSubProducts)
  const allMediaItems = [];

  if (categoryData && !categoryData.hasSubProducts) {
    // Add the main category image if it exists

    // Add gallery images if they exist
    if (categoryData.galleryImages && categoryData.galleryImages.length > 0) {
      categoryData.galleryImages.forEach((imageUrl, index) => {
        allMediaItems.push({
          type: "image",
          url: imageUrl,
          alt: `${categoryData.name} Gallery Image ${index + 1}`,
        });
      });
    }

    // Add videos if they exist
    if (categoryData.videos && categoryData.videos.length > 0) {
      categoryData.videos.forEach((video, index) => {
        // Assuming video.url is an embeddable URL (e.g., YouTube embed)
        allMediaItems.push({
          type: "video",
          url: video.url,
          caption: video.caption,
          title: video.caption || `${categoryData.name} Video ${index + 1}`,
        });
      });
    }
  }

  return (
    <>
      {/* Category Products Hero Section - Displays dynamic title based on category */}
      {/* You might want to adjust the hero section to be more generic if it shows on non-product categories too */}
      <section className="products-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 products-hero-title">
            {loading && !categoryData
              ? "Loading Category..."
              : categoryData?.name ||
                (categorySlug
                  ? categorySlug.replace(/-/g, " ").toUpperCase()
                  : "Category")}{" "}
            {/* Show category name, slug, or "Category" */}
          </h1>
          {/* Optional: Add a subtitle based on categoryData */}
          {/* <p className="lead products-hero-subtitle">
            {categoryData?.description || `Discover our specialized ${categoryData?.name ? categoryData.name.toLowerCase() : "paper"} offerings.`}
           </p> */}
        </div>
      </section>

      {/* Main Content Area - Displays category info, products, gallery, videos, etc. */}
      <section className="py-5 bg-white">
        <div className="container">
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading content...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center message-box animate__animated animate__fadeIn">
              {error}
            </div>
          )}

          {!loading && !error && categoryData && (
            <>
              {/* --- Content for ALL Categories (Two-Column Layout) --- */}
              {/* Two-column layout for multimedia (Image or Carousel) and long description */}
              <div className="row mb-5 align-items-center">
                {" "}
                {/* Use align-items-center to vertically align content */}
                {/* Left Column: Multimedia (Image or Carousel) */}
                <div className="col-md-6 mb-md-0 mb-4 animate__animated animate__fadeInLeft">
                  {categoryData.hasSubProducts ? (
                    // If hasSubProducts is true, show only the main image
                    categoryData.image_url ? (
                      <img
                        src={categoryData.image_url}
                        alt={categoryData.name}
                        className="img-fluid rounded shadow-sm category-detail-image" // Reusing the class for consistent styling
                      />
                    ) : (
                      // Placeholder if no main image for a product category
                      <img
                        src="https://placehold.co/600x400/dddddd/333333?text=Category+Image"
                        alt="Category Placeholder"
                        className="img-fluid rounded shadow-sm category-detail-image"
                      />
                    )
                  ) : // If hasSubProducts is false, show the multimedia carousel
                  allMediaItems.length > 0 ? (
                    <div
                      id="categoryMediaCarousel"
                      className="carousel slide rounded shadow-sm"
                      data-bs-ride="carousel"
                    >
                      <div className="carousel-inner rounded">
                        {allMediaItems.map((item, index) => (
                          <div
                            key={index}
                            className={`carousel-item ${
                              index === 0 ? "active" : ""
                            }`}
                          >
                            {item.type === "image" ? (
                              <img
                                src={item.url}
                                className="d-block w-100 category-carousel-image"
                                alt={item.alt}
                              />
                            ) : (
                              // Must be a video
                              <div className="category-carousel-video-container embed-responsive embed-responsive-16by9">
                                <iframe
                                  className="embed-responsive-item d-block w-100 category-carousel-video"
                                  src={item.url}
                                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope"
                                  title={item.title}
                                ></iframe>
                              </div>
                              // If using <video> tag for self-hosted:
                              // <video controls className="d-block w-100 category-carousel-video" style={{ height: '400px', objectFit: 'cover' }}>
                              //    <source src={item.url} type="video/mp4" />
                              //    Your browser does not support the video tag.
                              // </video>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Carousel Controls (Previous/Next buttons) */}
                      {allMediaItems.length > 1 && ( // Only show controls if more than one item
                        <>
                          <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target="#categoryMediaCarousel"
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
                            data-bs-target="#categoryMediaCarousel"
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

                      {/* REMOVED: Carousel Indicators */}
                    </div>
                  ) : (
                    // Fallback if no media items for a non-product category
                    <div className="text-center py-5">
                      <p>No media available for this category.</p>
                    </div>
                  )}
                </div>
                {/* Right Column: What is this Category About? (Long Description) */}
                <div className="col-md-6 mb-md-0 mb-4 animate__animated animate__fadeInRight">
                  {categoryData.longDescription && (
                    <div className="category-info-content">
                      <h2 className="sub-heading mb-3">
                        What is {categoryData.name} About?
                      </h2>
                      <p className="paragraph">
                        {categoryData.longDescription}
                      </p>
                    </div>
                  )}
                  {/* Optional: Add short description here if needed */}
                  {/* {categoryData.description && (
                       <p className="paragraph lead">{categoryData.description}</p>
                   )} */}
                </div>
              </div>{" "}
              {/* End of two-column row */}
              {/* --- Content Below the Two-Column Layout --- */}
              {/* Benefits and Applications Section (Below the two-column layout, irrespective of hasSubProducts) */}
              {categoryData.benefits && categoryData.benefits.length > 0 && (
                <div className="category-benefits-applications-section mb-5 p-4 rounded-3 shadow-sm bg-white animate__animated animate__fadeInUp">
                  <h2 className="sub-heading text-center mb-4">
                    Benefits and Applications:
                  </h2>
                  <ul className="list-unstyled combined-list row row-cols-1 row-cols-md-2 g-3">
                    {categoryData.benefits.map((item, index) => (
                      <li
                        key={`item-${index}`}
                        className="col d-flex align-items-start animate__animated animate__fadeInUp"
                      >
                        <i className="fas fa-gem me-3 mt-1 category-list-icon"></i>{" "}
                        <span className="paragraph">{item}</span>{" "}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Products Heading and Listing (Rendered ONLY if hasSubProducts is true) */}
              {categoryData.hasSubProducts && (
                <>
                  {/* Products Heading for the current category */}
                  <h2 className="page-title text-center mb-5">
                    {categoryData.name} Products
                  </h2>

                  {/* Product Listing */}
                  {products.length === 0 ? ( // If no products found for this category
                    <div className="alert alert-info text-center message-box animate__animated animate__fadeIn">
                      No products found for this category.
                    </div>
                  ) : (
                    // Render product cards if products exist
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                      {products.map((product) => (
                        <div
                          className="col animate__animated animate__fadeInUp"
                          key={product.id}
                        >
                          <Link
                            to={`/product/${product.slug}`} // Link to the Product Detail Page
                            className="product-card-link text-decoration-none"
                          >
                            <div className="product-card card h-100 rounded-3 shadow-sm overflow-hidden">
                              <img
                                src={
                                  product.image_url || // Product image URL from Firestore
                                  "https://placehold.co/600x400/dddddd/333333?text=Product+Image" // Placeholder if no image
                                }
                                className="card-img-top product-image"
                                alt={product.name}
                                onError={(e) => {
                                  // Fallback for broken images
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/600x400/dddddd/333333?text=Image+Error";
                                }}
                              />
                              <div className="card-body text-center">
                                <h5 className="card-title product-title mb-2">
                                  {product.name}
                                </h5>
                                <p className="card-text product-short_description">
                                  {product.short_description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* The combined View All Categories and Get a Quote button container */}
              {/* This appears below all content sections */}
              {categoryData && !loading && !error && (
                <div className="d-flex flex-column flex-md-row justify-content-center mt-5">
                  {/* View All Categories Button */}
                  <Link
                    to="/products"
                    className="btn btn-outline-dark btn-lg rounded-pill product-back-btn mb-3 mb-md-0 me-md-3"
                  >
                    View All Categories
                  </Link>

                  {categoryData && formDefinitions[categorySlug] && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-lg rounded-pill product-back-btn"
                        onClick={handleShowQuoteModal}
                      >
                        Get a Quote
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quote Modal */}
      <QuoteModal
        show={showQuoteModal}
        handleClose={handleCloseQuoteModal}
        category_slug={categorySlug}
        formDefinition={formDefinitions[categorySlug]}
        loadingDefinitions={loadingDefinitions}
        definitionError={definitionError}
      />
    </>
  );
};

export default CategoryProductsPage;
