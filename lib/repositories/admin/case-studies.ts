import type { AdminCaseStudyListItem } from "@/lib/admin/types";
import type { CaseStudy } from "@/lib/content/types";
import { mapCaseStudyRowsToDomain } from "@/lib/repositories/mappers";
import type {
  CaseStudyMediaRow,
  CaseStudyRow,
  CaseStudyStepRow,
  CaseStudyToolRow,
  ContentStatus,
  ReliabilityControlRow,
} from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CaseStudyInput } from "@/lib/validations/case-study";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

export async function listAdminCaseStudies(): Promise<AdminCaseStudyListItem[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("id, title, slug, status, display_order, updated_at, is_featured")
    .order("display_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    status: row.status as ContentStatus,
    displayOrder: row.display_order as number,
    updatedAt: row.updated_at as string,
    isFeatured: Boolean(row.is_featured),
  }));
}

export async function getAdminCaseStudyById(
  id: string,
): Promise<
  | (CaseStudy & {
      id: string;
      status: ContentStatus;
      displayOrder: number;
      isFeatured: boolean;
      publishedAt: string | null;
    })
  | null
> {
  const supabase = await requireClient();
  const { data: study, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!study) return null;

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

  const mapped = mapCaseStudyRowsToDomain({
    study: study as CaseStudyRow,
    steps: (stepsRes.data ?? []) as CaseStudyStepRow[],
    tools: (toolsRes.data ?? []) as CaseStudyToolRow[],
    controls: (controlsRes.data ?? []) as ReliabilityControlRow[],
    media: (mediaRes.data ?? []) as CaseStudyMediaRow[],
  });

  return {
    ...mapped,
    id: studyId,
    status: (study as CaseStudyRow).status,
    displayOrder: (study as CaseStudyRow).display_order,
    isFeatured: (study as CaseStudyRow).is_featured,
    publishedAt: (study as CaseStudyRow).published_at,
  };
}

async function replaceChildren(
  caseStudyId: string,
  input: CaseStudyInput,
): Promise<void> {
  const supabase = await requireClient();

  await Promise.all([
    supabase.from("case_study_steps").delete().eq("case_study_id", caseStudyId),
    supabase.from("case_study_tools").delete().eq("case_study_id", caseStudyId),
    supabase.from("reliability_controls").delete().eq("case_study_id", caseStudyId),
    supabase.from("case_study_media").delete().eq("case_study_id", caseStudyId),
  ]);

  const { error: stepsError } = await supabase.from("case_study_steps").insert(
    input.steps.map((step) => ({
      case_study_id: caseStudyId,
      step_number: step.stepNumber,
      title: step.title,
      description: step.description,
    })),
  );
  if (stepsError) throw stepsError;

  const { error: toolsError } = await supabase.from("case_study_tools").insert(
    input.tools.map((tool, index) => ({
      case_study_id: caseStudyId,
      name: tool.name,
      category: tool.category ?? null,
      display_order: index,
    })),
  );
  if (toolsError) throw toolsError;

  const { error: controlsError } = await supabase.from("reliability_controls").insert(
    input.reliabilityControls.map((control, index) => ({
      case_study_id: caseStudyId,
      name: control.name,
      description: control.description,
      display_order: index,
    })),
  );
  if (controlsError) throw controlsError;

  const galleryRows =
    input.galleryImages.length > 0
      ? input.galleryImages.map((item, index) => {
          const hasUrl = Boolean(item.url && item.url.trim());
          return {
            case_study_id: caseStudyId,
            media_type: hasUrl ? "image" : "placeholder",
            external_url: hasUrl ? item.url : null,
            alt_text: item.alt?.trim() || item.caption,
            caption: item.caption,
            display_order: index,
          };
        })
      : input.galleryPlaceholders.map((caption, index) => ({
          case_study_id: caseStudyId,
          media_type: "placeholder",
          external_url: null,
          alt_text: caption,
          caption,
          display_order: index,
        }));

  if (galleryRows.length > 0) {
    const { error: mediaError } = await supabase
      .from("case_study_media")
      .insert(galleryRows);
    if (mediaError) throw mediaError;
  }
}

function toCaseStudyRow(
  input: CaseStudyInput,
  displayOrder: number,
  isFeatured: boolean,
  previousPublishedAt?: string | null,
) {
  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    business_problem: input.businessProblem,
    before_state: input.beforeState,
    before_issues: input.beforeIssues,
    architecture_description: input.architectureDescription,
    architecture_nodes: input.architectureNodes,
    // Null rather than [] when empty, so "no narrative yet" is one value the
    // read path can test, and the page's prose fallback engages.
    narrative: input.narrative.length > 0 ? input.narrative : null,
    contribution: input.contribution,
    result: input.result,
    accent: input.accent,
    preview_label: input.previewLabel,
    featured_image_url: input.featuredImageUrl?.trim() || null,
    demo_video_url: input.demoVideoUrl?.trim() || null,
    status: input.status,
    is_featured: isFeatured,
    display_order: displayOrder,
    seo_title: input.title,
    seo_description: input.summary,
    published_at:
      input.status === "published"
        ? previousPublishedAt || new Date().toISOString()
        : null,
  };
}

