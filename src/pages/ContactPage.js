// src/pages/ContactPage.js

import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";

const ContactPage = ({ userId, authReady }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setStatusMessage("");
    setIsSubmitting(true);

    if (!authReady || !userId) {
      setStatusMessage(
        "Authentication not ready. Please wait a moment and try again."
      );
      setSubmissionStatus("error");
      setIsSubmitting(false);
      return;
    }

    if (!name || !email || !message) {
      setStatusMessage("All fields are required.");
      setSubmissionStatus("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const messagesCollectionPath = "contact_messages";
      await addDoc(collection(db, messagesCollectionPath), {
        name,
        email,
        message,
        timestamp: new Date(),
        userId: userId,
      });
      setStatusMessage("Your message has been sent successfully!");
      setSubmissionStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage("Failed to send message. Please try again.");
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setStatusMessage("");
        setSubmissionStatus(null);
      }, 4000);
    }
  };

  return (
    <div className="py-5">
      {" "}
      {/* Removed .content-section, using py-5 for direct padding */}
      <div className="container">
        {" "}
        {/* Use Bootstrap container for content */}
        <h2 className="page-title" style={{ color: "var(--sp-dark-gray)" }}>
          Contact Us
        </h2>
        <p className="paragraph lead mb-4">
          Have a question or want to discuss a project? Feel free to reach out
          to us using the form below, or contact us directly using the
          information provided.
        </p>
        <div className="row g-4">
          {/* Contact Form Column */}
          <div className="col-lg-7">
            <div className="contact-form-card p-4 border rounded shadow-lg h-100 animate__animated animate__fadeInLeft">
              <h3 className="sub-heading fw-bold mb-4">Send Us a Message</h3>
              <form className="form" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="contactName"
                    className="form-label"
                    style={{ color: "var(--sp-medium-gray)" }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="form-control input-field"
                    id="contactName"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="contactEmail"
                    className="form-label"
                    style={{ color: "var(--sp-medium-gray)" }}
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    className="form-control input-field"
                    id="contactEmail"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="contactMessage"
                    className="form-label"
                    style={{ color: "var(--sp-medium-gray)" }}
                  >
                    Your Message
                  </label>
                  <textarea
                    className="form-control text-area-field"
                    id="contactMessage"
                    placeholder="Your Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-dark btn-lg submit-button rounded-pill mt-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
              {submissionStatus && (
                <div
                  className={`alert ${
                    submissionStatus === "success"
                      ? "alert-success"
                      : "alert-danger"
                  } text-center mt-3 message-box animate__animated animate__fadeIn`}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info Column */}
          <div className="col-lg-5">
            <div className="contact-info-card p-4 border rounded shadow-lg h-100 bg-light animate__animated animate__fadeInRight">
              <h3 className="sub-heading fw-bold mb-4">Our Details</h3>
              <ul className="list-unstyled contact-details-list">
                <li className="mb-3">
                  <i className="fas fa-map-marker-alt me-3 text-primary fa-lg"></i>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=107, Vardhman, Crystal Plaza, CD Block, Pitampura, Delhi- 110088, Delhi, India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-dark"
                  >
                    107, Vardhman, Crystal Plaza, CD Block, Pitampura, Delhi-
                    110088, Delhi, India
                  </a>
                </li>
                <li className="mb-3">
                  <i className="fas fa-envelope me-3 text-primary fa-lg"></i>
                  <a
                    href="mailto:info@sunrisepapers.com"
                    className="text-decoration-none text-dark"
                  >
                    info@sunrisepapers.com
                  </a>
                </li>
                <li className="mb-3">
                  <i className="fas fa-phone-alt me-3 text-primary fa-lg"></i>
                  <a
                    href="tel:+123456789101"
                    className="text-decoration-none text-dark"
                  >
                    +1 (234) 5678 9101
                  </a>
                  ,{" "}
                  <a
                    href="tel:+919810087126"
                    className="text-decoration-none text-dark"
                  >
                    +91 9810087126
                  </a>
                  ,{" "}
                  <a
                    href="tel:+01145587126"
                    className="text-decoration-none text-dark"
                  >
                    011-45587126
                  </a>
                </li>
              </ul>
              <h4 className="sub-heading fw-bold mt-5 mb-3">Business Hours</h4>
              <p className="paragraph">
                Monday - Friday: 9:00 AM - 6:00 PM
                <br />
                Saturday: 10:00 AM - 2:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
