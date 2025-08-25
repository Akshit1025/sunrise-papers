// src/pages/ProductsPage.js

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import necessary Firestore functions
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig"; // Import db directly
import "./ProductsPage.css"; // Shared CSS for product-related pages

const ProductsPage = ({ authReady }) => {
  // authReady is passed as a prop
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!authReady) {
        // Wait for Firebase auth (and thus db) to be ready
        setLoading(true); // Keep loading state true until authReady
        return;
      }

      try {
        setLoading(true);
        const categoriesCollectionRef = collection(db, "categories");
        const q = query(categoriesCollectionRef, where("isVisible", "==", true));
        const querySnapshot = await getDocs(q);
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by 'order' field if it exists, otherwise by name
        fetchedCategories.sort(
          (a, b) =>
            (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)
        );
        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load product categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [authReady]); // Depend on authReady to trigger fetch

  return (
    <>
      {/* Products Page Hero Section */}
      <section className="products-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 products-hero-title">
            Our Products
          </h1>
          <p className="lead products-hero-subtitle">
            Explore our wide range of high-quality paper solutions.
          </p>
        </div>
      </section>

      {/* Main Content Area - Categories Listing */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="page-title text-center mb-5">Product Categories</h2>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading categories...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center message-box animate__animated animate__fadeIn">
              {error}
            </div>
          )}

          {!loading && categories.length === 0 && !error && (
            <div className="alert alert-info text-center message-box animate__animated animate__fadeIn">
              No categories found. Please add categories to your Firestore.
            </div>
          )}

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {categories.map((category) => (
              <div
                className="col animate__animated animate__fadeInUp"
                key={category.id}
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
                      className="card-img-top category-image"
                      alt={category.name}
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
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
