// src/pages/CategoryProductsPage.js

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig"; // Import db directly
import "./ProductsPage.css"; // Shared CSS for product-related pages
import QuoteModal from "../components/QuoteModal";

const CategoryProductsPage = ({ authReady }) => {
  const { categorySlug } = useParams(); // Extracts the 'categorySlug' from the URL (e.g., 'food-grade-papers')
  const [products, setProducts] = useState([]); // State to store the products belonging to the current category
  const [categoryData, setCategoryData] = useState(null); // State to store all details of the current category (name, description, benefits, etc.)
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to store any error messages

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
              `Category "${categorySlug}" does not have sub-products.`
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

    // Only run the fetch operation if categorySlug is available
    if (categorySlug) {
      fetchCategoryAndProducts();
    }
  }, [authReady, categorySlug]); // Removed 'db' from dependency array to fix the warning

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleShowQuoteModal = () => setShowQuoteModal(true);
  const handleCloseQuoteModal = () => setShowQuoteModal(false);


  return (
    <>
      {/* Category Products Hero Section - Displays dynamic title based on category */}
      <section className="products-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 products-hero-title">
            {loading && !categoryData
              ? "Loading Category..."
              : categoryData?.name || "Products"}{" "}
            {/* Show category name or "Products" */}
          </h1>
          <p className="lead products-hero-subtitle">
            Discover our specialized{" "}
            {categoryData?.name ? categoryData.name.toLowerCase() : "paper"}{" "}
            offerings.
          </p>
        </div>
      </section>

      {/* Main Content Area - Displays category info and products */}
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
              {/* What is this Category About Section */}
              {categoryData.longDescription && ( // Conditionally render if longDescription exists
                <div className="category-info-section mb-5 p-4 rounded-3 shadow-sm bg-light-beige animate__animated animate__fadeInUp">
                  <h2 className="sub-heading text-center mb-4">
                    What is {categoryData.name} About? {/* Dynamic heading */}
                  </h2>
                  <p className="paragraph text-center">
                    {categoryData.longDescription}{" "}
                    {/* Display long description */}
                  </p>
                </div>
              )}

              {/* Benefits and Applications Section (Combined, only uses 'benefits' field) */}
              {categoryData.benefits &&
                categoryData.benefits.length > 0 && ( // Conditionally render if benefits array exists and has items
                  <div className="category-benefits-applications-section mb-5 p-4 rounded-3 shadow-sm bg-white animate__animated animate__fadeInUp animate__delay-0-3s">
                    <h2 className="sub-heading text-center mb-4">
                      Benefits and Applications:{" "}
                      {/* Fixed heading for combined section */}
                    </h2>
                    <ul className="list-unstyled combined-list row row-cols-1 row-cols-md-2 g-3">
                      {/* Map through the 'benefits' array to display each item */}
                      {categoryData.benefits.map((item, index) => (
                        <li
                          key={`item-${index}`}
                          className="col d-flex align-items-start animate__animated animate__fadeInUp"
                        >
                          <i className="fas fa-gem me-3 mt-1 category-list-icon"></i>{" "}
                          {/* Diamond icon */}
                          <span className="paragraph">{item}</span>{" "}
                          {/* Display the benefit/application item */}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Conditionally render Products Heading and Listing ONLY if hasSubProducts is true */}
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

              {/* Container for both buttons */}
              {/* Use d-flex for flex container, justify-content-center to center items */}
              <div className="d-flex justify-content-center mt-5">
                {/* View All Categories Button */}
                <Link
                  to="/products"
                  className="btn btn-outline-dark btn-lg rounded-pill product-back-btn" // FIXED: Changed btn-dark to btn-outline-dark
                >
                  View All Categories
                </Link>

                {(categorySlug === 'carbonless-paper' || categorySlug === 'coated-paper') && (
                  <> {/* Use a fragment to group the conditional button */}
                    {/* Get a Quote Button */}
                    <button type="button" className="btn btn-outline-dark btn-lg rounded-pill product-back-btn ms-3" onClick={handleShowQuoteModal}> {/* Added ms-3 for left margin */}
                      Get a Quote
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      <QuoteModal show={showQuoteModal} handleClose={handleCloseQuoteModal} categorySlug={categorySlug} />
    </>
  );
};

export default CategoryProductsPage;
