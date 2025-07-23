// src/pages/CategoryProductsPage.js

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
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

  // State for the Quote Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const handleShowQuoteModal = () => setShowQuoteModal(true);
  const handleCloseQuoteModal = () => setShowQuoteModal(false);


  // useEffect hook to fetch data when the component mounts or dependencies change
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      // If Firebase authentication is not yet ready, keep loading state and return
      if (!authReady) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true); // Set loading to true at the start of fetch operation
        setError(null); // Clear any previous errors
        setCategoryData(null); // Clear previous category data
        setProducts([]); // Clear previous products

        // --- Step 1: Fetch Category Details ---
        // Get a reference to the 'categories' collection in Firestore
        const categoriesCollectionRef = collection(db, "categories");
        // Create a query to find the category document where 'slug' matches the the 'categorySlug' from the URL
        const categoryQuery = query(
          categoriesCollectionRef,
          where("slug", "==", categorySlug),
          limit(1) // Limit to 1 result as slug should be unique
        );
        // Execute the query to get the category snapshot
        const categorySnapshot = await getDocs(categoryQuery);

        // Check if a category document was found
        if (!categorySnapshot.empty) {
          const fetchedCategoryData = categorySnapshot.docs[0].data();
          setCategoryData(fetchedCategoryData); // Store the fetched category data in state
          console.log("Fetched category details:", fetchedCategoryData);

          // --- Step 2: Conditionally Fetch Products for this Category ---
          // Only fetch products if the category is marked as having sub-products
          if (fetchedCategoryData.hasSubProducts) {
            const productsCollectionRef = collection(db, "products");
            const productsQuery = query(
              productsCollectionRef,
              where("category_slug", "==", categorySlug)
            );
            const productsSnapshot = await getDocs(productsQuery);
            const fetchedProducts = productsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProducts(fetchedProducts);
            console.log(
              `Fetched products for category "${categorySlug}":`,
              fetchedProducts
            );
          } else {
            // If hasSubProducts is false, no need to fetch products, so set products to empty array
            setProducts([]);
            console.log(
              `Category "${categorySlug}" does not have sub-products. Displaying category details.`
            );
          }
          setError(null); // Clear any errors if category was fetched successfully
        } else {
          // If no category found for the given slug, set an error and stop loading
          setError(`Category "${categorySlug}" not found.`);
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
      } finally {
        setLoading(false); // Always set loading to false after fetch attempt (success or failure)
      }
    };

    // Only run the fetch operation if categorySlug is available and authReady is true
    if (categorySlug && authReady) {
      fetchCategoryAndProducts();
    } else if (!authReady) {
      // Reset loading if auth becomes not ready after initial load
      setLoading(true);
    }
  }, [authReady, categorySlug]); // Added authReady to dependency array

  // Effect to handle loading state when authReady changes
  useEffect(() => {
    if (authReady && loading) {
      // If auth becomes ready and we were still loading, trigger fetch
      // (This covers the case where authReady is false initially)
      const fetchOnAuthReady = async () => { /* logic is in the other effect */ };
      fetchOnAuthReady(); // Re-trigger the fetch in the main effect
    }
    if (!authReady) {
      // If auth becomes not ready, ensure loading state is true
      setLoading(true);
    }
  }, [authReady, loading]); // Depend on authReady and loading


  return (
    <>
      {/* Category Products Hero Section - Displays dynamic title based on category */}
      {/* You might want to adjust the hero section to be more generic if it shows on non-product categories too */}
      <section className="products-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 products-hero-title">
            {loading && !categoryData
              ? "Loading Category..."
              : categoryData?.name || (categorySlug ? categorySlug.replace(/-/g, ' ').toUpperCase() : "Category")}{" "}
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
              {/* Conditionally render content based on whether the category has sub-products */}
              {categoryData.hasSubProducts ? (
                // --- Content for Categories with Sub-Products (e.g., Food Grade Papers) ---
                <>
                  {/* Display the existing Long Description and Benefits/Applications sections if they exist */}
                  {categoryData.longDescription && (
                    <div className="category-info-section mb-5 p-4 rounded-3 shadow-sm bg-light-beige animate__animated animate__fadeInUp">
                      <h2 className="sub-heading text-center mb-4">
                        What is {categoryData.name} About?
                      </h2>
                      <p className="paragraph text-center">
                        {categoryData.longDescription}
                      </p>
                    </div>
                  )}

                  {categoryData.benefits && categoryData.benefits.length > 0 && (
                    <div className="category-benefits-applications-section mb-5 p-4 rounded-3 shadow-sm bg-white animate__animated animate__fadeInUp animate__delay-0-3s">
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
              ) : (
                // --- Content for Categories WITHOUT Sub-Products (e.g., Carbonless, Coated) ---
                <>
                  {/* Display the existing Long Description and Benefits/Applications sections if they exist */}
                  {categoryData.longDescription && (
                    <div className="category-info-section mb-5 p-4 rounded-3 shadow-sm bg-light-beige animate__animated animate__fadeInUp">
                      <h2 className="sub-heading text-center mb-4">
                        What is {categoryData.name} About?
                      </h2>
                      <p className="paragraph text-center">
                        {categoryData.longDescription}
                      </p>
                    </div>
                  )}

                  {categoryData.benefits && categoryData.benefits.length > 0 && (
                    <div className="category-benefits-applications-section mb-5 p-4 rounded-3 shadow-sm bg-white animate__animated animate__fadeInUp animate__delay-0-3s">
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


                  {/* New: Image Gallery Section */}
                  {categoryData.galleryImages && categoryData.galleryImages.length > 0 && (
                    <div className="category-gallery-section mb-5 p-4 rounded-3 shadow-sm bg-light-beige animate__animated animate__fadeInUp animate__delay-0-5s">
                      <h2 className="sub-heading text-center mb-4">Gallery</h2>
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"> {/* Responsive grid for images */}
                        {categoryData.galleryImages.map((imageUrl, index) => (
                          <div key={`gallery-img-${index}`} className="col">
                            {/* You can wrap this in a link or button to trigger a lightbox */}
                            <img
                              src={imageUrl}
                              alt={`${categoryData.name} Pic ${index + 1}`}
                              className="img-fluid rounded shadow-sm" // Bootstrap classes for responsive images
                              style={{ width: '100%', height: '200px', objectFit: 'cover' }} // Consistent image size (adjust as needed)
                            // Add onClick to open lightbox/modal here
                            />
                          </div>
                        ))}
                      </div>
                      {/* Implement Lightbox/Modal here if desired */}
                    </div>
                  )}

                  {/* New: Video Section */}
                  {categoryData.videos && categoryData.videos.length > 0 && (
                    <div className="category-videos-section mb-5 p-4 rounded-3 shadow-sm bg-white animate__animated animate__fadeInUp animate__delay-0-7s">
                      <h2 className="sub-heading text-center mb-4">Videos</h2>
                      <div className="row justify-content-center g-4"> {/* Center videos and add spacing */}
                        {categoryData.videos.map((video, index) => (
                          <div key={`video-${index}`} className="col-12 col-md-10 col-lg-8"> {/* Responsive column size */}
                            {/* Example for embedding YouTube/Vimeo - adjust src format */}
                            {/* For self-hosted videos, use <video> tag */}
                            <div className="embed-responsive embed-responsive-16by9"> {/* Optional: For 16:9 aspect ratio */}
                              <iframe
                                className="embed-responsive-item rounded shadow-sm"
                                src={video.url} // Ensure URL is embeddable (e.g., YouTube embed URL)
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={video.caption || `${categoryData.name} Video ${index + 1}`}
                                style={{ width: '100%', height: '400px' }} // Adjust height as needed
                              ></iframe>
                            </div>
                            {video.caption && (
                              <p className="text-center mt-2 paragraph">{video.caption}</p> // Display caption
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* The combined View All Categories and Get a Quote button container */}
                  <div className="d-flex flex-column flex-md-row justify-content-center mt-5"> {/* Adjusted for stacking on small screens */}
                    {/* View All Categories Button */}
                    <Link
                      to="/products"
                      className="btn btn-outline-dark btn-lg rounded-pill product-back-btn mb-3 mb-md-0 me-md-3" // Added mb-3 for small screens, me-md-3 for medium and up
                    >
                      View All Categories
                    </Link>

                    {(categorySlug === 'carbonless-paper' || categorySlug === 'coated-paper') && ( // Keep conditional rendering based on slug for the quote button
                      <>
                        {/* Get a Quote Button */}
                        <button type="button" className="btn btn-outline-dark btn-lg rounded-pill product-back-btn" onClick={handleShowQuoteModal}>
                          Get a Quote
                        </button>
                      </>
                    )}
                  </div>

                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quote Modal */}
      <QuoteModal show={showQuoteModal} handleClose={handleCloseQuoteModal} categorySlug={categorySlug} />
    </>
  );
};

export default CategoryProductsPage;
