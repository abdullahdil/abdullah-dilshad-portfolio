import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DatabaseHealth = {
  /** Env vars are present and not placeholders. */
  configured: boolean;
  /** A trivial query against the database succeeded. */
  reachable: boolean;
  detail?: string;
};

/**
 * Cheap reachability probe for the admin banner.
 *
 * The public site deliberately falls back to seed content when the database is
 * unreachable, which means an outage is invisible to visitors. The admin panel
 * surfaces it instead, so stale content does not go unnoticed.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      reachable: false,
      detail:
        "Supabase environment variables are missing or still contain placeholders.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return {
        configured: true,
        reachable: false,
        detail: "Could not create a Supabase client.",
      };
    }

    const { error } = await supabase
      .from("profile")
      .select("id", { count: "exact", head: true });

    if (error) {
      return { configured: true, reachable: false, detail: error.message };
    }
    return { configured: true, reachable: true };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      detail: error instanceof Error ? error.message : "Unknown error.",
    };
  }
}
