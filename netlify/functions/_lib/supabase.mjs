import { createClient } from "@supabase/supabase-js";

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function supabaseAnon() {
  return createClient(must("SUPABASE_URL"), must("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export function supabaseService() {
  return createClient(must("SUPABASE_URL"), must("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
