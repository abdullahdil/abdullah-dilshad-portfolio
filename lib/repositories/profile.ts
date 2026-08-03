import { profileSeed } from "@/lib/content/seed";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicProfile = {
  fullName: string;
  professionalTitle: string;
  heroHeadline: string;
  heroDescription: string;
  shortBio: string;
  longBio: string[];
  location: string;
  availabilityStatus: "available" | "limited" | "unavailable";
  availabilityLabel: string;
  email: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  n8nProfileUrl: string | null;
  credentialUrl: string | null;
  cvUrl: string | null;
  portraitUrl: string | null;
};

function mapProfile(row: ProfileRow): PublicProfile {
  return {
    fullName: row.full_name,
    professionalTitle: row.professional_title,
    heroHeadline: row.hero_headline,
    heroDescription: row.hero_description,
    shortBio: row.short_bio,
    longBio: row.long_bio,
    location: row.location,
    availabilityStatus: row.availability_status,
    availabilityLabel: row.availability_label,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    n8nProfileUrl: row.n8n_profile_url,
    credentialUrl: row.credential_url,
    cvUrl: row.cv_url,
    portraitUrl: row.portrait_url,
  };
}

function seedProfile(): PublicProfile {
  return {
    fullName: profileSeed.fullName,
    professionalTitle: profileSeed.professionalTitle,
    heroHeadline: profileSeed.heroHeadline,
    heroDescription: profileSeed.heroDescription,
    shortBio: profileSeed.shortBio,
    longBio: [...profileSeed.longBio],
    location: profileSeed.location,
    availabilityStatus: profileSeed.availabilityStatus,
    availabilityLabel: profileSeed.availabilityLabel,
    email: profileSeed.email,
    linkedinUrl: profileSeed.linkedinUrl,
    githubUrl: profileSeed.githubUrl,
    n8nProfileUrl: profileSeed.n8nProfileUrl,
    credentialUrl: profileSeed.credentialUrl,
    cvUrl: profileSeed.cvUrl,
    portraitUrl: null,
  };
}

export async function getPublicProfile(): Promise<PublicProfile> {
  if (!isSupabaseConfigured()) {
    return seedProfile();
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedProfile();

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) return seedProfile();
    return mapProfile(data as ProfileRow);
  } catch {
    return seedProfile();
  }
}
