/**
 * Pure, React-free helpers for the workflow catalog, the workflow detail page
 * and the featured strip. Everything here is *derived* from data that is
 * already published — the listing row and its sanitised, parsed canvas — so no
 * helper can say anything the stored graph does not show.
 */

import { classifyNode } from "@/components/public/workflow-canvas-geometry";
import { iconForTypeKey } from "@/lib/workflow-canvas/icons";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

/**
 * Groups that hold teaching / training material rather than delivered work.
 * Names match `lib/content/workflows.ts` (and the seeded `workflow_groups`).
 */
export const TEACHING_CATEGORIES: readonly string[] = [
  "Teaching & Training Demos",
  "Education Content Systems",
];

export type WorkflowStatus = "production" | "teaching" | "build";

export const WORKFLOW_STATUS_LABELS: Readonly<Record<WorkflowStatus, string>> = {
  production: "Production",
  teaching: "Teaching demo",
  build: "Build",
};

export function isTeachingCategory(category: string): boolean {
  return TEACHING_CATEGORIES.includes(category);
}

/**
 * Teaching groups always read as teaching. Otherwise the n8n `active` flag
 * decides: an active workflow outside the teaching groups is production work;
 * an inactive one is shown as a plain "build" — never promoted to production.
 */
export function workflowStatus(
  listing: Pick<PublicWorkflowListing, "category" | "active">,
): WorkflowStatus {
  if (isTeachingCategory(listing.category)) return "teaching";
  return listing.active ? "production" : "build";
}

/** B1 adds `slug` (= id) to listings; fall back to `id` so both shapes work. */
export function workflowSlug(listing: { id: string; slug?: string | null }): string {
  return listing.slug || listing.id;
}

export function workflowPath(listing: { id: string; slug?: string | null }): string {
  return `/workflows/${workflowSlug(listing)}`;
}

/** A canvas worth drawing: present and non-empty. */
export function drawableCanvas(
  canvas: WorkflowCanvas | null | undefined,
): WorkflowCanvas | null {
  return canvas && canvas.nodes.length > 0 ? canvas : null;
}

// ---------------------------------------------------------------------------
// Canvas facts
// ---------------------------------------------------------------------------

export type WorkflowFacts = {
  nodeCount: number;
  connectionCount: number;
  /** Distinct trigger labels, e.g. `Webhook`, `Schedule`. */
  triggers: string[];
  aiSteps: number;
  /** IF / Switch nodes — decision points in the flow. */
  branches: number;
  /** Distinct integration labels (Sheets, Gmail, HTTP Request …), first-seen order. */
  integrations: string[];
};

const BRANCH_KEYS = new Set(["if", "switch", "filter"]);

export function workflowFacts(canvas: WorkflowCanvas): WorkflowFacts {
  const triggers: string[] = [];
  const integrations: string[] = [];
  let aiSteps = 0;
  let branches = 0;

  for (const node of canvas.nodes) {
    const kind = classifyNode(node);
    const label = iconForTypeKey(node.typeKey).label;
    if (kind === "trigger" && !triggers.includes(label)) triggers.push(label);
    if (kind === "ai") aiSteps += 1;
    if (kind === "integration" && !integrations.includes(label)) integrations.push(label);
    if (BRANCH_KEYS.has(node.typeKey.toLowerCase())) branches += 1;
  }

  return {
    nodeCount: canvas.nodes.length,
    connectionCount: canvas.edges.length,
    triggers,
    aiSteps,
    branches,
    integrations,
  };
}

// ---------------------------------------------------------------------------
// Client-safe card data (no canvas)
// ---------------------------------------------------------------------------

/**
 * What a card needs, minus the canvas. This is the shape that crosses into the
 * catalog's client island, so it must stay small: the graph itself is
 * rendered on the server as a thumbnail node.
 */
export type WorkflowCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  outcomeTags: string[];
  status: WorkflowStatus;
  toolKeys: string[];
  nodeCount: number;
};

export function toWorkflowCardData(listing: PublicWorkflowListing): WorkflowCardData {
  const canvas = drawableCanvas(listing.canvas);
  return {
    id: listing.id,
    slug: workflowSlug(listing as PublicWorkflowListing & { slug?: string }),
    title: listing.title,
    summary: listing.summary,
    category: listing.category,
    outcomeTags: [...listing.outcomeTags],
    status: workflowStatus(listing),
    toolKeys: canvas ? [...canvas.toolKeys] : [],
    nodeCount: canvas ? canvas.nodes.length : 0,
  };
}

/**
 * The strongest production systems for a featured strip: production only,
 * largest graphs first, at most one per group so the strip shows range, then
 * topped up by size if there are fewer groups than slots.
 */
export function pickFeaturedWorkflows(
  listings: PublicWorkflowListing[],
  count = 6,
): PublicWorkflowListing[] {
  const ranked = listings
    .filter((listing) => workflowStatus(listing) === "production")
    .map((listing) => ({ listing, size: drawableCanvas(listing.canvas)?.nodes.length ?? 0 }))
    .sort((a, b) => b.size - a.size)
    .map((entry) => entry.listing);

  const picked: PublicWorkflowListing[] = [];
  const seenGroups = new Set<string>();
  for (const listing of ranked) {
    if (picked.length >= count) break;
    if (seenGroups.has(listing.category)) continue;
    seenGroups.add(listing.category);
    picked.push(listing);
  }
  for (const listing of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(listing)) picked.push(listing);
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Catalog filtering (shared by the client island and tests)
// ---------------------------------------------------------------------------

export type CatalogScope = "all" | "production" | "teaching";

export type CatalogFilter = {
  q: string;
  group: string | null;
  scope: CatalogScope;
};

export const EMPTY_FILTER: CatalogFilter = { q: "", group: null, scope: "all" };

export function parseCatalogFilter(search: string): CatalogFilter {
  const params = new URLSearchParams(search);
  const scope = params.get("scope");
  return {
    q: (params.get("q") ?? "").slice(0, 100),
    group: params.get("group") || null,
    scope: scope === "production" || scope === "teaching" ? scope : "all",
  };
}

/** Inverse of `parseCatalogFilter`; empty values are omitted. */
export function serializeCatalogFilter(filter: CatalogFilter): string {
  const params = new URLSearchParams();
  if (filter.group) params.set("group", filter.group);
  if (filter.q.trim()) params.set("q", filter.q.trim());
  if (filter.scope !== "all") params.set("scope", filter.scope);
  const out = params.toString();
  return out ? `?${out}` : "";
}

export function matchesScope(item: Pick<WorkflowCardData, "status">, scope: CatalogScope) {
  if (scope === "all") return true;
  return item.status === scope;
}

export function matchesQuery(
  item: Pick<WorkflowCardData, "title" | "summary" | "category" | "outcomeTags"> & {
    toolKeys?: string[];
  },
  q: string,
): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const tools = (item.toolKeys ?? []).map((key) => iconForTypeKey(key).label);
  const haystack = [item.title, item.summary, item.category, ...item.outcomeTags, ...tools]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function filterCatalog<T extends WorkflowCardData>(
  items: T[],
  filter: CatalogFilter,
): T[] {
  return items.filter(
    (item) =>
      matchesScope(item, filter.scope) &&
      (!filter.group || item.category === filter.group) &&
      matchesQuery(item, filter.q),
  );
}
