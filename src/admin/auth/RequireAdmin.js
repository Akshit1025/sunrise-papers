import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../../firebaseConfig";

const parseAdminEmails = () => {
  const raw = process.env.REACT_APP_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const RequireAdmin = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(undefined); // undefined = loading
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (u && !u.isAnonymous) {
        const whitelist = parseAdminEmails();
        if (whitelist.length === 0) {
          setAllowed(true); // Temporarily allow any signed-in user if no whitelist set
        } else {
          setAllowed(whitelist.includes(u.email || ""));
        }
      } else {
        setAllowed(false);
      }
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
    return null; // or a tiny inline spinner if you prefer
  }

  if (!user || user.isAnonymous || !allowed) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
};

export default RequireAdmin;
