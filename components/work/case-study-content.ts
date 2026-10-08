/**
 * Pure helpers that turn a `CaseStudy` record into the short, scannable copy
 * the top of a case-study page needs. Nothing here writes new facts: every
 * string returned is a sentence (or the opening of a sentence) already on the
 * record, so the summary can never drift from the verified content.
 */

import type { ArchitectureNode, CaseStudy, CaseStudyStep } from "@/lib/content/types";

const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9"“(])/;

/**
 * The opening sentence(s) of `text`, stopping before `maxChars` is exceeded.
 * Always returns at least one sentence; a single sentence longer than
 * `hardLimit` is cut at a word boundary with an ellipsis.
 */
export function condense(text: string, maxChars = 200, hardLimit = 260): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";

  const sentences = clean.split(SENTENCE_SPLIT);
  let out = sentences[0] ?? clean;
  for (const sentence of sentences.slice(1)) {
    if (out.length + 1 + sentence.length > maxChars) break;
    out = `${out} ${sentence}`;
  }

  if (out.length <= hardLimit) return out;
  const cut = out.slice(0, hardLimit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : hardLimit).replace(/[,;:\s]+$/, "")}…`;
}

/** First non-empty value among the candidates, condensed. */
export function condenseFirst(
  candidates: (string | null | undefined)[],
  maxChars?: number,
): string {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) return condense(value, maxChars);
  }
  return "";
}

/**
 * Steps whose title or description mention a pipeline node by name — used to
 * give an architecture node more than its two-word caption when opened.
 * Generic labels ("n8n", "Trigger") still match their own steps; a label with
 * no match simply shows its own detail.
 */
export function stepsForNode(
  node: ArchitectureNode,
  steps: CaseStudyStep[],
): CaseStudyStep[] {
  const terms = node.label
    .split(/\s*\/\s*|\s+and\s+/i)
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 3);
  if (terms.length === 0) return [];

  return steps
    .filter((step) => {
      const haystack = `${step.title} ${step.description}`.toLowerCase();
      return terms.some((term) => haystack.includes(term));
    })
    .slice(0, 2);
}

export type CaseStudyChip = { label: string; value: string };

/** Hero chips: domain, step count, tool count, control count. */
export function caseStudyChips(study: CaseStudy): CaseStudyChip[] {
  const chips: CaseStudyChip[] = [];
  if (study.previewLabel) chips.push({ label: "Domain", value: study.previewLabel });
  if (study.steps.length > 0) {
    chips.push({ label: "Pipeline", value: `${study.steps.length} steps` });
  }
  if (study.tools.length > 0) {
    chips.push({
      label: "Stack",
      value: `${study.tools.length} ${study.tools.length === 1 ? "tool" : "tools"}`,
    });
  }
  if (study.reliabilityControls.length > 0) {
    chips.push({
      label: "Controls",
      value: `${study.reliabilityControls.length} reliability`,
    });
  }
  return chips;
}

/** Stable DOM id for a narrative section — shared by the prose and the TOC. */
export function narrativeSectionId(
  section: { id?: string },
  index: number,
): string {
  return section.id ?? `story-${index + 1}`;
}
