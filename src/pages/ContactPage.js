// src/pages/ContactPage.js

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

const ContactPage = ({ userId, authReady }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', null
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setStatusMessage('');

    if (!authReady || !userId) {
      setStatusMessage("Authentication not ready. Please wait a moment and try again.");
      setSubmissionStatus('error');
      return;
    }

    if (!name || !email || !message) {
      setStatusMessage("All fields are required.");
      setSubmissionStatus('error');
      return;
    }

    try {
      const messagesCollectionPath = 'contact_messages';
      await addDoc(collection(db, messagesCollectionPath), {
        name,
        email,
        message,
        timestamp: new Date(),
        userId: userId,
      });
      setStatusMessage("Your message has been sent successfully!");
      setSubmissionStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage("Failed to send message. Please try again.");
      setSubmissionStatus('error');
    }
  };

  return (
    <div className="my-4"> {/* Add some vertical margin */}
      <h2 className="page-title text-success">Contact Us</h2> {/* Use Bootstrap text-success for color */}
      <p className="paragraph">
        Have a question or want to discuss a project? Feel free to reach out to us using the form below.
      </p>
      <form className="form p-4 border rounded shadow-sm" onSubmit={handleSubmit}> {/* Add Bootstrap form styling */}
        <div className="mb-3">
          <label htmlFor="contactName" className="form-label">Your Name</label>
          <input
            type="text"
            className="form-control input-field rounded-pill" // Combine Bootstrap form-control with custom
            id="contactName"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contactEmail" className="form-label">Your Email</label>
          <input
            type="email"
            className="form-control input-field rounded-pill" // Combine Bootstrap form-control with custom
            id="contactEmail"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contactMessage" className="form-label">Your Message</label>
          <textarea
            className="form-control text-area-field rounded-3" // Combine Bootstrap form-control with custom
            id="contactMessage"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5" // Set initial rows for textarea
            required
          />
        </div>
        <button type="submit" className="btn btn-success btn-lg submit-button rounded-pill mt-3"> {/* Bootstrap button classes */}
          Send Message
        </button>
      </form>
      {submissionStatus && (
        <div
          className={`alert ${
            submissionStatus === 'success' ? 'alert-success' : 'alert-danger'
          } text-center mt-3 message-box`} // Bootstrap alert classes
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default ContactPage;