export async function createAdminCaseStudy(
  input: CaseStudyInput,
  options?: { displayOrder?: number; isFeatured?: boolean },
): Promise<string> {
  const supabase = await requireClient();
  const displayOrder = options?.displayOrder ?? 0;
  const isFeatured = options?.isFeatured ?? false;

  const { data, error } = await supabase
    .from("case_studies")
    .insert(toCaseStudyRow(input, displayOrder, isFeatured, null))
    .select("id")
    .single();

  if (error) throw error;
  const id = data.id as string;
  await replaceChildren(id, input);
  return id;
}

export async function updateAdminCaseStudy(
  id: string,
  input: CaseStudyInput,
  options?: { displayOrder?: number; isFeatured?: boolean },
): Promise<void> {
  const supabase = await requireClient();
  const existing = await getAdminCaseStudyById(id);
  if (!existing) throw new Error("Case study not found.");

  const displayOrder = options?.displayOrder ?? existing.displayOrder;
  const isFeatured = options?.isFeatured ?? existing.isFeatured;

  const { error } = await supabase
    .from("case_studies")
    .update(toCaseStudyRow(input, displayOrder, isFeatured, existing.publishedAt))
    .eq("id", id);

  if (error) throw error;
  await replaceChildren(id, input);
}

export async function updateAdminCaseStudyStatus(
  id: string,
  status: ContentStatus,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("case_studies")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminCaseStudy(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Related workflows
// ---------------------------------------------------------------------------

/** One workflow offered in the case-study picker. */
export type AdminWorkflowOption = {
  /** `public.workflows.id` — the uuid the link table stores. */
  id: string;
  /** `public.workflows.slug` — how the public site addresses the workflow. */
  slug: string;
  title: string;
  category: string;
  isPublished: boolean;
  /** True when a canvas is stored, so the picker can flag links that render nothing. */
  hasCanvas: boolean;
};

/** A workflow currently linked to a case study, in its authored order. */
export type AdminCaseStudyWorkflowLink = {
  workflowId: string;
  slug: string;
  title: string;
  displayOrder: number;
};

type WorkflowOptionRow = {
  id: string;
  slug: string;
  title: string;
  canvas_json: unknown;
  is_published: boolean;
  display_order: number;
  workflow_groups: { category: string; display_order: number } | null;
};

type CaseStudyWorkflowLinkRow = {
  workflow_id: string;
  display_order: number;
  workflows: { slug: string; title: string } | null;
};

/**
 * Every workflow an admin may link, published or not, grouped-order first so
 * the picker reads like the public catalog. Unpublished ones are included
 * deliberately: an admin can stage a link before publishing the workflow, and
 * the public read simply hides it until then.
 */
export async function listAdminWorkflowOptions(): Promise<AdminWorkflowOption[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, slug, title, canvas_json, is_published, display_order, workflow_groups (category, display_order)",
    )
    .order("display_order", { ascending: true });

  if (error) throw error;

  const groupOrder = (row: WorkflowOptionRow) =>
    row.workflow_groups?.display_order ?? Number.MAX_SAFE_INTEGER;

  return ((data ?? []) as unknown as WorkflowOptionRow[])
    .slice()
    .sort(
      (a, b) => groupOrder(a) - groupOrder(b) || a.display_order - b.display_order,
    )
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.workflow_groups?.category ?? "",
      isPublished: row.is_published,
      hasCanvas: row.canvas_json !== null && row.canvas_json !== undefined,
    }));
}

/** The picker's initial state: what this case study links today, in order. */
export async function listAdminCaseStudyWorkflows(
  caseStudyId: string,
): Promise<AdminCaseStudyWorkflowLink[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("case_study_workflows")
    .select("workflow_id, display_order, workflows (slug, title)")
    .eq("case_study_id", caseStudyId)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as CaseStudyWorkflowLinkRow[]).map((row) => ({
    workflowId: row.workflow_id,
    slug: row.workflows?.slug ?? "",
    title: row.workflows?.title ?? "",
    displayOrder: row.display_order,
  }));
}

/**
 * Replaces a case study's workflow links with the submitted list, using array
 * position as display_order.
 *
 * Delete-then-insert rather than a diff: the set is small, the picker always
 * submits the complete list, and PostgREST gives no transaction across two
 * statements. The delete is therefore issued first and its error is fatal, so a
 * failed insert leaves the case study with no links rather than with a stale
 * set silently merged into the new one.
 */
export async function replaceAdminCaseStudyWorkflows(
  caseStudyId: string,
  workflowIds: string[],
): Promise<void> {
  const supabase = await requireClient();

  const { error: deleteError } = await supabase
    .from("case_study_workflows")
    .delete()
    .eq("case_study_id", caseStudyId);
  if (deleteError) throw deleteError;

  if (workflowIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("case_study_workflows")
    .insert(
      workflowIds.map((workflowId, index) => ({
        case_study_id: caseStudyId,
        workflow_id: workflowId,
        display_order: index,
      })),
    );
  if (insertError) throw insertError;
}
