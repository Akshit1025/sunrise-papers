// src/pages/AboutPage.js

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Import doc and getDoc
import { db } from "../firebaseConfig.js"; // Import db

// Define a default structure for the About page content (copy from ContentManagement.js)
const defaultAboutContent = {
  sections: [
    {
      name: "aboutGlance",
      title: "A Glance at Sunrise Papers",
      paragraphs: [
        "Established in 1995, Sunrise Papers is a leading importer...",
        "Our success is built...",
        "We remain at the forefront...",
      ],
      image_url: "images/about/about-glance-img.jpeg",
    },
    {
      name: "philosophy",
      title: "Paper Supply Philosophy",
      icon_class: "fas fa-lightbulb",
      paragraph: "We believe in delivering only the best...",
    },
    {
      name: "leadership",
      title: "Our Leadership",
      quote:
        "\"It's not about how many years I've worked - it's about how much those years have taught me.\"", // Escaped quote
      quote_author: "Mr. Dinesh Gupta",
      paragraph: "Under the insightful leadership of Mr. Dinesh Gupta...",
      image_url: "images/logo-no-bg.png",
    },
    {
      name: "companyProfile",
      title: "Company Profile",
      image_url: "images/about/about-profile-img.jpg",
      info_list: [
        {
          icon_class: "fas fa-dot-circle",
          label: "Nature of Business",
          value: "Trader and Importer",
        },
        {
          icon_class: "fas fa-dot-circle",
          label: "Additional Business",
          value: "Wholesale Supplier",
        },
        {
          icon_class: "fas fa-dot-circle",
          label: "Company Owner",
          value: "Dinesh Gupta",
        },
        {
          icon_class: "fas fa-map-marker-alt",
          label: "Registered Address",
          value:
            "Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka, Delhi, 110078, India",
        },
        {
          icon_class: "fas fa-users",
          label: "Total No. of Employees",
          value: "11 to 25 people",
        },
        {
          icon_class: "fas fa-calendar-alt",
          label: "Year of Establishment",
          value: "1995",
        },
        {
          icon_class: "fas fa-balance-scale",
          label: "Legal Status of Firm",
          value: "Individual - Proprietor",
        },
        {
          icon_class: "fas fa-wallet",
          label: "Annual Turnover",
          value: "Rs. 25 - 50 Crores",
        },
        {
          icon_class: "fas fa-barcode",
          label: "GST No.",
          value: "07AAJPK3664M1Z9",
        },
      ],
    },
    {
      name: "whyUs",
      title: "WHY US ?",
      icon_class: "fas fa-question-circle",
      intro_paragraph: "Over the years, we have established a reputation...",
      values_list: [
        {
          icon_class: "fas fa-shipping-fast",
          text: "Prompt and Reliable Delivery",
        },
        {
          icon_class: "fas fa-handshake",
          text: "Ethical and Transparent Business Practices",
        },
        {
          icon_class: "fas fa-tags",
          text: "Competitive Pricing with Technically Advanced Products",
        },
        {
          icon_class: "fas fa-globe",
          text: "Widespread and Efficient Distribution Network",
        },
        {
          icon_class: "fas fa-check-circle",
          text: "Consistent Product Quality and Client Satisfaction",
        },
      ],
    },
    {
      name: "qualityAssurance",
      title: "Our Commitment to Quality",
      image_url: "images/about/about-quality-img.png",
      paragraphs: [
        "As a dedicated wholesale supplier and importer, our foremost priority...",
        "Our product range is crafted...",
        "We maintain detailed oversight...",
      ],
    },
  ],
};

