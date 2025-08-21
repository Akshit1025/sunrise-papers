import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

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
  image_url: "",
  hasSubProducts: false,
  order: 0,
  benefits: [""],
  galleryImages: [""], // Used when hasSubProducts is false
  videos: [{ url: "", caption: "" }] // Used when hasSubProducts is false
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

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
      return next;
    });
  };

  const onNameBlur = () => {
    setForm((prev) => ({
      ...prev,
      slug: prev.slug ? slugify(prev.slug) : slugify(prev.name)
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

  // Gallery Images handlers
  const changeGalleryImage = (index, val) => {
    setForm((prev) => {
      const galleryImages = [...prev.galleryImages];
      galleryImages[index] = val;
      return { ...prev, galleryImages };
    });
  };

  const addGalleryImage = () => {
    setForm((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ""]
    }));
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => {
      const galleryImages = prev.galleryImages.filter((_, i) => i !== index);
      return {
        ...prev,
        galleryImages: galleryImages.length ? galleryImages : [""]
      };
    });
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
      videos: [...prev.videos, { url: "", caption: "" }]
    }));
  };

  const removeVideo = (index) => {
    setForm((prev) => {
      const videos = prev.videos.filter((_, i) => i !== index);
      return {
        ...prev,
        videos: videos.length ? videos : [{ url: "", caption: "" }]
      };
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setMode("create");
    setEditingId(null);
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: slugify(form.slug.trim()),
    description: form.description.trim(),
    longDescription: form.longDescription.trim(),
    image_url: form.image_url.trim(),
    hasSubProducts: !!form.hasSubProducts,
    order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
    benefits: (form.benefits || []).map((b) => b.trim()).filter(Boolean),
    galleryImages: (form.galleryImages || [])
      .map((u) => u.trim())
      .filter(Boolean),
    videos: (form.videos || [])
      .map((v) => ({
        url: (v.url || "").trim(),
        caption: (v.caption || "").trim()
      }))
      .filter((v) => v.url)
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "categories"), buildPayload());
      resetForm();
      await fetchCategories();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setMode("edit");
    setEditingId(cat.id);
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
      galleryImages:
        Array.isArray(cat.galleryImages) && cat.galleryImages.length
          ? cat.galleryImages
          : [""],
      videos:
        Array.isArray(cat.videos) && cat.videos.length
          ? cat.videos.map((v) => ({
              url: v.url || "",
              caption: v.caption || ""
            }))
          : [{ url: "", caption: "" }]
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "categories", editingId), buildPayload());
      resetForm();
      await fetchCategories();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      if (editingId === id) resetForm();
      await fetchCategories();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete category.");
    }
  };

  return (
    <div>
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

                <div className="mb-3">
                  <label className="form-label">Main Image URL</label>
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
                    Used when the category has sub-products.
                  </div>
                </div>

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
                  <label className="form-check-label" htmlFor="hasSubProducts">
                    Has sub-products
                  </label>
                </div>

                {!form.hasSubProducts && (
                  <>
                    <div className="mb-4">
                      <label className="form-label">Gallery Images</label>
                      {form.galleryImages.map((u, i) => (
                        <div className="input-group mb-2" key={`gi-${i}`}>
                          <input
                            type="url"
                            className="form-control"
                            value={u}
                            onChange={(e) =>
                              changeGalleryImage(i, e.target.value)
                            }
                            placeholder={`Image URL #${i + 1}`}
                            disabled={submitting}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeGalleryImage(i)}
                            disabled={submitting}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={addGalleryImage}
                        disabled={submitting}
                      >
                        + Add Image
                      </button>
                      <div className="form-text">
                        These appear in the carousel when the category has no
                        sub-products.
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Videos</label>
                      {form.videos.map((v, i) => (
                        <div
                          className="row g-2 align-items-stretch mb-2"
                          key={`vid-${i}`}
                        >
                          <div className="col-12 col-md-7">
                            <input
                              type="url"
                              className="form-control"
                              value={v.url}
                              onChange={(e) =>
                                changeVideo(i, "url", e.target.value)
                              }
                              placeholder="Embeddable video URL (e.g., https://www.youtube.com/embed/...)"
                              disabled={submitting}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <input
                              type="text"
                              className="form-control"
                              value={v.caption}
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
                              onClick={() => removeVideo(i)}
                              disabled={submitting}
                            >
                              X
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
                        + Add Video
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
                    + Add Benefit
                  </button>
                </div>

                <button className="btn btn-dark w-100" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : mode === "edit"
                    ? "Save Changes"
                    : "Create Category"}
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
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
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
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(c.id)}
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
  );
};

export default Categories;
