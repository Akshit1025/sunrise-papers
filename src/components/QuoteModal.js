import React, { useState, useEffect } from 'react';
import './QuoteModal.css';
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseConfig'; // Import your Firestore database instance

// Define form fields and their properties for each category
const categoryFormDefinitions = {
    'food-grade-papers': [
        { name: 'product', label: 'Product', type: 'select', options: ['Option 1', 'Option 2', 'Option 3'], required: true }, // <-- REPLACE WITH ACTUAL FOOD GRADE PRODUCT TYPES
        { name: 'gsm', label: 'GSM', type: 'text', required: true, tooltip: 'GSM stands for Grams per Square Meter, with a higher GSM number signifying a thicker and heavier paper.' },
        { name: 'kitValue', label: 'Kit Value', type: 'text', required: true, tooltip: 'Kit value indicates the level of grease resistance, with higher Kit values signifying greater resistance to oil and grease penetration.' },
        { name: 'rollOrSheet', label: 'Roll or Sheet', type: 'select', options: ['Roll', 'Sheet'], required: true },
        { name: 'colour', label: 'Colour', type: 'text', required: false },
        { name: 'size', label: 'Size', type: 'text', required: false },
        { name: 'purpose', label: 'Purpose', type: 'textarea', required: true },
        { name: 'moq', label: 'Minimum Order Quantity (MOQ)', type: 'text', required: true },
    ],
    'carbonless-paper': [
        { name: 'product', label: 'Product', type: 'select', options: ['CF', 'CB', 'CFB', 'PS'], required: true }, // <-- REPLACE WITH ACTUAL CARBONLESS PRODUCT TYPES
        { name: 'gsm', label: 'GSM', type: 'text', required: true, tooltip: 'GSM stands for Grams per Square Meter, with a higher GSM number signifying a thicker and heavier paper.' },
        { name: 'rollOrSheet', label: 'Roll or Sheet', type: 'select', options: ['Roll', 'Sheet'], required: true },
        { name: 'colour', label: 'Colour', type: 'text', required: false },
        { name: 'size', label: 'Size', type: 'text', required: false },
        { name: 'purpose', label: 'Purpose', type: 'textarea', required: true },
        { name: 'moq', label: 'Minimum Order Quantity (MOQ)', type: 'text', required: true },
    ],
    'coated-paper': [
        { name: 'gsm', label: 'GSM', type: 'text', required: true, tooltip: 'GSM stands for Grams per Square Meter, with a higher GSM number signifying a thicker and heavier paper.' },
        { name: 'colour', label: 'Colour', type: 'text', required: true },
        { name: 'purpose', label: 'Purpose', type: 'textarea', required: true },
        { name: 'moq', label: 'Minimum Order Quantity (MOQ)', type: 'text', required: true },
    ],
    'default': [
        { name: 'message', label: 'Message', type: 'textarea', required: true },
    ]
};


