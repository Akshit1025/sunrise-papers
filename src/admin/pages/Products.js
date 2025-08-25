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
import { db } from "../../firebaseConfig"; // Ensure storage is not imported here
import RequireAdmin from "../auth/RequireAdmin"; // Assuming you have this for protection

// Import Cloudinary
import { Cloudinary } from "cloudinary-core"; // Assuming you'll use core for now

const cloudinaryCore = new Cloudinary({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
  api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET, // INSECURE for frontend in production
  secure: true, // Use HTTPS
});

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
  category_slug: "",
  short_description: "",
  long_description: "",
  image_url: "",
  image_gallery: [""],
  order: 0,
  isVisible: true,
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [originalProductData, setOriginalProductData] = useState(null); // Store original data for comparison

  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    copy.sort(
      (a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)
    );
    return copy;
  }, [products]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const ref = collection(db, "categories");
      const q = query(ref);
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(list);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const ref = collection(db, "products");
      const q = query(ref);
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (e) {
      console.error(e);
      setError("Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "name" && !prev.slug) {
        next.slug = slugify(value);
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

  const handleImageFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Max size is 10 MB.`);
        return false;
      }
      return true;
    });
    setImageFiles(validFiles);
  };

  const changeGallery = (index, val) => {
    setForm((prev) => {
      const gallery = [...prev.image_gallery];
      gallery[index] = val;
      return { ...prev, image_gallery: gallery };
    });
  };

  const addGallery = () => {
    setForm((prev) => ({
      ...prev,
      image_gallery: [...prev.image_gallery, ""],
    }));
  };

  const removeGallery = (index) => {
    setForm((prev) => {
      const gallery = prev.image_gallery.filter((_, i) => i !== index);
      return { ...prev, image_gallery: gallery };
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setMode("create");
    setEditingId(null);
    setImageFiles([]);
  };

  // --- Modified uploadImages function to use Cloudinary ---
  const uploadImages = async (files) => {
    const imageUrls = [];
    const uploadPromises = Array.from(files).map((file) => {
      // Using a direct upload URL to Cloudinary.
      // Replace 'YOUR_CLOUD_NAME' with your actual Cloudinary cloud name.
      // This is a simplified approach for an admin panel.
      // For a production app, consider using signed uploads with a backend.
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      ); // Use your Cloudinary upload preset from .env
      formData.append("folder", "product_images");

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
  // --- End uploadImages function ---

  const buildPayload = (uploadedImageUrls = []) => ({
    name: form.name.trim(),
    slug: slugify(form.slug.trim()),
    category_slug: form.category_slug.trim(),
    short_description: form.short_description.trim(),
    long_description: form.long_description.trim(),
    image_url:
      form.image_url.trim() ||
      (uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : ""), // Use first uploaded as main if none specified
    image_gallery: [
      ...(form.image_gallery || []).map((u) => u.trim()).filter(Boolean), // Existing gallery URLs
      ...uploadedImageUrls, // Newly uploaded URLs
    ].filter(Boolean), // Ensure no empty strings
    order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
    isVisible: !!form.isVisible,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.category_slug.trim()) return setError("Category is required.");
    setSubmitting(true);

    try {
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(imageFiles);
      }

      await addDoc(collection(db, "products"), buildPayload(uploadedImageUrls));
      resetForm();
      await fetchProducts();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p) => {
    setMode("edit");
    setEditingId(p.id);
    setOriginalProductData(p);
    setForm({
      name: p.name || "",
      slug: p.slug || "",
      category_slug: p.category_slug || "",
      short_description: p.short_description || "",
      long_description: p.long_description || "",
      image_url: p.image_url || "",
      image_gallery: Array.isArray(p.image_gallery) ? p.image_gallery : [], // Ensure it's an array
      order: typeof p.order === "number" ? p.order : 0,
      isVisible: p.isVisible === undefined ? true : !!p.isVisible,
    });
    setImageFiles([]); // Clear selected image files when starting edit
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !originalProductData) return;
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.category_slug.trim()) return setError("Category is required.");
    setSubmitting(true);

    try {
      // --- 1. Identify images to delete ---
      const imageUrlsToDelete = [];

      // Check original main image vs current main image URL
      if (
        originalProductData.image_url &&
        originalProductData.image_url.startsWith("https://res.cloudinary.com/")
      ) {
        if (originalProductData.image_url !== form.image_url) {
          imageUrlsToDelete.push(originalProductData.image_url);
        }
      }

      // Check original gallery images vs current gallery images
      const originalGalleryImageUrls = new Set(
        originalProductData.image_gallery || []
      );
      const currentGalleryImageUrls = new Set(form.image_gallery || []);

      originalGalleryImageUrls.forEach((url) => {
        // If an image was in the original gallery, is a Cloudinary URL, and is NOT in the current form gallery
        if (
          url.startsWith("https://res.cloudinary.com/") &&
          !currentGalleryImageUrls.has(url)
        ) {
          imageUrlsToDelete.push(url); // This image was removed during editing
        }
      });

      // --- 2. Delete identified images from Cloudinary ---
      for (const imageUrl of imageUrlsToDelete) {
        try {
          const urlParts = imageUrl.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
            console.warn(
              "Could not extract public ID from Cloudinary URL for deletion during update:",
              imageUrl
            );
            continue; // Skip to the next image if public ID cannot be extracted
          }
          let publicIdParts = urlParts.slice(uploadIndex + 2);
          if (publicIdParts.length === 0) {
            publicIdParts = urlParts.slice(uploadIndex + 1);
          }
          const publicId = publicIdParts.join("/").split(".")[0];

          // Call Cloudinary API to delete (frontend deletion - INSECURE for production)
          const timestamp = new Date().getTime();
          const signature = cloudinaryCore.utils.api_sign_request(
            {
              timestamp: timestamp,
              public_id: publicId,
              resource_type: "image", // Explicitly set resource type
            },
            process.env.REACT_APP_CLOUDINARY_API_SECRET
          );

          const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/destroy`;
          const deleteFormData = new FormData();
          deleteFormData.append("public_id", publicId);
          deleteFormData.append("timestamp", timestamp);
          deleteFormData.append(
            "api_key",
            process.env.REACT_APP_CLOUDINARY_API_KEY
          );
          deleteFormData.append("signature", signature);
          deleteFormData.append("resource_type", "image"); // Include resource_type

          const response = await fetch(deleteUrl, {
            method: "POST",
            body: deleteFormData,
          });

          const data = await response.json();

          if (data.result === "ok" || data.result === "not found") {
            console.log(
              `Cloudinary deletion result for ${publicId}:`,
              data.result
            );
          } else {
            console.error(`Cloudinary deletion failed for ${publicId}:`, data);
            // Decide how to handle failures here - maybe log and continue?
          }
        } catch (e) {
          console.error(
            `Error deleting image ${imageUrl} from Cloudinary during update:`,
            e
          );
          // Decide how to handle failures here
        }
      }

      // --- 3. Upload new images ---
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(imageFiles);
      }

      // --- 4. Build payload from current form state + uploaded images ---
      // The current form state already reflects locally removed images.
      // buildPayload adds newly uploaded images to the gallery and sets main_image_url if needed.
      const payload = buildPayload(uploadedImageUrls);

      // --- 5. Update Firestore document ---
      await updateDoc(doc(db, "products", editingId), payload);

      resetForm(); // Reset form and clear file inputs
      setOriginalProductData(null); // Clear original data state
      await fetchProducts(); // Refresh the list
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Modified handleDeleteImage function to use Cloudinary ---
  const handleDeleteImage = async (imageUrlToDelete, productId) => {
    setError("");
    // setSubmitting(true);
    try {
      // --- Check if we are in edit mode with a product ID ---
      if (productId) {
        // This function is called from the UI delete button in edit mode
        console.log("Removing image URL from local state:", imageUrlToDelete);
        setForm((prev) => {
          const updatedGalleryImages = (prev.image_gallery || []).filter(
            (url) => url !== imageUrlToDelete
          );
          const updatedMainImageUrl =
            prev.image_url === imageUrlToDelete ? "" : prev.image_url; // Clear main image if it was the one deleted
          return {
            ...prev,
            image_gallery: updatedGalleryImages,
            image_url: updatedMainImageUrl,
          };
        });
        // NOTE: Cloudinary and Firestore deletion will happen in handleUpdate now
      } else {
        console.warn(
          "handleDeleteImage called without productId. This might indicate an issue."
        );
        // For safety, we'll still perform local state update
        setForm((prev) => {
          const updatedGalleryImages = (prev.image_gallery || []).filter(
            (url) => url !== imageUrlToDelete
          );
          const updatedMainImageUrl =
            prev.image_url === imageUrlToDelete ? "" : prev.image_url; // Clear main image if it was the one deleted
          return {
            ...prev,
            image_gallery: updatedGalleryImages,
            image_url: updatedMainImageUrl,
          };
        });
      }
    } catch (e) {
      console.error("Unexpected error in handleDeleteImage:", e);
      setError(`An error occurred while trying to remove image locally.`);
    } finally {
      // setSubmitting(false);
    }
  };
  // --- End handleDeleteImage function ---

  // --- Modified handleDelete function to use Cloudinary ---
  const handleDelete = async (productToDelete) => {
    const ok = window.confirm("Delete this product? This cannot be undone.");
    if (!ok) return;
    setError("");
    setSubmitting(true);
    try {
      // Get all image URLs associated with the product
      const imageUrlsToDelete = [
        productToDelete.image_url,
        ...(productToDelete.image_gallery || []),
      ].filter(Boolean);

      // Delete images from Cloudinary first
      for (const imageUrl of imageUrlsToDelete) {
        try {
          const urlParts = imageUrl.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
            console.warn(
              "Could not extract public ID from Cloudinary URL for deletion:",
              imageUrl
            );
            continue; // Skip to the next image if public ID cannot be extracted
          }
          let publicIdParts = urlParts.slice(uploadIndex + 2); // Get parts after /upload/ and version
          if (publicIdParts.length === 0) {
            // Handle cases without version
            publicIdParts = urlParts.slice(uploadIndex + 1); // Get parts after /upload/
          }
          const publicId = publicIdParts.join("/").split(".")[0]; // Join parts and get the part before the extension

          // Call Cloudinary API to delete the image
          // Again, consider a backend for secure deletion in production
          const timestamp = new Date().getTime();
          const signature = cloudinaryCore.utils.api_sign_request(
            {
              timestamp: timestamp,
              public_id: publicId,
              // Add other parameters used in the original upload if necessary for signing
            },
            process.env.REACT_APP_CLOUDINARY_API_SECRET
          );

          const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/destroy`;
          const deleteFormData = new FormData();
          deleteFormData.append("public_id", publicId);
          deleteFormData.append("timestamp", timestamp);
          deleteFormData.append(
            "api_key",
            process.env.REACT_APP_CLOUDINARY_API_KEY
          );
          deleteFormData.append("signature", signature);

          const response = await fetch(deleteUrl, {
            method: "POST",
            body: deleteFormData,
          });

          const data = await response.json();

          if (data.result === "ok" || data.result === "not found") {
            console.log(
              `Cloudinary deletion result for ${publicId}:`,
              data.result
            );
          } else {
            console.error(`Cloudinary deletion failed for ${publicId}:`, data);
            // Continue with other images and product deletion even if one image fails
          }
        } catch (e) {
          console.error(`Error deleting image ${imageUrl} from Cloudinary:`, e);
          // Continue with other images and product deletion even if one image fails
        }
      }

      // Delete product document from Firestore
      await deleteDoc(doc(db, "products", productToDelete.id));
      if (editingId === productToDelete.id) resetForm();
      await fetchProducts();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to delete product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireAdmin>
      <div className="container mt-4">
        <h2 className="h4 mb-4">Products</h2>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h5 m-0">
                    {mode === "edit" ? "Edit Product" : "Add Product"}
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
                      placeholder="e.g., Greaseproof Paper"
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
                      Used in URLs: /product/{form.slug || "your-slug"}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="category_slug"
                      value={form.category_slug}
                      onChange={onChange}
                      disabled={submitting || loadingCategories}
                      required
                    >
                      <option value="" disabled>
                        {loadingCategories ? "Loading..." : "Select category"}
                      </option>
                      {categories
                        .filter((c) => c.hasSubProducts)
                        .map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Short Description</label>
                    <textarea
                      className="form-control"
                      name="short_description"
                      value={form.short_description}
                      onChange={onChange}
                      rows={2}
                      placeholder="Short teaser..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Long Description</label>
                    <textarea
                      className="form-control"
                      name="long_description"
                      value={form.long_description}
                      onChange={onChange}
                      rows={5}
                      placeholder="Detailed description for product detail page..."
                      disabled={submitting}
                    />
                  </div>

                  {/* Existing Image URL input - keep for manual entry or initial migration */}
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
                      }
                    />
                    <div className="form-text">
                      Entering a URL here will override any uploaded main image.
                      Manual editing is disabled for uploaded images.
                    </div>
                  </div>

                  {/* New File Input for Images */}
                  <div className="mb-3">
                    <label htmlFor="imageFiles" className="form-label">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="imageFiles"
                      name="imageFiles"
                      onChange={handleImageFileChange}
                      multiple
                      disabled={submitting}
                      accept="image/*"
                    />
                    <div className="form-text">
                      Select one or more image files to upload. The first image
                      uploaded will be used as the Main Image if "Main Image
                      URL" is empty.
                    </div>
                  </div>

                  {/* Display existing images in edit mode with delete option */}
                  {mode === "edit" &&
                    form.image_gallery &&
                    form.image_gallery.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label">Existing Images:</label>
                        <div className="d-flex flex-wrap align-items-center">
                          {form.image_gallery.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="position-relative me-2 mb-2"
                            >
                              <img
                                src={imageUrl}
                                alt={`Product Image ${index + 1}`}
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
                                  handleDeleteImage(imageUrl, editingId)
                                }
                                disabled={submitting}
                                aria-label={`Delete image ${index + 1}`}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Image Gallery URLs (can be kept for manual entry or as fallback) */}
                  <div className="mb-4">
                    <label className="form-label">
                      Image Gallery URLs (Manual Entry)
                    </label>
                    {form.image_gallery.map((u, i) => (
                      <div className="input-group mb-2" key={`img-url-${i}`}>
                        <span className="input-group-text">URL {i + 1}:</span>
                        <input
                          type="url"
                          className="form-control"
                          value={u}
                          // Disable input if the URL came from an uploaded image
                          onChange={(e) => changeGallery(i, e.target.value)}
                          placeholder={`Image URL #${i + 1}`}
                          disabled={
                            submitting ||
                            (u && u.startsWith("https://res.cloudinary.com/"))
                          } // Disable manual edit for Cloudinary URLs
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteImage(u, editingId)}
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
                      onClick={addGallery}
                      disabled={submitting}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add URL Field
                    </button>
                    <div className="form-text">
                      Manually add additional image URLs or edit URLs of
                      existing images. Uploaded images will automatically add
                      URLs here.
                    </div>
                  </div>

                  {/* isVisible Checkbox */}
                  <div className="mb-4 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="productIsVisible"
                      name="isVisible"
                      checked={form.isVisible}
                      onChange={onChange}
                      disabled={submitting}
                    />
                    <label className="form-check-label" htmlFor="productIsVisible">
                      Visible on Website
                    </label>
                    <div className="form-text">
                      Uncheck to hide this product from the public website.
                    </div>
                  </div>

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
                      Lower numbers appear first in listings.
                    </div>
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
                          Product
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
                  <h3 className="h5 m-0">All Products</h3>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchProducts}
                    disabled={loadingProducts || submitting}
                  >
                    {loadingProducts ? (
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

                {loadingProducts ? (
                  <div>Loading...</div>
                ) : sortedProducts.length === 0 ? (
                  <div className="text-muted">No products yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Image</th>
                          <th>Slug</th>
                          <th>Category</th>
                          <th>Order</th>
                          <th>Visible</th>
                          <th style={{ width: 170 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="fw-medium">{p.name}</td>
                            {/* Display main image or a placeholder */}
                            <td>
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
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
                              <code>{p.slug}</code>
                            </td>
                            <td>{p.category_slug}</td>
                            <td>{p.order || 0}</td>
                            <td>
                              {p.isVisible ? (
                                <i className="fas fa-eye text-success" title="Visible"></i>
                              ) : (
                                <i className="fas fa-eye-slash text-danger" title="Hidden"></i>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => startEdit(p)}
                                  disabled={submitting}
                                >
                                  <i className="fas fa-edit me-1"></i>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(p)}
                                  disabled={submitting}
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

export default Products;
