// api/generate-signature.js

const cloudinary = require("cloudinary");

// Configure Cloudinary with your credentials from environment variables
// These are the same server-side variables used by the delete endpoint
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  // We only want to handle POST requests for this endpoint
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.body.folder || "default_folder"; // Use folder from request or a default
    const resource_type = req.body.resource_type || "image"; // Default to image if not provided

    // Define the parameters to sign.
    // The upload_preset MUST be included for the signature to be valid.
    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    };

    // If the resource type is video, it must be part of the signature
    if (resource_type === "video") {
      paramsToSign.resource_type = "video";
    }

    // Use the Cloudinary SDK to generate the signature
    const signature = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    // Send the generated signature and timestamp back to the client
    res.status(200).json({ signature, timestamp });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    res.status(500).json({
      error: "Failed to generate signature",
      details: error.message,
    });
  }
}
