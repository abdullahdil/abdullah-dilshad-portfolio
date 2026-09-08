/**
 * Upserts verified seed content into Supabase.
 * Credentials come only from environment variables — never hardcode secrets.
 *
 * Usage:
 *   npm run db:seed
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { caseStudies } from "../lib/content/case-studies";
import {
  capabilitiesSeed,
  experienceSeed,
  heroWorkflowSeed,
  navLinks,
  profileSeed,
  proofStripSeed,
  templatesSeed,
} from "../lib/content/seed";
import { workflowGroups } from "../lib/content/workflows";

config({ path: ".env.local" });
config({ path: ".env" });

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.includes("your-") || value.includes("your_")) {
    throw new Error(`Missing or placeholder env: ${name}`);
  }
  return value;
}

function monthYearToDate(label: string, bound: "start" | "end"): string | null {
  const range = label.split("–");
  const part = (bound === "start" ? range[0] : range[1])?.trim();
  if (!part || part === "Present") return null;

  if (/^\d{4}$/.test(part)) {
    return bound === "start" ? `${part}-01-01` : `${part}-12-31`;
  }

  const date = new Date(`${part} 1`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Unable to parse date segment: ${part}`);
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

async function main() {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: profileError } = await supabase.from("profile").upsert(
    {
      full_name: profileSeed.fullName,
      professional_title: profileSeed.professionalTitle,
      hero_headline: profileSeed.heroHeadline,
      hero_description: profileSeed.heroDescription,
      short_bio: profileSeed.shortBio,
      long_bio: profileSeed.longBio,
      location: profileSeed.location,
      availability_status: profileSeed.availabilityStatus,
      availability_label: profileSeed.availabilityLabel,
      email: profileSeed.email,
      linkedin_url: profileSeed.linkedinUrl,
      github_url: profileSeed.githubUrl,
      n8n_profile_url: profileSeed.n8nProfileUrl,
      credential_url: profileSeed.credentialUrl,
      cv_url: profileSeed.cvUrl,
      portrait_url: null,
    },
    { onConflict: "email" },
  );
  if (profileError) throw profileError;

  await supabase.from("experience").delete().neq("organization", "__never__");
  const { error: experienceError } = await supabase.from("experience").insert(
    experienceSeed.map((item, index) => ({
      organization: item.organization,
      role: item.role,
      location: item.location,
      start_date: monthYearToDate(item.period, "start"),
      end_date: item.isCurrent ? null : monthYearToDate(item.period, "end"),
      is_current: item.isCurrent,
      description: item.description,
      display_order: index,
      is_published: true,
    })),
  );
  if (experienceError) throw experienceError;

  await supabase.from("capabilities").delete().neq("name", "__never__");
  const capabilityRows = capabilitiesSeed.flatMap((group, groupIndex) =>
    group.items.map((name, itemIndex) => ({
      category: group.category,
      name,
      description: "",
      display_order: groupIndex * 100 + itemIndex,
      is_published: true,
    })),
  );
  const { error: capabilitiesError } = await supabase
    .from("capabilities")
    .insert(capabilityRows);
  if (capabilitiesError) throw capabilitiesError;

  await supabase.from("public_templates").delete().neq("title", "__never__");
  const { error: templatesError } = await supabase.from("public_templates").insert(
    templatesSeed.map((template, index) => ({
      title: template.title,
      description: template.description,
      external_url: template.externalUrl,
      tools: [...template.tools],
      accent: template.accent,
      display_order: index,
      is_published: true,
    })),
  );
  if (templatesError) throw templatesError;

  for (const [index, study] of caseStudies.entries()) {
    const { data: upserted, error: studyError } = await supabase
      .from("case_studies")
      .upsert(
        {
          title: study.title,
          slug: study.slug,
          summary: study.summary,
          business_problem: study.businessProblem,
          before_state: study.beforeState,
          before_issues: study.beforeIssues,
          architecture_description: study.architectureDescription,
          architecture_nodes: study.architectureNodes,
          contribution: study.contribution,
          result: study.result,
          accent: study.accent,
          preview_label: study.previewLabel,
          status: "published",
          is_featured: true,
          display_order: index,
          published_at: new Date().toISOString(),
          seo_title: study.title,
          seo_description: study.summary,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (studyError) throw studyError;
    const caseStudyId = upserted.id as string;

    await supabase.from("case_study_steps").delete().eq("case_study_id", caseStudyId);
    await supabase.from("case_study_tools").delete().eq("case_study_id", caseStudyId);
    await supabase.from("reliability_controls").delete().eq("case_study_id", caseStudyId);
    await supabase.from("case_study_media").delete().eq("case_study_id", caseStudyId);

    const { error: stepsError } = await supabase.from("case_study_steps").insert(
      study.steps.map((step) => ({
        case_study_id: caseStudyId,
        step_number: step.stepNumber,
        title: step.title,
        description: step.description,
      })),
    );
    if (stepsError) throw stepsError;

    const { error: toolsError } = await supabase.from("case_study_tools").insert(
      study.tools.map((tool, toolIndex) => ({
        case_study_id: caseStudyId,
        name: tool.name,
        category: tool.category ?? null,
        display_order: toolIndex,
      })),
    );
    if (toolsError) throw toolsError;

    const { error: controlsError } = await supabase.from("reliability_controls").insert(
      study.reliabilityControls.map((control, controlIndex) => ({
        case_study_id: caseStudyId,
        name: control.name,
        description: control.description,
        display_order: controlIndex,
      })),
    );
    if (controlsError) throw controlsError;

    const { error: mediaError } = await supabase.from("case_study_media").insert(
      study.galleryPlaceholders.map((caption, mediaIndex) => ({
        case_study_id: caseStudyId,
        media_type: "placeholder",
        alt_text: caption,
        caption,
        display_order: mediaIndex,
      })),
    );
    if (mediaError) throw mediaError;
  }

  // ---------------------------------------------------------------------------
  // Editable site content: proof strip, hero diagram, navigation, workflows.
  // Each set is replaced wholesale so the seed stays the source of truth until
  // it is edited in the admin panel.
  // ---------------------------------------------------------------------------

  await supabase.from("proof_points").delete().neq("value", "__never__");
  const { error: proofError } = await supabase.from("proof_points").insert(
    proofStripSeed.map((item, index) => ({
      value: item.value,
      label: item.label,
      is_featured: "featured" in item && item.featured === true,
      display_order: index,
      is_published: true,
    })),
  );
  if (proofError) throw proofError;

  await supabase.from("hero_workflow_steps").delete().neq("title", "__never__");
  const { error: heroStepsError } = await supabase
    .from("hero_workflow_steps")
    .insert(
      heroWorkflowSeed.map((step, index) => ({
        title: step.title,
        description: step.description,
        icon: step.icon,
        display_order: index,
        is_published: true,
      })),
    );
  if (heroStepsError) throw heroStepsError;

  await supabase.from("nav_links").delete().neq("href", "__never__");
  const { error: navError } = await supabase.from("nav_links").insert(
    navLinks.map((link, index) => ({
      href: link.href,
      label: link.label,
      display_order: index,
      is_published: true,
    })),
  );
  if (navError) throw navError;

  // Deleting groups cascades to their workflows.
  await supabase.from("workflow_groups").delete().neq("category", "__never__");
  for (const [groupIndex, group] of workflowGroups.entries()) {
    const { data: groupRow, error: groupError } = await supabase
      .from("workflow_groups")
      .insert({
        category: group.category,
        description: group.description,
        display_order: groupIndex,
        is_published: true,
      })
      .select("id")
      .single();
    if (groupError) throw groupError;

    const { error: workflowsError } = await supabase.from("workflows").insert(
      group.items.map((item, itemIndex) => ({
        group_id: groupRow.id,
        slug: item.id,
        title: item.title,
        summary: item.summary,
        outcome_tags: item.outcomeTags ?? [],
        is_active: item.active ?? true,
        display_order: itemIndex,
        is_published: true,
      })),
    );
    if (workflowsError) throw workflowsError;
  }

  const { error: settingsError } = await supabase.from("site_settings").upsert(
    {
      setting_key: "availability",
      setting_value: {
        status: profileSeed.availabilityStatus,
        label: profileSeed.availabilityLabel,
      },
    },
    { onConflict: "setting_key" },
  );
  if (settingsError) throw settingsError;

  console.log(
    "Seed complete: verified content upserted. No credentials were written to source files.",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
