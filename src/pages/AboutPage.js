// src/pages/AboutPage.js

import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => (
  <div className="py-5">
    <div className="container">
      <h2 className="page-title" style={{ color: "var(--sp-dark-gray)" }}>
        About Us
      </h2>
      <p className="paragraph lead">
        Founded in 20XX, Sunrise Papers has rapidly grown to become a leader in
        the paper trading industry, driven by a commitment to innovation,
        quality, and environmental stewardship.
      </p>

      <div className="row g-5 mt-4 align-items-center">
        <div className="col-md-6 order-md-2">
          <img
            src="https://placehold.co/600x400/dddddd/333333?text=Our+Team"
            alt="Our Team"
            className="img-fluid rounded shadow-lg animate__animated animate__fadeInRight"
          />
        </div>
        <div className="col-md-6 order-md-1">
          <h3 className="sub-heading fw-bold mb-3">Our Mission</h3>
          <p className="paragraph">
            Our mission is to deliver exceptional value to our clients through
            sustainable and high-quality paper products, fostering long-term
            partnerships built on trust, integrity, and mutual success. We aim
            to be at the forefront of eco-friendly paper solutions.
          </p>
          <h3 className="sub-heading fw-bold mt-4 mb-3">Our Vision</h3>
          <p className="paragraph">
            To be the global leader in sustainable paper **supply and
            distribution**, recognized for our innovative products, operational
            excellence, and unwavering commitment to a greener future. We
            envision a world where essential paper products are **sourced and
            supplied** with minimal environmental impact.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      <div className="row g-5 align-items-center">
        <div className="col-md-6">
          <img
            src="https://placehold.co/600x400/dddddd/333333?text=Our+Values"
            alt="Our Values"
            className="img-fluid rounded shadow-lg animate__animated animate__fadeInLeft"
          />
        </div>
        <div className="col-md-6">
          <h3 className="sub-heading fw-bold mb-3">Our Core Values</h3>
          <ul className="list-unstyled values-list">
            <li className="mb-2">
              <i className="fas fa-check-circle me-2 text-primary"></i>{" "}
              <strong>Quality:</strong> Delivering superior products that meet
              and exceed expectations.
            </li>
            <li className="mb-2">
              <i className="fas fa-check-circle me-2 text-primary"></i>{" "}
              <strong>Sustainability:</strong> Protecting our planet through
              responsible resource management and **ethical sourcing**.
            </li>
            <li className="mb-2">
              <i className="fas fa-check-circle me-2 text-primary"></i>{" "}
              <strong>Innovation:</strong> Constantly seeking new ways to
              improve and excel.
            </li>
            <li className="mb-2">
              <i className="fas fa-check-circle me-2 text-primary"></i>{" "}
              <strong>Integrity:</strong> Operating with honesty, transparency,
              and ethical conduct.
            </li>
            <li className="mb-2">
              <i className="fas fa-check-circle me-2 text-primary"></i>{" "}
              <strong>Customer Focus:</strong> Prioritizing client needs and
              building lasting relationships.
            </li>
          </ul>
          <Link to="/contact" className="btn btn-dark mt-4">
            Get in Touch
          </Link>
        </div>
      </div>

      <div className="text-center mt-5">
        <h3 className="sub-heading fw-bold mb-3">
          Meet Our Team (Placeholder)
        </h3>
        <p className="paragraph">
          Our success is powered by a dedicated team of experts. Coming soon:
          detailed profiles of our leadership.
        </p>
      </div>
    </div>
  </div>
);

export default AboutPage;
