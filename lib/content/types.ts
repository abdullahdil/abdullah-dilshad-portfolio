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

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  accent: AccentTone;
  previewLabel: string;
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
  galleryImages: CaseStudyGalleryItem[];
  galleryPlaceholders: string[];
  demoVideoLabel: string;
};
