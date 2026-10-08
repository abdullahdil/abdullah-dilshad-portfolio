import { cache } from "react";
import { navLinks, proofStripSeed } from "@/lib/content/seed";
import { workflowGroups as workflowGroupsSeed } from "@/lib/content/workflows";
import {
  mapSeedWorkflowToPublicListing,
  mapWorkflowRowToPublicListing,
  type PublicWorkflowRowFields,
} from "@/lib/repositories/mappers";
import type {
  NavLinkRow,
  ProofPointRow,
  WorkflowGroupRow,
} from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

export type PublicProofPoint = {
  value: string;
  label: string;
  featured: boolean;
};

export type PublicNavLink = {
  href: string;
  label: string;
};

export type PublicWorkflowListing = {
  /** The public identifier — the database `workflows.slug`, never the uuid. */
  id: string;
  /** Same value as `id`; use it for `/workflows/[slug]` URLs. */
  slug: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Parsed n8n canvas, or null when none is stored / the stored one is stale. */
  canvas: WorkflowCanvas | null;
  outcomeTags: string[];
  active: boolean;
  /** ISO timestamp of the last edit; null on the seed (no-Supabase) path. */
  updatedAt: string | null;
};

/**
 * A listing without its canvas — what a card, catalog row or client island
 * should receive so a full n8n graph never ships in the RSC payload for a
 * grid of 59 items. Render the canvas thumbnail on the server instead.
 */
export type PublicWorkflowCardData = Omit<PublicWorkflowListing, "canvas"> & {
  /** Number of (non-sticky) nodes in the canvas; 0 when there is none. */
  nodeCount: number;
  hasCanvas: boolean;
  /** Distinct node type keys, first-seen order (for an icon row). */
  toolKeys: string[];
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
    const supabase = createPublicSupabaseClient();
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
// Nav links
// ---------------------------------------------------------------------------

function seedNavLinks(): PublicNavLink[] {
  return navLinks.map((link) => ({ href: link.href, label: link.label }));
}

export async function listPublishedNavLinks(): Promise<PublicNavLink[]> {
  if (!isSupabaseConfigured()) return seedNavLinks();

  try {
    const supabase = createPublicSupabaseClient();
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
    items: group.items.map(mapSeedWorkflowToPublicListing),
  }));
}

/**
 * The workflow columns a public read may select. Explicit rather than `*` so
 * canvas_source — the raw n8n paste, admin-only editor state — never leaves
 * the database on a public request.
 */
const PUBLIC_WORKFLOW_LIST_COLUMNS =
  "group_id, slug, title, summary, image_url, image_alt, canvas_json, outcome_tags, is_active, updated_at";

type PublicWorkflowListRow = PublicWorkflowRowFields & { group_id: string };

/** Cached per request: home, hub and listings helpers share one fetch. */
export const listPublishedWorkflowGroups = cache(fetchPublishedWorkflowGroups);

async function fetchPublishedWorkflowGroups(): Promise<PublicWorkflowGroup[]> {
  if (!isSupabaseConfigured()) return seedWorkflowGroups();

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return seedWorkflowGroups();

    const [groupsResult, workflowsResult] = await Promise.all([
      supabase
        .from("workflow_groups")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("workflows")
        .select(PUBLIC_WORKFLOW_LIST_COLUMNS)
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
    ]);

    if (
      groupsResult.error ||
      !groupsResult.data ||
      groupsResult.data.length === 0
    ) {
      return seedWorkflowGroups();
    }
    if (workflowsResult.error) return seedWorkflowGroups();

    const groups = groupsResult.data as WorkflowGroupRow[];
    const rows = (workflowsResult.data ??
      []) as unknown as PublicWorkflowListRow[];

    const byGroup = new Map<string, PublicWorkflowListing[]>();
    for (const group of groups) byGroup.set(group.id, []);
    for (const row of rows) {
      // Skip workflows whose group is unpublished or missing.
      const bucket = byGroup.get(row.group_id);
      if (!bucket) continue;
      const group = groups.find((candidate) => candidate.id === row.group_id);
      bucket.push(mapWorkflowRowToPublicListing(row, group?.category ?? ""));
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

/**
 * Every published workflow as one flat list, in catalog order (group order,
 * then each workflow's display order). Same source and fallback as
 * `listPublishedWorkflowGroups`, so the two can never disagree.
 */
export async function listPublishedWorkflowListings(): Promise<
  PublicWorkflowListing[]
> {
  const groups = await listPublishedWorkflowGroups();
  return groups.flatMap((group) => group.items);
}

type PublicWorkflowDetailRow = PublicWorkflowRowFields & {
  workflow_groups: { category: string } | null;
};

function seedWorkflowBySlug(slug: string): PublicWorkflowListing | null {
  for (const group of seedWorkflowGroups()) {
    const match = group.items.find((item) => item.slug === slug);
    if (match) return match;
  }
  return null;
}

/**
 * One published workflow by its public slug (`PublicWorkflowListing.slug`),
 * or null. A single-row query (not the whole catalog), and — like the catalog
 * — a workflow in an unpublished group is treated as unpublished. Wrapped in
 * React `cache` so `generateMetadata` and the page share one fetch.
 */
export const getPublishedWorkflowBySlug = cache(
  async (slug: string): Promise<PublicWorkflowListing | null> => {
    if (!isSupabaseConfigured()) return seedWorkflowBySlug(slug);

    try {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return seedWorkflowBySlug(slug);

      const { data, error } = await supabase
        .from("workflows")
        .select(
          "slug, title, summary, image_url, image_alt, canvas_json, outcome_tags, is_active, updated_at, workflow_groups!inner (category)",
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .eq("workflow_groups.is_published", true)
        .maybeSingle();

      if (error) return seedWorkflowBySlug(slug);
      if (!data) return null;

      const row = data as unknown as PublicWorkflowDetailRow;
      return mapWorkflowRowToPublicListing(
        row,
        row.workflow_groups?.category ?? "",
      );
    } catch {
      return seedWorkflowBySlug(slug);
    }
  },
);

/** Strips the canvas from a listing for cards / client islands (see type). */
export function toWorkflowCardData(
  listing: PublicWorkflowListing,
): PublicWorkflowCardData {
  const { canvas, ...rest } = listing;
  return {
    ...rest,
    nodeCount: canvas?.nodes.length ?? 0,
    hasCanvas: canvas !== null && canvas.nodes.length > 0,
    toolKeys: canvas ? [...canvas.toolKeys] : [],
  };
}
