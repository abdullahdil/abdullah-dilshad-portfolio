import { heroWorkflowSeed, navLinks, proofStripSeed } from "@/lib/content/seed";
import { workflowGroups as workflowGroupsSeed } from "@/lib/content/workflows";
import type {
  HeroWorkflowStepRow,
  NavLinkRow,
  ProofPointRow,
  WorkflowGroupRow,
  WorkflowRow,
} from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { heroWorkflowIcons } from "@/lib/validations/site-content";

export type PublicProofPoint = {
  value: string;
  label: string;
  featured: boolean;
};

export type PublicHeroWorkflowStep = {
  title: string;
  description: string;
  icon: (typeof heroWorkflowIcons)[number];
};

export type PublicNavLink = {
  href: string;
  label: string;
};

export type PublicWorkflowListing = {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  imageAlt: string;
  outcomeTags: string[];
  active: boolean;
};

export type PublicWorkflowGroup = {
  category: string;
  description: string;
  items: PublicWorkflowListing[];
};

// ---------------------------------------------------------------------------
// Proof points
// ---------------------------------------------------------------------------

function seedProofPoints(): PublicProofPoint[] {
  return proofStripSeed.map((item) => ({
    value: item.value,
    label: item.label,
    featured: "featured" in item && item.featured === true,
  }));
}

export async function listPublishedProofPoints(): Promise<PublicProofPoint[]> {
  if (!isSupabaseConfigured()) return seedProofPoints();

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedProofPoints();

    const { data, error } = await supabase
      .from("proof_points")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return seedProofPoints();

    return (data as ProofPointRow[]).map((row) => ({
      value: row.value,
      label: row.label,
      featured: row.is_featured,
    }));
  } catch {
    return seedProofPoints();
  }
}

// ---------------------------------------------------------------------------
// Hero workflow steps
// ---------------------------------------------------------------------------

function seedHeroWorkflowSteps(): PublicHeroWorkflowStep[] {
  return heroWorkflowSeed.map((step) => ({
    title: step.title,
    description: step.description,
    icon: step.icon,
  }));
}

/** Unknown icon names fall back to a safe default rather than crashing render. */
function coerceIcon(icon: string): PublicHeroWorkflowStep["icon"] {
  return (heroWorkflowIcons as readonly string[]).includes(icon)
    ? (icon as PublicHeroWorkflowStep["icon"])
    : "Workflow";
}

export async function listPublishedHeroWorkflowSteps(): Promise<
  PublicHeroWorkflowStep[]
> {
  if (!isSupabaseConfigured()) return seedHeroWorkflowSteps();

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedHeroWorkflowSteps();

    const { data, error } = await supabase
      .from("hero_workflow_steps")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return seedHeroWorkflowSteps();

    return (data as HeroWorkflowStepRow[]).map((row) => ({
      title: row.title,
      description: row.description,
      icon: coerceIcon(row.icon),
    }));
  } catch {
    return seedHeroWorkflowSteps();
  }
}

// ---------------------------------------------------------------------------
// Nav links
// ---------------------------------------------------------------------------

function seedNavLinks(): PublicNavLink[] {
  return navLinks.map((link) => ({ href: link.href, label: link.label }));
}

export async function listPublishedNavLinks(): Promise<PublicNavLink[]> {
  if (!isSupabaseConfigured()) return seedNavLinks();

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedNavLinks();

    const { data, error } = await supabase
      .from("nav_links")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return seedNavLinks();

    return (data as NavLinkRow[]).map((row) => ({
      href: row.href,
      label: row.label,
    }));
  } catch {
    return seedNavLinks();
  }
}

// ---------------------------------------------------------------------------
// Workflow catalog
// ---------------------------------------------------------------------------

function seedWorkflowGroups(): PublicWorkflowGroup[] {
  return workflowGroupsSeed.map((group) => ({
    category: group.category,
    description: group.description,
    items: group.items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category,
      imageUrl: null,
      imageAlt: "",
      outcomeTags: [...(item.outcomeTags ?? [])],
      active: item.active ?? true,
    })),
  }));
}

export async function listPublishedWorkflowGroups(): Promise<
  PublicWorkflowGroup[]
> {
  if (!isSupabaseConfigured()) return seedWorkflowGroups();

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return seedWorkflowGroups();

    const [groupsResult, workflowsResult] = await Promise.all([
      supabase
        .from("workflow_groups")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("workflows")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
    ]);

    if (groupsResult.error || !groupsResult.data || groupsResult.data.length === 0) {
      return seedWorkflowGroups();
    }
    if (workflowsResult.error) return seedWorkflowGroups();

    const groups = groupsResult.data as WorkflowGroupRow[];
    const rows = (workflowsResult.data ?? []) as WorkflowRow[];

    const byGroup = new Map<string, PublicWorkflowListing[]>();
    for (const group of groups) byGroup.set(group.id, []);
    for (const row of rows) {
      // Skip workflows whose group is unpublished or missing.
      const bucket = byGroup.get(row.group_id);
      if (!bucket) continue;
      const group = groups.find((candidate) => candidate.id === row.group_id);
      bucket.push({
        id: row.slug,
        title: row.title,
        summary: row.summary,
        category: group?.category ?? "",
        imageUrl: row.image_url,
        imageAlt: row.image_alt || row.title,
        outcomeTags: row.outcome_tags ?? [],
        active: row.is_active,
      });
    }

    const mapped = groups
      .map((group) => ({
        category: group.category,
        description: group.description,
        items: byGroup.get(group.id) ?? [],
      }))
      .filter((group) => group.items.length > 0);

    return mapped.length > 0 ? mapped : seedWorkflowGroups();
  } catch {
    return seedWorkflowGroups();
  }
}
