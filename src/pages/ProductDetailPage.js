// src/pages/ProductDetailPage.js

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
import { db } from "../firebaseConfig";
import "./ProductsPage.css";
import QuoteModal from "../components/QuoteModal";

const ProductDetailPage = ({ authReady }) => {
  const { productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formDefinitions, setFormDefinitions] = useState({});
  const [loadingDefinitions, setLoadingDefinitions] = useState(true);
  const [definitionError, setDefinitionError] = useState(null);

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchProductAndDefinition = async () => {
      if (!authReady) {
        setLoading(true);
        setLoadingDefinitions(true);
        return;
      }

      try {
        setLoading(true);
        setLoadingDefinitions(true);
        setError(null);
        setDefinitionError(null);
        setProduct(null);
        setFormDefinitions({});

        const productsCollectionRef = collection(db, "products");
        const q = query(
          productsCollectionRef,
          where("slug", "==", productSlug),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        let productData = null;
        if (!querySnapshot.empty) {
          productData = querySnapshot.docs[0].data();
          setProduct({ id: querySnapshot.docs[0].id, ...productData });

          if (productData.category_slug) {
            try {
              const definitionDocRef = doc(
                db,
                "quoteFormDefinitions",
                productData.category_slug
              );
              const definitionDocSnap = await getDoc(definitionDocRef);

              if (definitionDocSnap.exists()) {
                setFormDefinitions({
                  [productData.category_slug]: definitionDocSnap.data(),
                });
              } else {
                setFormDefinitions({});
              }
              setDefinitionError(null);
            } catch (defErr) {
              console.error(
                `Error fetching form definition for ${productData.category_slug}:`,
                defErr
              );
              setDefinitionError("Failed to load form configuration.");
              setFormDefinitions({});
            } finally {
              setLoadingDefinitions(false);
            }
          } else {
            setFormDefinitions({});
            setLoadingDefinitions(false);
          }
          setError(null);
        } else {
          setError(`Product "${productSlug}" not found.`);
          setFormDefinitions({});
          setLoadingDefinitions(false);
        }
      } catch (err) {
        console.error(`Error fetching product "${productSlug}":`, err);
        setError(
          `Failed to load product details. Please try again later. (Error: ${err.message})`
        );
        setFormDefinitions({});
        setLoadingDefinitions(false);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug && authReady) {
      fetchProductAndDefinition();
    } else if (!authReady) {
      setLoading(true);
      setLoadingDefinitions(true);
    }
  }, [authReady, productSlug, db]);

  const handleShowQuoteModal = () => setShowQuoteModal(true);
  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
  };

  return (
    <>
      {/* Hero */}
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

      {/* Main Content */}
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

          {product && (
            <div className="product-detail-content row g-5">
              {/* ✅ Carousel for images */}
              <div className="col-md-6 col-lg-6 justify-content-center align-items-center animate__animated animate__fadeInLeft">
                <div
                  id="productCarousel"
                  className="carousel slide shadow-lg rounded"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner rounded product-detail-media">
                    {/* First Image */}
                    <div className="carousel-item active">
                      <img
                        src={
                          product.image_url ||
                          "https://placehold.co/800x600/dddddd/333333?text=Product+Image"
                        }
                        alt={product.name}
                        className="d-block w-100 rounded product-detail-media"
                      />
                    </div>

                    {/* Extra Images */}
                    {product.image_gallery &&
                      product.image_gallery.map((img, index) => (
                        <div className="carousel-item" key={`img-${index}`}>
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="d-block w-100 rounded-3 product-detail-media"
                          />
                        </div>
                      ))}
                  </div>

                  {/* Controls */}
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#productCarousel"
                    data-bs-slide="prev"
                  >
                    <span className="carousel-control-prev-icon"></span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#productCarousel"
                    data-bs-slide="next"
                  >
                    <span className="carousel-control-next-icon"></span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="col-lg-6 animate__animated animate__fadeInRight">
                <h2 className="product-detail-name sub-heading mb-3">
                  {product.name}
                </h2>
                <p className="product-detail-description paragraph lead">
                  {product.long_description || product.short_description}
                </p>

                <div className="mt-5 text-center">
                  <Link
                    to={`/products/${product.category_slug}`}
                    className="btn btn-outline-dark rounded-pill me-3 product-back-btn"
                  >
                    <i className="fas fa-arrow-left me-2"></i> Back to{" "}
                    {product.category_slug
                      ? product.category_slug
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (s) => s.toUpperCase()) +
                        " Products"
                      : "Categories"}
                  </Link>{" "}
                  <Link
                    to="/products"
                    className="btn btn-outline-dark rounded-pill product-back-btn"
                  >
                    <i className="fas fa-th-large me-2"></i> View All Categories
                  </Link>
                  {product && product.category_slug && formDefinitions[product.category_slug] && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-lg rounded-pill product-back-btn"
                        onClick={handleShowQuoteModal}
                      >
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

      <QuoteModal
        show={showQuoteModal}
        handleClose={handleCloseQuoteModal}
        category_slug={product ? product.category_slug : ""}
        formDefinition={product && formDefinitions[product.category_slug]}
        loadingDefinition={loadingDefinitions}
        definitionError={definitionError}
      />
    </>
  );
};

export default ProductDetailPage;
