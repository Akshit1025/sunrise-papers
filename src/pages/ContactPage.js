// src/pages/ContactPage.js

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js'; // Added .js extension back

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
      // Collection path now directly points to 'contact_messages' at the root
      const messagesCollectionPath = 'contact_messages';
      await addDoc(collection(db, messagesCollectionPath), {
        name,
        email,
        message,
        timestamp: new Date(),
        userId: userId, // Still store the user ID for reference
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
    <div>
      <h2 className="page-title">Contact Us</h2>
      <p className="paragraph">
        Have a question or want to discuss a project? Feel free to reach out to us using the form below.
      </p>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="text-area-field"
          required
        />
        <button type="submit" className="submit-button">
          Send Message
        </button>
      </form>
      {submissionStatus && (
        <div
          className={`message-box ${
            submissionStatus === 'success' ? 'success-message' : 'error-message'
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default ContactPage;
