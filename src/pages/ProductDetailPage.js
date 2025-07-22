// src/pages/ProductDetailPage.js

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore"; // Import necessary Firestore functions
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig"; // Import db directly
import "./ProductsPage.css"; // Shared CSS for product-related pages
import QuoteModal from '../components/QuoteModal';

const ProductDetailPage = ({ authReady }) => {
  // authReady is passed as a prop
  const { productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!authReady) {
        // Wait for Firebase auth (and thus db) to be ready
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setProduct(null);

        const productsCollectionRef = collection(db, "products");
        const q = query(
          productsCollectionRef,
          where("slug", "==", productSlug),
          limit(1)
        );
        const querySnapshot = await getDocs(q); // Use getDocs for queries

        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data();
          setProduct({ id: querySnapshot.docs[0].id, ...productData });
        } else {
          setError(`Product "${productSlug}" not found.`);
        }
      } catch (err) {
        console.error(`Error fetching product "${productSlug}":`, err);
        setError(
          `Failed to load product details. Please try again later. (Error: ${err.message})`
        );
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      // Ensure productSlug is available before attempting to fetch
      fetchProduct();
    }
  }, [authReady, productSlug]); // Depend on authReady and productSlug

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleShowQuoteModal = () => setShowQuoteModal(true);
  const handleCloseQuoteModal = () => setShowQuoteModal(false);


  return (
    <>
      {/* Product Detail Hero Section */}
      <section className="products-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 products-hero-title">
            {loading && !product
              ? "Loading Product..."
              : product?.name || "Product Details"}
          </h1>
          <p className="lead products-hero-subtitle">
            Detailed information about our{" "}
            {product?.name ? product.name.toLowerCase() : "product"}.
          </p>
        </div>
      </section>

      {/* Main Content Area - Product Details */}
      <section className="py-5 bg-white">
        <div className="container">
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">
                  Loading product details...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center message-box animate__animated animate__fadeIn">
              {error}
            </div>
          )}

          {!loading && !product && !error && (
            <div className="alert alert-info text-center message-box animate__animated animate__fadeIn">
              No product details found.
            </div>
          )}

          {product && (
            <div className="product-detail-content row g-5">
              <div className="col-lg-6 animate__animated animate__fadeInLeft">
                <img
                  src={
                    product.image_url ||
                    "https://placehold.co/800x600/dddddd/333333?text=Product+Image"
                  }
                  alt={product.name}
                  className="img-fluid rounded-3 shadow-lg product-detail-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/800x600/dddddd/333333?text=Image+Error";
                  }}
                />
              </div>
              <div className="col-lg-6 animate__animated animate__fadeInRight">
                <h2 className="product-detail-name sub-heading mb-3">
                  {product.name}
                </h2>
                <p className="product-detail-description paragraph lead">
                  {product.long_description || product.short_description}
                </p>

                {/* Link back to category or all products */}
                <div className="mt-5 text-center text-lg-start">
                  <Link
                    to={`/products/${product.category_slug}`}
                    className="btn btn-outline-secondary rounded-pill me-3 product-back-btn"
                  >
                    <i className="fas fa-arrow-left me-2"></i> Back to{" "}
                    {product.category_slug
                      ? product.category_slug
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (s) => s.toUpperCase()) +
                      " Products"
                      : "Categories"}
                  </Link>
                  <Link
                    to="/products"
                    className="btn btn-outline-secondary rounded-pill product-back-btn"
                  >
                    <i className="fas fa-th-large me-2"></i> View All Categories
                  </Link>
                  {product && product.category_slug === 'food-grade-papers' && (
                    <div className="mt-4 text-center">
                      <button type="button" className="btn btn-outline-dark btn-lg rounded-pill product-back-btn" onClick={handleShowQuoteModal}>
                        Get a Quote
                      </button>
                    </div>
                  )}


                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <QuoteModal show={showQuoteModal} handleClose={handleCloseQuoteModal} categorySlug={product ? product.category_slug : ''} />
    </>
  );
};

export default ProductDetailPage;
