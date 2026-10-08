import { describe, expect, it } from "vitest";
import {
  caseStudies,
  getSeedRelatedWorkflows,
} from "@/lib/content/case-studies";
import { workflowGroups } from "@/lib/content/workflows";
import { mapWorkflowRowToPublicListing } from "@/lib/repositories/mappers";
import type { PublicWorkflowRowFields } from "@/lib/repositories/mappers";
import { caseStudyWorkflowLinksSchema } from "@/lib/validations/case-study";

const firstSeedWorkflowId = workflowGroups[0].items[0].id;
const secondSeedWorkflowId = workflowGroups[0].items[1].id;

function workflowRow(
  overrides: Partial<PublicWorkflowRowFields> = {},
): PublicWorkflowRowFields {
  return {
    slug: "prospect-discovery-engine",
    title: "Prospect Discovery Engine",
    summary: "Builds targeted prospect lists.",
    image_url: null,
    image_alt: "",
    canvas_json: null,
    outcome_tags: ["Lead gen"],
    is_active: true,
    updated_at: "2026-09-17T10:14:45.579863+00:00",
    ...overrides,
  };
}

describe("seed related workflows", () => {
  it("returns nothing when a case study declares no links", () => {
    expect(getSeedRelatedWorkflows({})).toEqual([]);
    for (const study of caseStudies) {
      expect(Array.isArray(getSeedRelatedWorkflows(study))).toBe(true);
    }
  });

  it("resolves ids against the seed catalog in the authored order", () => {
    const resolved = getSeedRelatedWorkflows({
      relatedWorkflowIds: [secondSeedWorkflowId, firstSeedWorkflowId],
    });
    expect(resolved.map((item) => item.id)).toEqual([
      secondSeedWorkflowId,
      firstSeedWorkflowId,
    ]);
    expect(resolved[0].category).toBe(workflowGroups[0].category);
  });

  it("drops ids that no longer exist instead of rendering a hole", () => {
    const resolved = getSeedRelatedWorkflows({
      relatedWorkflowIds: ["does-not-exist", firstSeedWorkflowId],
    });
    expect(resolved.map((item) => item.id)).toEqual([firstSeedWorkflowId]);
  });

  it("only references seed workflow ids that exist", () => {
    const known = new Set(
      workflowGroups.flatMap((group) => group.items.map((item) => item.id)),
    );
    for (const study of caseStudies) {
      for (const id of study.relatedWorkflowIds ?? []) {
        expect(known.has(id)).toBe(true);
      }
    }
  });
});

describe("mapWorkflowRowToPublicListing", () => {
  it("exposes the slug as the public id and falls back to the title for alt text", () => {
    const listing = mapWorkflowRowToPublicListing(workflowRow(), "Lead Gen");
    expect(listing.id).toBe("prospect-discovery-engine");
    expect(listing.imageAlt).toBe("Prospect Discovery Engine");
    expect(listing.category).toBe("Lead Gen");
  });

  it("degrades a malformed stored canvas to null", () => {
    const listing = mapWorkflowRowToPublicListing(
      workflowRow({ canvas_json: { nodes: "not-an-array" } }),
      "Lead Gen",
    );
    expect(listing.canvas).toBeNull();
  });

  it("keeps a valid stored canvas", () => {
    const canvas = {
      version: 1 as const,
      name: "Demo",
      nodes: [
        {
          id: "n1",
          name: "Trigger",
          type: "n8n-nodes-base.scheduleTrigger",
          typeKey: "scheduletrigger",
          shape: "trigger" as const,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          subtitle: "",
          disabled: false,
        },
      ],
      stickies: [],
      edges: [],
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      toolKeys: ["scheduletrigger"],
    };
    const listing = mapWorkflowRowToPublicListing(
      workflowRow({ canvas_json: canvas }),
      "Lead Gen",
    );
    expect(listing.canvas?.nodes).toHaveLength(1);
  });
});

describe("caseStudyWorkflowLinksSchema", () => {
  const uuidA = "11111111-1111-4111-8111-111111111111";
  const uuidB = "22222222-2222-4222-8222-222222222222";

  it("defaults to an empty selection", () => {
    expect(caseStudyWorkflowLinksSchema.parse({})).toEqual({ workflowIds: [] });
  });

  it("accepts an ordered list of workflow uuids", () => {
    const parsed = caseStudyWorkflowLinksSchema.parse({
      workflowIds: [uuidB, uuidA],
    });
    expect(parsed.workflowIds).toEqual([uuidB, uuidA]);
  });

  it("rejects duplicates and non-uuid ids", () => {
    expect(
      caseStudyWorkflowLinksSchema.safeParse({ workflowIds: [uuidA, uuidA] })
        .success,
    ).toBe(false);
    expect(
      caseStudyWorkflowLinksSchema.safeParse({
        workflowIds: ["prospect-discovery-engine"],
      }).success,
    ).toBe(false);
  });
});
