import { useState } from "react";
import AddressStatusCard from "../components/AddressStatusCard.jsx";
import RequestJoinCard from "../components/RequestJoinCard.jsx";
import MinerStatsCard from "../components/MinerStatsCard.jsx";

export default function Landing() {
  const [address, setAddress] = useState("");

  return (
    <div className="grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Landing</h2>
        <p className="muted">
          Submit your Bitcoin payout address for manual approval. Approved addresses will be monitored for solo block wins.
        </p>
        <label>Bitcoin address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value.trim())}
          placeholder="bc1... / 1... / 3..."
        />
      </div>

      <AddressStatusCard address={address} />
      <RequestJoinCard address={address} />
      <MinerStatsCard address={address} />
    </div>
  );
}
