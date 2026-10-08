export type AccentTone = "primary" | "secondary" | "tertiary";

export type CaseStudyStep = {
  stepNumber: number;
  title: string;
  description: string;
};

export type CaseStudyTool = {
  name: string;
  category?: string;
};

export type ReliabilityControl = {
  name: string;
  description: string;
};

export type ArchitectureNode = {
  label: string;
  detail: string;
};

export type CaseStudyGalleryItem = {
  url?: string;
  caption: string;
  alt?: string;
};

export type CaseStudyMetric = {
  value: string;
  label: string;
};

/**
 * One movement of a case study's story, rendered as flowing prose.
 *
 * `body` is an ordered list of *paragraphs* — never bullets. The user asked
 * for the story of what was built, how it was built and what time it saved,
 * not a point structure, so nothing here models a list item.
 */
export type CaseStudyNarrativeSection = {
  /** Optional slug-ish anchor id, so a section can be deep-linked. */
  id?: string;
  /** Optional sub-heading. Omit it to keep a section running on from the last. */
  heading?: string;
  /** Paragraphs of prose, in reading order. */
  body: string[];
  /**
   * Places the real n8n canvases immediately after this section instead of
   * after the whole narrative — the story can then show the build at the
   * moment it describes it. Set on at most one section; the first one that
   * sets it wins.
   */
  showWorkflowsAfter?: boolean;
};

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  accent: AccentTone;
  previewLabel: string;
  /**
   * The long-form story: what was built, how, and what it saved. Optional so
   * every existing seed entry stays valid unchanged and the no-Supabase path
   * renders — a study without one falls back to the prose it already has
   * (see `components/work/case-study-narrative.tsx`).
   */
  narrative?: CaseStudyNarrativeSection[];
  businessProblem: string;
  beforeState: string;
  beforeIssues: string[];
  architectureDescription: string;
  architectureNodes: ArchitectureNode[];
  steps: CaseStudyStep[];
  tools: CaseStudyTool[];
  contribution: string[];
  reliabilityControls: ReliabilityControl[];
  result: string;
  resultMetrics?: CaseStudyMetric[];
  featuredImageUrl?: string | null;
  demoVideoUrl?: string | null;
  /**
   * Ids of workflow listings (`WorkflowListing.id`, the same value as the
   * database `workflows.slug`) whose canvases illustrate this case study.
   * Optional so every existing seed entry stays valid unchanged and the
   * no-Supabase path renders with the section simply absent.
   */
  relatedWorkflowIds?: string[];
  galleryImages: CaseStudyGalleryItem[];
  galleryPlaceholders: string[];
  demoVideoLabel: string;
  /**
   * ISO timestamp of the last edit (`case_studies.updated_at`). Seed content
   * has none, so it is absent / null on the no-Supabase path. Used for
   * sitemap `lastModified` and article `dateModified`.
   */
  updatedAt?: string | null;
};
