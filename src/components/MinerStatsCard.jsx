import { useState } from "react";

export default function MinerStatsCard({ address }) {
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setOut(null);
    try {
      const res = await fetch(`/.netlify/functions/miner-stats?address=${encodeURIComponent(address || "")}`, {
        cache: "no-store"
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Miner stats request failed");
      setOut(j);
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Miner Uptime / Hashrate (Disabled Template)</h3>
      <p className="muted">
        This feature is intentionally disabled to control bandwidth and abuse. The template shows what will exist when enabled.
      </p>

      <div className="row">
        <button onClick={load}>View Template</button>
        <span className="muted">Currently returns enabled=false.</span>
      </div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}
      {out ? <pre style={{ marginTop: 12 }}>{JSON.stringify(out, null, 2)}</pre> : null}
    </div>
  );
}
