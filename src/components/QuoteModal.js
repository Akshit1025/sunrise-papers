import React, { useState, useEffect } from "react";
import "./QuoteModal.css";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const categoryFormDefinitions = {
  "food-grade-papers": [
    {
      name: "product",
      label: "Product",
      type: "select",
      options: [],
      required: true,
    },
    {
      name: "gsm",
      label: "GSM",
      type: "text",
      required: true,
      tooltip:
        "GSM stands for Grams per Square Meter, with a higher GSM number signifying a thicker and heavier paper.",
    },
    {
      name: "kitValue",
      label: "Kit Value",
      type: "text",
      required: true,
      tooltip:
        "Kit value indicates the level of grease resistance, with higher Kit values signifying greater resistance to oil and grease penetration.",
    },
    {
      name: "rollOrSheet",
      label: "Roll or Sheet",
      type: "select",
      options: ["Roll", "Sheet"],
      required: true,
    },
    { name: "colour", label: "Colour", type: "text", required: false },
    { name: "size", label: "Size", type: "text", required: false },
    { name: "purpose", label: "Purpose", type: "textarea", required: true },
    {
      name: "moq",
      label: "Minimum Order Quantity (MOQ)",
      type: "text",
      required: true,
    },
  ],
  "carbonless-paper": [
    {
      name: "product",
      label: "Product",
      type: "select",
      options: ["CF", "CB", "CFB", "PS"],
      required: true,
    },
    {
      name: "gsm",
      label: "GSM",
      type: "text",
      required: true,
      tooltip:
        "GSM stands for Grams per Square Meter, with a higher GSM number signifying a thicker and heavier paper.",
    },
    {
      name: "rollOrSheet",
      label: "Roll or Sheet",
      type: "select",
      options: ["Roll", "Sheet"],
      required: true,
    },
    { name: "colour", label: "Colour", type: "text", required: false },
    { name: "size", label: "Size", type: "text", required: false },
    { name: "purpose", label: "Purpose", type: "textarea", required: true },
    {
      name: "moq",
      label: "Minimum Order Quantity (MOQ)",
      type: "text",
      required: true,
    },
  ],
  "coated-paper": [
    {
      name: "gsm",
      label: "GSM",
      type: "text",
      required: true,
      tooltip:
        "GSM stands for Grams per Square Meter, with a higher GSM number signifying a thicker and heavier paper.",
    },
    { name: "colour", label: "Colour", type: "text", required: true },
    { name: "purpose", label: "Purpose", type: "textarea", required: true },
    {
      name: "moq",
      label: "Minimum Order Quantity (MOQ)",
      type: "text",
      required: true,
    },
  ],
  default: [
    { name: "message", label: "Message", type: "textarea", required: true },
  ],
};

