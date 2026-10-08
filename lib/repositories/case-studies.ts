import {
  caseStudies as seedCaseStudies,
  getAdjacentCaseStudies as getAdjacentSeed,
  getCaseStudyBySlug as getSeedBySlug,
  getCaseStudyCards as getSeedCards,
  getSeedRelatedWorkflows,
} from "@/lib/content/case-studies";
import type { CaseStudy } from "@/lib/content/types";
import {
  mapCaseStudyRowsToDomain,
  mapWorkflowRowToPublicListing,
  type PublicWorkflowRowFields,
} from "@/lib/repositories/mappers";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";
import type {
  CaseStudyMediaRow,
  CaseStudyRow,
  CaseStudyStepRow,
  CaseStudyToolRow,
  ReliabilityControlRow,
} from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

async function fetchPublishedCaseStudyFromSupabase(
  slug: string,
): Promise<CaseStudy | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data: study, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !study) {
    return null;
  }

  const studyId = (study as CaseStudyRow).id;

  const [stepsRes, toolsRes, controlsRes, mediaRes] = await Promise.all([
    supabase
      .from("case_study_steps")
      .select("*")
      .eq("case_study_id", studyId)
      .order("step_number", { ascending: true }),
    supabase
      .from("case_study_tools")
      .select("*")
      .eq("case_study_id", studyId)
      .order("display_order", { ascending: true }),
    supabase
      .from("reliability_controls")
      .select("*")
      .eq("case_study_id", studyId)
      .order("display_order", { ascending: true }),
    supabase
      .from("case_study_media")
      .select("*")
      .eq("case_study_id", studyId)
      .order("display_order", { ascending: true }),
  ]);

  return mapCaseStudyRowsToDomain({
    study: study as CaseStudyRow,
    steps: (stepsRes.data ?? []) as CaseStudyStepRow[],
    tools: (toolsRes.data ?? []) as CaseStudyToolRow[],
    controls: (controlsRes.data ?? []) as ReliabilityControlRow[],
    media: (mediaRes.data ?? []) as CaseStudyMediaRow[],
  });
}

async function listPublishedCaseStudiesFromSupabase(): Promise<
  CaseStudy[] | null
> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("case_studies")
    .select("slug")
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (error || !data) {
    return null;
  }

  // Fetch every study in parallel (was sequential): one round-trip of
  // latency instead of N, while preserving display order.
  const studies = await Promise.all(
    data.map((row) =>
      fetchPublishedCaseStudyFromSupabase((row as { slug: string }).slug),
    ),
  );
  return studies.filter((study): study is CaseStudy => study !== null);
}

export async function listPublishedCaseStudies(): Promise<CaseStudy[]> {
  if (!isSupabaseConfigured()) {
    return seedCaseStudies;
  }

  try {
    const remote = await listPublishedCaseStudiesFromSupabase();
    if (remote && remote.length > 0) return remote;
  } catch {
    // Fall through to seed.
  }

  return seedCaseStudies;
}

export async function getPublishedCaseStudyBySlug(
  slug: string,
): Promise<CaseStudy | null> {
  if (!isSupabaseConfigured()) {
    return getSeedBySlug(slug) ?? null;
  }

  try {
    const remote = await fetchPublishedCaseStudyFromSupabase(slug);
    if (remote) return remote;
  } catch {
    // Fall through to seed.
  }

  // Seed fallback only for known verified slugs during local development.
  return getSeedBySlug(slug) ?? null;
}

/**
 * The canvas that stands in for a case study on a card: the first related
 * workflow that actually has a graph. Resolved through
 * `getPublishedCaseStudyWorkflows`, so it inherits that function's seed
 * fallback and its "return nothing rather than throw" behaviour — a study with
 * no links (or a database without the join table yet) simply yields `null` and
 * the card falls back to its image, then to its preview label.
 */
async function primaryWorkflowCanvas(
  slug: string,
): Promise<WorkflowCanvas | null> {
  try {
    const related = await getPublishedCaseStudyWorkflows(slug);
    const primary = related.find(
      (workflow) => workflow.canvas && workflow.canvas.nodes.length > 0,
    );
    return primary?.canvas ?? null;
  } catch {
    return null;
  }
}

async function withPreviewCanvas<T extends { slug: string }>(
  cards: T[],
): Promise<(T & { previewCanvas: WorkflowCanvas | null })[]> {
  return Promise.all(
    cards.map(async (card) => ({
      ...card,
      previewCanvas: await primaryWorkflowCanvas(card.slug),
    })),
  );
}

export async function getPublishedCaseStudyCards() {
  if (!isSupabaseConfigured()) {
    return withPreviewCanvas(getSeedCards());
  }

  try {
    const studies = await listPublishedCaseStudiesFromSupabase();
    if (studies && studies.length > 0) {
      return withPreviewCanvas(
        studies.map((study) => ({
          slug: study.slug,
          title: study.title,
          summary: study.summary,
          tools: study.tools.map((tool) => tool.name),
          accent: study.accent,
          previewLabel: study.previewLabel,
          featuredImageUrl: study.featuredImageUrl ?? null,
        })),
      );
    }
  } catch {
    // Fall through.
  }

  return withPreviewCanvas(getSeedCards());
}

