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
