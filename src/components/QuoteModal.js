import React, { useState, useEffect } from "react";
import "./QuoteModal.css";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
// Import db only if you still need it for fetching foodGradeProducts, otherwise remove
import { db } from "../firebaseConfig";

// Removed hardcoded categoryFormDefinitions object

// Update component signature to accept definition props
const QuoteModal = ({
  show,
  handleClose,
  category_slug,
  formDefinition,
  loadingDefinition,
  definitionError,
}) => {
  const [formData, setFormData] = useState({
    // Initialize with basic fields, dynamic fields handled in useEffect if needed
    name: "",
    email: "",
    // message: "", // Message field might be dynamic
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Submitting state
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Keep foodGradeProducts state and fetch logic if needed for a specific select field
  const [foodGradeProducts, setFoodGradeProducts] = useState([]);

  // Effect to initialize formData when the formDefinition prop changes and modal is shown
  // Or when modal is closed, reset formData
  useEffect(() => {
    if (show && formDefinition && formDefinition.fields) {
      const initialFormData = {};
      (formDefinition.fields || []).forEach((field) => {
        // Initialize based on the definition
        initialFormData[field.name] = "";
      });
      setFormData(initialFormData);
      setErrors({}); // Clear errors on definition change
      setSubmissionError(null); // Clear submission errors
      setSubmissionSuccess(null); // Clear submission success
    } else if (!show) {
      // Reset form state when modal is closed
      setFormData({}); // Reset to empty object
      setErrors({});
      setSubmissionError(null);
      setSubmissionSuccess(null);
    }
  }, [show, formDefinition]); // Depend on show and formDefinition props

  // Fetch products for food-grade-papers (Keep this if needed for a specific select field)
  useEffect(() => {
    const fetchFoodGradeProducts = async () => {
      // Only fetch if modal is shown, a definition is loaded, and it requires the 'product' field for this category
      if (
        show &&
        formDefinition && // Check if definition is loaded
        !loadingDefinition && // Check if definition is NOT loading
        formDefinition.categorySlug === "food-grade-papers" &&
        formDefinition.fields.some(
          (field) => field.name === "product" && field.type === "select"
        )
      ) {
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
          setSubmissionError("Failed to load product options."); // Use submissionError for this error
        }
      } else {
        setFoodGradeProducts([]); // Clear products if not needed or definition not loaded
      }
    };
    // Only fetch if show is true, definition is not loading, and categorySlug matches
    if (show && !loadingDefinition && category_slug === "food-grade-papers") {
      fetchFoodGradeProducts();
    } else {
      setFoodGradeProducts([]); // Clear products if modal closed or criteria not met
    }
  }, [show, formDefinition, loadingDefinition, category_slug, db]); // Depend on relevant props and db

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    // Clear submission success/error messages on input change
    if (submissionError) setSubmissionError(null);
    if (submissionSuccess) setSubmissionSuccess(null);
    // definitionError should persist as it indicates a config issue
  };

  // ValidateForm uses the passed formDefinition prop
  const validateForm = () => {
    if (!formDefinition || !formDefinition.fields) return false;

    const newErrors = {};

    (formDefinition.fields || []).forEach((field) => {
      if (
        field.required &&
        (!formData[field.name] || formData[field.name].trim() === "")
      ) {
        newErrors[field.name] = `${field.label || field.name} is mandatory`;
      }
    });

    // Basic email format validation if email field is present and not empty in formData
    if (
      formData.email &&
      (formDefinition.fields || []).some((field) => field.name === "email")
    ) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = "Invalid email format"; // More specific error message
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent submission if definition is loading, there's a definition error, or form is already submitting
    if (loadingDefinition || definitionError || loading) return;
    if (!formDefinition || !formDefinition.fields) return; // Also prevent if no definition loaded

    if (validateForm()) {
      setLoading(true);
      setSubmissionError(null);
      setSubmissionSuccess(null);
      try {
        // Send Email via Resend API
        const response = await fetch("/api/send-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            categorySlug: category_slug,
            timestamp: new Date().toISOString(),
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setSubmissionSuccess(
            "Your quote request has been submitted successfully! We’ve also emailed you a confirmation."
          );
          // Reset formData based on the successfully loaded definition
          const initialFormData = {};
          (formDefinition.fields || []).forEach((field) => {
            initialFormData[field.name] = "";
          });
          setFormData(initialFormData);

          setTimeout(() => {
            handleClose();
          }, 3000);
        } else {
          console.error("Error from /api/send-quote:", result);
          setSubmissionError(result.message || "Failed to send quote request.");
        }
      } catch (error) {
        console.error("Error submitting request:", error);
        setSubmissionError("Failed to submit quote request.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Render form fields uses the passed formDefinition prop
  const renderFormFields = () => {
    // If definition is loading, error, or not present, renderFormFields should return null.
    // These states are now handled in the main modal JSX.
    if (
      loadingDefinition ||
      definitionError ||
      !formDefinition ||
      !formDefinition.fields
    )
      return null;

    // Name and Email fields - Decide if you want these rendered dynamically from the definition
    // or hardcoded as they are now. If hardcoded, you might still need to filter them out here
    // to avoid rendering duplicates if they are also in the definition's fields array.
    const fieldsToRender = formDefinition.fields || []; // .filter(field => field.name !== 'name' && field.name !== 'email'); // Filter if hardcoded

    return (
      <>
        {fieldsToRender.map((field) => {
          // Skip rendering hardcoded fields if they exist in the definition
          // If 'name' or 'email' are hardcoded in the modal's JSX,
          // uncomment the filter above, or remove the hardcoded inputs below the h5 modal-title.
          // For now, let's assume Name and Email are defined in the admin panel definitions.
          // Remove the hardcoded Name and Email inputs below the h5 modal-title.

          // Let's keep the hardcoded name/email for now and filter them from the dynamic fields
          if (field.name === "name" || field.name === "email") return null;

          return (
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
                // Special handling for 'product' select IF it's tied to a specific category
                field.name === "product" &&
                category_slug === "food-grade-papers" ? ( // Use passed category_slug prop
                  <select
                    className={`form-select ${
                      errors[field.name] ? "is-invalid" : ""
                    }`}
                    id={`quote${field.name}`}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    disabled={loadingDefinition} // Disable select while products are loading
                  >
                    <option value="">Select {field.label}</option>
                    {loadingDefinition ? ( // Use definition loading state or separate product loading if needed
                      <option disabled>Loading options...</option>
                    ) : foodGradeProducts.length > 0 ? (
                      foodGradeProducts.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))
                    ) : (
                      <option disabled>No options available</option> // Or message based on definitionError if relevant
                    )}
                  </select>
                ) : (
                  // General select field using options from definition
                  <select
                    className={`form-select ${
                      errors[field.name] ? "is-invalid" : ""
                    }`}
                    id={`quote${field.name}`}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {(field.options || []).map((option) => (
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
                  required={field.required}
                ></textarea>
              ) : (
                // Default to text input for other types, use type from definition
                <input
                  type={field.type}
                  className={`form-control ${
                    errors[field.name] ? "is-invalid" : ""
                  }`}
                  id={`quote${field.name}`}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required}
                />
              )}
              {errors[field.name] && (
                <div className="invalid-feedback">{errors[field.name]}</div>
              )}
            </div>
          );
        })}
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
            {/* Display definition loading, error, or form based on passed props */}
            {loadingDefinition ? (
              <div>Loading form configuration...</div>
            ) : definitionError ? (
              <div className="alert alert-warning">{definitionError}</div>
            ) : !formDefinition || !formDefinition.fields || formDefinition.fields.length === 0 ? (
              <div>No form configuration available for this category.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Hardcoded Name and Email inputs - consider making these dynamic from definition */}
                {/* If you keep these hardcoded, ensure they are filtered out in renderFormFields */}
                <div className="mb-3">
                  <label htmlFor="quoteName" className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="quoteName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="quoteEmail" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="quoteEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Category-specific fields rendered dynamically */}
                {renderFormFields()}

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
                    disabled={
                      loading ||
                      loadingDefinition ||
                      definitionError ||
                      !formDefinition ||
                      !formDefinition.fields ||
                      formDefinition.fields.length === 0
                    } // Disable if submitting, definition loading, or error
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
