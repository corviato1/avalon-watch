import { createClient } from "@supabase/supabase-js";

/**
 * Simple "design-first" behavior:
 * - If Supabase env vars exist -> use real Supabase.
 * - If they do not -> use a mock auth client so the UI can render.
 *
 * This lets you design the whole UI locally with zero backend setup.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createMockSupabase() {
  let currentSession = null;
  const listeners = new Set();

  function notify(event) {
    for (const fn of listeners) fn(event, currentSession);
  }

  return {
    auth: {
      async getSession() {
        return { data: { session: currentSession }, error: null };
      },
      onAuthStateChange(callback) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              }
            }
          }
        };
      },
      async signInWithPassword({ email }) {
        // Fake login so you can design the Admin UI without Supabase.
        currentSession = {
          access_token: "mock-token",
          user: { email: email || "admin@example.com" }
        };
        notify("SIGNED_IN");
        return { data: { user: currentSession.user }, error: null };
      },
      async signOut() {
        currentSession = null;
        notify("SIGNED_OUT");
        return { error: null };
      }
    }
  };
}

export const isMockMode = !(url && anonKey);

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : createMockSupabase();
