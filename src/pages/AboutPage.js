// src/pages/AboutPage.js

import React from "react";

const AboutPage = () => (
  <>
    {/* About Us Hero Section */}
    <section className="about-hero-section py-5 text-center text-white d-flex align-items-center justify-content-center">
      <div className="container animate__animated animate__fadeIn">
        <h1 className="display-3 fw-bold mb-3 about-hero-title">About Us</h1>
        <p className="lead about-hero-subtitle">
          Your trusted partner in paper trading industry since 1990.
        </p>
      </div>
    </section>

    {/* A Glance at Sunrise Papers */}
    <section className="glance-at-sunrise-section py-5">
      <div className="container">
        <h2 className="page-title text-center mb-5">A Glance at Sunrise</h2>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <p className="paragraph lead animate__animated animate__fadeInLeft animate__delay-0-5s">
              Established in 1990, Sunrise Papers is a leading{" "}
              <b>Importer, Trader, and Wholesale Supplier</b> of Carbonless and
              Baking Paper. Our range is highly demanded for its optimum
              quality. All the efforts of the company to ensure excellent
              quality products have enabled them to build long-lasting business
              relationships with their clients.
            </p>
            <p className="paragraph animate__animated animate__fadeInLeft animate__delay-1s">
              The provided products are conceptualized with a client-oriented
              approach to bring extreme gratification to our patrons. The
              offered gamut of products is rendered in obedience to the quality
              constraints by our competent experts with a rich understanding of
              this field. Through continuous adaptation to industry trends and
              innovative strategies, Sunrise Papers remains at the forefront of
              delivering top-tier paper solutions that cater to the diverse
              needs of our discerning customers.
            </p>
          </div>
          <div className="col-lg-6">
            <img
              src="images/about-glance-img.jpeg"
              alt="Paper Supply"
              className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Our Team Section */}
    <section className="our-team-section py-5 bg-light">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 order-lg-2">
            <img
              src="https://placehold.co/600x400/999999/ffffff?text=Our+Owner"
              alt="Our Owner"
              className="img-fluid rounded-3 shadow-lg animate__animated animate__fadeInRight"
            />
          </div>
          <div className="col-lg-6 order-lg-1">
            <h2
              className="page-title text-start animate__animated animate__fadeInLeft"
              style={{
                color: "var(--sp-dark-gray)",
                borderBottom: "none",
                paddingBottom: "0",
              }}
            >
              Our Accomplishment Story
            </h2>
            <p className="paragraph lead animate__animated animate__fadeInLeft animate__delay-0-5s">
              For our accomplishment story, we are grateful to our owner,{" "}
              <b>Mr. Dinesh Gupta</b>, whose continual backing and direction
              have been useful to us for attaining exponential development in
              the current market.
            </p>
            <p className="paragraph animate__animated animate__fadeInLeft animate__delay-1s">
              We have an adroit team of quality people that value the quality of
              our provided products at each stage to make sure that the norms
              are effectively met. We direct all our activities to cater to the
              expectations of customers by providing them excellent quality
              products as per their gratifications. Moreover, we follow moral
              business policies and crystal pure transparency in all our
              transactions to keep healthy relations with the customers.
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
              src="images/about-profile-img.jpg"
              alt="Paper Rolls Storage"
              className="img-fluid rounded-3 shadow-lg mb-4 animate__animated animate__fadeInLeft"
            />
          </div>
          <div className="col-lg-6">
            <h3 className="sub-heading fw-bold mb-3 animate__animated animate__fadeInRight">
              Basic Information:
            </h3>
            <ul className="list-unstyled company-info-list">
              <li className="animate__animated animate__fadeInRight animate__delay-0-3s">
                <i className="fas fa-dot-circle me-2"></i>{" "}
                <strong>Nature of Business:</strong> Wholesale Supplier
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-0-6s">
                <i className="fas fa-dot-circle me-2"></i>{" "}
                <strong>Additional Business:</strong> Trader and Importer
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-0-9s">
                <i className="fas fa-dot-circle me-2"></i>{" "}
                <strong>Company CEO:</strong> Dinesh Gupta
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-1-2s">
                <i className="fas fa-map-marker-alt me-2"></i>{" "}
                <strong>Registered Address:</strong> 107, Vardhman, Crystal
                Plaza, CD Block, Pitampura, Delhi- 110088, Delhi, India
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-1-5s">
                <i className="fas fa-users me-2"></i>{" "}
                <strong>Total No. of Employees:</strong> 11 to 25 people
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-1-8s">
                <i className="fas fa-calendar-alt me-2"></i>{" "}
                <strong>Year of Establishment:</strong> 1990
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-2-1s">
                <i className="fas fa-balance-scale me-2"></i>{" "}
                <strong>Legal Status of Firm:</strong> Individual - Proprietor
              </li>
              <li className="animate__animated animate__fadeInRight animate__delay-2-4s">
                <i className="fas fa-wallet me-2"></i>{" "}
                <strong>Annual Turnover:</strong> Rs. 25 - 50 Crores
              </li>
              {/* Moved GST No. here from Statutory Profile */}
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
            <h2
              className="page-title text-center animate__animated animate__fadeIn"
              style={{ borderBottom: "none", paddingBottom: "0" }}
            >
              WHY US?
            </h2>
          </div>
          <div className="col-lg-6 order-lg-1">
            <p className="paragraph lead animate__animated animate__fadeInLeft animate__delay-0-5s">
              We have been immersed in the realm of presenting to our clients an
              extensive variety of products. Following are the reasons for our
              success:
            </p>
            <ul className="list-unstyled values-list">
              <li className="animate__animated animate__fadeInLeft animate__delay-0-7s">
                <i className="fas fa-shipping-fast me-2"></i>{" "}
                Prompt delivery of an order
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-0-9s">
                <i className="fas fa-handshake me-2"></i> Ethical
                business deals
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-1-1s">
                <i className="fas fa-shield-alt me-2"></i>{" "}
                Transparency
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-1-3s">
                <i className="fas fa-tags me-2"></i> Attractive
                Prices with technically superior products
              </li>
              <li className="animate__animated animate__fadeInLeft animate__delay-1-5s">
                <i className="fas fa-globe me-2"></i> Huge
                distribution network
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
          <div className="col-lg-6">
            <h2
              className="page-title text-start animate__animated animate__fadeInLeft"
              style={{
                color: "var(--sp-dark-gray)",
                borderBottom: "none",
                paddingBottom: "0",
              }}
            >
              Quality Assurance
            </h2>
            <p className="paragraph lead animate__animated animate__fadeInLeft animate__delay-0-5s">
              As a Wholesale Supplier and Importer, our sole emphasis &
              objective has always been the quality of our paper products. Made
              out of high-quality imported chemicals, our product range is
              prepared by skillful artisans & workforce.
            </p>
            <p className="paragraph animate__animated animate__fadeInLeft animate__delay-1s">
              Our products go under strict quality checks in the pre &
              post-manufacture process to avoid faults & defects when the
              materials reach our clients. The detailed workmanship of our team
              is involved in the production process right from the selection of
              the materials to their finalization.
            </p>
          </div>
          <div className="col-lg-6 text-center">
            <img
              src="images/about-quality-img.png"
              alt="Quality Seal"
              className="img-fluid quality-seal-img animate__animated animate__fadeInRight"
            />
          </div>
        </div>
      </div>
    </section>
  </>
);

export default AboutPage;
