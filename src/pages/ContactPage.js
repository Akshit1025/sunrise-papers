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
    <>
      {/* Contact Us Hero Section */}
      <section className="contact-hero-section py-5 text-center d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          <h1 className="display-3 fw-bold mb-3 contact-hero-title">
            Contact Us
          </h1>
          <p className="lead contact-hero-subtitle">
            We're here to help! Reach out to us for any inquiries.
          </p>
        </div>
      </section>

      <div className="py-5">
        <div className="container">
          <p className="paragraph lead mb-4 text-center">
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
                      style={{ color: "var(--sp-dark-secondary)" }}
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
                      style={{ color: "var(--sp-dark-secondary)" }}
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
                      style={{ color: "var(--sp-dark-secondary)" }}
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
                  <li className="mb-3 contact-detail-item">
                    <i className="fas fa-map-marker-alt me-3 fa-lg"></i>
                    <span className="contact-text">
                      <a
                        href="https://maps.app.goo.gl/zFrzmgSPvqrrL79Z9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                        style={{ color: "var(--sp-dark-primary)" }}
                      >
                        Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka,
                        New Delhi, 110078, India
                      </a>
                    </span>
                  </li>
                  <li className="mb-3 contact-detail-item">
                    <i className="fas fa-envelope me-3 fa-lg"></i>
                    <span className="contact-text">
                      <a
                        href="mailto:dineshgupta@sunrisepapers.co.in"
                        className="text-decoration-none"
                        style={{ color: "var(--sp-dark-primary)" }}
                      >
                        dineshgupta@sunrisepapers.co.in
                      </a>
                      {/* Updated email */}
                    </span>
                  </li>
                  <li className="mb-3 contact-detail-item">
                    <i className="fas fa-phone me-3 fa-lg"></i>
                    <span className="contact-text">
                      <a
                        href="tel:+919555509507"
                        className="text-decoration-none"
                        style={{ color: "var(--sp-dark-primary)" }}
                      >
                        +91 95555 09507
                      </a>
                      &nbsp;| {/* Adjusted spacing */}
                      <a
                        href="tel:+919810087126"
                        className="text-decoration-none"
                        style={{ color: "var(--sp-dark-primary)" }}
                      >
                        +91 98100 87126
                      </a>
                    </span>
                  </li>
                </ul>
                <h4 className="sub-heading fw-bold mt-5 mb-3">
                  Business Hours
                </h4>
                <p className="paragraph">
                  Monday - Saturday: 10:00 AM - 6:00 PM
                  <br />
                  Sunday: Closed
                </p>

                {/* Google Map Embed */}
                <h4 className="sub-heading fw-bold mt-5 mb-3">Find Us Here</h4>
                <div className="map-container rounded-3 overflow-hidden shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2795.9882920818955!2d77.02699707434387!3d28.600752085525215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1dd61eb460af%3A0xe89377d97456bc5e!2sVegas%20Mall!5e1!3m2!1sen!2sin!4v1750858738212!5m2!1sen!2sin"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Business Location on Google Maps"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
