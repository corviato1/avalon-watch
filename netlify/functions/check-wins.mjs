import { json } from "./_lib/http.mjs";
import { supabaseService } from "./_lib/supabase.mjs";
import { getTip, getCoinbaseOutputs } from "./_lib/btc.mjs";

export const config = {
  // Netlify Scheduled Function: every minute
  schedule: "*/1 * * * *"
};

export default async function handler() {
  try {
    const enabled = String(process.env.WIN_CHECK_ENABLED || "true").toLowerCase() === "true";
    if (!enabled) return json(200, { ok: true, enabled: false });

    const sb = supabaseService();

    // Deduplicate by height
    const { data: stateRow } = await sb.from("app_state").select("*").eq("key", "last_tip_height").maybeSingle();

    const { tipHeight, tipHash } = await getTip();
    const lastHeight = stateRow?.value ? Number(stateRow.value) : null;

    if (lastHeight === tipHeight) {
      return json(200, { ok: true, skipped: true, reason: "already_processed", tipHeight, tipHash });
    }

    const { coinbaseTxid, addresses } = await getCoinbaseOutputs(tipHash);

    // Approved addresses
    const { data: approved, error } = await sb
      .from("join_requests")
      .select("address")
      .eq("status", "approved");

    if (error) return json(500, { error: "Approved query failed", details: error.message });

    const approvedSet = new Set((approved || []).map((r) => r.address));
    const winners = addresses.filter((a) => approvedSet.has(a));

    // Store win event(s)
    if (winners.length) {
      for (const addr of winners) {
        await sb.from("win_events").insert({
          height: tipHeight,
          block_hash: tipHash,
          coinbase_txid: coinbaseTxid,
          payout_address: addr
        });
      }
    }

    // Update state
    await sb.from("app_state").upsert({ key: "last_tip_height", value: String(tipHeight) });

    return json(200, {
      ok: true,
      tipHeight,
      tipHash,
      coinbaseTxid,
      coinbaseAddresses: addresses,
      approvedWinners: winners
    });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e) });
  }
}
