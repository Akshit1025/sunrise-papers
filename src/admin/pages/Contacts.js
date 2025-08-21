import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

const Contacts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr("");
      const ref = collection(db, "contact_messages");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setErr("Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "contact_messages", id), { status });
    await fetchAll();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await deleteDoc(doc(db, "contact_messages", id));
    await fetchAll();
  };

  return (
    <div>
      <h2 className="h4 mb-4">Contact Messages</h2>
      {err && <div className="alert alert-danger mb-3">{err}</div>}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 m-0">All Messages</h3>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={fetchAll}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-muted">No messages yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td style={{ maxWidth: 320, whiteSpace: "normal" }}>
                        {m.message}
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={m.status || "new"}
                          onChange={(e) => updateStatus(m.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td>
                        {m.createdAt?.toDate
                          ? m.createdAt.toDate().toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => remove(m.id)}
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
        </div>
      </div>
    </div>
  );
};

export default Contacts;
