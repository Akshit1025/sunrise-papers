// src/pages/ProductsPage.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig.js'; // Import db

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
    const productsCollectionPath = 'company_products';

    const q = query(collection(db, productsCollectionPath));

    // Listen for real-time updates to the products collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = [];
      snapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
      setLoading(false);
      setError(null); // Clear any previous errors
      console.log("Products fetched:", productsList);
    }, (err) => {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    });

    // Cleanup function to unsubscribe from real-time updates when the component unmounts
    return () => unsubscribe();
  }, [authReady]); // Removed 'db' from dependency array

  if (loading) {
    return <div className="loading-text">Loading products...</div>;
  }

  if (error) {
    return <div className="message-box error-message">{error}</div>;
  }

  return (
    <div>
      <h2 className="page-title">Our Products</h2>
      <p className="paragraph">
        Discover our innovative products designed to enhance your experience. We focus on quality and user satisfaction.
      </p>
      {products.length === 0 ? (
        <div className="message-box">No products available yet. Check back soon!</div>
      ) : (
        <div className="service-card-container">
          {products.map((product) => (
            <div key={product.id} className="service-card">
              <h3 className="service-title">{product.name}</h3>
              <p className="service-description">{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
