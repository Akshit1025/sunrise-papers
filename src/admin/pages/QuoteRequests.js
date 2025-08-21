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

const QuoteRequests = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr("");
      const ref = collection(db, "quoteRequests");
      const q = query(ref, orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setErr("Failed to load quote requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "quoteRequests", id), { status });
    await fetchAll();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this quote request?")) return;
    await deleteDoc(doc(db, "quoteRequests", id));
    await fetchAll();
  };

  return (
    <div>
      <h2 className="h4 mb-4">Quote Requests</h2>
      {err && <div className="alert alert-danger mb-3">{err}</div>}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 m-0">All Requests</h3>
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
            <div className="text-muted">No requests yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.categorySlug || "-"}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={r.status || "new"}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td>
                        {r.timestamp?.toDate
                          ? r.timestamp.toDate().toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => remove(r.id)}
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

export default QuoteRequests;
