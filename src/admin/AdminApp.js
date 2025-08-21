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
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";

const AdminApp = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  const isLoginRoute = location.pathname === "/admin/login";

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 m-0">Admin Panel</h1>
        {!isLoginRoute && (
          <nav className="d-flex gap-3 align-items-center">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/categories">Categories</Link>
            <Link to="/admin/quotes">Quotes</Link>
            <Link to="/admin/contacts">Contacts</Link>
            <Link to="/admin/settings">Settings</Link>
            {user && !user.isAnonymous ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-dark ms-2"
                onClick={() => signOut(auth)}
              >
                Logout
              </button>
            ) : (
              <Link to="/admin/login" className="btn btn-sm btn-dark ms-2">
                Login
              </Link>
            )}
          </nav>
        )}
      </header>

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
          path="quotes"
          element={
            <RequireAdmin>
              <QuoteRequests />
            </RequireAdmin>
          }
        />
        <Route
          path="contacts"
          element={
            <RequireAdmin>
              <Contacts />
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
  );
};

export default AdminApp;
