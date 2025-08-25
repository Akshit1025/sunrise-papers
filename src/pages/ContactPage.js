// src/pages/ContactPage.js

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Import doc and getDoc
import { db } from "../firebaseConfig.js"; // Import db

// Define a default structure for the Contact page content (copy from ContentManagement.js)
const defaultContactContent = {
  sections: [
    {
      name: "intro",
      title: "Contact Us",
      subtitle: "We're here to help! Reach out to us for any inquiries.",
      // Optional: hero_image_url could be added here
    },
    {
      name: "details",
      intro_paragraph: "Have a question or want to discuss a project...",
      contact_info: [
        {
          icon_class: "fas fa-map-marker-alt",
          text: "Unit No. 390, Vegas Mall...",
          link_url: "https://maps.app.goo.gl/dnWGFT5NEYQBvkfc9",
        },
        {
          icon_class: "fas fa-envelope",
          text: "dineshgupta@sunrisepapers.co.in",
          link_url: "mailto:dineshgupta@sunrisepapers.co.in",
        },
        // *** Modified to have two separate phone number entries ***
        {
          icon_class: "fas fa-phone",
          text: "+91 95555 09507", // First number
          link_url: "tel:+919555509507",
        },
        {
          icon_class: "fas fa-phone", // Same icon for both
          text: "+91 98100 87126", // Second number
          link_url: "tel:+919810087126",
        },
        {
          icon_class: "fas fa-tty",
          text: "011-6995-2451",
          link_url: "tel:+911169952451",
        },
      ],
      business_hours_title: "Business Hours",
      business_hours_text:
        "Monday - Saturday: 10:00 AM - 6:00 PM\nSunday: Closed",
      map_embed_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.9434620915536!2d77.02744837454031!3d28.601472885492168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1ba519ad564f%3A0xe2d9a71052183dde!2sSunrise%20Papers!5e0!3m2!1sen!2sin!4v1755530280369!5m2!1sen!2sin", // Example embed URL
      // Optional: map_image_url could be added here
    },
  ],
  // Note: Contact form is managed by QuoteRequests definitions
};

