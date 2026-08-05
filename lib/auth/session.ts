import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAuthorizedAdminUser } from "@/lib/auth/authorized-admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminSession = {
  user: User;
  email: string | null;
};

/** Per-request memoization so layout + pages don't re-hit Auth/DB. */
export const getAuthUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const isCurrentUserAuthorizedAdmin = cache(
  async (userId: string): Promise<boolean> => {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("authorized_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return false;

    return isAuthorizedAdminUser(
      { userId, isAuthenticated: true },
      [String(data.user_id)],
    );
  },
);

export const getAuthorizedAdminSession = cache(
  async (): Promise<AdminSession | null> => {
    const user = await getAuthUser();
    if (!user) return null;

    const authorized = await isCurrentUserAuthorizedAdmin(user.id);
    if (!authorized) return null;

    return {
      user,
      email: user.email ?? null,
    };
  },
);

/**
 * Guard for protected admin routes.
 * - Missing Supabase config → login with config error
 * - No session → login
 * - Session but not in authorized_admins → logout route (clears cookies) + denied
 */
export async function requireAuthorizedAdmin(): Promise<AdminSession> {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=not_configured");
  }

  const session = await getAuthorizedAdminSession();
  if (!session) {
    const user = await getAuthUser();
    if (!user) {
      redirect("/admin/login");
    }
    redirect("/admin/logout?error=unauthorized");
  }

  return session;
}
