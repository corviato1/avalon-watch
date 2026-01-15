import { useEffect, useState } from "react";

export default function AdminQueues({ accessToken }) {
  const [filter, setFilter] = useState("pending");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setOut(null);

    try {
      const res = await fetch(`/.netlify/functions/admin-list?status=${encodeURIComponent(filter)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store"
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Admin list failed");
      setOut(j);
    } catch (e) {
      setErr(String(e));
    }
  }

  async function update(id, action) {
    try {
      const res = await fetch("/.netlify/functions/admin-update", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ id, action })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Update failed");
      await load();
    } catch (e) {
      alert(String(e));
    }
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Queues</h3>

      <div className="row">
        <label>Filter</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <button onClick={load}>Refresh</button>
      </div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}

      {!out ? (
        <div className="muted" style={{ marginTop: 10 }}>No data loaded yet.</div>
      ) : (
        <>
          <div className="muted" style={{ marginTop: 10 }}>
            Total: <b>{out.total}</b>
          </div>

          <div className="grid" style={{ marginTop: 12 }}>
            {out.items.map((r) => (
              <div key={r.id} className="card" style={{ border: "1px solid #ddd" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div><b>Address:</b> {r.address}</div>
                    <div><b>Status:</b> {r.status}</div>
                    <div><b>Created:</b> {r.created_at}</div>
                    <div><b>Updated:</b> {r.updated_at}</div>
                    <div><b>Email:</b> {r.request_email || "(none)"}</div>
                  </div>

                  <div className="row">
                    <button onClick={() => update(r.id, "approve")} disabled={r.status === "approved"}>Approve</button>
                    <button onClick={() => update(r.id, "reject")} disabled={r.status === "rejected"}>Reject</button>
                  </div>
                </div>

                <details style={{ marginTop: 10 }}>
                  <summary>Full Metadata</summary>
                  <pre style={{ marginTop: 10 }}>{JSON.stringify(r, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
