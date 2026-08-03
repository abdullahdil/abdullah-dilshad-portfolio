import type { ProfileRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { profileSchema } from "@/lib/validations/profile";
import type { z } from "zod";

type ProfileInput = z.infer<typeof profileSchema>;

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function getAdminProfile(): Promise<ProfileRow | null> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function upsertAdminProfile(input: ProfileInput): Promise<void> {
  const supabase = await requireClient();
  const existing = await getAdminProfile();

  const row = {
    full_name: input.fullName,
    professional_title: input.professionalTitle,
    hero_headline: input.heroHeadline,
    hero_description: input.heroDescription,
    short_bio: input.shortBio,
    long_bio: input.longBio,
    location: input.location,
    availability_status: input.availabilityStatus,
    availability_label: input.availabilityLabel,
    email: input.email,
    linkedin_url: input.linkedinUrl || null,
    github_url: input.githubUrl || null,
    n8n_profile_url: input.n8nProfileUrl || null,
    credential_url: input.credentialUrl || null,
    cv_url: input.cvUrl || null,
    portrait_url: input.portraitUrl || null,
  };

  if (existing) {
    const { error } = await supabase.from("profile").update(row).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("profile").insert(row);
  if (error) throw error;
}
