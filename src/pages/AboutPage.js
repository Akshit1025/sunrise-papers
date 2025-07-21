// src/pages/AboutPage.js

import React from "react";

const AboutPage = () => (
  <>
    {/* About Us Hero Section */}
    <section className="about-hero-section py-5 text-center text-white d-flex align-items-center justify-content-center">
      <div className="container animate__animated animate__fadeIn">
        <h1 className="display-3 fw-bold mb-3 about-hero-title">About Us</h1>
        <p className="lead about-hero-subtitle">
          Your trusted partner in paper trading industry since 1995.
        </p>
      </div>
    </section>

    {/* A Glance at Sunrise Papers */}
    <section className="glance-at-sunrise-section py-5">
      <div className="container">
        <h2 className="page-title text-center mb-5">
          A Glance at Sunrise Papers
        </h2>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <img
              src="images/about/about-glance-img.jpeg"
              alt="Paper Supply"
              className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInLeft"
            />
          </div>
          <div className="col-lg-6">
            <p className="paragraph lead animate__animated animate__fadeInRight animate__delay-0-5s">
              Established in 1995, Sunrise Papers is a leading importer, trader,
              and wholesale supplier of high-quality carbonless paper and
              food-grade paper. Known for our consistent quality and
              client-centric approach, our products are trusted across
              industries for their reliability and performance.
            </p>
            <p className="paragraph animate__animated animate__fadeInRight animate__delay-1s">
              Our success is built so strong, long-term relationships with
              clients - a result of our unwavering commitment to quality and
              service. Every product in our range is carefully selected and
              offered to deliver maximum value satisfaction. From procurement to
              supply, we maintain strict adherence to industry standards, guided
              by a team of experience professionals with deep domain knowledge.
            </p>
            <p className="paragraph animate__animated animate__fadeInRight animate__delay-1-5s">
              We remain at the forefront of the paper industry by staying
              attuned to market trends, embracing innovation, and continually
              refining our product offerings to meet the evolving needs of our
              customers.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* New: Paper Supply Philosophy Section */}
    <section className="paper-philosophy-section py-5">
      <div className="container">
        <h2 className="page-title text-center mb-5">Paper Supply Philosophy</h2>
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <i className="fas fa-lightbulb philosophy-icon animate__animated animate__fadeInDown mb-4"></i>
            <p className="paragraph lead animate__animated animate__fadeInUp animate__delay-0-5s">
              We believe in delivering only the best, high-grade paper products
              that combine functionality, hygiene, and durability. Accurate
              selection supports both food-grade and documentation needs with
              precision and care.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Our Leadership Section (formerly Our Team Section) */}
    <section className="our-team-section py-5 bg-light">
      {" "}
      {/* Retaining class for existing CSS */}
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 order-lg-2">
            <img
              src="images/logo-no-bg.png"
              alt="Our Owner"
              className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
            />
          </div>
          <div className="col-lg-6 order-lg-1">
            <h2
              className="page-title text-start animate__animated animate__fadeInLeft"
              style={{
                color: "var(--sp-dark-gray)", // This will be overridden by royal theme CSS
                borderBottom: "none",
                paddingBottom: "0",
              }}
            >
              Our Leadership
            </h2>
            {/* Styled Quote */}
            <blockquote className="leadership-quote animate__animated animate__fadeInLeft animate__delay-0-5s">
              <p className="mb-2">
                "It's not about how many years I've worked - it's about how much
                those years have taught me."
              </p>
              <footer className="blockquote-footer mt-2">
                Mr. Dinesh Gupta
              </footer>
            </blockquote>
            {/* New Paragraph */}
            <p className="paragraph animate__animated animate__fadeInLeft animate__delay-1s">
              Under the insightful leadership of Mr. Dinesh Gupta, Sunrise
              Papers has grown with purpose and vision. His experience-driven
              guidance continues to shape our commitment to quality, trust, and
              long-term growth.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Company Profile Section */}
    <section className="company-profile-section py-5">
      <div className="container">
        <h2 className="page-title text-center mb-5">Company Profile</h2>
        <div className="row g-5">
          <div className="col-lg-6">
            <img
              src="images/about/about-profile-img.jpg"
              alt="Paper Rolls Storage"
              className="img-fluid rounded-3 shadow-lg mb-4 animate__animated animate__fadeInLeft"
            />
          </div>
          <div className="col-lg-6">
            <ul className="list-unstyled company-info-list">
              <li className="animate__animated animate__fadeInRight animate__delay-0-3s">
                <i className="fas fa-dot-circle me-2"></i>{" "}
                <strong>Nature of Business:</strong> Trader and Importer
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-0-6s">
                <i className="fas fa-dot-circle me-2"></i>{" "}
                <strong>Additional Business:</strong> Wholesale Supplier
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-0-9s">
                <i className="fas fa-dot-circle me-2"></i>{" "}
                <strong>Company Owner:</strong> Dinesh Gupta
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-1-2s">
                <i className="fas fa-map-marker-alt me-2"></i>{" "}
                <strong>Registered Address:</strong> Unit No. 390, Vegas Mall,
                Plot No. 6, Sector 14, Dwarka, Delhi, 110078, India
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-1-5s">
                <i className="fas fa-users me-2"></i>{" "}
                <strong>Total No. of Employees:</strong> 11 to 25 people
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-1-8s">
                <i className="fas fa-calendar-alt me-2"></i>{" "}
                <strong>Year of Establishment:</strong> 1995
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-2-1s">
                <i className="fas fa-balance-scale me-2"></i>{" "}
                <strong>Legal Status of Firm:</strong> Individual - Proprietor
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-2-4s">
                <i className="fas fa-wallet me-2"></i>{" "}
                <strong>Annual Turnover:</strong> Rs. 25 - 50 Crores
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-2-7s">
                <i className="fas fa-barcode me-2"></i>{" "}
                <strong>GST No.:</strong> 07AAJPK3664M1Z9
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Why Us Section */}
    <section className="why-us-section py-5">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 order-lg-2 text-center">
            <i className="fas fa-question-circle fa-8x text-muted mb-4 animate__animated animate__zoomIn"></i>
          </div>
          <div className="col-lg-6 order-lg-1">
            <h2
              className="page-title text-start animate__animated animate__fadeInLeft"
              style={{
                borderBottom: "none",
                paddingBottom: "0",
                color: "var(--sp-dark-gray)", // This will be overridden by royal theme CSS
              }}
            >
              WHY US ?
            </h2>
            <p className="paragraph lead animate__animated animate__fadeInLeft animate__delay-0-5s">
              Over the years, we have established a reputation for providing a
              comprehensive and reliable range of paper solutions tailored to
              our clients' specific needs. The following key strengths drive our
              continued success:
            </p>
            <ul className="list-unstyled values-list">
              <li className="animate__animated animate__fadeInLeft animate__delay-0-7s">
                <i className="fas fa-shipping-fast me-2"></i> Prompt and
                Reliable Delivery
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-0-9s">
                <i className="fas fa-handshake me-2"></i> Ethical and
                Transparent Business Practices
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-1-1s">
                <i className="fas fa-tags me-2"></i> Competitive Pricing with
                Technically Advanced Products
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-1-3s">
                <i className="fas fa-globe me-2"></i> Widespread and Efficient
                Distribution Network
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-1-5s">
                <i className="fas fa-check-circle me-2"></i> Consistent Product
                Quality and Client Satisfaction
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Quality Assurance Section */}
    <section className="quality-assurance-section py-5 bg-light">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-center">
            <img
              src="images/about/about-quality-img.png"
              alt="Quality Seal"
              className="img-fluid quality-seal-img animate__animated animate__fadeInLeft"
            />
          </div>
          <div className="col-lg-6">
            <h2
              className="page-title text-start animate__animated animate__fadeInRight"
              style={{
                color: "var(--sp-dark-gray)", // This will be overridden by royal theme CSS
                borderBottom: "none",
                paddingBottom: "0",
              }}
            >
              Our Commitment to Quality
            </h2>
            <p className="paragraph lead animate__animated animate__fadeInRight animate__delay-0-5s">
              As a dedicated wholesale supplier and importer, our foremost
              priority has always been the quality of the paper we provide.
            </p>
            <p className="paragraph animate__animated animate__fadeInRight animate__delay-1s">
              Our product range is crafted using high-grade imported raw
              materials and chemicals, handled by a skilled and experienced
              workforce. Every batch undergoes rigorous quality checks - both
              before and after production - to ensure defect-free delivery.
            </p>
            <p className="paragraph animate__animated animate__fadeInRight animate__delay-1-5s">
              We maintain detailed oversight throughout the process, from
              material selection to final dispatch, ensuring that only
              precision-finished, high-performance paper products reach our
              customers.
            </p>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default AboutPage;