const AboutPage = () => {
  const [aboutContent, setAboutContent] = useState(defaultAboutContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "siteContent", "about");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Merge with default to ensure all fields are present if not in DB
          setAboutContent({
            ...defaultAboutContent, // Start with defaults
            ...docSnap.data(), // Overlay fetched data
            sections: Array.isArray(docSnap.data().sections)
              ? docSnap.data().sections.map((fetchedSection) => {
                  const defaultSection = defaultAboutContent.sections.find(
                    (ds) => ds.name === fetchedSection.name
                  );
                  return {
                    ...defaultSection, // Start with default section
                    ...fetchedSection, // Overlay fetched
                    // Explicitly handle merging arrays within sections
                    paragraphs: Array.isArray(fetchedSection.paragraphs)
                      ? fetchedSection.paragraphs
                      : defaultSection?.paragraphs || [],
                    info_list: Array.isArray(fetchedSection.info_list)
                      ? fetchedSection.info_list
                      : defaultSection?.info_list || [],
                    values_list: Array.isArray(fetchedSection.values_list)
                      ? fetchedSection.values_list
                      : defaultSection?.values_list || [],
                    // Add similar checks for any other arrays within about sections
                  };
                })
              : defaultAboutContent.sections, // Fallback to default about sections
          });
        } else {
          // Document does not exist, use default content
          setAboutContent(defaultAboutContent);
        }
      } catch (e) {
        console.error("Error fetching About page content:", e);
        setError("Failed to load About page content.");
        setAboutContent(defaultAboutContent); // Fallback to default on error
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []); // Empty dependency array means this runs once on mount

  // Helper function to find a section by name
  const findSection = (name) =>
    aboutContent.sections.find((s) => s.name === name);

  return (
    <>
      {/* About Us Hero Section (Static or potentially make dynamic) */}
      <section className="about-hero-section py-5 text-center text-white d-flex align-items-center justify-content-center">
        <div className="container animate__animated animate__fadeIn">
          {/* You might want to fetch hero title/subtitle if they are editable */}
          <h1 className="display-3 fw-bold mb-3 about-hero-title">About Us</h1>
          <p className="lead about-hero-subtitle">
            Your trusted partner in paper trading industry since 1995.
          </p>
        </div>
      </section>

      {/* A Glance at Sunrise Papers */}
      {loading ? (
        <div className="text-center py-5">Loading ...</div>
      ) : error ? (
        <div className="alert alert-danger text-center message-box py-5">
          {error}
        </div>
      ) : (
        <>
          {/* A Glance at Sunrise Papers Section */}
          {findSection("aboutGlance") && (
            <section className="glance-at-sunrise-section py-5">
              <div className="container">
                <h2 className="page-title text-center mb-5">
                  {findSection("aboutGlance").title ||
                    "A Glance at Sunrise Papers"}
                </h2>
                <div className="row align-items-center g-5">
                  <div className="col-lg-6">
                    <img
                      src={
                        findSection("aboutGlance").image_url ||
                        "images/about/about-glance-img.jpeg"
                      }
                      alt={
                        findSection("aboutGlance").title ||
                        "A Glance at Sunrise Papers"
                      } // Use title as alt text
                      className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInLeft"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Error";
                      }} // Error fallback
                    />
                  </div>
                  <div className="col-lg-6">
                    {(findSection("aboutGlance").paragraphs || []).map(
                      (para, index) => (
                        <p
                          key={index}
                          className={`paragraph ${
                            index === 0 ? "lead" : ""
                          } animate__animated animate__fadeInRight animate__delay-${
                            index * 0.5 + 0.5
                          }s`}
                        >
                          {para}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Paper Supply Philosophy Section */}
          {findSection("philosophy") && (
            <section className="paper-philosophy-section py-5">
              <div className="container">
                <h2 className="page-title text-center mb-5">
                  {findSection("philosophy").title || "Paper Supply Philosophy"}
                </h2>
                <div className="row justify-content-center">
                  <div className="col-lg-8 text-center">
                    {findSection("philosophy").icon_class && (
                      <i
                        className={`${
                          findSection("philosophy").icon_class
                        } philosophy-icon animate__animated animate__fadeInDown mb-4`}
                      ></i>
                    )}
                    {findSection("philosophy").paragraph && (
                      <p className="paragraph lead animate__animated animate__fadeInUp animate__delay-0-5s">
                        {findSection("philosophy").paragraph}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Our Leadership Section */}
          {findSection("leadership") && (
            <section className="our-team-section py-5 bg-light">
              <div className="container">
                <div className="row align-items-center g-5">
                  <div className="col-lg-6 order-lg-2">
                    <img
                      src={
                        findSection("leadership").image_url ||
                        "images/logo-no-bg.png"
                      }
                      alt={findSection("leadership").title || "Our Leadership"} // Use title as alt text
                      className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Error";
                      }} // Error fallback
                    />
                  </div>
                  <div className="col-lg-6 order-lg-1">
                    <h2 className="page-title text-start animate__animated animate__fadeInLeft">
                      {findSection("leadership").title || "Our Leadership"}
                    </h2>
                    {findSection("leadership").quote && (
                      <blockquote className="leadership-quote animate__animated animate__fadeInLeft animate__delay-0-5s">
                        <p className="mb-2">
                          {findSection("leadership").quote}
                        </p>
                        {findSection("leadership").quote_author && (
                          <footer className="blockquote-footer mt-2">
                            {findSection("leadership").quote_author}
                          </footer>
                        )}
                      </blockquote>
                    )}
                    {findSection("leadership").paragraph && (
                      <p className="paragraph animate__animated animate__fadeInLeft animate__delay-1s">
                        {findSection("leadership").paragraph}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Company Profile Section */}
          {findSection("companyProfile") && (
            <section className="company-profile-section py-5">
              <div className="container">
                <h2 className="page-title text-center mb-5">
                  {findSection("companyProfile").title || "Company Profile"}
                </h2>
                <div className="row g-5">
                  <div className="col-lg-6">
                    <img
                      src={
                        findSection("companyProfile").image_url ||
                        "images/about/about-profile-img.jpg"
                      }
                      alt={
                        findSection("companyProfile").title || "Company Profile"
                      } // Use title as alt text
                      className="img-fluid rounded-3 shadow-lg mb-4 animate__animated animate__fadeInLeft"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Error";
                      }} // Error fallback
                    />
                  </div>
                  <div className="col-lg-6">
                    <ul className="list-unstyled company-info-list">
                      {(findSection("companyProfile").info_list || []).map(
                        (item, index) => (
                          <li
                            key={index}
                            className={`animate__animated animate__fadeInRight animate__delay-${
                              index * 0.3
                            }s`}
                          >
                            {item.icon_class && (
                              <i className={`${item.icon_class} me-2`}></i>
                            )}
                            <strong>{item.label}:</strong> {item.value}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Why Us Section */}
          {findSection("whyUs") && (
            <section className="why-us-section py-5">
              <div className="container">
                <div className="row align-items-center g-5">
                  <div className="col-lg-6 order-lg-2 text-center">
                    {findSection("whyUs").icon_class && (
                      <i
                        className={`${
                          findSection("whyUs").icon_class
                        } fa-8x text-muted mb-4 animate__animated animate__zoomIn`}
                      ></i>
                    )}
                  </div>
                  <div className="col-lg-6 order-lg-1">
                    <h2 className="page-title text-start animate__animated animate__fadeInLeft">
                      {findSection("whyUs").title || "WHY US ?"}
                    </h2>
                    {findSection("whyUs").intro_paragraph && (
                      <p className="paragraph lead animate__animated animate__fadeInLeft animate__delay-0-5s">
                        {findSection("whyUs").intro_paragraph}
                      </p>
                    )}
                    <ul className="list-unstyled values-list">
                      {(findSection("whyUs").values_list || []).map(
                        (item, index) => (
                          <li
                            key={index}
                            className={`animate__animated animate__fadeInLeft animate__delay-${
                              index * 0.2 + 0.7
                            }s`}
                          >
                            {item.icon_class && (
                              <i className={`${item.icon_class} me-2`}></i>
                            )}{" "}
                            {item.text}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Quality Assurance Section */}
          {findSection("qualityAssurance") && (
            <section className="quality-assurance-section py-5 bg-light">
              <div className="container">
                <div className="row align-items-center g-5">
                  <div className="col-lg-6 text-center">
                    <img
                      src={
                        findSection("qualityAssurance").image_url ||
                        "images/about/about-quality-img.png"
                      }
                      alt={
                        findSection("qualityAssurance").title ||
                        "Our Commitment to Quality"
                      } // Use title as alt text
                      className="img-fluid quality-seal-img animate__animated animate__fadeInLeft"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Error";
                      }} // Error fallback
                    />
                  </div>
                  <div className="col-lg-6">
                    <h2 className="page-title text-start animate__animated animate__fadeInRight">
                      {findSection("qualityAssurance").title ||
                        "Our Commitment to Quality"}
                    </h2>
                    {(findSection("qualityAssurance").paragraphs || []).map(
                      (para, index) => (
                        <p
                          key={index}
                          className={`paragraph ${
                            index === 0 ? "lead" : ""
                          } animate__animated animate__fadeInRight animate__delay-${
                            index * 0.5 + 0.5
                          }s`}
                        >
                          {para}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default AboutPage;
