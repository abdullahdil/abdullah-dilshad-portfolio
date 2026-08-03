import {
  caseStudies as seedCaseStudies,
  getAdjacentCaseStudies as getAdjacentSeed,
  getCaseStudyBySlug as getSeedBySlug,
  getCaseStudyCards as getSeedCards,
} from "@/lib/content/case-studies";
import type { CaseStudy } from "@/lib/content/types";
import { mapCaseStudyRowsToDomain } from "@/lib/repositories/mappers";
import type {
  CaseStudyMediaRow,
  CaseStudyRow,
  CaseStudyStepRow,
  CaseStudyToolRow,
  ReliabilityControlRow,
} from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function fetchPublishedCaseStudyFromSupabase(
  slug: string,
): Promise<CaseStudy | null> {
  const supabase = await createServerSupabaseClient();
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

async function listPublishedCaseStudiesFromSupabase(): Promise<CaseStudy[] | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("case_studies")
    .select("slug")
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (error || !data) {
    return null;
  }

  const studies: CaseStudy[] = [];
  for (const row of data) {
    const study = await fetchPublishedCaseStudyFromSupabase(
      (row as { slug: string }).slug,
    );
    if (study) studies.push(study);
  }
  return studies;
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

export async function getPublishedCaseStudyCards() {
  if (!isSupabaseConfigured()) {
    return getSeedCards();
  }

  try {
    const studies = await listPublishedCaseStudiesFromSupabase();
    if (studies && studies.length > 0) {
      return studies.map((study) => ({
        slug: study.slug,
        title: study.title,
        summary: study.summary,
        tools: study.tools.map((tool) => tool.name),
        accent: study.accent,
        previewLabel: study.previewLabel,
        featuredImageUrl: study.featuredImageUrl ?? null,
      }));
    }
  } catch {
    // Fall through.
  }

  return getSeedCards();
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
