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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import RequireAdmin from "../auth/RequireAdmin";

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
  image_gallery: [],
  order: 0,
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
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
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
    setImageFiles([...e.target.files]);
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

  const uploadImages = async (files) => {
    const imageUrls = [];
    for (const file of files) {
      const storageRef = ref(storage, `product_images/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      imageUrls.push(downloadURL);
    }
    return imageUrls;
  };

  const buildPayload = (uploadedImageUrls = []) => ({
    name: form.name.trim(),
    slug: slugify(form.slug.trim()),
    category_slug: form.category_slug.trim(),
    short_description: form.short_description.trim(),
    long_description: form.long_description.trim(),
    image_url:
      form.image_url.trim() ||
      (uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : ""),
    image_gallery: [
      ...(form.image_gallery || []).map((u) => u.trim()).filter(Boolean),
      ...uploadedImageUrls,
    ].filter(Boolean),
    order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
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
    setForm({
      name: p.name || "",
      slug: p.slug || "",
      category_slug: p.category_slug || "",
      short_description: p.short_description || "",
      long_description: p.long_description || "",
      image_url: p.image_url || "",
      image_gallery:
        Array.isArray(p.image_gallery) && p.image_gallery.length
          ? p.image_gallery
          : [],
      order: typeof p.order === "number" ? p.order : 0,
    });
    setImageFiles([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
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

      // Merge existing gallery Urls with newly uploaded ones
      const updatedGallery = [
        ...(form.image_gallery || []).map((u) => u.trim()).filter(Boolean),
        ...uploadedImageUrls,
      ].filter(Boolean);

      await updateDoc(doc(db, "products", editingId), {
        ...buildPayload(uploadedImageUrls),
        image_gallery: updatedGallery,
      });
      resetForm();
      await fetchProducts();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageUrlToDelete, productId) => {
    setError("");
    setSubmitting(true);
    try {
      const imageRef = ref(storage, imageUrlToDelete);
      await deleteObject(imageRef);

      const productRef = doc(db, "products", productId);
      const productToUpdate = products.find((p) => p.id === productId);
      if (productToUpdate) {
        const updatedImages = (productToUpdate.image_gallery || []).filter(
          (url) => url !== imageUrlToDelete
        );
        const updatedMainImageUrl =
          productToUpdate.image_url === imageUrlToDelete
            ? ""
            : productToUpdate.image_url;
        await updateDoc(productRef, {
          image_gallery: updatedImages,
          image_url: updatedMainImageUrl,
        });

        setProducts(
          products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  image_gallery: updatedImages,
                  image_url: updatedMainImageUrl,
                }
              : p
          )
        );
        if (editingId === productId) {
          setForm((prevForm) => ({
            ...prevForm,
            image_gallery: updatedImages,
            image_url: updatedMainImageUrl,
          }));
        }
      }

      console.log("Image Deleted Successfully from the Storage and Document");
    } catch (storageError) {
      if (storageError.code === "storage/object-not-found") {
        console.warn(
          `Image not found in storage: ${imageUrlToDelete}. Removing from document.`
        );
        // If image not found in storage, still remove from document
        const productRef = doc(db, "products", productId);
        const productToUpdate = products.find((p) => p.id === productId);
        if (productToUpdate) {
          const updatedImages = (productToUpdate.image_gallery || []).filter(
            (url) => url !== imageUrlToDelete
          );
          const updatedMainImageUrl =
            productToUpdate.image_url === imageUrlToDelete
              ? ""
              : productToUpdate.image_url;

          await updateDoc(productRef, {
            image_gallery: updatedImages,
            image_url: updatedMainImageUrl,
          });

          // Update local state
          setProducts(
            products.map((p) =>
              p.id === productId
                ? {
                    ...p,
                    image_gallery: updatedImages,
                    image_url: updatedMainImageUrl,
                  }
                : p
            )
          );
          if (editingId === productId) {
            setForm((prevForm) => ({
              ...prevForm,
              image_gallery: updatedImages,
              image_url: updatedMainImageUrl,
            }));
          }
        }
      } else {
        console.error("Error deleting image:", storageError);
        setError(`Failed to delete image: ${storageError.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productToDelete) => {
    const ok = window.confirm("Delete this product? This cannot be undone.");
    if (!ok) return;
    setError("");
    setSubmitting(true);
    try {
      // Delete images from storage first
      const imageUrlsToDelete = [
        productToDelete.image_url,
        ...(productToDelete.image_gallery || []),
      ].filter(Boolean);

      for (const imageUrl of imageUrlsToDelete) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
          console.log(`Deleted image from storage: ${imageUrl}`);
        } catch (storageError) {
          if (storageError.code === "storage/object-not-found") {
            console.warn(
              `Image not found in storage, skipping deletion: ${imageUrl}`,
              storageError
            );
          } else {
            console.error(
              `Error deleting image from storage: ${imageUrl}`,
              storageError
            );
            // Continue with other images and product deletion
          }
        }
      }

      // Delete product document
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
                      disabled={submitting}
                    />
                    <div className="form-text">
                      Entering a URL here will override any uploaded main image.
                    </div>
                  </div>

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
                          disabled={submitting || (u && u.startsWith("gs://"))} // Optionally disable manual edit for uploaded URLs
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeGallery(i)}
                          disabled={submitting}
                        >
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
                      + Add URL Field
                    </button>
                    <div className="form-text">
                      Manually add additional image URLs or edit URLs of
                      existing images. Uploaded images will automatically add
                      URLs here.
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
                    {submitting
                      ? "Saving..."
                      : mode === "edit"
                      ? "Save Changes"
                      : "Create Product"}
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
                    {loadingProducts ? "Refreshing..." : "Refresh"}
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
                          <th style={{ width: 170 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="fw-medium">{p.name}</td>
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
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => startEdit(p)}
                                  disabled={submitting}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(p)}
                                  disabled={submitting}
                                >
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
