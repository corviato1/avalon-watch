import { json } from "./_lib/http.mjs";
import { supabaseService } from "./_lib/supabase.mjs";

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const address = (url.searchParams.get("address") || "").trim();
    if (!address) return json(400, { error: "Missing address" });

    const sb = supabaseService();
    const { data, error } = await sb
      .from("join_requests")
      .select("id,address,status,updated_at")
      .eq("address", address)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) return json(500, { error: "Query failed", details: error.message });

    if (!data?.length) return json(200, { ok: true, address, status: "not_found" });

    return json(200, { ok: true, ...data[0] });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e) });
  }
}
