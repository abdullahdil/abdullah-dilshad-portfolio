import type { CaseStudyInput } from "@/lib/validations/case-study";

export const emptyCaseStudyInput: CaseStudyInput = {
  title: "",
  slug: "",
  summary: "",
  businessProblem: "",
  beforeState: "",
  beforeIssues: ["Issue one"],
  architectureDescription: "",
  architectureNodes: [{ label: "Trigger", detail: "Start event" }],
  steps: [
    {
      stepNumber: 1,
      title: "Step one",
      description: "Describe the first step.",
    },
  ],
  tools: [{ name: "n8n", category: "Automation" }],
  contribution: ["Designed the workflow"],
  reliabilityControls: [
    {
      name: "Error handling",
      description: "Retries and logging for failed steps.",
    },
  ],
  result: "",
  accent: "primary",
  previewLabel: "Architecture preview",
  status: "draft",
  featuredImageUrl: "",
  demoVideoUrl: "",
  galleryImages: [],
  galleryPlaceholders: [],
  demoVideoLabel: "Demo video coming soon",
};
