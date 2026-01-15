import { json, getClientIp } from "./_lib/http.mjs";
import { enforceRateLimit } from "./_lib/rateLimit.mjs";
import { supabaseService } from "./_lib/supabase.mjs";

function looksLikeBtcAddress(a) {
  if (!a) return false;
  if (a.startsWith("bc1") && a.length >= 14 && a.length <= 90) return true;
  if ((a.startsWith("1") || a.startsWith("3")) && a.length >= 26 && a.length <= 62) return true;
  return false;
}

export default async function handler(request) {
  try {
    if (request.method !== "POST") return json(405, { error: "Method not allowed" });

    const ip = getClientIp(request);
    const rl = await enforceRateLimit({ ip, limitPerHour: 3 });
    if (!rl.ok) return json(429, { error: "Rate limited" });

    const body = await request.json();
    const address = (body?.address || "").trim();
    const request_email = (body?.email || "").trim() || null;
    const note = (body?.note || "").trim() || null;

    if (!looksLikeBtcAddress(address)) return json(400, { error: "Invalid Bitcoin address format" });

    const meta = {
      ip,
      user_agent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      accept_language: request.headers.get("accept-language")
    };

    const sb = supabaseService();

    // Prevent duplicate spam (same address)
    const { data: existing } = await sb
      .from("join_requests")
      .select("id,status,updated_at")
      .eq("address", address)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing?.length) {
      return json(200, {
        ok: true,
        message: "Request already exists for this address",
        existing: existing[0]
      });
    }

    const { data, error } = await sb
      .from("join_requests")
      .insert({
        address,
        request_email,
        note,
        status: "pending",
        meta
      })
      .select("id,status,created_at")
      .single();

    if (error) return json(500, { error: "Insert failed", details: error.message });

    return json(200, { ok: true, message: "Request submitted", ...data });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e) });
  }
}
