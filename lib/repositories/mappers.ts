import type { CaseStudy, CaseStudyGalleryItem } from "@/lib/content/types";
import type { WorkflowListing } from "@/lib/content/workflows";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";
import type {
  CaseStudyMediaRow,
  CaseStudyRow,
  CaseStudyStepRow,
  CaseStudyToolRow,
  Json,
  ReliabilityControlRow,
  WorkflowRow,
} from "@/lib/supabase/database.types";
import { caseStudyNarrativeSchema } from "@/lib/validations/case-study";
import { workflowCanvasSchema } from "@/lib/validations/workflow-canvas";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asArchitectureNodes(value: unknown): CaseStudy["architectureNodes"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const node = item as { label?: unknown; detail?: unknown };
      if (typeof node.label !== "string" || typeof node.detail !== "string") {
        return null;
      }
      return { label: node.label, detail: node.detail };
    })
    .filter(
      (item): item is CaseStudy["architectureNodes"][number] => item !== null,
    );
}

/**
 * The stored jsonb is only as trustworthy as whatever wrote it, so it is
 * re-validated on every read. A legacy, hand-edited or malformed payload
 * degrades to no narrative — the page then falls back to its existing prose
 * fields — instead of crashing the route.
 */
function asNarrative(value: unknown): CaseStudy["narrative"] {
  if (value === null || value === undefined) return undefined;
  const parsed = caseStudyNarrativeSchema.safeParse(value);
  if (!parsed.success || parsed.data.length === 0) return undefined;
  return parsed.data;
}

function mediaUrl(item: CaseStudyMediaRow): string | undefined {
  if (item.external_url) return item.external_url;
  if (item.storage_path?.startsWith("http")) return item.storage_path;
  return undefined;
}

export function mapCaseStudyRowsToDomain(input: {
  study: CaseStudyRow;
  steps: CaseStudyStepRow[];
  tools: CaseStudyToolRow[];
  controls: ReliabilityControlRow[];
  media: CaseStudyMediaRow[];
}): CaseStudy {
  const { study, steps, tools, controls, media } = input;

  const galleryImages: CaseStudyGalleryItem[] = [...media]
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => {
      const url = mediaUrl(item);
      return {
        url,
        caption: item.caption || item.alt_text || "Screenshot",
        alt: item.alt_text || item.caption || study.title,
      };
    });

  const placeholders = galleryImages
    .filter((item) => !item.url)
    .map((item) => item.caption)
    .filter(Boolean);

  return {
    slug: study.slug,
    title: study.title,
    summary: study.summary,
    accent: study.accent,
    previewLabel: study.preview_label,
    narrative: asNarrative(study.narrative),
    businessProblem: study.business_problem,
    beforeState: study.before_state,
    beforeIssues: asStringArray(study.before_issues),
    architectureDescription: study.architecture_description,
    architectureNodes: asArchitectureNodes(study.architecture_nodes),
    steps: [...steps]
      .sort((a, b) => a.step_number - b.step_number)
      .map((step) => ({
        stepNumber: step.step_number,
        title: step.title,
        description: step.description,
      })),
    tools: [...tools]
      .sort((a, b) => a.display_order - b.display_order)
      .map((tool) => ({
        name: tool.name,
        category: tool.category ?? undefined,
      })),
    contribution: asStringArray(study.contribution),
    reliabilityControls: [...controls]
      .sort((a, b) => a.display_order - b.display_order)
      .map((control) => ({
        name: control.name,
        description: control.description,
      })),
    result: study.result,
    featuredImageUrl: study.featured_image_url,
    demoVideoUrl: study.demo_video_url,
    galleryImages,
    galleryPlaceholders:
      placeholders.length > 0
        ? placeholders
        : galleryImages.length === 0
          ? [
              "Screenshot placeholder",
              "Workflow detail placeholder",
              "Outcome placeholder",
            ]
          : [],
    demoVideoLabel: study.demo_video_url
      ? "Watch demo"
      : "Demo video coming soon",
    updatedAt: study.updated_at ?? null,
  };
}

/**
 * The stored jsonb is only as trustworthy as the version of the parser that
 * wrote it, so it is re-validated on every read. A legacy, hand-edited or
 * malformed payload degrades to no canvas instead of crashing the page.
 */
export function coerceWorkflowCanvas(
  value: Json | null,
): WorkflowCanvas | null {
  if (value === null || value === undefined) return null;
  const parsed = workflowCanvasSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * The workflow columns a public read may select. Narrower than `WorkflowRow` on
 * purpose: canvas_source (the raw n8n paste, admin-only editor state) is not in
 * it, so a public mapper cannot pass it through even by accident.
 */
export type PublicWorkflowRowFields = Pick<
  WorkflowRow,
  | "slug"
  | "title"
  | "summary"
  | "image_url"
  | "image_alt"
  | "canvas_json"
  | "outcome_tags"
  | "is_active"
  | "updated_at"
>;

/**
 * Workflow row -> the shape the public catalog components render.
 * `id` carries the slug, not the uuid: it is the identifier the public site
 * addresses a workflow by (access requests, anchors), and the uuid is never
 * exposed. `category` is passed in because it lives on the parent group row.
 */
export function mapWorkflowRowToPublicListing(
  row: PublicWorkflowRowFields,
  category: string,
): PublicWorkflowListing {
  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category,
    imageUrl: row.image_url,
    imageAlt: row.image_alt || row.title,
    canvas: coerceWorkflowCanvas(row.canvas_json),
    outcomeTags: row.outcome_tags ?? [],
    active: row.is_active,
    updatedAt: row.updated_at ?? null,
  };
}

/**
 * Seed (no-Supabase) workflow -> public listing. The seed id is already the
 * public slug; seed content has no modification time, so `updatedAt` is null.
 */
export function mapSeedWorkflowToPublicListing(
  item: WorkflowListing,
): PublicWorkflowListing {
  return {
    id: item.id,
    slug: item.id,
    title: item.title,
    summary: item.summary,
    category: item.category,
    imageUrl: null,
    imageAlt: "",
    canvas: item.canvas ?? null,
    outcomeTags: [...(item.outcomeTags ?? [])],
    active: item.active ?? true,
    updatedAt: null,
  };
}
