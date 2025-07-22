import React, { useState, useEffect } from 'react';
import './QuoteModal.css'; // We'll update this CSS file next

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
        // Add new fields for category-specific data
        product: '',
        gsm: '',
        kitValue: '',
        rollOrSheet: '',
        colour: '',
        size: '',
        purpose: '',
        moq: '',
    });
    const [errors, setErrors] = useState({});

    // Effect to reset form data and errors when modal is shown or category changes
    useEffect(() => {
        // Get the definition for the current category to initialize form data correctly
        const currentDefinition = categoryFormDefinitions[categorySlug] || categoryFormDefinitions['default'];
        const initialFormData = {
            name: '',
            email: '',
            message: '',
        };
        // Add fields from the definition to the initial form data
        currentDefinition.forEach(field => {
            initialFormData[field.name] = '';
        });

        setFormData(initialFormData);
        setErrors({});
    }, [show, categorySlug]); // Depend on 'show' and 'categorySlug'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Optionally, clear error for the field when it's changed
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = getRequiredFields(categorySlug);

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${categoryFormDefinitions[categorySlug]?.find(f => f.name === field)?.label || field} is mandatory`; // More specific error message
            } else if (field === 'email' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData[field])) { // Basic email validation
                newErrors[field] = 'Invalid email address';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Handle form submission logic here (e.g., sending email, saving to database)
            console.log('Quote form submitted:', formData);
            handleClose(); // Close the modal after submission
        } else {
            console.log('Form validation failed', errors);
        }
    };

    // Helper function to get required fields based on category slug
    const getRequiredFields = (slug) => {
        const definition = categoryFormDefinitions[slug] || categoryFormDefinitions['default'];
        return definition.filter(field => field.required).map(field => field.name);
    };


    // Function to render category-specific form fields dynamically
    const renderFormFields = (slug) => {
        const definition = categoryFormDefinitions[slug] || categoryFormDefinitions['default'];

        return (
            <>
                {definition.map(field => (
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
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={field.required}
                            >
                                <option value="">Select {field.label}</option>
                                {field.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : field.type === 'textarea' ? (
                            <textarea
                                className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                                id={`quote${field.name}`}
                                name={field.name}
                                rows="3"
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={field.required}
                            ></textarea>
                        ) : ( // Default to text input
                            <input
                                type={field.type}
                                className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                                id={`quote${field.name}`}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={field.required}
                            />
                        )}
                        {errors[field.name] && <div className="invalid-feedback">{errors[field.name]}</div>}
                    </div>
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

                            {/* Spam Protection Placeholder */}
                            {/* You would typically integrate a backend service or a third-party library for CAPTCHA here */}
                            {/* <div className="mb-3">
                Add your spam protection/CAPTCHA here
              </div> */}

                            <div className="d-flex justify-content-center mt-3"> {/* Added centering div and margin */}
                                <button type="submit" className="btn btn-outline-dark btn-lg rounded-pill product-back-btn">Submit Quote Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteModal;
