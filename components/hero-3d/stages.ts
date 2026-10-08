/**
 * The five canonical workflow stages shown by the hero machine.
 * Source of truth: CONTENT_TRUTH.md — "Business Trigger → Data Enrichment →
 * AI-Assisted Decision → Human Approval → Business Action". Do not reword.
 *
 * Plain module (no "use client") so Server Components can import the values.
 */
export type HeroStageKind = "trigger" | "enrich" | "ai" | "human" | "action";

export type HeroStage = {
  id: string;
  label: string;
  kind: HeroStageKind;
};

export const HERO_STAGES: readonly HeroStage[] = [
  { id: "trigger", label: "Business Trigger", kind: "trigger" },
  { id: "enrich", label: "Data Enrichment", kind: "enrich" },
  { id: "ai", label: "AI-Assisted Decision", kind: "ai" },
  { id: "human", label: "Human Approval", kind: "human" },
  { id: "action", label: "Business Action", kind: "action" },
];

/** Plain-language equivalent of the scene, for screen readers. */
export function describeHeroStages(steps: readonly HeroStage[]): string {
  const labels = steps.map((s) => s.label);
  const list =
    labels.length > 1
      ? `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`
      : (labels[0] ?? "");
  return `Illustration of a business automation workflow with ${labels.length} connected steps: ${list}. Items pause for human approval before the business action runs; some are sent back for another enrichment pass.`;
}
