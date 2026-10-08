import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { caseStudies } from "@/lib/content/case-studies";
import { workflowGroups, workflowListings } from "@/lib/content/workflows";
import {
  getPublishedCaseStudiesForWorkflow,
  getPublishedCaseStudyBySlug,
} from "@/lib/repositories/case-studies";
import { mapCaseStudyRowsToDomain } from "@/lib/repositories/mappers";
import {
  getPublishedWorkflowBySlug,
  listPublishedWorkflowGroups,
  listPublishedWorkflowListings,
  toWorkflowCardData,
} from "@/lib/repositories/site-content";
import type { CaseStudyRow } from "@/lib/supabase/database.types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

// Force the seed (no-Supabase) path regardless of the developer's .env.local.
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public supabase client", () => {
  it("is null when Supabase is not configured", () => {
    expect(createPublicSupabaseClient()).toBeNull();
  });
});

describe("workflow listings (seed path)", () => {
  it("flattens every group in catalog order", async () => {
    const flat = await listPublishedWorkflowListings();
    const groups = await listPublishedWorkflowGroups();
    expect(flat.map((item) => item.id)).toEqual(
      groups.flatMap((group) => group.items.map((item) => item.id)),
    );
    expect(flat).toHaveLength(workflowListings.length);
  });

  it("uses the id as the slug and has no updatedAt", async () => {
    for (const listing of await listPublishedWorkflowListings()) {
      expect(listing.slug).toBe(listing.id);
      expect(listing.updatedAt).toBeNull();
    }
  });

  it("finds a workflow by slug and returns null for an unknown one", async () => {
    const first = workflowGroups[0].items[0];
    const found = await getPublishedWorkflowBySlug(first.id);
    expect(found?.title).toBe(first.title);
    expect(found?.category).toBe(first.category);
    expect(await getPublishedWorkflowBySlug("does-not-exist")).toBeNull();
  });

  it("strips the canvas for card data", () => {
    const listing = {
      id: "demo",
      slug: "demo",
      title: "Demo",
      summary: "",
      category: "Cat",
      imageUrl: null,
      imageAlt: "",
      canvas: {
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
      },
      outcomeTags: [],
      active: true,
      updatedAt: null,
    };
    const card = toWorkflowCardData(listing);
    expect("canvas" in card).toBe(false);
    expect(card.nodeCount).toBe(1);
    expect(card.hasCanvas).toBe(true);
    expect(card.toolKeys).toEqual(["scheduletrigger"]);

    const empty = toWorkflowCardData({ ...listing, canvas: null });
    expect(empty).toMatchObject({
      nodeCount: 0,
      hasCanvas: false,
      toolKeys: [],
    });
  });
});

describe("case studies for a workflow (seed path)", () => {
  it("returns the studies whose relatedWorkflowIds include it", async () => {
    const refs = await getPublishedCaseStudiesForWorkflow(
      "smart-complaint-routing-demo",
    );
    expect(refs).toEqual([
      {
        slug: "rag-customer-support-workflow",
        title: "AI Complaint Triage and Routing",
      },
    ]);
  });

  it("returns [] for a workflow no study features", async () => {
    expect(await getPublishedCaseStudiesForWorkflow("does-not-exist")).toEqual(
      [],
    );
  });

  it("seed studies carry no updatedAt", async () => {
    const study = await getPublishedCaseStudyBySlug(caseStudies[0].slug);
    expect(study?.updatedAt ?? null).toBeNull();
  });
});

describe("mapCaseStudyRowsToDomain updatedAt", () => {
  it("passes the row's updated_at through", () => {
    const study = {
      id: "id",
      slug: "s",
      title: "T",
      summary: "",
      business_problem: "",
      before_state: "",
      before_issues: [],
      architecture_description: "",
      architecture_nodes: [],
      narrative: null,
      contribution: [],
      result: "",
      accent: "primary",
      preview_label: "",
      featured_image_url: null,
      demo_video_url: null,
      status: "published",
      updated_at: "2026-09-21T10:59:24.596987+00:00",
    } as unknown as CaseStudyRow;
    const mapped = mapCaseStudyRowsToDomain({
      study,
      steps: [],
      tools: [],
      controls: [],
      media: [],
    });
    expect(mapped.updatedAt).toBe("2026-09-21T10:59:24.596987+00:00");
  });
});
