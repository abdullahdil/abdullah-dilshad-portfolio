import { experienceSeed } from "@/lib/content/seed";
import type { ExperienceRow } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicExperience = {
  organization: string;
  role: string;
  location: string;
  period: string;
  isCurrent: boolean;
  description: string;
};

function formatPeriod(start: string, end: string | null, isCurrent: boolean): string {
  const startDate = new Date(start);
  const startLabel = startDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  if (isCurrent || !end) {
    return `${startLabel}–Present`;
  }

  const endDate = new Date(end);
  const endLabel = endDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${startLabel}–${endLabel}`;
}

function seedExperience(): PublicExperience[] {
  return experienceSeed.map((item) => ({
    organization: item.organization,
    role: item.role,
    location: item.location,
    period: item.period,
    isCurrent: item.isCurrent,
    description: item.description,
  }));
}

export async function listPublishedExperience(): Promise<PublicExperience[]> {
  if (!isSupabaseConfigured()) {
    return seedExperience();
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedExperience();

    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return seedExperience();
    }

    return (data as ExperienceRow[]).map((row) => ({
      organization: row.organization,
      role: row.role,
      location: row.location,
      period: formatPeriod(row.start_date, row.end_date, row.is_current),
      isCurrent: row.is_current,
      description: row.description,
    }));
  } catch {
    return seedExperience();
  }
}
