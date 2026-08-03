import { describe, expect, it } from "vitest";
import {
  caseStudies,
  getAdjacentCaseStudies,
  getCaseStudyBySlug,
  getCaseStudyCards,
} from "@/lib/content/case-studies";

const forbiddenTerms = [
  "350%",
  "98%",
  "4.5 seconds",
  "45 minutes",
  "70%",
  "TechStack",
  "Instantly.ai",
  "Clearbit",
  "Zapier",
  "Make.com",
  "Pinecone",
  "LangChain",
  "Sales Navigator",
  "employee onboarding",
  "asset provisioning",
];

describe("case study content helpers", () => {
  it("exposes exactly three verified case studies", () => {
    expect(caseStudies).toHaveLength(3);
    expect(caseStudies.map((study) => study.slug)).toEqual([
      "ai-lead-generation-outreach-engine",
      "internal-operations-automation-system",
      "rag-customer-support-workflow",
    ]);
  });

  it("returns a study for a known slug", () => {
    const study = getCaseStudyBySlug("rag-customer-support-workflow");
    expect(study?.title).toBe("RAG Customer Support Workflow");
    expect(study?.tools.map((tool) => tool.name)).toContain(
      "Vector knowledge base",
    );
  });

  it("returns undefined for an unknown slug", () => {
    expect(getCaseStudyBySlug("does-not-exist")).toBeUndefined();
  });

  it("builds adjacent navigation without wrapping", () => {
    const first = getAdjacentCaseStudies("ai-lead-generation-outreach-engine");
    expect(first.previous).toBeNull();
    expect(first.next?.slug).toBe("internal-operations-automation-system");

    const last = getAdjacentCaseStudies("rag-customer-support-workflow");
    expect(last.next).toBeNull();
    expect(last.previous?.slug).toBe("internal-operations-automation-system");
  });

  it("maps card summaries for the homepage", () => {
    const cards = getCaseStudyCards();
    expect(cards).toHaveLength(3);
    expect(cards[0]?.tools.length).toBeGreaterThan(0);
    expect(cards[0]?.previewLabel).toBeTruthy();
  });

  it("excludes fabricated metrics and tools from case-study copy", () => {
    const corpus = JSON.stringify(caseStudies);
    for (const term of forbiddenTerms) {
      expect(corpus.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });
});
