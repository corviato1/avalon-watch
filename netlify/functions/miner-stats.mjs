import { json } from "./_lib/http.mjs";

export default async function handler(_request) {
  const enabled = String(process.env.MINER_STATS_ENABLED || "false").toLowerCase() === "true";

  if (!enabled) {
    return json(200, {
      ok: true,
      enabled: false,
      message: "Miner stats are disabled to control bandwidth and prevent abuse.",
      planned: {
        fields: {
          hashrate_current: "number (hashes/sec)",
          hashrate_5m_avg: "number",
          hashrate_1h_avg: "number",
          uptime_seconds: "number",
          last_seen_at: "ISO timestamp",
          worker_name: "string",
          miner_source: "string"
        },
        abuse_controls: {
          approved_only: true,
          minimum_poll_seconds: 30,
          per_ip_rate_limit: "token bucket or fixed-window",
          caching_seconds: 30,
          max_users: "first N approved users",
          monthly_budget_cutoff: "disable when budget >= 50% (or tighten limits)"
        }
      }
    });
  }

  return json(501, { error: "Miner stats enabled but not implemented yet." });
}
