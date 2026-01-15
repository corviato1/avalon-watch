import { useState } from "react";

function looksLikeBtcAddress(a) {
  if (!a) return false;
  if (a.startsWith("bc1") && a.length >= 14 && a.length <= 90) return true;
  if ((a.startsWith("1") || a.startsWith("3")) && a.length >= 26 && a.length <= 62) return true;
  return false;
}

export default function RequestJoinCard({ address }) {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    setOut(null);

    if (!looksLikeBtcAddress(address)) {
      setErr("Enter a valid-looking Bitcoin address (format check).");
      return;
    }

    try {
      const res = await fetch("/.netlify/functions/request-join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address,
          email: email.trim() || null,
          note: note.trim() || null
        })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Request failed");
      setOut(j);
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Request to Add Address</h3>

      <label>Email (optional)</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

      <label style={{ marginTop: 10 }}>Message / context (optional)</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="What should the admin know?" />

      <div className="row" style={{ marginTop: 10 }}>
        <button onClick={submit}>Submit Request</button>
        <span className="muted">Rate-limited per IP.</span>
      </div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}
      {out ? <pre style={{ marginTop: 12 }}>{JSON.stringify(out, null, 2)}</pre> : null}
    </div>
  );
}
