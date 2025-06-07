// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS for styling
import "./App.css"; // Import the main App CSS file
import App from "./App.js"; // Ensure .js extension is explicitly used for local modules

// Get the root element from the public/index.html file (where your React app will mount)
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the main App component into the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
