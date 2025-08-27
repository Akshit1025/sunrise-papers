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
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [originalProductData, setOriginalProductData] = useState(null); // Store original data for comparison

  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  const mainImageFileInputRef = React.useRef(null);
  const galleryImageFileInputRef = React.useRef(null);

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

  // Handler for the single main image file input
  const handleMainImageFileChange = (e) => {
    const file = e.target.files[0]; // Get only the first file
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (file) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Max size is 10 MB.`);
        setMainImageFile(null); // Clear the state
        e.target.value = null; // Clear the input
        return;
      }
      setMainImageFile(file); // Set the single file state
    } else {
      setMainImageFile(null); // Clear the state if no file is selected
    }
  };

  // Handler for the multiple gallery image files input
  const handleGalleryImageFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Max size is 10 MB.`);
        return false;
      }
      return true;
    });

    setGalleryImageFiles(validFiles); // Set the multiple files state
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
    setMainImageFile(null);
    setGalleryImageFiles([]); 
    setError("");
    setOriginalProductData(null); // Clear original data

    // Clear the file input element's values using the refs
    if (mainImageFileInputRef.current) {
      mainImageFileInputRef.current.value = "";
    }
    if (galleryImageFileInputRef.current) {
      galleryImageFileInputRef.current.value = "";
    }
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

  const buildPayload = (
    uploadedMainImageUrl = "",
    uploadedGalleryImageUrls = []
  ) => {
    const existingGalleryUrls = (form.image_gallery || [])
      .map((u) => u.trim())
      .filter(Boolean);

    // Determine the final main image URL:
    // 1. Use the manual image_url from the form if it exists and is not a placeholder.
    // 2. Otherwise, use the uploaded main image URL if one was uploaded.
    // 3. Otherwise, keep the existing main image URL if in edit mode and not changed.
    // 4. Otherwise, it's empty.
    let finalMainImageUrl = form.image_url.trim();

    if (!finalMainImageUrl && uploadedMainImageUrl) {
      finalMainImageUrl = uploadedMainImageUrl;
    } else if (mode === "edit" && originalProductData && !finalMainImageUrl) {
      // If in edit mode, no manual URL, and no new main image upload, retain original main URL
      finalMainImageUrl = originalProductData.image_url || "";
    }

    // Combine existing manual/uploaded gallery URLs and the newly uploaded gallery URLs
    const finalImageGallery = [
      ...existingGalleryUrls,
      ...uploadedGalleryImageUrls, // Add the uploaded gallery images directly
    ].filter(Boolean); // Ensure no empty strings

    return {
      name: form.name.trim(),
      slug: slugify(form.slug.trim()),
      category_slug: form.category_slug.trim(),
      short_description: form.short_description.trim(),
      long_description: form.long_description.trim(),
      image_url: finalMainImageUrl, // Use the determined final main image URL
      image_gallery: finalImageGallery, // Use the final gallery URLs
      order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
      isVisible: !!form.isVisible,
    };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.category_slug.trim()) return setError("Category is required.");
    setSubmitting(true);

    try {
      // Upload the main image file (if selected)
      let uploadedMainImageUrl = "";
      if (mainImageFile) {
        // Pass the single file in an array to uploadImages
        const urls = await uploadImages([mainImageFile]);
        if (urls.length > 0) {
          uploadedMainImageUrl = urls[0]; // Get the URL of the uploaded main image
        } else {
          // Handle case where main image upload failed
          setError("Main image upload failed.");
          setSubmitting(false);
          return;
        }
      }

      // Upload the gallery image files (if any selected)
      let uploadedGalleryImageUrls = [];
      if (galleryImageFiles.length > 0) {
        uploadedGalleryImageUrls = await uploadImages(galleryImageFiles);
        if (
          uploadedGalleryImageUrls.length === 0 &&
          galleryImageFiles.length > 0 &&
          !error
        ) {
          // Handle case where gallery image uploads failed
          setError("One or more gallery image uploads failed.");
          setSubmitting(false);
          return;
        }
      }

      // buildPayload now uses the separate uploaded URLs
      const payload = buildPayload(
        uploadedMainImageUrl,
        uploadedGalleryImageUrls
      );

      // Add validation for minimum images if required
      if (!payload.image_url) {
        // Example: require at least a main image URL (manual or uploaded)
        setError(
          "Please provide a Main Image URL or upload a Main Image file."
        );
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, "products"), payload); // Use the payload
      resetForm(); // This clears form state, file states, and input values
      await fetchProducts();
    } catch (e) {
      console.error(e);
      // Check if error was already set by uploads or validation
      if (!error) {
        // Only set a generic error if no specific error was already set
        setError(e.message || "Failed to create product.");
      }
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
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !originalProductData) return;
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    if (!form.slug.trim()) return setError("Slug is required");
    if (!form.category_slug.trim()) return setError("Category is required");
    setSubmitting(true);

    try{
      let uploadedMainImageUrl = "";
      if (mainImageFile) {
        const urls = await uploadImages([mainImageFile]);
        if (urls.length > 0) {
          uploadedMainImageUrl = urls[0];
        } else {
          setError("New main image upload failed.");
          setSubmitting(false);
          return;
        }
      }

      let uploadedGalleryImageUrls = [];
      if (galleryImageFiles.length > 0) {
        uploadedGalleryImageUrls = await uploadImages(galleryImageFiles);
        if (uploadedGalleryImageUrls.length === 0 && galleryImageFiles.length > 0 && !error) {
          setError("One or more new gallery image uploads failed.");
          setSubmitting(false);
          return;
        }
      }

      const finalPayloadCandidate = buildPayload(uploadedMainImageUrl, uploadedGalleryImageUrls);

      const allFinalImageUrls = new Set([
        finalPayloadCandidate.image_url,
        ...(finalPayloadCandidate.image_gallery || []),
      ].filter(Boolean));

      const imageUrlsToDelete = [];

      const allOriginalImageUrls = new Set([
        originalProductData.image_url,
        ...(originalProductData.image_gallery || []),
      ].filter(Boolean));

      allOriginalImageUrls.forEach(url => {
        if (url.startsWith("https://res.cloudinary.com/") && !allFinalImageUrls.has(url)) {
          imageUrlsToDelete.push(url);
        }
      });

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
          let publicIdParts = urlParts.slice(uploadIndex + 2); // Get parts after /upload/ and potentially version segment
           if (publicIdParts.length === 0) {
              // Handle cases without version segment
              publicIdParts = urlParts.slice(uploadIndex + 1); // Get parts after /upload/
           }

          // Join the parts and remove the file extension
          const publicId = publicIdParts.join("/").split(".")[0];

          // Call Cloudinary API to delete (frontend deletion - INSECURE for production)
          const timestamp = new Date().getTime();
          // Note: api_sign_request is typically used on the backend with your API Secret.
          // Performing this on the frontend with the secret exposed is INSECURE.
          // Replace this with a backend call to handle deletion securely.
          const signature = cloudinaryCore.utils.api_sign_request(
            {
              timestamp: timestamp,
              public_id: publicId,
               resource_type: "image", // Assuming all are images, add resource_type
              // Add other parameters used in the original upload if necessary for signing
            },
            process.env.REACT_APP_CLOUDINARY_API_SECRET // INSECURE on frontend!
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
          console.error(`Error deleting image ${imageUrl} from Cloudinary during update:`, e);
        }
      }
      if (!finalPayloadCandidate.image_url) {
        setError("Plese provide a Main Image URL or upload a Main Image File.");
        setSubmitting(false);
        return;
      }

      await updateDoc(doc(db, "products", editingId), finalPayloadCandidate);

      resetForm();
      await fetchProducts();
    } catch (e){
      console.error(e);
      if (!error) {
        setError(e.message || "Failed to update product.");
      }
    } finally {
      setSubmitting(false);
    }
  }

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
                    <label htmlFor="mainImageFile" className="form-label">
                      Upload Main Image (Single)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="mainImageFile"
                      name="mainImageFile"
                      onChange={handleMainImageFileChange}
                      disabled={submitting}
                      accept="image/*"
                      ref={mainImageFileInputRef}
                    />
                    <div className="form-text">
                      Select a single image file for the main product image
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="galleryImageFiles" className="form-label">
                      Upload Gallery Images (Multiple)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="galleryImageFiles"
                      name="galleryImageFiles"
                      onChange={handleGalleryImageFileChange}
                      multiple
                      disabled={submitting}
                      accept="image/*"
                      ref={galleryImageFileInputRef}
                    />
                    <div className="form-text">
                      Select one or more image files for the product gallery.
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
                    <label
                      className="form-check-label"
                      htmlFor="productIsVisible"
                    >
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
                                <i
                                  className="fas fa-eye text-success"
                                  title="Visible"
                                ></i>
                              ) : (
                                <i
                                  className="fas fa-eye-slash text-danger"
                                  title="Hidden"
                                ></i>
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
