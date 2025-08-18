// api/send-contact.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const dateStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // 🔹 HTML template generator
    const generateEmailHTML = (type, isAdmin) => {
      return `
<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#333;border:1px solid #eee;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1)">
  <!-- Header -->
  <div style="background:#004aad;padding:20px;text-align:center;">
    <img src="https://sunrise-papers.vercel.app/images/logo.png" alt="Sunrise Papers" style="max-height:60px;margin-bottom:10px;" />
    <h1 style="color:#fff;margin:0;font-size:22px;">Sunrise Papers</h1>
  </div>

  <!-- Body -->
  <div style="padding:25px;">
    <h2 style="color:#004aad;margin-top:0;">📩 ${
      isAdmin ? "New Contact Message" : "Thank You for Contacting Us"
    }</h2>
    
    ${
      isAdmin
        ? `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">
            You’ve received a new <strong>${type}</strong> from <strong>${name}</strong>.
          </p>`
        : `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">
            Hi <strong>${name}</strong>, thank you for contacting <strong>Sunrise Papers</strong>.
            We have received your message and our team will respond to you shortly.
          </p>`
    }

    ${
      isAdmin
        ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tbody>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #eee;">${name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #eee;">${email}</td></tr>
              ${
                subject
                  ? `<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Subject</td><td style="padding:8px;border:1px solid #eee;">${subject}</td></tr>`
                  : ""
              }
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #eee;">${message}</td></tr>
            </tbody>
          </table>`
        : ""
    }

    <div style="text-align:center;margin:30px 0;">
      ${
        isAdmin
          ? ""
          : `<a href="https://sunrisepapers.com" 
         style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">
         🌐 Visit Website
      </a>
      <a href="https://wa.me/919810087126" 
         style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">
         💬 Chat on WhatsApp
      </a>`
      }
    </div>

    <p style="font-size:13px;color:#555;text-align:center;">
      Received on ${dateStr}
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:13px;color:#777;">
    <p style="margin:0;"><strong>Sunrise Papers</strong></p>
    <p style="margin:0;">Unit No. 390, Vegas Mall, Sector 14, Dwarka, Delhi, 110078</p>
    <p style="margin:0;">📧 dineshgupta@sunrisepapers.co.in | ☎ +91 95555 09507</p>
  </div>
</div>`;
    };

    // 🔹 Send to Admin
    await resend.emails.send({
      from: "Sunrise Papers <contact@sunrisepapers.co.in>",
      to: "dineshgupta@sunrisepapers.co.in",
      replyTo: email,
      subject: `📩 New Contact Form Submission from ${name}`,
      html: generateEmailHTML("Contact Form", true),
    });

    // 🔹 Send to Customer
    await resend.emails.send({
      from: "Sunrise Papers <contact@sunrisepapers.co.in>",
      to: email,
      subject: "✅ We received your message",
      html: generateEmailHTML("Contact Form", false),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
