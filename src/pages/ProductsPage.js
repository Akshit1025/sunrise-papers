// src/pages/ProductsPage.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

const ProductsPage = ({ authReady }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authReady) {
      console.log("Firestore not ready, skipping products fetch.");
      return;
    }

    const productsCollectionPath = 'company_products'; // Matches your root-level collection
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
  }, [authReady]); // db is not needed in dependency array

  if (loading) {
    return <div className="loading-text">Loading products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>; {/* Use Bootstrap alert */}
  }

  return (
    <div className="my-4"> {/* Add some vertical margin */}
      <h2 className="page-title text-info">Our Products</h2> {/* Use Bootstrap text-info for color */}
      <p className="paragraph">
        Discover our innovative products designed to enhance your experience. We focus on quality and user satisfaction.
      </p>
      {products.length === 0 ? (
        <div className="alert alert-info text-center">No products available yet. Check back soon!</div>
      ) : (
        // Use Bootstrap grid classes for responsive product cards
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-4">
          {products.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 shadow-sm border-0 service-card"> {/* Use Bootstrap card and shadow classes, combine with custom */}
                <div className="card-body">
                  <h5 className="card-title text-primary mb-3 service-title">{product.name}</h5> {/* Bootstrap card-title, text-primary */}
                  <p className="card-text text-secondary service-description">{product.description}</p> {/* Bootstrap card-text, text-secondary */}
                  {/* Add more product details here, e.g., an image or features */}
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
