// api/delete-media.js

// Import the Cloudinary library
const cloudinary = require("cloudinary");

// Configure Cloudinary with your credentials from environment variables
// IMPORTANT: These are server-side variables and should not be exposed to the client
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

  const { public_id, resource_type } = req.body;

  // Check if public_id is provided in the request body
  if (!public_id) {
    return res.status(400).json({ error: "public_id is required" });
  }

  try {
    // Use the Cloudinary SDK to destroy (delete) the media asset.
    // The resource_type is important to specify whether you're deleting an 'image' or a 'video'.
    // If not provided, it defaults to 'image'.
    const result = await cloudinary.v2.uploader.destroy(public_id, {
      resource_type: resource_type || "image", // Default to 'image' if not specified
    });

    // Cloudinary returns { result: 'ok' } on success
    if (result.result === "ok") {
      res.status(200).json({ message: "Media deleted successfully" });
    } else if (result.result === "not found") {
      // If the media was already deleted or never existed, consider it a success.
      res.status(200).json({ message: "Media not found, considered deleted" });
    } else {
      // Handle other potential responses from Cloudinary
      throw new Error(result.result || "Failed to delete media");
    }
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
    res.status(500).json({
      error: "Failed to delete media",
      details: error.message,
    });
  }
}
