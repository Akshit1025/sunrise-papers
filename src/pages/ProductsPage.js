// src/pages/ProductsPage.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ProductsPage = ({ authReady }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authReady) {
      console.log("Firestore not ready, skipping products fetch.");
      return;
    }

    const productsCollectionPath = 'company_products';
    const q = query(collection(db, productsCollectionPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = [];
      snapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
      setLoading(false);
      setError(null);
      console.log("Products fetched:", productsList);
    }, (err) => {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authReady]);

  if (loading) {
    return <div className="loading-text">Loading products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="my-4">
      {/* Using custom CSS variables for color */}
      <h2 className="page-title" style={{ color: 'var(--sp-dark-gray)' }}>Our Products</h2>
      <p className="paragraph">
        Discover our innovative products designed to enhance your experience. We focus on quality and user satisfaction.
      </p>
      {products.length === 0 ? (
        <div className="alert alert-info text-center">No products available yet. Check back soon!</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-4">
          {products.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 shadow-sm border-0 service-card">
                <div className="card-body">
                  {/* Using custom CSS variables for color */}
                  <h5 className="card-title mb-3 service-title" style={{ color: 'var(--sp-dark-gray)' }}>{product.name}</h5>
                  <p className="card-text service-description" style={{ color: 'var(--sp-medium-gray)' }}>{product.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
