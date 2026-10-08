import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Cookie-less, anonymous Supabase client for PUBLIC reads only.
 *
 * It never touches `cookies()` / `headers()`, so public pages that read through
 * `lib/repositories/*.ts` stay statically renderable (ISR) instead of being
 * forced dynamic on every request. It always runs as `anon`, so RLS shows it
 * published rows only — even when the visitor happens to be a signed-in admin.
 *
 * Admin pages, auth and server actions keep the cookie client in
 * `lib/supabase/server.ts`. Never use this client for writes.
 */
let cached: SupabaseClient | null = null;

export function createPublicSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;

  cached = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cached;
}