// Keep the Contact form related state and handleSubmit function outside the main rendering logic,
// as they are not directly part of the fetched content structure.
// You might manage these in a separate component later if desired.
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

    if (!name || !email || !message) {
      setStatusMessage("Please fill in all fields.");
      setSubmissionStatus("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage("Your message has been sent successfully!");
        setSubmissionStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatusMessage(result.message || "Failed to send message.");
        setSubmissionStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage("Failed to send message. Please try again later");
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setStatusMessage("");
        setSubmissionStatus(null);
      }, 4000);
    }
  };

  // --- Add state for fetched content, loading, and error ---
  const [contactContent, setContactContent] = useState(defaultContactContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- useEffect to fetch content on mount ---
  useEffect(() => {
    const fetchContactContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "siteContent", "contact"); // Fetch the "contact" document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Merge with default to ensure all fields are present
          setContactContent({
            ...defaultContactContent, // Start with defaults
            ...docSnap.data(), // Overlay fetched data
            sections: Array.isArray(docSnap.data().sections)
              ? docSnap.data().sections.map((fetchedSection) => {
                  const defaultSection = defaultContactContent.sections.find(
                    (ds) => ds.name === fetchedSection.name
                  );
                  return {
                    ...defaultSection, // Start with default section
                    ...fetchedSection, // Overlay fetched
                    // Explicitly handle merging arrays within sections
                    contact_info: Array.isArray(fetchedSection.contact_info)
                      ? fetchedSection.contact_info
                      : defaultSection?.contact_info || [],
                    // Add similar checks for any other arrays within contact sections if they are arrays of objects
                  };
                })
              : defaultContactContent.sections, // Fallback to default contact sections
          });
        } else {
          // Document does not exist, use default content
          setContactContent(defaultContactContent);
        }
      } catch (e) {
        console.error("Error fetching Contact page content:", e);
        setError("Failed to load Contact page content.");
        setContactContent(defaultContactContent); // Fallback to default on error
      } finally {
        setLoading(false);
      }
    };

    fetchContactContent();
  }, []); // Empty dependency array runs once on mount

  // Helper function to find a section by name (similar to AboutPage)
  const findSection = (name) =>
    contactContent.sections.find((s) => s.name === name);

  return (
    <>
      {/* Contact Us Hero Section */}
      {loading ? (
        <div className="text-center py-5">Loading ...</div>
      ) : error ? (
        <div className="alert alert-danger text-center message-box py-5">
          {error}
        </div>
      ) : (
        <>
          {/* Contact Us Hero Section - Make Dynamic if editable fields exist for it */}
          {findSection("intro") && (
            <section className="contact-hero-section py-5 text-center d-flex align-items-center justify-content-center">
              <div className="container animate__animated animate__fadeIn">
                <h1 className="display-3 fw-bold mb-3 contact-hero-title">
                  {findSection("intro").title || "Contact Us"}
                </h1>
                <p className="lead contact-hero-subtitle">
                  {findSection("intro").subtitle ||
                    "We're here to help! Reach out to us for any inquiries."}
                </p>
                {/* If you add hero_image_url to the intro section, you'd add an img tag here */}
              </div>
            </section>
          )}

          <div className="py-5 bg-light">
            <div className="container">
              {findSection("details") &&
                findSection("details").intro_paragraph && (
                  <p className="paragraph lead mb-4 text-center">
                    {findSection("details").intro_paragraph}
                  </p>
                )}
              <div className="row g-4">
                {/* Contact Form Column (Static for now, but reusable component later?) */}
                <div className="col-lg-7">
                  <div className="contact-form-card p-4 border rounded shadow-lg h-100 animate__animated animate__fadeInLeft">
                    <h3 className="sub-heading fw-bold mb-4">
                      Send Us a Message
                    </h3>
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

                {/* Contact Info Column - Make Dynamic */}
                {findSection("details") && (
                  <div className="col-lg-5">
                    <div className="contact-info-card p-4 border rounded shadow-lg h-100 bg-light animate__animated animate__fadeInRight">
                      <h3 className="sub-heading fw-bold mb-4">Our Details</h3>
                      <ul className="list-unstyled contact-details-list">
                        {(findSection("details").contact_info || []).map(
                          (item, index) => (
                            <li
                              key={index}
                              className="mb-3 contact-detail-item"
                            >
                              {item.icon_class && (
                                <i
                                  className={`${item.icon_class} me-3 fa-lg`}
                                ></i>
                              )}
                              <span className="contact-text">
                                {item.link_url ? (
                                  <a
                                    href={item.link_url}
                                    target={
                                      item.link_url.startsWith("http")
                                        ? "_blank"
                                        : undefined
                                    } // Open external links in new tab
                                    rel={
                                      item.link_url.startsWith("http")
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className="text-decoration-none"
                                    style={{ color: "var(--sp-dark-primary)" }}
                                  >
                                    {item.text}
                                  </a>
                                ) : (
                                  <span
                                    style={{ color: "var(--sp-dark-primary)" }}
                                  >
                                    {item.text}
                                  </span>
                                )}
                              </span>
                            </li>
                          )
                        )}
                      </ul>

                      {findSection("details").business_hours_title && (
                        <h4 className="sub-heading fw-bold mt-5 mb-3">
                          {findSection("details").business_hours_title}
                        </h4>
                      )}
                      {findSection("details").business_hours_text && (
                        <p className="paragraph">
                          {/* Use dangerouslySetInnerHTML if you want to preserve line breaks from Firestore */}
                          {/* Alternatively, split by '\n' and map to <p> or <br> */}
                          {findSection("details")
                            .business_hours_text.split("\n")
                            .map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                {index <
                                  findSection(
                                    "details"
                                  ).business_hours_text.split("\n").length -
                                    1 && <br />}
                              </React.Fragment>
                            ))}
                        </p>
                      )}

                      {/* Google Map Embed - Make Dynamic */}
                      {findSection("details").map_embed_url && (
                        <>
                          <h4 className="sub-heading fw-bold mt-5 mb-3">
                            Find Us Here
                          </h4>
                          <div className="map-container rounded-3 overflow-hidden shadow-sm">
                            <iframe
                              src={findSection("details").map_embed_url}
                              width="100%"
                              height="300"
                              style={{ border: 0 }}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Business Location on Google Maps" // Use a dynamic title based on content if possible
                            ></iframe>
                          </div>
                        </>
                      )}
                      {/* Optional: Display map image if you chose that instead of embed */}
                      {/* {findSection('details').map_image_url && (
                                             <>
                                                 <h4 className="sub-heading fw-bold mt-5 mb-3">Find Us Here (Image)</h4>
                                                 <div className="map-container rounded-3 overflow-hidden shadow-sm">
                                                      <img
                                                          src={findSection('details').map_image_url}
                                                          alt="Map Image"
                                                          className="img-fluid"
                                                          onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/600x300?text=Map+Image+Error"}} // Error fallback
                                                      />
                                                 </div>
                                             </>
                                         )} */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ContactPage;
