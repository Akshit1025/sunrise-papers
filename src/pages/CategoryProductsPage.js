// src/pages/CategoryProductsPage.js

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig"; // Import db directly
import "./ProductsPage.css"; // Shared CSS for product-related pages

const CategoryProductsPage = ({ authReady }) => {
  // authReady is passed as a prop
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!authReady) {
        // Wait for Firebase auth (and thus db) to be ready
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setCategoryName("");
        setProducts([]);

        // First, fetch category details to get the proper name
        const categoriesCollectionRef = collection(db, "categories");
        const categoryQuery = query(
          categoriesCollectionRef,
          where("slug", "==", categorySlug),
          limit(1)
        );
        const categorySnapshot = await getDocs(categoryQuery);

        if (!categorySnapshot.empty) {
          const categoryData = categorySnapshot.docs[0].data();
          setCategoryName(categoryData.name);
        } else {
          setError(`Category "${categorySlug}" not found.`);
          setLoading(false);
          return;
        }

        // Then, fetch products for this category
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
        console.log(`Fetched products for category "${categorySlug}":`, fetchedProducts);
        setError(null);
      } catch (err) {
        console.error(
          `Error fetching products for category "${categorySlug}":`,
          err
        );
        setError(
          `Failed to load products for this category. Please try again later. (Error: ${err.message})`
        );
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      // Ensure categorySlug is available before attempting to fetch
      fetchCategoryAndProducts();
    }
  }, [authReady, categorySlug]); // Depend on authReady and categorySlug

  return (
    <>
      {/* Category Products Hero Section */}
      <section className="products-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 products-hero-title">
            {loading && !categoryName
              ? "Loading Category..."
              : categoryName || "Products"}
          </h1>
          <p className="lead products-hero-subtitle">
            Discover our specialized{" "}
            {categoryName ? categoryName.toLowerCase() : "paper"} offerings.
          </p>
        </div>
      </section>

      {/* Main Content Area - Product Listing */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="page-title text-center mb-5">
            {categoryName ? `${categoryName} Products` : "All Products"}
          </h2>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center message-box animate__animated animate__fadeIn">
              {error}
            </div>
          )}

          {!loading && products.length === 0 && !error && (
            <div className="alert alert-info text-center message-box animate__animated animate__fadeIn">
              No products found for this category.
            </div>
          )}

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {products.map((product) => (
              <div
                className="col animate__animated animate__fadeInUp"
                key={product.id}
              >
                <Link
                  to={`/product/${product.slug}`}
                  className="product-card-link text-decoration-none"
                >
                  <div className="product-card card h-100 rounded-3 shadow-sm overflow-hidden">
                    <img
                      src={
                        product.image_url ||
                        "https://placehold.co/600x400/dddddd/333333?text=Product+Image"
                      }
                      className="card-img-top product-image"
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400/dddddd/333333?text=Image+Error";
                      }}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title product-title mb-2">
                        {product.name}
                      </h5>
                      <p className="card-text product-short-description">
                        {product.short_description}
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

export default CategoryProductsPage;
