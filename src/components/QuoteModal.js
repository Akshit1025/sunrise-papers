import React, { useState, useEffect } from "react";
import "./QuoteModal.css";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"; // Import doc and getDoc
import { db } from "../firebaseConfig";

// Removed hardcoded categoryFormDefinitions object

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
  const [foodGradeProducts, setFoodGradeProducts] = useState([]); // Keep if still needed for a 'product' select field

  // New state for fetched form definition
  const [formDefinition, setFormDefinition] = useState(null);
  const [loadingDefinition, setLoadingDefinition] = useState(true);
  const [definitionError, setDefinitionError] = useState(null);

  // Fetch form definition when modal opens or category_slug changes
  useEffect(() => {
    const fetchDefinition = async () => {
      if (!show || !category_slug) {
        setFormDefinition(null); // Clear definition if modal is hidden or no slug
        setLoadingDefinition(false);
        // Reset formData when modal is closed or slug is cleared
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
        setSubmissionError(null);
        setSubmissionSuccess(null);
        setDefinitionError(null);
        return;
      }

      setLoadingDefinition(true);
      setDefinitionError(null);
      setSubmissionError(null); // Clear submission errors when changing slugs
      setSubmissionSuccess(null);

      try {
        const docRef = doc(db, "quoteFormDefinitions", category_slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedDefinition = docSnap.data();
          // Initialize formData based on the fetched definition
          const initialFormData = {
            name: "",
            email: "",
            // Initialize other fields from the definition with empty strings
          };
          (fetchedDefinition.fields || []).forEach((field) => {
            initialFormData[field.name] = "";
          });
          setFormData(initialFormData);
          setFormDefinition(fetchedDefinition);
        } else {
          // Fallback or error if no definition found for the slug
          console.warn(`No form definition found for slug: ${category_slug}`);
          // Provide a default definition allowing at least name, email, and message
          const defaultDef = {
            categorySlug: category_slug,
            fields: [
              { name: "name", label: "Name", type: "text", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              {
                name: "message",
                label: "Message",
                type: "textarea",
                required: true,
              },
            ],
          };
          setFormDefinition(defaultDef);
          setFormData({ name: "", email: "", message: "" }); // Basic initial data
          setDefinitionError(
            `No custom form found for "${category_slug}". Using a default form.`
          );
        }
      } catch (error) {
        console.error("Error fetching form definition:", error);
        setDefinitionError("Failed to load form configuration.");
        // Fallback to default form on error
        const defaultDef = {
          categorySlug: category_slug,
          fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            {
              name: "message",
              label: "Message",
              type: "textarea",
              required: true,
            },
          ],
        };
        setFormDefinition(defaultDef);
        setFormData({ name: "", email: "", message: "" }); // Basic initial data
      } finally {
        setLoadingDefinition(false);
        setErrors({}); // Clear errors on modal open/slug change
      }
    };

    fetchDefinition();
  }, [show, category_slug, db]); // Add db as a dependency if it might change (unlikely, but good practice)

  // Fetch products for food-grade-papers (Keep this if needed for a specific select field)
  useEffect(() => {
    const fetchFoodGradeProducts = async () => {
      // Only fetch if the definition requires a 'product' field and is for food-grade-papers
      if (
        show &&
        formDefinition &&
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
          // Handle error, maybe show a message in the modal
          setSubmissionError("Failed to load product options.");
        }
      } else {
        setFoodGradeProducts([]); // Clear products if not needed
      }
    };
    fetchFoodGradeProducts();
  }, [show, formDefinition, category_slug, db]); // Add formDefinition and db as dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    if (submissionError) setSubmissionError(null);
    if (submissionSuccess) setSubmissionSuccess(null);
    // definitionError should persist if it happened during fetch
    // if (definitionError) setDefinitionError(null); // Don't clear definition error on input change
  };

  // Modified validateForm to use the fetched definition
  const validateForm = () => {
    if (!formDefinition) return false; // Cannot validate without a definition

    const newErrors = {};

    // Validate required fields from the fetched definition
    (formDefinition.fields || []).forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label || field.name} is mandatory`;
      }
    });

    // Basic email format validation if email field is present and not empty
    if (
      formData.email &&
      formDefinition.fields.some((field) => field.name === "email")
    ) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = "Invalid email";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDefinition || loadingDefinition || loading) return; // Prevent submission if definition not loaded or already submitting

    if (validateForm()) {
      setLoading(true);
      setSubmissionError(null);
      setSubmissionSuccess(null);
      try {
        // Removed: Save to Firestore (as requested)

        // 2) Send Email via Resend API
        const response = await fetch("/api/send-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Include all data from formData
            ...formData,
            categorySlug: category_slug,
            // You might want to include the timestamp and status in the email/for logging elsewhere if not using Firestore
            timestamp: new Date().toISOString(), // ISO string format for email
            // status: "new", // Status is only relevant if storing in DB
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setSubmissionSuccess(
            "Your quote request has been submitted successfully! We’ve also emailed you a confirmation."
          );
          // Consider resetting formData to initial state based on definition after successful submission
          const initialFormData = {};
          (formDefinition.fields || []).forEach((field) => {
            initialFormData[field.name] = "";
          });
          setFormData(initialFormData);

          // handleClose(); // You might want to keep the modal open to show the success message for a few seconds
          // Or close it immediately and show a toast notification on the main page
          setTimeout(() => {
            handleClose();
          }, 3000); // Close after 3 seconds to show success message
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

  // Modified renderFormFields to use the fetched definition
  const renderFormFields = () => {
    // Name and Email are handled separately, so we filter them out here.
    // They should still be defined as fields in the admin panel if required.
    const fieldsToRender = (formDefinition?.fields || []).filter(
      (field) => field.name !== "name" && field.name !== "email"
    );

    if (loadingDefinition) return null; // Loading indicator is outside this function now
    if (definitionError) return null; // Error message is outside this function now
    if (!formDefinition || !formDefinition.fields) return null; // No definition message outside

    return (
      <>
        {fieldsToRender.map((field) => (
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
              // Special handling for 'product' select if needed and tied to a category
              field.name === "product" &&
              formDefinition.categorySlug === "food-grade-papers" ? (
                <select
                  className={`form-select ${
                    errors[field.name] ? "is-invalid" : ""
                  }`}
                  id={`quote${field.name}`}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required} // Apply required from definition
                >
                  <option value="">Select {field.label}</option>
                  {foodGradeProducts.length > 0 ? (
                    foodGradeProducts.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    // Show "Loading products..." or "No products available" based on state
                    <option disabled>
                      {loadingDefinition
                        ? "Loading products..."
                        : "No products available"}
                    </option>
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
                  required={field.required} // Apply required from definition
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
                required={field.required} // Apply required from definition
              ></textarea>
            ) : (
              // Default to text input for other types
              <input
                type={field.type} // Use the type from definition
                className={`form-control ${
                  errors[field.name] ? "is-invalid" : ""
                }`}
                id={`quote${field.name}`}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                required={field.required} // Apply required from definition
              />
            )}
            {errors[field.name] && (
              <div className="invalid-feedback">{errors[field.name]}</div>
            )}
          </div>
        ))}
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
            {/* Display definition loading, error, or form */}
            {loadingDefinition ? (
              <div>Loading form definition...</div>
            ) : definitionError ? (
              <div className="alert alert-warning">{definitionError}</div>
            ) : !formDefinition ? (
              <div>No form configuration available for this category.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Name and Email fields (can be removed if you want them fully controlled by the definition in admin) */}
                {/* Keeping them here assumes they are always required fields */}
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
                    required // Assuming Name is always required
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
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="quoteEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required // Assuming Email is always required
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
                    disabled={loading || loadingDefinition} // Disable submit button while definition is loading or form is submitting
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