export async function getPublishedAdjacentCaseStudies(slug: string) {
  if (!isSupabaseConfigured()) {
    return getAdjacentSeed(slug);
  }

  try {
    const studies = await listPublishedCaseStudies();
    const index = studies.findIndex((study) => study.slug === slug);
    if (index === -1) {
      return { previous: null, next: null };
    }
    return {
      previous: index > 0 ? studies[index - 1] : null,
      next: index < studies.length - 1 ? studies[index + 1] : null,
    };
  } catch {
    return getAdjacentSeed(slug);
  }
}

// ---------------------------------------------------------------------------
// Related workflows
// ---------------------------------------------------------------------------

/**
 * The workflow columns a public read is allowed to select. Explicit rather than
 * `*` so canvas_source — the raw n8n paste, which is admin-only editor state
 * and may name internal systems — can never reach a public response.
 */
const PUBLIC_WORKFLOW_COLUMNS =
  "slug, title, summary, image_url, image_alt, canvas_json, outcome_tags, is_active, updated_at, workflow_groups (category)";

type RelatedWorkflowJoinRow = {
  display_order: number;
  workflows:
    | (PublicWorkflowRowFields & {
        workflow_groups: { category: string } | null;
      })
    | null;
};

async function fetchRelatedWorkflowsFromSupabase(
  caseStudyId: string,
): Promise<PublicWorkflowListing[] | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("case_study_workflows")
    .select(`display_order, workflows (${PUBLIC_WORKFLOW_COLUMNS})`)
    .eq("case_study_id", caseStudyId)
    .order("display_order", { ascending: true });

  if (error || !data) return null;

  // RLS already hides links to unpublished workflows, but the embedded row can
  // also come back null for an admin session, which sees everything.
  return (data as unknown as RelatedWorkflowJoinRow[])
    .map((link) => link.workflows)
    .filter(
      (row): row is NonNullable<RelatedWorkflowJoinRow["workflows"]> =>
        row !== null,
    )
    .map((row) =>
      mapWorkflowRowToPublicListing(row, row.workflow_groups?.category ?? ""),
    );
}

/**
 * Workflow canvases to preview on a published case study's page, in the order
 * an admin arranged them. Falls back to the seed catalog so the page keeps
 * rendering with no Supabase project configured, and returns an empty list
 * whenever a case study has no links — the section is simply not shown.
 */
export async function getPublishedCaseStudyWorkflows(
  slug: string,
): Promise<PublicWorkflowListing[]> {
  const seedFallback = () => {
    const study = getSeedBySlug(slug);
    return study ? getSeedRelatedWorkflows(study) : [];
  };

  if (!isSupabaseConfigured()) return seedFallback();

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return seedFallback();

    const { data: study, error } = await supabase
      .from("case_studies")
      .select("id")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !study) return seedFallback();

    const related = await fetchRelatedWorkflowsFromSupabase(
      (study as { id: string }).id,
    );
    if (related) return related;
  } catch {
    // Fall through to seed.
  }

  return seedFallback();
}

// ---------------------------------------------------------------------------
// Reverse lookup: workflow -> case studies
// ---------------------------------------------------------------------------

export type PublicCaseStudyRef = { slug: string; title: string };

type WorkflowCaseStudyJoinRow = {
  case_studies: { slug: string; title: string; display_order: number } | null;
};

function seedCaseStudiesForWorkflow(workflowId: string): PublicCaseStudyRef[] {
  return seedCaseStudies
    .filter((study) => study.relatedWorkflowIds?.includes(workflowId))
    .map((study) => ({ slug: study.slug, title: study.title }));
}

/**
 * Published case studies that feature a workflow, in case-study display order.
 * `workflowId` is the public workflow id (`PublicWorkflowListing.slug`), never
 * the uuid. Returns [] rather than throwing; falls back to the seed
 * `relatedWorkflowIds` with no Supabase project.
 */
export async function getPublishedCaseStudiesForWorkflow(
  workflowId: string,
): Promise<PublicCaseStudyRef[]> {
  if (!isSupabaseConfigured()) return seedCaseStudiesForWorkflow(workflowId);

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return seedCaseStudiesForWorkflow(workflowId);

    const { data, error } = await supabase
      .from("case_study_workflows")
      .select(
        "case_studies!inner (slug, title, display_order, status), workflows!inner (slug)",
      )
      .eq("workflows.slug", workflowId)
      .eq("case_studies.status", "published");

    if (error || !data) return seedCaseStudiesForWorkflow(workflowId);

    const seen = new Set<string>();
    return (data as unknown as WorkflowCaseStudyJoinRow[])
      .map((row) => row.case_studies)
      .filter((study): study is NonNullable<typeof study> => study !== null)
      .sort((a, b) => a.display_order - b.display_order)
      .filter((study) => {
        if (seen.has(study.slug)) return false;
        seen.add(study.slug);
        return true;
      })
      .map((study) => ({ slug: study.slug, title: study.title }));
  } catch {
    return seedCaseStudiesForWorkflow(workflowId);
  }
}
