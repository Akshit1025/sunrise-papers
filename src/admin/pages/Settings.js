import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const defaultSettings = {
  contactEmail: "dineshgupta@sunrisepapers.co.in",
  phone1: "+91 95555 09507",
  phone2: "+91 98100 87126",
  linkedinUrl: "http://www.linkedin.com/in/dineshgupta-sunriise",
  whatsappUrl: "https://wa.me/919810087126",
  googleUrl: "https://g.co/kgs/WDyBz11",
  addressText:
    "Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka, Delhi, 110078, India",
  mapsUrl: "https://maps.app.goo.gl/zFrzmgSPvqrrL79Z9"
};

const Settings = () => {
  const [form, setForm] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const ref = doc(db, "settings", "site");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setForm({ ...defaultSettings, ...snap.data() });
      } else {
        setForm(defaultSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await setDoc(ref, form, { merge: true });
      setMsg("Settings saved.");
    } catch (e) {
      setMsg(e.message || "Failed to save settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  return (
    <div>
      <h2 className="h4 mb-4">Settings</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card">
          <div className="card-body">
            {msg && <div className="alert alert-info mb-3">{msg}</div>}
            <form onSubmit={onSave}>
              <h5 className="mb-3">Contact</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Contact Email</label>
                  <input
                    className="form-control"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={onChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Phone 1</label>
                  <input
                    className="form-control"
                    name="phone1"
                    value={form.phone1}
                    onChange={onChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Phone 2</label>
                  <input
                    className="form-control"
                    name="phone2"
                    value={form.phone2}
                    onChange={onChange}
                  />
                </div>
              </div>

              <h5 className="mb-3">Social</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    className="form-control"
                    name="linkedinUrl"
                    value={form.linkedinUrl}
                    onChange={onChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">WhatsApp URL</label>
                  <input
                    className="form-control"
                    name="whatsappUrl"
                    value={form.whatsappUrl}
                    onChange={onChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Google Business URL</label>
                  <input
                    className="form-control"
                    name="googleUrl"
                    value={form.googleUrl}
                    onChange={onChange}
                  />
                </div>
              </div>

              <h5 className="mb-3">Address</h5>
              <div className="mb-3">
                <label className="form-label">Address Text</label>
                <textarea
                  className="form-control"
                  name="addressText"
                  rows={2}
                  value={form.addressText}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Maps URL</label>
                <input
                  className="form-control"
                  name="mapsUrl"
                  value={form.mapsUrl}
                  onChange={onChange}
                />
              </div>

              <button className="btn btn-dark" disabled={saving}>
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i> Save Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
