import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig"; // adjust path if needed
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import RequireAdmin from "./auth/RequireAdmin";
import QuoteRequests from "./pages/QuoteRequests";
import Settings from "./pages/Settings";
import ContentManagement from "./pages/ContentManagement";

const AdminApp = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  const isLoginRoute = location.pathname === "/admin/login";

  return (
    <div className="admin-panel-wrapper">
      {!isLoginRoute && (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
          <div className="container-fluid">
            <Link className="navbar-brand h3 m-0" to="/admin">
              <img
                src="https://sunrise-papers.vercel.app/images/logo-no-bg.png"
                alt="Official logo"
              />
              Admin Panel
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item me-2">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/admin" ? "active" : ""
                    }`}
                    to="/admin"
                  >
                    <i className="fas fa-tachometer-alt me-1"></i>{" "}
                    {/* Dashboard icon */}
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/admin/products" ? "active" : ""
                    }`}
                    to="/admin/products"
                  >
                    <i className="fas fa-box-open me-1"></i>{" "}
                    {/* Products icon */}
                    Products
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/admin/categories" ? "active" : ""
                    }`}
                    to="/admin/categories"
                  >
                    <i className="fas fa-folder me-1"></i>{" "}
                    {/* Categories icon */}
                    Categories
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/admin/content" ? "active" : ""
                    }`}
                    to="/admin/content"
                  >
                    <i className="fas fa-circle-info me-1"></i>{" "}
                    {/* Categories icon */}
                    Content
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/admin/quotes" ? "active" : ""
                    }`}
                    to="/admin/quotes"
                  >
                    <i className="fas fa-quote-right me-1"></i>{" "}
                    {/* Quotes icon */}
                    Quotes
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/admin/settings" ? "active" : ""
                    }`}
                    to="/admin/settings"
                  >
                    <i className="fas fa-cog me-1"></i> {/* Settings icon */}
                    Settings
                  </Link>
                </li>
                {/* Add more nav items here */}
                <li className="nav-item">
                  {user && !user.isAnonymous ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark m-2"
                      onClick={() => signOut(auth)}
                    >
                      <i className="fas fa-sign-out-alt me-1"></i>{" "}
                      {/* Logout icon */}
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/admin/login"
                      className="btn btn-sm btn-dark ms-2"
                    >
                      <i className="fas fa-sign-in-alt me-1"></i>{" "}
                      {/* Login icon */}
                      Login
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
      {/* Wrap content in a container for spacing */}
      <div className="container py-4">
        {/* The Routes component stays here */}
        <Routes>
          <Route path="login" element={<Login />} />

          <Route
            index
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="products"
            element={
              <RequireAdmin>
                <Products />
              </RequireAdmin>
            }
          />
          <Route
            path="categories"
            element={
              <RequireAdmin>
                <Categories />
              </RequireAdmin>
            }
          />
          <Route
            path="content"
            element={
              <RequireAdmin>
                <ContentManagement />
              </RequireAdmin>
            }
          />
          <Route
            path="quotes"
            element={
              <RequireAdmin>
                <QuoteRequests />
              </RequireAdmin>
            }
          />
          <Route
            path="settings"
            element={
              <RequireAdmin>
                <Settings />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
        <footer>
          <div className="text-center py-3 bg-light text-muted small">
            {" "}
            {/* Using Bootstrap classes for basic styling */}
            &copy; {new Date().getFullYear()} Sunrise Papers. All Rights
            Reserved.
            <br />
            Made by {/* Added space */}
            <a
              href="https://instagram.com/akshitthecoder"
              target="_blank" // Open in a new tab
              rel="noopener noreferrer" // Security best practice for target="_blank"
              className="text-decoration-none text-muted" // Style the link to match text
            >
              Akshit Gupta
            </a>
          </div>
        </footer>
    </div>
  );
};

export default AdminApp;
