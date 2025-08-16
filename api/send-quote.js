// /api/send-quote.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, message, ...otherFields } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required." });
    }

    // Plain text body
    const textBody = `
New Quote Request

Name: ${name}
Email: ${email}
${Object.entries(otherFields)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}
${message ? `Message: ${message}` : ""}
    `;

    // HTML body (simple table)
    const htmlBody = `
      <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.6; color:#333;">
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${Object.entries(otherFields)
          .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
          .join("")}
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        <hr />
        <small>Received on ${new Date().toLocaleString()}</small>
      </div>
    `;

    // 1) Send to you
    await resend.emails.send({
      from: "quotes@sunrisepapers.co.in", // must match your verified domain
      to: "dineshgupta@sunrisepapers.co.in", // your receiving email
      replyTo: email, // customer email for direct reply
      subject: `New Quote Request — ${name}`,
      text: textBody,
      html: htmlBody,
    });

    // 2) Confirmation to customer
    await resend.emails.send({
      from: "quotes@sunrisepapers.co.in",
      to: email,
      subject: "We received your quote request!",
      text: `Hi ${name},\n\nThanks for reaching out to Sunrise Papers. We’ve received your quote request and will get back to you soon.\n\n— Sunrise Papers`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.6; color:#333;">
          <h2>Thank you, ${name}!</h2>
          <p>We’ve received your quote request and our team will get back to you soon.</p>
          <p><em>— Sunrise Papers</em></p>
        </div>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "Quote email(s) sent." });
  } catch (err) {
    console.error("Resend error:", err);
    return res
      .status(500)
      .json({ message: "Failed to send quote request.", error: err.message });
  }
}
