import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Assuming db is exported from here

// Import Cloudinary
import { Cloudinary } from "cloudinary-core"; // Assuming you'll use core for utility functions

// --- Cloudinary Configuration (Ensure these are in your .env) ---
// WARNING: Storing API Secret directly in frontend code is INSECURE for production.
// For production, consider using signed uploads where signature is generated on the backend.
const cloudinaryCore = new Cloudinary({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
  api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET, // INSECURE for frontend in production
  secure: true, // Use HTTPS
});
// --- End Cloudinary Configuration ---

import RequireAdmin from "../auth/RequireAdmin"; // Assuming you have this component

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const initialForm = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  image_url: "", // Main image URL
  hasSubProducts: false,
  order: 0,
  benefits: [""],
  galleryImages: [""], // Initialize as empty array for easier handling of uploaded URLs
  videos: [{ url: "", caption: "" }], // Used when hasSubProducts is false
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]); // New state for selected image files for upload
  const [videoFiles, setVideoFiles] = useState([]);
  const [originalCategoryData, setOriginalCategoryData] = useState(null); // Store original data for comparison

  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  const sortedCategories = useMemo(() => {
    const copy = [...categories];
    copy.sort(
      (a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)
    );
    return copy;
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const ref = collection(db, "categories");
      const q = query(ref);
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(list);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "name" && !prev.slug) {
        next.slug = slugify(value);
      }
      // If 'hasSubProducts' changes, reset relevant image/video fields
      if (name === "hasSubProducts") {
        if (checked) {
          // Switched to having sub-products
          next.galleryImages = [];
          next.videos = [{ url: "", caption: "" }];
        } else {
          // Switched to not having sub-products
          // Maybe keep image_url, but reset gallery and videos or ensure they have default empty states
          if (
            !Array.isArray(next.galleryImages) ||
            next.galleryImages.length === 0
          ) {
            next.galleryImages = []; // Use empty array if no images existed
          }
          if (!Array.isArray(next.videos) || next.videos.length === 0) {
            next.videos = [{ url: "", caption: "" }]; // Ensure default video object
          }
        }
      }
      return next;
    });
  };

  const onNameBlur = () => {
    setForm((prev) => ({
      ...prev,
      slug: prev.slug ? slugify(prev.slug) : slugify(prev.name),
    }));
  };

  const changeBenefit = (index, val) => {
    setForm((prev) => {
      const benefits = [...prev.benefits];
      benefits[index] = val;
      return { ...prev, benefits };
    });
  };

  const addBenefit = () => {
    setForm((prev) => ({ ...prev, benefits: [...prev.benefits, ""] }));
  };

  const removeBenefit = (index) => {
    setForm((prev) => {
      const benefits = prev.benefits.filter((_, i) => i !== index);
      return { ...prev, benefits: benefits.length ? benefits : [""] };
    });
  };

  // --- Image File Handling ---
  const handleImageFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10 MB in bytes

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10 MB.`);
        return false; // Exclude this file
      }
      return true; // Include this file
    });

    setImageFiles(validFiles);
    // Optional: Clear the input so the same files can be selected again if needed
    e.target.value = null;
  };

  // --- Video File Handling ---
  const handleVideoFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 100 * 1024 * 1024; // 100MB

    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("video/")) {
        alert(`File ${file.name} is not a video file`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 100 MB.`);
        return false;
      }
      return true;
    });
    setVideoFiles(validFiles);
  };

  // --- Cloudinary Image Upload Function (Similar to Products.js) ---
  const uploadImages = async (files) => {
    const imageUrls = [];
    const uploadPromises = Array.from(files).map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      ); // Use your Cloudinary upload preset from .env

      // Optional: Add a folder for better organization in Cloudinary
      formData.append("folder", "category_images"); // Upload to a 'category_images' folder

      return fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.secure_url) {
            console.log("Uploaded to Cloudinary:", data.secure_url);
            return data.secure_url;
          } else {
            console.error("Cloudinary upload failed:", data);
            throw new Error("Cloudinary upload failed");
          }
        })
        .catch((error) => {
          console.error("Error uploading to Cloudinary:", error);
          setError(`Image upload failed: ${error.message}`);
          throw error; // Re-throw to be caught by Promise.all
        });
    });

    try {
      const results = await Promise.all(uploadPromises);
      return results.filter(Boolean); // Filter out any failed uploads
    } catch (error) {
      // Errors are already logged in the individual promises
      return []; // Return empty array on overall failure
    }
  };
  // --- End Cloudinary Image Upload Function ---

  // --- Video Upload Function ---
  const uploadVideos = async (files) => {
    const videoUrls = [];
    const uploadPromises = Array.from(files).map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append("folder", "category_videos");
      formData.append("resource_type", "video");

      return fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          // Use /video/upload endpoint
          method: "POST",
          body: formData,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.secure_url) {
            console.log("Uploaded to Cloudinary:", data.secure_url);
            // For videos, we store an object with url and caption
            return { url: data.secure_url, caption: "" }; // Default empty caption
          } else {
            console.error("Cloudinary video upload failed:", data);
            throw new Error("Cloudinary video upload failed");
          }
        })
        .catch((error) => {
          console.error("Error uploading video to Cloudinary:", error);
          setError(`Video upload failed: ${error.message}`);
          throw error;
        });
    });

    try {
      const results = await Promise.all(uploadPromises);
      return results.filter(Boolean);
    } catch (error) {
      return [];
    }
  };

  // Gallery Images handlers (Modified to integrate with uploaded files)
  const changeGalleryImage = (index, val) => {
    setForm((prev) => {
      const galleryImages = [...prev.galleryImages];
      galleryImages[index] = val;
      return { ...prev, galleryImages };
    });
  };

  // Add a new empty URL field to the gallery
  const addGalleryImageUrlField = () => {
    setForm((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ""],
    }));
  };

  const removeGalleryImage = async (imageUrlToDelete, categoryId) => {
    setError("");
    try {
      // --- Check if we are in edit mode with a category ID ---
      if (categoryId) {
        // This function is called from the UI delete button in edit mode
        console.log("Removing image URL from local state:", imageUrlToDelete);
        setForm((prev) => {
          const updatedGalleryImages = (prev.galleryImages || []).filter(
            (url) => url !== imageUrlToDelete
          );
          const updatedMainImageUrl =
            prev.image_url === imageUrlToDelete ? "" : prev.image_url; // Clear main image if it was the one deleted
          return {
            ...prev,
            galleryImages: updatedGalleryImages,
            image_url: updatedMainImageUrl,
          };
        });
        // NOTE: Cloudinary and Firestore deletion will happen in handleUpdate now
      } else {
        // This else block might not be strictly needed if only called from edit form, but keep for safety
        console.warn(
          "removeGalleryImage called without categoryId. This might indicate an issue."
        );
        // If somehow called without categoryId, maybe just remove from local state? Or show error?
        setForm((prev) => {
          const updatedGalleryImages = (prev.galleryImages || []).filter(
            (url) => url !== imageUrlToDelete
          );
          const updatedMainImageUrl =
            prev.image_url === imageUrlToDelete ? "" : prev.image_url; // Clear main image if it was the one deleted
          return {
            ...prev,
            galleryImages: updatedGalleryImages,
            image_url: updatedMainImageUrl,
          };
        });
      }
    } catch (e) {
      console.error("Unexpected error in removeGalleryImage:", e);
      setError(`An error occurred while trying to remove image locally.`);
    } finally {
      // setSubmitting(false);
    }
  };

  // Videos handlers
  const changeVideo = (index, field, val) => {
    setForm((prev) => {
      const videos = [...prev.videos];
      const at = videos[index] || { url: "", caption: "" };
      videos[index] = { ...at, [field]: val };
      return { ...prev, videos };
    });
  };

  const addVideo = () => {
    setForm((prev) => ({
      ...prev,
      videos: [...prev.videos, { url: "", caption: "" }],
    }));
  };

  const removeVideo = async (videoToRemove, categoryId) => {
    // Now accepts video object and categoryId
    setError("");
    // setSubmitting(true);
    try {
      // --- Check if we are in edit mode with a category ID ---
      if (categoryId) {
        // This function is called from the UI delete button in edit mode
        console.log("Removing video object from local state:", videoToRemove);
        setForm((prev) => {
          // Filter out the video object based on its URL (assuming URLs are unique)
          const updatedVideos = (prev.videos || []).filter(
            (v) => v.url !== videoToRemove.url
          );
          return {
            ...prev,
            videos: updatedVideos,
          };
        });
        // NOTE: Cloudinary and Firestore deletion will happen in handleUpdate now
      } else {
        // This else block might not be strictly needed
        console.warn(
          "removeVideo called without categoryId. This might indicate an issue."
        );
        setForm((prev) => {
          const updatedVideos = (prev.videos || []).filter(
            (v) => v.url !== videoToRemove.url
          );
          return {
            ...prev,
            videos: updatedVideos,
          };
        });
      }
    } catch (e) {
      console.error("Unexpected error in removeVideo:", e);
      setError(`An error occurred while trying to remove video locally.`);
    } finally {
      // setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setMode("create");
    setEditingId(null);
    setImageFiles([]); // Clear selected image files on reset
  };

  // --- Modified buildPayload function to handle uploaded videos ---
  const buildPayload = (uploadedImageUrls = [], uploadedVideoUrls = []) => {
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug.trim()),
      description: form.description.trim(),
      longDescription: form.longDescription.trim(),
      hasSubProducts: !!form.hasSubProducts,
      order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
      benefits: (form.benefits || []).map((b) => b.trim()).filter(Boolean),
      // If hasSubProducts is true, galleryImages and videos should not be saved, or be empty/default
      // Otherwise, build them from form state + uploaded media
      // image_url handling: manual overrides uploaded, first uploaded if no manual and uploads exist
      image_url:
        form.image_url.trim() ||
        (uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : ""),
    };

    if (!payload.hasSubProducts) {
      // Only include galleryImages and videos if hasSubProducts is false
      payload.galleryImages = [
        ...(form.galleryImages || []).map((u) => u.trim()).filter(Boolean), // Existing manual/uploaded gallery URLs
        ...uploadedImageUrls, // Newly uploaded Image URLs
      ].filter(Boolean);
      payload.videos = [
        ...(form.videos || [])
          .map((v) => ({
            // Existing manual/uploaded video objects
            url: (v.url || "").trim(),
            caption: (v.caption || "").trim(),
          }))
          .filter((v) => v.url), // Only include videos with a URL
        ...(uploadedVideoUrls || []), // Newly uploaded Video objects (assuming uploadVideos returns objects)
      ].filter((v) => v.url); // Ensure no empty video objects
    } else {
      // If hasSubProducts is true, ensure galleryImages and videos are empty in the payload
      payload.galleryImages = [];
      payload.videos = [];
    }

    return payload;
  };
  // --- End buildPayload function ---

  // --- Modified handleCreate to include image and video uploads ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    setSubmitting(true);

    try {
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(imageFiles);
      }

      let uploadedVideoUrls = [];
      // Only upload videos if the category is not set to have sub-products
      if (videoFiles.length > 0 && !form.hasSubProducts) {
        uploadedVideoUrls = await uploadVideos(videoFiles);
      }

      // Pass both uploaded image and video URLs to buildPayload
      await addDoc(
        collection(db, "categories"),
        buildPayload(uploadedImageUrls, uploadedVideoUrls)
      );
      resetForm();
      await fetchCategories();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };
  // --- End handleCreate ---

  const startEdit = (cat) => {
    setMode("edit");
    setEditingId(cat.id);
    setOriginalCategoryData(cat);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      longDescription: cat.longDescription || "",
      image_url: cat.image_url || "",
      hasSubProducts: !!cat.hasSubProducts,
      order: typeof cat.order === "number" ? cat.order : 0,
      benefits:
        Array.isArray(cat.benefits) && cat.benefits.length
          ? cat.benefits
          : [""],
      // Ensure galleryImages is an array when starting edit
      galleryImages: Array.isArray(cat.galleryImages) ? cat.galleryImages : [],
      // Ensure videos is an array of objects with url/caption when starting edit
      videos: Array.isArray(cat.videos)
        ? cat.videos.map((v) => ({
            url: v.url || "",
            caption: v.caption || "",
          }))
        : [{ url: "", caption: "" }], // Default if no videos exist
    });
    setImageFiles([]); // Clear selected image files when starting edit
    setVideoFiles([]);
  };

  // --- Modified handleUpdate to include image and video uploads ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !originalCategoryData) return;
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    setSubmitting(true);

    try {
      // --- 1. Identify media to delete ---
      const mediaUrlsToDelete = [];

      // Check original main image vs current main image URL
      if (
        originalCategoryData.image_url &&
        originalCategoryData.image_url.startsWith("https://res.cloudinary.com/")
      ) {
        if (originalCategoryData.image_url !== form.image_url) {
          mediaUrlsToDelete.push(originalCategoryData.image_url);
        }
      }

      // Check original gallery images vs current gallery images
      const originalGalleryImageUrls = new Set(
        originalCategoryData.galleryImages || []
      );
      const currentGalleryImageUrls = new Set(form.galleryImages || []);

      originalGalleryImageUrls.forEach((url) => {
        if (
          url.startsWith("https://res.cloudinary.com/") &&
          !currentGalleryImageUrls.has(url)
        ) {
          mediaUrlsToDelete.push(url); // Image was in original but not current form state
        }
      });

      // Check original videos vs current videos
      // Convert video objects to a Set of URLs for comparison
      const originalVideoUrls = new Set(
        (originalCategoryData.videos || []).map((v) => v.url)
      );
      const currentVideoUrls = new Set((form.videos || []).map((v) => v.url));

      originalVideoUrls.forEach((url) => {
        if (
          url.startsWith("https://res.cloudinary.com/") &&
          !currentVideoUrls.has(url)
        ) {
          mediaUrlsToDelete.push(url); // Video was in original but not current form state
        }
      });

      // --- 2. Delete identified media from Cloudinary ---
      for (const mediaUrl of mediaUrlsToDelete) {
        try {
          const urlParts = mediaUrl.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
            console.warn(
              "Could not extract public ID from Cloudinary URL for deletion:",
              mediaUrl
            );
            continue;
          }

          let publicIdParts = urlParts.slice(uploadIndex + 2);
          if (publicIdParts.length === 0) {
            publicIdParts = urlParts.slice(uploadIndex + 1);
          }
          const publicIdWithExtension = publicIdParts.join("/");
          const resourceType = mediaUrl.includes("/image/upload/")
            ? "image"
            : mediaUrl.includes("/video/upload/")
            ? "video"
            : null;

          if (!resourceType) {
            console.warn(
              "Could not determine resource type from Cloudinary URL:",
              mediaUrl
            );
            continue;
          }

          const publicId =
            resourceType === "video"
              ? publicIdWithExtension.substring(
                  0,
                  publicIdWithExtension.lastIndexOf(".")
                )
              : publicIdWithExtension.split(".")[0];

          // Call Cloudinary API to delete (frontend deletion - INSECURE for production)
          const timestamp = new Date().getTime();
          const signature = cloudinaryCore.utils.api_sign_request(
            {
              timestamp: timestamp,
              public_id: publicId,
              resource_type: resourceType,
            },
            process.env.REACT_APP_CLOUDINARY_API_SECRET
          );

          const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`;
          const deleteFormData = new FormData();
          deleteFormData.append("public_id", publicId);
          deleteFormData.append("timestamp", timestamp);
          deleteFormData.append(
            "api_key",
            process.env.REACT_APP_CLOUDINARY_API_KEY
          );
          deleteFormData.append("signature", signature);
          deleteFormData.append("resource_type", resourceType);

          const response = await fetch(deleteUrl, {
            method: "POST",
            body: deleteFormData,
          });

          const data = await response.json();

          if (data.result === "ok" || data.result === "not found") {
            console.log(
              `Cloudinary deletion result for ${publicId} (${resourceType}):`,
              data.result
            );
          } else {
            console.error(
              `Cloudinary deletion failed for ${publicId} (${resourceType}):`,
              data
            );
            // Decide how to handle failures here - maybe log and continue?
          }
        } catch (e) {
          console.error(
            `Error deleting media ${mediaUrl} from Cloudinary during update:`,
            e
          );
          // Decide how to handle failures here
        }
      }

      // --- 3. Upload new media ---
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(imageFiles);
      }

      let uploadedVideoUrls = [];
      if (videoFiles.length > 0 && !form.hasSubProducts) {
        uploadedVideoUrls = await uploadVideos(videoFiles);
      }

      // --- 4. Build payload from current form state + uploaded media ---
      const payload = buildPayload(uploadedImageUrls, uploadedVideoUrls);

      // --- 5. Update Firestore document ---
      await updateDoc(doc(db, "categories", editingId), payload);

      resetForm(); // Reset form and clear file inputs
      setOriginalCategoryData(null); // Clear original data state
      await fetchCategories(); // Refresh the list
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };
  // --- End handleUpdate ---

  // --- Modified handleDelete to include image and video deletion ---
  const handleDelete = async (categoryToDelete) => {
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    setError("");
    setSubmitting(true);
    try {
      // Get all image and video URLs associated with the category
      const mediaUrlsToDelete = [
        categoryToDelete.image_url,
        ...(categoryToDelete.galleryImages || []),
        ...(categoryToDelete.videos || []).map((v) => v.url), // Extract video URLs
      ].filter(Boolean);

      // Delete media from Cloudinary first
      for (const mediaUrl of mediaUrlsToDelete) {
        try {
          const urlParts = mediaUrl.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
            console.warn(
              "Could not extract public ID from Cloudinary URL for deletion:",
              mediaUrl
            );
            continue; // Skip to the next media if public ID cannot be extracted
          }

          let publicIdParts = urlParts.slice(uploadIndex + 2); // Get parts after /upload/ and version
          if (publicIdParts.length === 0) {
            // Handle cases without version
            publicIdParts = urlParts.slice(uploadIndex + 1); // Get parts after /upload/
          }
          const publicIdWithExtension = publicIdParts.join("/");
          // Determine resource type (image or video)
          const resourceType = mediaUrl.includes("/image/upload/")
            ? "image"
            : mediaUrl.includes("/video/upload/")
            ? "video"
            : null;

          if (!resourceType) {
            console.warn(
              "Could not determine resource type from Cloudinary URL:",
              mediaUrl
            );
            continue;
          }

          // Extract public ID without extension for video
          const publicId =
            resourceType === "video"
              ? publicIdWithExtension.substring(
                  0,
                  publicIdWithExtension.lastIndexOf(".")
                )
              : publicIdWithExtension.split(".")[0]; // Get the part before the extension for images

          // Call Cloudinary API to delete the media (Using simplified frontend deletion - INSECURE for production)
          const timestamp = new Date().getTime();
          const signature = cloudinaryCore.utils.api_sign_request(
            {
              timestamp: timestamp,
              public_id: publicId,
              resource_type: resourceType, // Include resource type in signature payload
              // Add other parameters used in the original upload if necessary for signing
            },
            process.env.REACT_APP_CLOUDINARY_API_SECRET
          );

          const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`; // Use appropriate destroy endpoint
          const deleteFormData = new FormData();
          deleteFormData.append("public_id", publicId);
          deleteFormData.append("timestamp", timestamp);
          deleteFormData.append(
            "api_key",
            process.env.REACT_APP_CLOUDINARY_API_KEY
          );
          deleteFormData.append("signature", signature);
          deleteFormData.append("resource_type", resourceType); // Include resource_type in form data

          const response = await fetch(deleteUrl, {
            method: "POST",
            body: deleteFormData,
          });

          const data = await response.json();

          if (data.result === "ok" || data.result === "not found") {
            console.log(
              `Cloudinary deletion result for ${publicId} (${resourceType}):`,
              data.result
            );
          } else {
            console.error(
              `Cloudinary deletion failed for ${publicId} (${resourceType}):`,
              data
            );
            // Continue with other media and category deletion even if one fails
          }
        } catch (e) {
          console.error(`Error deleting media ${mediaUrl} from Cloudinary:`, e);
          // Continue with other media and category deletion even if one fails
        }
      }

      // Delete category document from Firestore
      await deleteDoc(doc(db, "categories", categoryToDelete.id));
      if (editingId === categoryToDelete.id) resetForm();
      await fetchCategories();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete category.");
    } finally {
      setSubmitting(false);
    }
  };
  // --- End handleDelete ---

  return (
    <RequireAdmin>
      <div className="container mt-4">
        <h2 className="h4 mb-4">Categories</h2>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h5 m-0">
                    {mode === "edit" ? "Edit Category" : "Add Category"}
                  </h3>
                  {mode === "edit" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={mode === "edit" ? handleUpdate : handleCreate}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      onBlur={onNameBlur}
                      placeholder="e.g., Food Grade Papers"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      name="slug"
                      value={form.slug}
                      onChange={onChange}
                      placeholder="auto-generated-from-name"
                      required
                      disabled={submitting}
                    />
                    <div className="form-text">
                      Used in URLs: /products/{form.slug || "your-slug"}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Short Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      rows={2}
                      placeholder="Short summary..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Long Description</label>
                    <textarea
                      className="form-control"
                      name="longDescription"
                      value={form.longDescription}
                      onChange={onChange}
                      rows={5}
                      placeholder="Detailed description that appears on category page..."
                      disabled={submitting}
                    />
                  </div>

                  {/* New File Input for Images (for main image and gallery) */}
                  <div className="mb-3">
                    <label htmlFor="categoryImageFiles" className="form-label">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="categoryImageFiles"
                      name="categoryImageFiles"
                      onChange={handleImageFileChange}
                      multiple
                      disabled={submitting}
                      accept="image/*" // Restrict to image files
                    />
                    <div className="form-text">
                      Select one or more image files to upload. The first image
                      uploaded will be used as the Main Image if "Main Image
                      URL" is empty.
                    </div>
                  </div>

                  {/* Manual Main Image URL input - keep for flexibility */}
                  <div className="mb-3">
                    <label className="form-label">
                      Main Image URL (Manual Entry)
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="image_url"
                      value={form.image_url}
                      onChange={onChange}
                      placeholder="https://..."
                      disabled={
                        submitting ||
                        (form.image_url &&
                          form.image_url.startsWith(
                            "https://res.cloudinary.com/"
                          ))
                      } // Disable if it's a Cloudinary URL
                    />
                    <div className="form-text">
                      Used when the category has sub-products. Entering a URL
                      here overrides uploaded main image. Manual editing
                      disabled for uploaded images.
                    </div>
                  </div>

                  {/* Display existing images in edit mode with delete option (main image) */}
                  {mode === "edit" &&
                    form.image_url &&
                    form.image_url.startsWith(
                      "https://res.cloudinary.com/"
                    ) && (
                      <div className="mb-3">
                        <label className="form-label">
                          Current Main Image:
                        </label>
                        <div className="d-flex flex-wrap align-items-center">
                          <div className="position-relative me-2 mb-2">
                            <img
                              src={form.image_url}
                              alt="Main Category Image"
                              className="img-thumbnail"
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle"
                              onClick={() =>
                                removeGalleryImage(form.image_url, editingId)
                              }
                              disabled={submitting}
                              aria-label="Delete main image"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="mb-3 form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hasSubProducts"
                      name="hasSubProducts"
                      checked={form.hasSubProducts}
                      onChange={onChange}
                      disabled={submitting}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="hasSubProducts"
                    >
                      Has sub-products
                    </label>
                  </div>

                  {!form.hasSubProducts && (
                    <>
                      <div className="mb-4">
                        <label className="form-label">Gallery Images</label>
                        {/* Display existing images in edit mode with delete option (gallery) */}
                        {mode === "edit" &&
                          form.galleryImages &&
                          form.galleryImages.length > 0 && (
                            <div className="mb-3">
                              <label className="form-label">
                                Existing Gallery Images:
                              </label>
                              <div className="d-flex flex-wrap align-items-center">
                                {form.galleryImages.map((imageUrl, index) => (
                                  <div
                                    key={index}
                                    className="position-relative me-2 mb-2"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Gallery Image ${index + 1}`}
                                      className="img-thumbnail"
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle"
                                      onClick={() =>
                                        removeGalleryImage(imageUrl, editingId)
                                      }
                                      disabled={submitting}
                                      aria-label={`Delete gallery image ${
                                        index + 1
                                      }`}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Manual Gallery Image URL inputs */}
                        {form.galleryImages.map((u, i) => (
                          <div className="input-group mb-2" key={`gi-${i}`}>
                            <span className="input-group-text">
                              URL {i + 1}:
                            </span>
                            <input
                              type="url"
                              className="form-control"
                              value={u || ""}
                              onChange={(e) =>
                                changeGalleryImage(i, e.target.value)
                              }
                              placeholder={`Image URL #${i + 1}`}
                              disabled={
                                submitting ||
                                (u &&
                                  u.startsWith("https://res.cloudinary.com/"))
                              } // Disable manual edit for Cloudinary URLs
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              // Remove from local form state (deletion from Cloudinary handled above)
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  galleryImages: prev.galleryImages.filter(
                                    (_, idx) => idx !== i
                                  ),
                                }))
                              }
                              disabled={submitting}
                            >
                              <i className="fas fa-trash-alt me-1"></i>
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={addGalleryImageUrlField} // Use the function to add an empty URL field
                          disabled={submitting}
                        >
                          <i className="fas fa-plus me-1"></i>
                          Add URL Field
                        </button>
                        <div className="form-text">
                          These appear in the carousel when the category has no
                          sub-products. Manually add additional image URLs or
                          edit URLs of existing images. Uploaded images will
                          automatically add URLs here.
                        </div>
                      </div>

                      <div className="mb-4">
                        {" "}
                        {/* Wrap video related inputs */}
                        <label className="form-label">Videos</label>
                        {/* New File Input for Videos */}
                        <div className="mb-3">
                          <label
                            htmlFor="categoryVideoFiles"
                            className="form-label"
                          >
                            Upload Videos
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            id="categoryVideoFiles"
                            name="categoryVideoFiles"
                            onChange={handleVideoFileChange}
                            multiple
                            disabled={submitting}
                            accept="video/*" // Restrict to video files
                          />
                          <div className="form-text">
                            Select one or more video files to upload. Max 100MB
                            per file (example limit).
                          </div>
                        </div>
                        {/* Display existing videos in edit mode with delete option */}
                        {mode === "edit" &&
                          form.videos &&
                          form.videos.length > 0 && (
                            <div className="mb-3">
                              <label className="form-label">
                                Existing Videos:
                              </label>
                              <div className="d-flex flex-wrap align-items-center">
                                {form.videos.map((video, index) => (
                                  // Use video.url as the key if available, fallback to index
                                  <div
                                    key={video.url || index}
                                    className="position-relative me-2 mb-2"
                                    style={{ width: "120px" }}
                                  >
                                    {/* Display a thumbnail or icon for videos */}
                                    <div
                                      style={{
                                        width: "120px",
                                        height: "80px",
                                        backgroundColor: "#eee",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        border: "1px solid #ccc",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {video.url ? ( // Check if URL exists
                                        // Could potentially generate a video thumbnail URL from Cloudinary here if it's a Cloudinary URL
                                        video.url.startsWith(
                                          "https://res.cloudinary.com/"
                                        ) ? (
                                          // Cloudinary thumbnail URL: Add .jpg extension and f_auto,q_auto,w_100 transformation
                                          <img
                                            src={`https://res.cloudinary.com/${
                                              process.env
                                                .REACT_APP_CLOUDINARY_CLOUD_NAME
                                            }/video/upload/f_auto,q_auto,w_100/${video.url
                                              .split("/upload/")[1]
                                              .replace(/\..+$/, "")}.jpg`}
                                            alt="Video Thumbnail"
                                            style={{
                                              maxWidth: "100%",
                                              maxHeight: "100%",
                                              objectFit: "cover",
                                            }}
                                          />
                                        ) : (
                                          <i className="fas fa-video text-muted fa-2x"></i> // Generic video icon for manual URLs
                                        )
                                      ) : (
                                        <i className="fas fa-file-video text-muted fa-2x"></i> // Placeholder if URL is missing
                                      )}
                                    </div>
                                    {/* Display caption or URL as text */}
                                    <p
                                      className="text-muted text-truncate w-100 mt-1"
                                      style={{ fontSize: "0.7rem" }}
                                      title={video.caption || video.url}
                                    >
                                      {video.caption || video.url}
                                    </p>

                                    {/* Delete Button - triggers removeVideo with the video object and category ID */}
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle"
                                      onClick={() =>
                                        removeVideo(video, editingId)
                                      } // Pass the video object and category ID
                                      disabled={submitting}
                                      aria-label={`Delete video ${index + 1}`}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        <label className="form-label">
                          Add/Edit Video URLs (Manual Entry)
                        </label>
                        {form.videos.map((v, i) => (
                          <div
                            className="row g-2 align-items-stretch mb-2"
                            key={`vid-${i}`}
                          >
                            <div className="col-12 col-md-7">
                              <input
                                type="url"
                                className="form-control"
                                value={v.url || ""}
                                onChange={(e) =>
                                  changeVideo(i, "url", e.target.value)
                                }
                                placeholder="Embeddable video URL (e.g., https://www.youtube.com/embed/...)"
                                disabled={
                                  submitting ||
                                  (v.url &&
                                    v.url.startsWith(
                                      "https://res.cloudinary.com/"
                                    ))
                                }
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <input
                                type="text"
                                className="form-control"
                                value={v.caption || ""}
                                onChange={(e) =>
                                  changeVideo(i, "caption", e.target.value)
                                }
                                placeholder="Caption (optional)"
                                disabled={submitting}
                              />
                            </div>
                            <div className="col-12 col-md-1 d-grid">
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => removeVideo(v, editingId)}
                                disabled={submitting}
                              >
                                <i className="fas fa-times me-1"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={addVideo}
                          disabled={submitting}
                        >
                          <i className="fas fa-plus me-1"></i>
                          Add Video
                        </button>
                        <div className="form-text">
                          Use embeddable URLs (YouTube embed links) for the
                          carousel.
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mb-4">
                    <label className="form-label">Order</label>
                    <input
                      type="number"
                      className="form-control"
                      name="order"
                      value={form.order}
                      onChange={onChange}
                      disabled={submitting}
                    />
                    <div className="form-text">
                      Lower numbers appear first on the Products page.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Benefits</label>
                    {form.benefits.map((b, i) => (
                      <div className="input-group mb-2" key={`benefit-${i}`}>
                        <input
                          type="text"
                          className="form-control"
                          value={b}
                          onChange={(e) => changeBenefit(i, e.target.value)}
                          placeholder={`Benefit #${i + 1}`}
                          disabled={submitting}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeBenefit(i)}
                          disabled={submitting}
                        >
                          <i className="fas fa-trash-alt me-1"></i>
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={addBenefit}
                      disabled={submitting}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add Benefit
                    </button>
                  </div>

                  <button className="btn btn-dark w-100" disabled={submitting}>
                    {
                      submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>{" "}
                          Saving...
                        </> // Spinner while saving
                      ) : mode === "edit" ? (
                        <>
                          <i className="fas fa-save me-1"></i> Save Changes
                        </> // Save icon
                      ) : (
                        <>
                          <i className="fas fa-plus-circle me-1"></i> Create
                          Category
                        </>
                      ) // Create icon
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h3 className="h5 m-0">All Categories</h3>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchCategories}
                    disabled={loading || submitting} // Disable refresh while submitting
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>{" "}
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt me-1"></i> Refresh
                      </>
                    )}
                  </button>
                </div>

                {loading ? (
                  <div>Loading...</div>
                ) : sortedCategories.length === 0 ? (
                  <div className="text-muted">No categories yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Image</th>
                          <th>Slug</th>
                          <th>Has Sub-Products</th>
                          <th>Order</th>
                          <th style={{ width: 170 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCategories.map((c) => (
                          <tr key={c.id}>
                            <td className="fw-medium">{c.name}</td>
                            {/* Display main image or a placeholder */}
                            <td>
                              {c.image_url ? (
                                <img
                                  src={c.image_url}
                                  alt={c.name}
                                  className="img-thumbnail"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    border: "1px solid #ccc",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  No Image
                                </div>
                              )}
                            </td>
                            <td>
                              <code>{c.slug}</code>
                            </td>
                            <td>{c.hasSubProducts ? "Yes" : "No"}</td>
                            <td>{c.order || 0}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => startEdit(c)}
                                  disabled={submitting} // Disable edit while submitting
                                >
                                  <i className="fas fa-edit me-1"></i>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(c)} // Pass the whole category object
                                  disabled={submitting} // Disable delete while submitting
                                >
                                  <i className="fas fa-trash-alt me-1"></i>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="form-text">
                  Editing loads the form on the left; use Save or Cancel Edit.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
};

export default Categories;
