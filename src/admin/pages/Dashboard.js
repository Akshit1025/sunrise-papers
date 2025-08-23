import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Assuming db is exported from here
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import getAuth and onAuthStateChanged
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // To store current logged-in user
  const [loading, setLoading] = useState(true); // Overall loading state
  const [error, setError] = useState("");

  const auth = getAuth(); // Get Firebase Auth instance

  // Fetch counts and user info on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {

        // Fetch Product Count
        const productsRef = collection(db, "products");
        const productsSnap = await getDocs(query(productsRef));
        setProductCount(productsSnap.size); // snap.size gives the number of documents

        // Fetch Category Count
        const categoriesRef = collection(db, "categories");
        const categoriesSnap = await getDocs(query(categoriesRef));
        setCategoryCount(categoriesSnap.size); // snap.size gives the number of documents

        // Listen for Auth State Changes to get current user
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in
            setCurrentUser(user);
          } else {
            // User is signed out
            setCurrentUser(null);
          }
        });

        // Clean up auth state listener
        return () => unsubscribe();
      } catch (e) {
        console.error("Error fetching dashboard data:", e);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth]); // Depend on auth instance

  return (
    <div className="container mt-4">
      {" "}
      {/* Added container for spacing */}
      <h2 className="h4 mb-4">Admin Dashboard Overview</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      {loading ? (
        <div>Loading dashboard data...</div>
      ) : (
        <>
          {/* --- Overview Section (Links) --- */}
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="h5 card-title">Quick Links</h3>
              <div className="list-group list-group-flush">
                {/* Assuming your routing uses paths like /admin/categories and /admin/products */}
                {/* You might need to use Link components from your routing library (e.g., react-router-dom) */}
                <Link
                  to="/admin/categories"
                  className="list-group-item list-group-item-action"
                >
                  Manage Categories ({categoryCount} total)
                </Link>
                <Link
                  to="/admin/products"
                  className="list-group-item list-group-item-action"
                >
                  Manage Products ({productCount} total)
                </Link>
                <Link
                  to="/admin/quotes"
                  className="list-group-item list-group-item-action"
                >
                  Manage Quote Forms
                </Link>
                <Link
                  to="/admin/settings"
                  className="list-group-item list-group-item-action"
                >
                  Manage Settings
                </Link>
                {/* Add other links as needed */}
              </div>
            </div>
          </div>

          {/* --- User Information Section --- */}
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="h5 card-title">User Information</h3>
              {currentUser ? (
                <div>
                  <p>
                    <strong>Logged in as:</strong> {currentUser.email}
                  </p>
                  {/* You can display other user properties if available, e.g., displayName */}
                  {currentUser.displayName && (
                    <p>
                      <strong>Display Name:</strong> {currentUser.displayName}
                    </p>
                  )}
                  <p>
                    <strong>User ID:</strong> {currentUser.uid}
                  </p>
                  {/* Add more user info as needed */}
                </div>
              ) : (
                <p>No admin user is currently logged in.</p>
              )}
            </div>
          </div>

          {/* --- Key Metrics Section --- */}
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="h5 card-title">Key Metrics</h3>
              <div className="row">
                <div className="col-md-6 mb-3 mb-md-0">
                  <div className="card text-center">
                    <div className="card-body">
                      <i className="fas fa-folder text-primary mb-2 fa-2x"></i>
                      <h6 className="card-title">Total Categories</h6>
                      <p className="card-text h3">{categoryCount}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card text-center">
                    <div className="card-body">
                      <i className="fas fa-box-open text-success mb-2 fa-2x"></i>
                      <h6 className="card-title">Total Products</h6>
                      <p className="card-text h3">{productCount}</p>
                    </div>
                  </div>
                </div>
                {/* Add more metric cards as needed */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
