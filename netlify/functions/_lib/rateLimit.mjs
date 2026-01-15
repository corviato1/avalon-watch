import { supabaseService } from "./supabase.mjs";

export async function enforceRateLimit({ ip, limitPerHour }) {
  const sb = supabaseService();
  const hour = new Date();
  hour.setMinutes(0, 0, 0);
  const hourIso = hour.toISOString();

  const { data: row, error } = await sb
    .from("rate_limits")
    .select("ip,hour_start,count")
    .eq("ip", ip)
    .eq("hour_start", hourIso)
    .maybeSingle();

  if (error) throw new Error("Rate limit read failed");

  if (!row) {
    const { error: insErr } = await sb
      .from("rate_limits")
      .insert({ ip, hour_start: hourIso, count: 1 });
    if (insErr) throw new Error("Rate limit write failed");
    return { ok: true, remaining: limitPerHour - 1 };
  }

  if (row.count >= limitPerHour) {
    return { ok: false, remaining: 0 };
  }

  const { error: upErr } = await sb
    .from("rate_limits")
    .update({ count: row.count + 1 })
    .eq("ip", ip)
    .eq("hour_start", hourIso);

  if (upErr) throw new Error("Rate limit update failed");
  return { ok: true, remaining: limitPerHour - (row.count + 1) };
}
