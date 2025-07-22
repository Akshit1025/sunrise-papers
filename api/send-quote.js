// api/send-quote.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, message, ...otherFields } = req.body;

        // Basic validation (consider more robust validation)
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required.' });
        }

        // Basic email format validation
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            return res.status(400).json({ message: 'Invalid email address.' });
        }


        // Format the email content based on the received data
        let emailBodyHtml = `
           <h2>New Quote Request</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
         `;

        let emailBodyText = `
           New Quote Request\n\n
           Name: ${name}\n
           Email: ${email}\n
         `;

        for (const field in otherFields) {
            if (otherFields.hasOwnProperty(field)) {
                const formattedFieldName = field.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
                emailBodyHtml += `<p><strong>${formattedFieldName}:</strong> ${otherFields[field]}</p>`;
                emailBodyText += `${formattedFieldName}: ${otherFields[field]}\n`;
            }
        }

        if (message && message.trim()) {
            emailBodyHtml += `<p><strong>Message:</strong> ${message}</p>`;
            emailBodyText += `Message: ${message}\n`;
        }


        const msg = {
            to: 'YOUR_RECEIVING_EMAIL@example.com', // Your email address to receive quotes
            from: 'YOUR_VERIFIED_SENDER_EMAIL@yourdomain.com', // Your verified sender email in SendGrid
            subject: `New Quote Request from ${name} (${email})`,
            text: emailBodyText,
            html: emailBodyHtml,
        };

        await sgMail.send(msg);

        res.status(200).json({ success: true, message: 'Your quote request has been sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send quote request.', error: error.message });
    }
}
