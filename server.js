// Load environment variables from a .env file if it exists
require("dotenv").config();

// --- Environment Variable Validation ---
// Ensure all required environment variables are set before starting the server.
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UPLOAD_PRESET",
  "RESEND_API_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(
      `[Fatal Error] Missing required environment variable: ${envVar}`
    );
    process.exit(1); // Exit the process with an error code, preventing the server from starting.
  }
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const cloudinary = require("cloudinary");
const { Resend } = require("resend");
const rateLimit = require("express-rate-limit");

// --- INITIALIZATION ---
const app = express();
const port = process.env.BACKEND_PORT || 8080; // Use port from environment or default to 8080
const resend = new Resend(process.env.RESEND_API_KEY);

// Configure Cloudinary using environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- MIDDLEWARE ---
// --- CORS Configuration ---
// Define the list of allowed domains.
// We include localhost for local development.
const allowedOrigins = [
  "http://localhost:3000",
  "https://sunrisepapers.com",
  "https://www.sunrisepapers.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Check if the incoming request's origin is in our allowed list.
    // The '!origin' check allows for non-browser requests (e.g., from tools like Postman or Curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
  optionsSuccessStatus: 200, // For legacy browser support
};

// Use the configured CORS options
app.use(cors(corsOptions));
// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());
// Statically serve the built React application from the 'build' folder
app.use(express.static(path.join(__dirname, "build")));

// --- Rate Limiting Configuration ---
// Protects API endpoints from brute-force attacks and abuse.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Apply the rate limiting middleware to all requests that start with /api/
app.use("/api/", apiLimiter);

// --- API ROUTES ---

// Route to handle Cloudinary signature generation
app.post("/api/generate-signature", (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.body.folder || "default_folder";
    const resource_type = req.body.resource_type || "image";

    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    };

    if (resource_type === "video") {
      paramsToSign.resource_type = "video";
    }

    const signature = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({ signature, timestamp });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    res.status(500).json({
      error: "Failed to generate signature",
      details: error.message,
    });
  }
});

// Route to handle deleting media from Cloudinary
app.post("/api/delete-media", async (req, res) => {
  const { public_id, resource_type } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: "public_id is required" });
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(public_id, {
      resource_type: resource_type || "image",
    });

    if (result.result === "ok") {
      res.status(200).json({ message: "Media deleted successfully" });
    } else if (result.result === "not found") {
      res.status(200).json({ message: "Media not found, considered deleted" });
    } else {
      throw new Error(result.result || "Failed to delete media");
    }
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
    res.status(500).json({
      error: "Failed to delete media",
      details: error.message,
    });
  }
});

// Route to handle sending contact form emails
app.post("/api/send-contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const dateStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const generateEmailHTML = (type, isAdmin) => {
      // This is the same HTML generation logic from your original file
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
                  : `<a href="https://sunrisepapers.com" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">
                       🌐 Visit Website
                    </a>
                    <a href="https://wa.me/919810087126" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">
                       💬 Chat on WhatsApp
                    </a>`
              }
            </div>
            <p style="font-size:13px;color:#555;text-align:center;">
              Received on ${dateStr}
            </p>
          </div>
          <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:13px;color:#777;">
            <p style="margin:0;"><strong>Sunrise Papers</strong></p>
            <p style="margin:0;">Unit No. 390, Vegas Mall, Sector 14, Dwarka, Delhi, 110078</p>
            <p style="margin:0;">📧 dineshgupta@sunrisepapers.co.in | ☎ +91 95555 09507</p>
          </div>
        </div>`;
    };

    // Send to Admin
    await resend.emails.send({
      from: "Sunrise Papers <contact@sunrisepapers.co.in>",
      to: "dineshgupta@sunrisepapers.co.in",
      reply_to: email,
      subject: `📩 New Contact Form Submission from ${name}`,
      html: generateEmailHTML("Contact Form", true),
    });

    // Send to Customer
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
});

// Route to handle sending quote request emails
app.post("/api/send-quote", async (req, res) => {
  try {
    const { name, email, message, ...otherFields } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = otherFields.product || "N/A";
    const quantity = otherFields.quantity || otherFields.moq || "N/A";
    const dateStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const generateEmailHTML = (type, isAdmin) => {
      // This is the same HTML generation logic from your original file
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
                ? `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">
                    You’ve received a new <strong>${type}</strong> from <strong>${name}</strong>.
                  </p>`
                : `<p style="font-size:16px;line-height:1.6;margin:0 0 15px;">
                    Hi <strong>${name}</strong>, thank you for reaching out to <strong>Sunrise Papers</strong>.
                    We have received your request for <strong>${product}</strong> (Qty: ${quantity}) and will get back to you soon.
                  </p>`
            }
            ${
              isAdmin
                ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <tbody>
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
                    </tbody>
                  </table>`
                : ""
            }
            <div style="text-align:center;margin:30px 0;">
            ${
              isAdmin
                ? ""
                : `<a href="https://sunrisepapers.com" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">
                     🌐 Visit Website
                  </a>
                  <a href="https://wa.me/919810087126" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;margin:5px;font-weight:bold;">
                     💬 Chat on WhatsApp
                  </a>`
            }
            </div>
            <p style="font-size:13px;color:#555;text-align:center;">
              Received on ${dateStr}
            </p>
          </div>
          <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:13px;color:#777;">
            <p style="margin:0;"><strong>Sunrise Papers</strong></p>
            <p style="margin:0;">Unit No. 390, Vegas Mall, Sector 14, Dwarka, Delhi, 110078</p>
            <p style="margin:0;">📧 dineshgupta@sunrisepapers.co.in | ☎ +91 95555 09507</p>
          </div>
        </div>`;
    };

    // Send to Admin
    await resend.emails.send({
      from: "Sunrise Papers <quotes@sunrisepapers.co.in>",
      to: "dineshgupta@sunrisepapers.co.in",
      reply_to: email,
      subject: `📩 New Quote Request from ${name}`,
      html: generateEmailHTML("Quote Request", true),
    });

    // Send to Customer
    await resend.emails.send({
      from: "Sunrise Papers <quotes@sunrisepapers.co.in>",
      to: email,
      subject: "✅ We received your quote request",
      html: generateEmailHTML("Quote Request", false),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// --- CATCH-ALL ROUTE ---
// This route handles any GET request that wasn't handled by the API routes.
// It sends back the main index.html file from the React build.
// This is crucial for single-page applications and client-side routing to work.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// --- START THE SERVER ---
// Make the server listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
