import { json } from "./_lib/http.mjs";
import { requireAdminFromBearer } from "./_lib/auth.mjs";
import { supabaseService } from "./_lib/supabase.mjs";

export default async function handler(request) {
  const auth = await requireAdminFromBearer(request);
  if (!auth.ok) return json(auth.status, { error: auth.error });

  try {
    if (request.method !== "POST") return json(405, { error: "Method not allowed" });
    const body = await request.json();

    const id = body?.id;
    const action = body?.action; // approve | reject
    if (!id || !["approve", "reject"].includes(action)) return json(400, { error: "Bad request" });

    const sb = supabaseService();

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { data, error } = await sb
      .from("join_requests")
      .update({
        status: newStatus,
        decided_at: new Date().toISOString(),
        decided_by: auth.user.id
      })
      .eq("id", id)
      .select("id,status,address,updated_at")
      .single();

    if (error) return json(500, { error: "Update failed", details: error.message });

    return json(200, { ok: true, updated: data });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e) });
  }
}
