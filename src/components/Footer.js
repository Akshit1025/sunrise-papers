// src/components/Footer.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Footer = () => {
  const [s, setS] = useState({
    contactEmail: "dineshgupta@sunrisepapers.co.in",
    phone1: "+91 95555 09507",
    phone2: "+91 98100 87126",
    linkedinUrl: "https://www.linkedin.com/in/dineshgupta-sunriise",
    whatsappUrl: "https://wa.me/919810087126",
    googleUrl: "https://g.co/kgs/WDyBz11",
    addressText:
      "Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka, Delhi, 110078, India",
    mapsUrl: "https://maps.app.goo.gl/zFrzmgSPvqrrL79Z9",
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (snap) => {
      if (snap.exists()) setS((p) => ({ ...p, ...snap.data() }));
    });
    return () => unsub();
  }, []);

  return (
    <>
      {/* Main Footer */}
      <footer className="footer py-5">
        <div className="container">
          <div className="row">
            {/* Column 1: Sunrise Papers logo and info */}
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="footer-brand d-flex align-items-center mb-3">
                <img
                  src="https://res.cloudinary.com/dzrv3ssy5/image/upload/v1756204861/logo-no-bg_hodk6e.png" // Changed logo path here
                  alt="Sunrise Papers Logo"
                  className="footer-logo me-3"
                />
                <span className="footer-company-name fw-bold">
                  Sunrise Papers
                </span>
              </div>
              <p className="footer-description">
                Delivering execellence in paper products since 1995. Committed
                to quality and sustainability.
              </p>
              <div className="footer-social-icons mt-4">
                <a
                  href={s.linkedinUrl} // Updated LinkedIn URL (example)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link me-3"
                >
                  <i className="fab fa-linkedin"></i>{" "}
                  {/* Changed from fa-twitter to fa-linkedin */}
                </a>
                <a
                  href={s.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link me-3"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a
                  href={s.googleUrl} // Updated Google Business URL (example)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                >
                  <i className="fab fa-google-plus-g"></i>{" "}
                  {/* Changed from fa-instagram to fa-google-plus-g */}
                </a>
              </div>
            </div>
            {/* Column 2: Quick Links */}
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="footer-heading mb-3">Quick Links</h5>
              <ul className="list-unstyled footer-links">
                <li>
                  <Link to="/" className="footer-link text-decoration-none">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="footer-link text-decoration-none"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="footer-link text-decoration-none"
                  >
                    Our Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="footer-link text-decoration-none"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            {/* Column 3: Contact Information */}
            <div className="col-md-4">
              <h5 className="footer-heading mb-3">Contact Info</h5>
              <address className="mb-0">
                <p className="footer-contact-item">
                  <i className="fas fa-map-marker-alt me-2 footer-icon"></i>
                  <a
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none footer-link"
                  >
                    {s.addressText}
                  </a>
                </p>
                <p className="footer-contact-item">
                  <i className="fas fa-envelope me-2 footer-icon"></i>
                  <a
                    href={`mailto:${s.contactEmail}`}
                    className="text-decoration-none footer-link"
                  >
                    {s.contactEmail}
                  </a>
                </p>
                <p className="footer-contact-item">
                  <i className="fas fa-phone me-2 footer-icon"></i>
                  <a
                    href={`tel:${s.phone1.replace(/\s+/g, "")}`}
                    className="text-decoration-none footer-link"
                  >
                    {s.phone1}
                  </a>
                  &nbsp;|&nbsp;
                  <a
                    href={`tel:${s.phone2.replace(/\s+/g, "")}`}
                    className="text-decoration-none footer-link"
                  >
                    {s.phone2}
                  </a>
                </p>
              </address>
            </div>
          </div>
        </div>
      </footer>
      {/* Bottom Copyright Bar */}
      <div className="bottom-bar py-3 text-center">
        <div className="container d-md-flex justify-content-between align-items-center">
          <small className="mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} Sunrise Papers. All Rights
            Reserved.
            <br />
            <a
              href="https://instagram.com/akshitthecoder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none footer-bottom-link"
            >
              Made by Akshit Gupta
            </a>
          </small>
          <ul className="list-inline mb-0 footer-policy-links">
            <li className="list-inline-item me-3">
              <a
                href="/pdf/privacy-policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none footer-bottom-link"
              >
                Privacy Policy
              </a>
            </li>
            <li className="list-inline-item">
              <a
                href="/pdf/terms-and-conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none footer-bottom-link"
              >
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Footer;
