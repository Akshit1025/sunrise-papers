import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc, // Use setDoc to manage definitions by category slug
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import RequireAdmin from "../auth/RequireAdmin"; // Import RequireAdmin

// Initial state for a single field definition
const initialFieldDefinition = {
  name: "",
  label: "",
  type: "text", // Default type
  options: [], // For select types
  required: false,
  tooltip: "",
};

// Initial state for a form definition for a category
const initialFormDefinition = {
  categorySlug: "",
  fields: [
    // Basic fields that might always be included but can be customized
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "message", label: "Message", type: "textarea", required: true },
    // Example of a category-specific field
    {
      name: "gsm",
      label: "GSM",
      type: "text",
      required: false,
      tooltip: "Grams per Square Meter",
    },
  ],
};

const QuoteRequests = () => {
  // Removed state for quote request submissions (items, loading, err, submittingStatus)

  const [formDefinitions, setFormDefinitions] = useState({}); // State to store quote form definitions by category slug
  const [loadingDefinitions, setLoadingDefinitions] = useState(true);
  const [error, setError] = useState(null);

  const [currentFormDefinition, setCurrentFormDefinition] = useState(
    initialFormDefinition
  ); // State for the form being edited/created
  const [editingCategorySlug, setEditingCategorySlug] = useState(null); // Track which category definition is being edited

  const [submittingDefinition, setSubmittingDefinition] = useState(false);

  // Function to fetch quote form definitions from Firestore
  const fetchFormDefinitions = async () => {
    setLoadingDefinitions(true);
    setError(null);
    try {
      const ref = collection(db, "quoteFormDefinitions");
      const snapshot = await getDocs(query(ref)); // No specific order needed for definitions
      const definitions = {};
      snapshot.docs.forEach((doc) => {
        definitions[doc.id] = doc.data();
      });
      setFormDefinitions(definitions);
    } catch (e) {
      console.error("Failed to load form definitions:", e);
      setError("Failed to load form definitions.");
    } finally {
      setLoadingDefinitions(false);
    }
  };

  useEffect(() => {
    fetchFormDefinitions();
  }, []);

  // Handle changes in the form definition form
  const handleDefinitionChange = (e) => {
    const { name, value } = e.target;
    setCurrentFormDefinition((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in individual field definitions
  const handleFieldChange = (index, fieldName, value) => {
    setCurrentFormDefinition((prev) => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = { ...updatedFields[index], [fieldName]: value };
      // Special handling for 'options' field type
      if (fieldName === "type" && value !== "select") {
        updatedFields[index].options = []; // Clear options if not select
      } else if (
        fieldName === "type" &&
        value === "select" &&
        !Array.isArray(updatedFields[index].options)
      ) {
        updatedFields[index].options = []; // Ensure options is an array for select
      }
      return { ...prev, fields: updatedFields };
    });
  };

  // Add a new field to the current form definition
  const addField = () => {
    setCurrentFormDefinition((prev) => ({
      ...prev,
      fields: [...prev.fields, initialFieldDefinition],
    }));
  };

  // Remove a field from the current form definition
  const removeField = (index) => {
    setCurrentFormDefinition((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  // Handle changes to options for select type fields
  const handleOptionChange = (fieldIndex, optionIndex, value) => {
    setCurrentFormDefinition((prev) => {
      const updatedFields = [...prev.fields];
      const updatedOptions = [...(updatedFields[fieldIndex].options || [])];
      updatedOptions[optionIndex] = value;
      updatedFields[fieldIndex].options = updatedOptions;
      return { ...prev, fields: updatedFields };
    });
  };

  // Add an option to a select type field
  const addOption = (fieldIndex) => {
    console.log("addOption called for fieldIndex:", fieldIndex); // Add logging here
    // Basic validation to ensure fieldIndex is valid
    if (
      fieldIndex === undefined ||
      fieldIndex === null ||
      fieldIndex < 0 ||
      fieldIndex >= currentFormDefinition.fields.length
    ) {
      console.error("Invalid fieldIndex for addOption:", fieldIndex);
      return;
    }
    setCurrentFormDefinition((prev) => {
      const updatedFields = [...prev.fields]; // Check if the field at fieldIndex exists and has an options array, or create one
      if (
        !updatedFields[fieldIndex].options ||
        !Array.isArray(updatedFields[fieldIndex].options)
      ) {
        updatedFields[fieldIndex].options = [];
      }
      const updatedOptions = [...updatedFields[fieldIndex].options];
      updatedOptions.push(""); // Adds one empty string
      updatedFields[fieldIndex].options = updatedOptions;
      console.log("addOption state updated."); // Add logging here
      return {
        ...prev,
        fields: updatedFields,
      };
    });
  };
  // Remove an option from a select type field
  const removeOption = (fieldIndex, optionIndex) => {
    console.log(
      "removeOption called for fieldIndex:",
      fieldIndex,
      "optionIndex:",
      optionIndex
    ); // Add logging here
    // Basic validation to ensure indices are valid
    if (
      fieldIndex === undefined ||
      fieldIndex === null ||
      fieldIndex < 0 ||
      fieldIndex >= currentFormDefinition.fields.length
    ) {
      console.error("Invalid fieldIndex for removeOption:", fieldIndex);
      return;
    }
    if (
      optionIndex === undefined ||
      optionIndex === null ||
      optionIndex < 0 ||
      optionIndex >=
        (currentFormDefinition.fields[fieldIndex].options || []).length
    ) {
      console.error("Invalid optionIndex for removeOption:", optionIndex);
      return;
    }
    setCurrentFormDefinition((prev) => {
      const updatedFields = [...prev.fields];
      const updatedOptions = [
        ...(updatedFields[fieldIndex].options || []),
      ].filter((_, i) => i !== optionIndex);
      updatedFields[fieldIndex].options = updatedOptions;
      console.log("removeOption state updated."); // Add logging here
      return {
        ...prev,
        fields: updatedFields,
      };
    });
  };

  // Start editing an existing form definition
  const startEditDefinition = (categorySlug, definition) => {
    setEditingCategorySlug(categorySlug);
    // Ensure fields and options are arrays when starting edit
    setCurrentFormDefinition({
      ...definition,
      fields: Array.isArray(definition.fields)
        ? definition.fields.map((field) => ({
            ...field,
            options: Array.isArray(field.options) ? field.options : [], // Ensure options is an array
          }))
        : [], // Default to empty array if no fields
    });
  };

  // Cancel editing
  const cancelEditDefinition = () => {
    setEditingCategorySlug(null);
    setCurrentFormDefinition(initialFormDefinition);
    setError(null);
  };

  // Save a form definition
  const saveFormDefinition = async (e) => {
    e.preventDefault();
    setSubmittingDefinition(true);
    setError(null);

    // Basic validation
    if (!currentFormDefinition.categorySlug.trim()) {
      setError("Category Slug is required.");
      setSubmittingDefinition(false);
      return;
    }
    if (
      !Array.isArray(currentFormDefinition.fields) ||
      currentFormDefinition.fields.length === 0
    ) {
      setError("At least one field is required.");
      setSubmittingDefinition(false);
      return;
    }
    // Validate fields have names and labels
    for (const field of currentFormDefinition.fields) {
      if (!field.name.trim() || !field.label.trim()) {
        setError(`Field name and label are required for all fields.`);
        setSubmittingDefinition(false);
        return;
      }
    }

    try {
      const categorySlug = currentFormDefinition.categorySlug.trim();
      // Use setDoc with the category slug as the document ID
      await setDoc(
        doc(db, "quoteFormDefinitions", categorySlug),
        currentFormDefinition
      );
      setEditingCategorySlug(null); // Exit editing mode
      setCurrentFormDefinition(initialFormDefinition); // Reset form
      await fetchFormDefinitions(); // Refresh the list
    } catch (e) {
      console.error("Failed to save form definition:", e);
      setError(e.message || "Failed to save form definition.");
    } finally {
      setSubmittingDefinition(false);
    }
  };

  // Delete a form definition
  const deleteFormDefinition = async (categorySlug) => {
    if (
      !window.confirm(
        `Delete the form definition for category "${categorySlug}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setSubmittingDefinition(true); // Use this state for any ongoing definition operation
    setError(null);
    try {
      await deleteDoc(doc(db, "quoteFormDefinitions", categorySlug));
      if (editingCategorySlug === categorySlug) {
        cancelEditDefinition(); // Exit editing if deleting the one being edited
      }
      await fetchFormDefinitions(); // Refresh the list
    } catch (e) {
      console.error("Failed to delete form definition:", e);
      setError(e.message || "Failed to delete form definition.");
    } finally {
      setSubmittingDefinition(false);
    }
  };

  return (
    <RequireAdmin>
      <div className="container mt-4">
        <h2 className="h4 mb-4">Quote Form Management</h2>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        {/* Form to Add/Edit Form Definitions */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h5 m-0">
                {editingCategorySlug
                  ? `Edit Form for "${editingCategorySlug}"`
                  : "Add New Form Definition"}
              </h3>
              {editingCategorySlug && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={cancelEditDefinition}
                  disabled={submittingDefinition}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={saveFormDefinition}>
              <div className="mb-3">
                <label htmlFor="categorySlug" className="form-label">
                  Category Slug
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="categorySlug"
                  name="categorySlug"
                  value={currentFormDefinition.categorySlug}
                  onChange={handleDefinitionChange}
                  disabled={
                    submittingDefinition || editingCategorySlug !== null
                  } // Disable slug when editing
                  required
                />
                {editingCategorySlug === null && (
                  <div className="form-text">
                    Use a unique slug (e.g., food-grade-papers,
                    carbonless-paper). This will link to your category.
                  </div>
                )}
              </div>

              <h4>Form Fields</h4>
              {currentFormDefinition.fields.map((field, index) => (
                <div className="card mb-3 p-3" key={index}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Field {index + 1}</h6>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeField(index)}
                      disabled={submittingDefinition}
                    >
                      <i className="fas fa-trash-alt me-1"></i>
                      Remove Field
                    </button>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        htmlFor={`fieldName-${index}`}
                        className="form-label"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`fieldName-${index}`}
                        value={field.name || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., gsm, colour"
                        disabled={submittingDefinition}
                        required
                      />
                      <div className="form-text">
                        Unique identifier for this field (no spaces).
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label
                        htmlFor={`fieldLabel-${index}`}
                        className="form-label"
                      >
                        Label
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`fieldLabel-${index}`}
                        value={field.label || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "label", e.target.value)
                        }
                        placeholder="e.g., GSM, Colour"
                        disabled={submittingDefinition}
                        required
                      />
                      <div className="form-text">User-friendly label.</div>
                    </div>
                    <div className="col-md-4">
                      <label
                        htmlFor={`fieldType-${index}`}
                        className="form-label"
                      >
                        Type
                      </label>
                      <select
                        className="form-select"
                        id={`fieldType-${index}`}
                        value={field.type}
                        onChange={(e) =>
                          handleFieldChange(index, "type", e.target.value)
                        }
                        disabled={submittingDefinition}
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Select</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        {/* Add other input types as needed */}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label
                        htmlFor={`fieldRequired-${index}`}
                        className="form-label"
                      >
                        Required
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`fieldRequired-${index}`}
                          checked={field.required}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "required",
                              e.target.checked
                            )
                          }
                          disabled={submittingDefinition}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`fieldRequired-${index}`}
                        >
                          Is Required
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label
                        htmlFor={`fieldTooltip-${index}`}
                        className="form-label"
                      >
                        Tooltip (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`fieldTooltip-${index}`}
                        value={field.tooltip || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "tooltip", e.target.value)
                        }
                        placeholder="Optional explanation"
                        disabled={submittingDefinition}
                      />
                    </div>
                  </div>

                  {/* Options for Select type */}
                  {field.type === "select" && (
                    <div className="mt-3">
                      <h6>Options</h6>
                      {(field.options || []).map((option, optionIndex) => (
                        <div
                          className="input-group mb-2"
                          key={`option-${optionIndex}`}
                        >
                          <input
                            type="text"
                            className="form-control"
                            value={option || ""}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                optionIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            disabled={submittingDefinition}
                            id={`field-${index}-option-${optionIndex}`}
                            name={`field-${index}-option-${optionIndex}`}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeOption(index, optionIndex)}
                            disabled={submittingDefinition}
                          >
                            <i className="fas fa-trash-alt me-1"></i>
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => addOption(index)}
                        disabled={submittingDefinition}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mb-3"
                onClick={addField}
                disabled={submittingDefinition}
              >
                <i className="fas fa-plus me-1"></i>
                Add Field
              </button>

              <button
                type="submit"
                className="btn btn-dark w-100"
                disabled={submittingDefinition}
              >
                {submittingDefinition ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>{" "}
                    Saving...
                  </>
                ) : editingCategorySlug ? (
                  <>
                    <i className="fas fa-save me-1"></i> Update Form Definition
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-1"></i> Create Form
                    Definition
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List of Existing Form Definitions */}
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 m-0">Existing Form Definitions</h3>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={fetchFormDefinitions}
                disabled={loadingDefinitions || submittingDefinition}
              >
                {loadingDefinitions ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>{" "}
                    Refreshing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-1"></i> Refresh
                  </>
                )}
              </button>
            </div>

            {loadingDefinitions ? (
              <div>Loading...</div>
            ) : Object.keys(formDefinitions).length === 0 ? (
              <div className="text-muted">No form definitions yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Category Slug</th>
                      <th>Number of Fields</th>
                      <th style={{ width: 150 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formDefinitions).map(
                      ([slug, definition]) => (
                        <tr key={slug}>
                          <td>
                            <code>{slug}</code>
                          </td>
                          <td>{(definition.fields || []).length}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  startEditDefinition(slug, definition)
                                }
                                disabled={submittingDefinition}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteFormDefinition(slug)}
                                disabled={submittingDefinition}
                              >
                                <i className="fas fa-trash-alt me-1"></i>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-text mt-3">
              These definitions control the fields displayed in the Quote
              Request modal for each category slug.
            </div>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
};

export default QuoteRequests;
