// src/pages/ProductsPage.js

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import db only, appId is no longer needed for root path
import { Link } from "react-router-dom"; // Ensure Link is imported if used in JSX

const ProductsPage = ({ authReady }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch data if Firestore is ready (authReady is true)
    if (!authReady) {
      console.log("Firestore not ready, skipping products fetch.");
      return;
    }

    // Collection path now directly points to 'company_products' at the root
    const productsCollectionPath = "company_products"; // Matches your screenshot

    const q = query(collection(db, productsCollectionPath));

    // Listen for real-time updates to the products collection
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList = [];
        snapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsList);
        setLoading(false);
        setError(null); // Clear any previous errors
        console.log("Products fetched:", productsList);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from real-time updates when the component unmounts
    return () => unsubscribe();
  }, [authReady]); // MODIFIED: Removed 'db' from the dependency array, keeping 'authReady'

  if (loading) {
    return (
      <div className="py-5">
        {" "}
        {/* Added py-5 */}
        <div className="container">
          {" "}
          {/* Added container */}
          <div className="loading-text text-center">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-5">
        {" "}
        {/* Added py-5 */}
        <div className="container">
          {" "}
          {/* Added container */}
          <div className="alert alert-danger text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      {" "}
      {/* Removed .content-section, using py-5 for direct padding */}
      <div className="container">
        {" "}
        {/* Use Bootstrap container for content */}
        <h2 className="page-title" style={{ color: "var(--sp-dark-gray)" }}>
          Our Products
        </h2>
        <p className="paragraph lead mb-4">
          Discover our innovative products designed to enhance your experience.
          We focus on quality and user satisfaction.
        </p>
        {products.length === 0 ? (
          <div className="alert alert-info text-center">
            No products available yet. Check back soon!
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-4">
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
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
