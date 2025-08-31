// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Allows your React app to communicate with this server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- API ROUTES WILL BE ADDED HERE ---
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// +++ START CLOUDINARY SECURE ENDPOINTS +++
const cloudinary = require("cloudinary").v2;

// This config uses your private keys and MUST live on the server
cloudinary.config({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME, // This can be public
  api_key: process.env.CLOUDINARY_API_KEY, // This is private
  api_secret: process.env.CLOUDINARY_API_SECRET, // This is super private
  secure: true,
});

// ENDPOINT 1: GENERATE SIGNATURE FOR UPLOADS
app.post("/api/cloudinary-signature", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  // Get parameters from the frontend (e.g., folder to upload to)
  const params_to_sign = req.body.params_to_sign || {};

  try {
    // This creates the secure signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        ...params_to_sign,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({ timestamp, signature });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    res.status(500).json({ error: "Could not generate signature." });
  }
});

// ENDPOINT 2: SECURELY DELETE A RESOURCE
app.post("/api/cloudinary-delete", async (req, res) => {
  const { public_id, resource_type = "image" } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: "public_id is required." });
  }

  try {
    // This securely destroys the resource using the SDK
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type,
    });
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error deleting Cloudinary resource:", error);
    res.status(500).json({ error: "Could not delete resource." });
  }
});
// +++ END CLOUDINARY SECURE ENDPOINTS +++

// ----------------- EMAIL HELPERS (FROM YOUR ORIGINAL FILES) -----------------

// Helper for the Contact Form Email
const generateContactEmailHTML = (data, isAdmin) => {
  const { name, email, subject, message } = data;
  const dateStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#333;border:1px solid #eee;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1)">
      <div style="background:#004aad;padding:20px;text-align:center;">
        <img src="https://res.cloudinary.com/dzrv3ssy5/image/upload/v1756204861/logo_xweqc3.png" alt="Sunrise Papers" style="max-height:60px;margin-bottom:10px;" />
        <h1 style="color:#fff;margin:0;font-size:22px;">Sunrise Papers</h1>
      </div>
      <div style="padding:25px;">
        <h2 style="color:#004aad;margin-top:0;">📩 ${
          isAdmin ? "New Contact Message" : "Thank You for Contacting Us"
        }</h2>
        ${
          isAdmin
            ? `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">You’ve received a new message from <strong>${name}</strong>.</p>`
            : `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">Hi <strong>${name}</strong>, thank you for contacting <strong>Sunrise Papers</strong>. We have received your message and our team will respond to you shortly.</p>`
        }
        ${
          isAdmin
            ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><tbody>
                      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #eee;">${name}</td></tr>
                      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #eee;">${email}</td></tr>
                      ${
                        subject
                          ? `<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Subject</td><td style="padding:8px;border:1px solid #eee;">${subject}</td></tr>`
                          : ""
                      }
                      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #eee;">${message}</td></tr>
                    </tbody></table>`
            : ""
        }
        <div style="text-align:center;margin:30px 0;">
          ${
            !isAdmin
              ? `<a href="https://sunrisepapers.com" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">🌐 Visit Website</a><a href="https://wa.me/919810087126" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">💬 Chat on WhatsApp</a>`
              : ""
          }
        </div>
        <p style="font-size:13px;color:#555;text-align:center;">Received on ${dateStr}</p>
      </div>
      <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:13px;color:#777;">
        <p style="margin:0;"><strong>Sunrise Papers</strong></p>
        <p style="margin:0;">Unit No. 390, Vegas Mall, Sector 14, Dwarka, Delhi, 110078</p>
        <p style="margin:0;">📧 dineshgupta@sunrisepapers.co.in | ☎ +91 95555 09507</p>
      </div>
    </div>`;
};

// Helper for the Quote Form Email
const generateQuoteEmailHTML = (data, isAdmin) => {
  const { name, email, message, ...otherFields } = data;
  const product = otherFields.product || "N/A";
  const quantity = otherFields.quantity || otherFields.moq || "N/A";
  const dateStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#333;border:1px solid #eee;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1)">
      <div style="background:#004aad;padding:20px;text-align:center;">
        <img src="https://res.cloudinary.com/dzrv3ssy5/image/upload/v1756204861/logo_xweqc3.png" alt="Sunrise Papers" style="max-height:60px;margin-bottom:10px;" />
        <h1 style="color:#fff;margin:0;font-size:22px;">Sunrise Papers</h1>
      </div>
      <div style="padding:25px;">
        <h2 style="color:#004aad;margin-top:0;">📩 ${
          isAdmin ? "New Quote Request" : "Thank You for Your Quote Request"
        }</h2>
        ${
          isAdmin
            ? `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">You’ve received a new quote request from <strong>${name}</strong>.</p>`
            : `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">Hi <strong>${name}</strong>, thank you for reaching out to <strong>Sunrise Papers</strong>. We have received your request for <strong>${product}</strong> (Qty: ${quantity}) and will get back to you soon.</p>`
        }
        ${
          isAdmin
            ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><tbody>
                      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #eee;">${name}</td></tr>
                      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #eee;">${email}</td></tr>
                      ${Object.entries(otherFields)
                        .map(
                          ([key, val]) =>
                            `<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">${key}</td><td style="padding:8px;border:1px solid #eee;">${val}</td></tr>`
                        )
                        .join("")}
                      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #eee;">${
                        message || "N/A"
                      }</td></tr>
                    </tbody></table>`
            : ""
        }
        <div style="text-align:center;margin:30px 0;">
          ${
            !isAdmin
              ? `<a href="https://sunrisepapers.com" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">🌐 Visit Website</a><a href="https://wa.me/919810087126" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">💬 Chat on WhatsApp</a>`
              : ""
          }
        </div>
        <p style="font-size:13px;color:#555;text-align:center;">Received on ${dateStr}</p>
      </div>
      <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:13px;color:#777;">
        <p style="margin:0;"><strong>Sunrise Papers</strong></p>
        <p style="margin:0;">Unit No. 390, Vegas Mall, Sector 14, Dwarka, Delhi, 110078</p>
        <p style="margin:0;">📧 dineshgupta@sunrisepapers.co.in | ☎ +91 95555 09507</p>
      </div>
    </div>`;
};

// ----------------- API ENDPOINTS -----------------

// Endpoint for the contact form
app.post("/api/send-contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Send email to admin
    await resend.emails.send({
      from: "Sunrise Papers <contact@sunrisepapers.co.in>",
      to: "dineshgupta@sunrisepapers.co.in",
      replyTo: email,
      subject: `📩 New Contact Form Submission from ${name}`,
      html: generateContactEmailHTML(req.body, true),
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "Sunrise Papers <contact@sunrisepapers.co.in>",
      to: email,
      subject: "✅ We received your message",
      html: generateContactEmailHTML(req.body, false),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Endpoint for the quote form
app.post("/api/send-quote", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Send email to admin
    await resend.emails.send({
      from: "Sunrise Papers <quotes@sunrisepapers.co.in>", // Correct 'from' address for quotes
      to: "dineshgupta@sunrisepapers.co.in",
      replyTo: email,
      subject: `📩 New Quote Request from ${name}`,
      html: generateQuoteEmailHTML(req.body, true),
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "Sunrise Papers <quotes@sunrisepapers.co.in>", // Correct 'from' address for quotes
      to: email,
      subject: "✅ We received your quote request",
      html: generateQuoteEmailHTML(req.body, false),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending quote email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// This section is crucial for production on Coolify
// It serves your built React app's static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
