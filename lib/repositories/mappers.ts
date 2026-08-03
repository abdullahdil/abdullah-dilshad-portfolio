import type { CaseStudy, CaseStudyGalleryItem } from "@/lib/content/types";
import type {
  CaseStudyMediaRow,
  CaseStudyRow,
  CaseStudyStepRow,
  CaseStudyToolRow,
  ReliabilityControlRow,
} from "@/lib/supabase/database.types";

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
    .filter((item): item is CaseStudy["architectureNodes"][number] => item !== null);
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
          ? ["Screenshot placeholder", "Workflow detail placeholder", "Outcome placeholder"]
          : [],
    demoVideoLabel: study.demo_video_url ? "Watch demo" : "Demo video coming soon",
  };
}
