import { supabaseAnon, supabaseService } from "./supabase.mjs";

export async function requireAdminFromBearer(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  if (!token) return { ok: false, status: 401, error: "Missing Bearer token" };

  const sbAnon = supabaseAnon();
  const { data, error } = await sbAnon.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, error: "Invalid user token" };

  const userId = data.user.id;

  const sb = supabaseService();
  const { data: prof, error: pe } = await sb
    .from("profiles")
    .select("id,is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (pe) return { ok: false, status: 500, error: "Profile lookup failed" };
  if (!prof?.is_admin) return { ok: false, status: 403, error: "Admin required" };

  return { ok: true, user: data.user };
}
