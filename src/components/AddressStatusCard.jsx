import { useState } from "react";

function looksLikeBtcAddress(a) {
  if (!a) return false;
  if (a.startsWith("bc1") && a.length >= 14 && a.length <= 90) return true;
  if ((a.startsWith("1") || a.startsWith("3")) && a.length >= 26 && a.length <= 62) return true;
  return false;
}

export default function AddressStatusCard({ address }) {
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");

  async function check() {
    setErr("");
    setOut(null);

    if (!looksLikeBtcAddress(address)) {
      setErr("Enter a valid-looking Bitcoin address (format check).");
      return;
    }

    try {
      const res = await fetch(`/.netlify/functions/address-status?address=${encodeURIComponent(address)}`, {
        cache: "no-store"
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Status check failed");
      setOut(j);
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Check Address Status</h3>
      <div className="row">
        <button onClick={check}>Check</button>
        <span className="muted">Returns: approved / pending / rejected / not_found</span>
      </div>
      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}
      {out ? <pre style={{ marginTop: 12 }}>{JSON.stringify(out, null, 2)}</pre> : null}
    </div>
  );
}
