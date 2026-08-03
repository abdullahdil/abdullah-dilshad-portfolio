import type { PublicTemplateRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TemplateInput } from "@/lib/validations/template";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listAdminTemplates(): Promise<PublicTemplateRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("public_templates")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PublicTemplateRow[];
}

export async function createAdminTemplate(input: TemplateInput): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("public_templates")
    .insert({
      title: input.title,
      description: input.description,
      external_url: input.externalUrl,
      tools: input.tools,
      accent: input.accent,
      display_order: input.displayOrder,
      is_published: input.isPublished,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminTemplate(
  id: string,
  input: TemplateInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("public_templates")
    .update({
      title: input.title,
      description: input.description,
      external_url: input.externalUrl,
      tools: input.tools,
      accent: input.accent,
      display_order: input.displayOrder,
      is_published: input.isPublished,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminTemplate(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("public_templates").delete().eq("id", id);
  if (error) throw error;
}
