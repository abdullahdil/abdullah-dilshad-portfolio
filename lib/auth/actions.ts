"use server";

import { redirect } from "next/navigation";
import { isCurrentUserAuthorizedAdmin } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error: string | null;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid credentials.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Unable to create auth client." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  const authorized = await isCurrentUserAuthorizedAdmin(data.user.id);
  if (!authorized) {
    await supabase.auth.signOut();
    return {
      error:
        "Signed in, but this account is not an authorized admin. Ask the operator to add your user id to authorized_admins.",
    };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  redirect("/admin/login");
}
