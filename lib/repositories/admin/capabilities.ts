import type { CapabilityRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CapabilityInput } from "@/lib/validations/capability";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listAdminCapabilities(): Promise<CapabilityRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("capabilities")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CapabilityRow[];
}

export async function createAdminCapability(input: CapabilityInput): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("capabilities")
    .insert({
      category: input.category,
      name: input.name,
      description: input.description,
      display_order: input.displayOrder,
      is_published: input.isPublished,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminCapability(
  id: string,
  input: CapabilityInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("capabilities")
    .update({
      category: input.category,
      name: input.name,
      description: input.description,
      display_order: input.displayOrder,
      is_published: input.isPublished,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminCapability(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("capabilities").delete().eq("id", id);
  if (error) throw error;
}