const QuoteModal = ({ show, handleClose, category_slug }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [foodGradeProducts, setFoodGradeProducts] = useState([]);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      const currentDefinition =
        categoryFormDefinitions[category_slug] ||
        categoryFormDefinitions["default"];
      const initialFormData = {
        name: "",
        email: "",
        message: "",
      };
      currentDefinition.forEach((field) => {
        initialFormData[field.name] = "";
      });
      setFormData(initialFormData);
      setErrors({});
      setSubmissionError(null);
      setSubmissionSuccess(null);
    }
  }, [show, category_slug]);

  // Fetch products for food-grade-papers
  useEffect(() => {
    const fetchFoodGradeProducts = async () => {
      if (show && category_slug === "food-grade-papers") {
        try {
          const productsRef = collection(db, "products");
          const q = query(
            productsRef,
            where("category_slug", "==", "food-grade-papers")
          );
          const snapshot = await getDocs(q);
          const productNames = snapshot.docs.map((doc) => doc.data().name);
          setFoodGradeProducts(productNames);
        } catch (error) {
          console.error("Error fetching products:", error);
          setSubmissionError("Failed to load product options.");
        }
      }
    };
    fetchFoodGradeProducts();
  }, [show, category_slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    if (submissionError) setSubmissionError(null);
    if (submissionSuccess) setSubmissionSuccess(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is mandatory";
    if (!formData.email) {
      newErrors.email = "Email is mandatory";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email";
    }
    const requiredFields = getRequiredFields(category_slug);
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        const def = categoryFormDefinitions[category_slug]?.find(
          (f) => f.name === field
        );
        newErrors[field] = `${def?.label || field} is mandatory`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setSubmissionError(null);
      setSubmissionSuccess(null);
      try {
        // 1) Save to Firestore
        const quoteRequestsRef = collection(db, "quoteRequests");
        await addDoc(quoteRequestsRef, {
          ...formData,
          timestamp: new Date(),
          categorySlug: category_slug,
          status: "new",
        });

        // 2) Send Email via Resend API
        await fetch("/api/send-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        setSubmissionSuccess(
          "Your quote request has been submitted successfully! We’ve also emailed you a confirmation."
        );
        handleClose();
      } catch (error) {
        console.error("Error submitting request:", error);
        setSubmissionError("Failed to submit quote request.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getRequiredFields = (slug) => {
    const definition =
      categoryFormDefinitions[slug] || categoryFormDefinitions["default"];
    const alwaysRequired = ["name", "email"];
    const categorySpecificRequired = definition
      .filter((field) => field.required)
      .map((field) => field.name);
    return [...new Set([...alwaysRequired, ...categorySpecificRequired])];
  };

  const renderFormFields = (slug) => {
    const definition =
      categoryFormDefinitions[slug] || categoryFormDefinitions["default"];
    return (
      <>
        {definition.map(
          (field) =>
            field.name !== "name" &&
            field.name !== "email" && (
              <div className="mb-3" key={field.name}>
                <label htmlFor={`quote${field.name}`} className="form-label">
                  {field.label}{" "}
                  {field.required && <span className="text-danger">*</span>}
                  {field.tooltip && (
                    <span className="tooltip-container">
                      <i className="fas fa-info-circle info-icon"></i>
                      <span className="tooltip-text">{field.tooltip}</span>
                    </span>
                  )}
                </label>
                {field.type === "select" ? (
                  field.name === "product" && slug === "food-grade-papers" ? (
                    <select
                      className={`form-select ${
                        errors[field.name] ? "is-invalid" : ""
                      }`}
                      id={`quote${field.name}`}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select {field.label}</option>
                      {foodGradeProducts.length > 0 ? (
                        foodGradeProducts.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      ) : (
                        <option disabled>No products available</option>
                      )}
                    </select>
                  ) : (
                    <select
                      className={`form-select ${
                        errors[field.name] ? "is-invalid" : ""
                      }`}
                      id={`quote${field.name}`}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )
                ) : field.type === "textarea" ? (
                  <textarea
                    className={`form-control ${
                      errors[field.name] ? "is-invalid" : ""
                    }`}
                    id={`quote${field.name}`}
                    name={field.name}
                    rows="3"
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  ></textarea>
                ) : (
                  <input
                    type={field.type}
                    className={`form-control ${
                      errors[field.name] ? "is-invalid" : ""
                    }`}
                    id={`quote${field.name}`}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  />
                )}
                {errors[field.name] && (
                  <div className="invalid-feedback">{errors[field.name]}</div>
                )}
              </div>
            )
        )}
      </>
    );
  };

  const modalClassName = `modal fade ${show ? "show" : ""}`;
  const modalStyle = {
    display: show ? "block" : "none",
    backgroundColor: show ? "rgba(0,0,0,0.5)" : "transparent",
    overflowY: "auto",
  };

  return (
    <div
      className={modalClassName}
      style={modalStyle}
      tabIndex="-1"
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Get a Quote</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="quoteName" className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="quoteName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="quoteEmail" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="quoteEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              {/* Category-specific fields */}
              {renderFormFields(category_slug)}

              {/* Error / Success Alerts */}
              {submissionError && (
                <div className="alert alert-danger">{submissionError}</div>
              )}
              {submissionSuccess && (
                <div className="alert alert-success">{submissionSuccess}</div>
              )}

              {/* Submit */}
              <div className="d-flex justify-content-center mt-3">
                <button
                  type="submit"
                  className="btn btn-outline-dark btn-lg rounded-pill"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit Quote Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
