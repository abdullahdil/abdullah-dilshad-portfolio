import { createClient } from "@supabase/supabase-js";
import {
  assertServerOnlyServiceRole,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Service-role client for privileged server operations.
 * Never import this into Client Components.
 */
export function createServiceRoleSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = getSupabaseUrl();
  if (!url) return null;

  return createClient(url, assertServerOnlyServiceRole(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
