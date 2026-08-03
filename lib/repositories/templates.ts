import { templatesSeed } from "@/lib/content/seed";
import type { PublicTemplateRow } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicTemplate = {
  title: string;
  description: string;
  externalUrl: string;
  tools: string[];
  accent: "primary" | "secondary" | "tertiary";
  engagementCount?: number | null;
};

function seedTemplates(): PublicTemplate[] {
  return templatesSeed.map((template) => ({
    title: template.title,
    description: template.description,
    externalUrl: template.externalUrl,
    tools: [...template.tools],
    accent: template.accent,
  }));
}

export async function listPublishedTemplates(): Promise<PublicTemplate[]> {
  if (!isSupabaseConfigured()) {
    return seedTemplates();
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedTemplates();

    const { data, error } = await supabase
      .from("public_templates")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return seedTemplates();
    }

    return (data as PublicTemplateRow[]).map((row) => ({
      title: row.title,
      description: row.description,
      externalUrl: row.external_url,
      tools: row.tools ?? [],
      accent: row.accent,
      engagementCount: row.engagement_count,
    }));
  } catch {
    return seedTemplates();
  }
}
