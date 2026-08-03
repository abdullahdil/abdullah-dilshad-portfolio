import { capabilitiesSeed } from "@/lib/content/seed";
import type { CapabilityRow } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicCapabilityGroup = {
  category: string;
  icon: "Workflow" | "Brain" | "Plug" | "Terminal";
  accent: "primary" | "secondary" | "tertiary";
  items: string[];
};

const categoryMeta: Record<
  string,
  { icon: PublicCapabilityGroup["icon"]; accent: PublicCapabilityGroup["accent"] }
> = {
  "Automation Engineering": { icon: "Workflow", accent: "primary" },
  "AI and LLM Workflows": { icon: "Brain", accent: "secondary" },
  Integrations: { icon: "Plug", accent: "tertiary" },
  "Engineering Tools": { icon: "Terminal", accent: "primary" },
};

function seedCapabilities(): PublicCapabilityGroup[] {
  return capabilitiesSeed.map((group) => ({
    category: group.category,
    icon: group.icon,
    accent: group.accent,
    items: [...group.items],
  }));
}

export async function listPublishedCapabilities(): Promise<PublicCapabilityGroup[]> {
  if (!isSupabaseConfigured()) {
    return seedCapabilities();
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedCapabilities();

    const { data, error } = await supabase
      .from("capabilities")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return seedCapabilities();
    }

    const grouped = new Map<string, string[]>();
    for (const row of data as CapabilityRow[]) {
      const items = grouped.get(row.category) ?? [];
      items.push(row.name);
      grouped.set(row.category, items);
    }

    return [...grouped.entries()].map(([category, items]) => {
      const meta = categoryMeta[category] ?? {
        icon: "Workflow" as const,
        accent: "primary" as const,
      };
      return { category, items, ...meta };
    });
  } catch {
    return seedCapabilities();
  }
}
