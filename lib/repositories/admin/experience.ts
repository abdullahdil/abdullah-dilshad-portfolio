import type { ExperienceRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ExperienceInput } from "@/lib/validations/experience";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listAdminExperience(): Promise<ExperienceRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ExperienceRow[];
}

export async function createAdminExperience(input: ExperienceInput): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("experience")
    .insert({
      organization: input.organization,
      role: input.role,
      location: input.location,
      start_date: input.startDate,
      end_date: input.isCurrent ? null : input.endDate || null,
      is_current: input.isCurrent,
      description: input.description,
      display_order: input.displayOrder,
      is_published: input.isPublished,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminExperience(
  id: string,
  input: ExperienceInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("experience")
    .update({
      organization: input.organization,
      role: input.role,
      location: input.location,
      start_date: input.startDate,
      end_date: input.isCurrent ? null : input.endDate || null,
      is_current: input.isCurrent,
      description: input.description,
      display_order: input.displayOrder,
      is_published: input.isPublished,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminExperience(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) throw error;
}