const QuoteModal = ({ show, handleClose, categorySlug }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '', // Keeping message for default or general use if needed
        // Add new fields for category-specific data (initialized in useEffect)
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // State for submission loading
    const [submissionError, setSubmissionError] = useState(null); // State for submission errors

    // Effect to reset form data and errors when modal is shown or category changes
    useEffect(() => {
        if (show) {
            // Get the definition for the current category to initialize form data correctly
            const currentDefinition = categoryFormDefinitions[categorySlug] || categoryFormDefinitions['default'];
            const initialFormData = {
                name: '',
                email: '',
                message: '', // Include message by default, it might be used even if not in definition
            };
            // Add fields from the definition to the initial form data
            currentDefinition.forEach(field => {
                initialFormData[field.name] = '';
            });

            setFormData(initialFormData);
            setErrors({});
            setSubmissionError(null); // Clear submission errors when modal opens
        }


    }, [show, categorySlug]); // Depend on 'show' and 'categorySlug'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Optionally, clear error for the field when it's changed
        setErrors({ ...errors, [name]: '' });
        // Clear submission error if user starts typing again
        if (submissionError) {
            setSubmissionError(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        // Ensure name and email are always validated
        if (!formData.name) newErrors.name = 'Name is mandatory';
        if (!formData.email) {
            newErrors.email = 'Email address is mandatory';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }


        // Validate category-specific required fields
        const requiredFields = getRequiredFields(categorySlug);
        requiredFields.forEach(field => {
            if (field !== 'name' && field !== 'email' && !formData[field]) { // Avoid double-checking name/email
                // Find the label from the definition for a better error message
                const fieldDefinition = categoryFormDefinitions[categorySlug]?.find(f => f.name === field);
                newErrors[field] = `${fieldDefinition?.label || field} is mandatory`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => { // Made the function async
        e.preventDefault();
        if (validateForm()) {
            console.log('Form data to save:', formData);

            setLoading(true); // Set loading state for submission
            setSubmissionError(null); // Clear previous submission errors

            try {
                // Get a reference to the 'quoteRequests' collection in Firestore
                const quoteRequestsCollectionRef = collection(db, 'quoteRequests');

                // Add a new document to the 'quoteRequests' collection with the form data
                const docRef = await addDoc(quoteRequestsCollectionRef, {
                    ...formData, // Spread all form data
                    timestamp: new Date(), // Add a timestamp
                    categorySlug: categorySlug, // Store the category slug
                    status: 'new', // Add a status field (e.g., 'new', 'read', 'closed')
                });

                console.log('Quote request saved to Firestore with ID:', docRef.id);

                // Handle success (e.g., show a success message, clear form)
                alert("Your quote request has been submitted successfully!");

                // Reset form after successful submission
                const currentDefinition = categoryFormDefinitions[categorySlug] || categoryFormDefinitions['default'];
                const initialFormData = {
                    name: '', email: '', message: '', // Always include these
                };
                currentDefinition.forEach(field => {
                    initialFormData[field.name] = ''; // Reset category specific fields
                });
                setFormData(initialFormData); // Update state


                handleClose(); // Close the modal on success
            } catch (error) {
                console.error('Error saving quote request to Firestore:', error);
                // Handle error (e.g., show an error message)
                setSubmissionError(`Failed to submit quote request: ${error.message}`);
                alert(`Failed to submit quote request: ${error.message}`); // Alert user about the error
            } finally {
                setLoading(false); // Turn off loading state
            }
        } else {
            console.log('Form validation failed', errors);
            setSubmissionError('Please fix the errors in the form.'); // Indicate validation failed
        }
    };

    // Helper function to get required fields based on category slug
    const getRequiredFields = (slug) => {
        const definition = categoryFormDefinitions[slug] || categoryFormDefinitions['default'];
        // Ensure name and email are always considered required for the purpose of validation logic here
        const alwaysRequired = ['name', 'email'];
        const categorySpecificRequired = definition.filter(field => field.required).map(field => field.name);
        // Combine and ensure uniqueness
        return [...new Set([...alwaysRequired, ...categorySpecificRequired])];
    };


    // Function to render category-specific form fields dynamically from the definition
    const renderFormFields = (slug) => {
        const definition = categoryFormDefinitions[slug] || categoryFormDefinitions['default'];

        return (
            <>
                {definition.map(field => (
                    // Only render fields that are not 'name' or 'email' as they are rendered separately
                    (field.name !== 'name' && field.name !== 'email') && (
                        <div className="mb-3" key={field.name}>
                            <label htmlFor={`quote${field.name}`} className="form-label">
                                {field.label} {field.required && <span className="text-danger">*</span>}
                                {field.tooltip && (
                                    <span className="tooltip-container">
                                        <i className="fas fa-info-circle info-icon"></i>
                                        <span className="tooltip-text">{field.tooltip}</span>
                                    </span>
                                )}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    className={`form-select ${errors[field.name] ? 'is-invalid' : ''}`}
                                    id={`quote${field.name}`}
                                    name={field.name}
                                    value={formData[field.name] || ''} // Use '' for initial empty state
                                    onChange={handleChange}
                                    required={field.required}
                                >
                                    <option value="">Select {field.label}</option>
                                    {field.options && field.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                                    id={`quote${field.name}`}
                                    name={field.name}
                                    rows="3"
                                    value={formData[field.name] || ''} // Use '' for initial empty state
                                    onChange={handleChange}
                                    required={field.required}
                                ></textarea>
                            ) : ( // Default to text input
                                <input
                                    type={field.type}
                                    className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                                    id={`quote${field.name}`}
                                    name={field.name}
                                    value={formData[field.name] || ''} // Use '' for initial empty state
                                    onChange={handleChange}
                                    required={field.required}
                                />
                            )}
                            {errors[field.name] && <div className="invalid-feedback">{errors[field.name]}</div>}
                        </div>
                    )
                ))}
            </>
        );
    };

    // Bootstrap modal classes and styles
    const modalClassName = `modal fade ${show ? 'show' : ''}`;
    const modalStyle = {
        display: show ? 'block' : 'none',
        backgroundColor: show ? 'rgba(0, 0, 0, 0.5)' : 'transparent', // Add a backdrop effect
        overflowY: 'auto', // Add scroll for long forms
    };

    return (
        <div className={modalClassName} style={modalStyle} tabIndex="-1" role="dialog" aria-labelledby="quoteModalLabel" aria-hidden={!show}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> {/* Added modal-dialog-centered and modal-lg for better centering and size */}
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="quoteModalLabel">Get a Quote {categorySlug ? `- ${categorySlug.replace(/-/g, ' ').toUpperCase()}` : ''}</h5> {/* Display category name in title */}
                        <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {/* Always include Name and Email - made mandatory */}
                            <div className="mb-3">
                                <label htmlFor="quoteName" className="form-label">Name <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} id="quoteName" name="name" value={formData.name} onChange={handleChange} required />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="quoteEmail" className="form-label">Email address <span className="text-danger">*</span></label>
                                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="quoteEmail" name="email" value={formData.email} onChange={handleChange} required />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            {/* Render category-specific fields */}
                            {renderFormFields(categorySlug)}

                            {/* Submission Error Message */}
                            {submissionError && (
                                <div className="alert alert-danger mt-3" role="alert">
                                    {submissionError}
                                </div>
                            )}

                            {/* Spam Protection Placeholder */}
                            {/* You would typically integrate a backend service or a third-party library for CAPTCHA here */}
                            {/* Before saving to Firestore, you would verify the CAPTCHA response */}
                            {/* <div className="mb-3">
                Add your spam protection/CAPTCHA here
              </div> */}

                            <div className="d-flex justify-content-center mt-3"> {/* Centering container for the button */}
                                <button
                                    type="submit"
                                    className="btn btn-outline-dark btn-lg rounded-pill product-back-btn"
                                    disabled={loading} // Disable button while loading
                                >
                                    {loading ? 'Submitting...' : 'Submit Quote Request'} {/* Button text changes while loading */}
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
