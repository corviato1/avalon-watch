import { json } from "./_lib/http.mjs";
import { requireAdminFromBearer } from "./_lib/auth.mjs";
import { supabaseService } from "./_lib/supabase.mjs";

export default async function handler(request) {
  const auth = await requireAdminFromBearer(request);
  if (!auth.ok) return json(auth.status, { error: auth.error });

  try {
    const url = new URL(request.url);
    const status = (url.searchParams.get("status") || "pending").trim();

    const sb = supabaseService();
    let q = sb
      .from("join_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (status !== "all") q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return json(500, { error: "Query failed", details: error.message });

    return json(200, { ok: true, status, total: data.length, items: data });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e) });
  }
}
