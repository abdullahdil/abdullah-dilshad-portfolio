import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTER,
  filterCatalog,
  parseCatalogFilter,
  pickFeaturedWorkflows,
  serializeCatalogFilter,
  toWorkflowCardData,
  workflowFacts,
  workflowStatus,
} from "@/components/catalog/workflow-data";
import {
  classifyNode,
  computeFit,
  graphFrame,
  MIN_LEGIBLE_SCALE,
} from "@/components/public/workflow-canvas-geometry";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";
import type { CanvasNode, WorkflowCanvas } from "@/lib/workflow-canvas/types";

function node(id: string, x: number, typeKey: string, shape: CanvasNode["shape"] = "default"): CanvasNode {
  return {
    id,
    name: id,
    type: `n8n-nodes-base.${typeKey}`,
    typeKey,
    shape,
    x,
    y: 0,
    width: 96,
    height: 96,
    subtitle: "",
    disabled: false,
  };
}

function canvasOf(nodes: CanvasNode[]): WorkflowCanvas {
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  return {
    version: 1,
    name: "t",
    nodes,
    stickies: [],
    edges: nodes.slice(1).map((n, i) => ({
      id: `e${i}`,
      source: nodes[i].id,
      target: n.id,
      kind: "main",
      port: "main",
      sourceIndex: 0,
      targetIndex: 0,
      label: "",
    })),
    bounds: { minX: 0, minY: 0, maxX, maxY: 96 },
    toolKeys: [...new Set(nodes.map((n) => n.typeKey))],
  };
}

function listing(
  id: string,
  category: string,
  active: boolean,
  size = 0,
): PublicWorkflowListing {
  const nodes = Array.from({ length: size }, (_, i) => node(`${id}-${i}`, i * 200, "code"));
  return {
    id,
    slug: id,
    title: `Title ${id}`,
    summary: `Summary for ${id}`,
    category,
    imageUrl: null,
    imageAlt: "",
    canvas: size > 0 ? canvasOf(nodes) : null,
    outcomeTags: ["Outreach"],
    active,
    updatedAt: null,
  };
}

describe("computeFit", () => {
  const small = { x: 0, y: 0, width: 800, height: 300 };
  const wide = { x: 100, y: 50, width: 5000, height: 600 };

  it("centres a graph that fits legibly", () => {
    const fit = computeFit(small, 1000, 600, "legible", 20);
    expect(fit.k).toBeGreaterThanOrEqual(MIN_LEGIBLE_SCALE);
    expect(fit.overflowX).toBe(false);
    // Centred horizontally: equal space either side.
    const left = fit.x + small.x * fit.k;
    const right = 1000 - (left + small.width * fit.k);
    expect(Math.abs(left - right)).toBeLessThan(1);
  });

  it("never drops below the legible floor for a very wide graph, and anchors its start", () => {
    const fit = computeFit(wide, 1000, 600, "legible", 20);
    expect(fit.k).toBeGreaterThanOrEqual(MIN_LEGIBLE_SCALE);
    expect(fit.overflowX).toBe(true);
    expect(fit.x + wide.x * fit.k).toBeCloseTo(20);
  });

  it("overview mode shows the whole graph inside the viewport", () => {
    const fit = computeFit(wide, 1000, 600, "overview", 20);
    const left = fit.x + wide.x * fit.k;
    const right = left + wide.width * fit.k;
    expect(left).toBeGreaterThanOrEqual(19.9);
    expect(right).toBeLessThanOrEqual(980.1);
  });

  it("survives a zero-size viewport", () => {
    const fit = computeFit(small, 0, 0, "legible", 0);
    expect(Number.isFinite(fit.k)).toBe(true);
  });
});

describe("node kinds and facts", () => {
  it("classifies triggers, AI, logic and integrations", () => {
    expect(classifyNode(node("a", 0, "webhook", "trigger"))).toBe("trigger");
    expect(classifyNode(node("b", 0, "gmailtrigger"))).toBe("trigger");
    expect(classifyNode(node("c", 0, "lmchatopenai", "attachment"))).toBe("ai");
    expect(classifyNode(node("d", 0, "agent"))).toBe("ai");
    expect(classifyNode(node("e", 0, "if"))).toBe("logic");
    expect(classifyNode(node("f", 0, "googlesheets"))).toBe("integration");
  });

  it("derives facts from the canvas only", () => {
    const canvas = canvasOf([
      node("t", 0, "scheduletrigger", "trigger"),
      node("ai", 200, "openai"),
      node("if", 400, "if"),
      node("s", 600, "googlesheets"),
      node("s2", 800, "googlesheets"),
    ]);
    const facts = workflowFacts(canvas);
    expect(facts).toMatchObject({
      nodeCount: 5,
      connectionCount: 4,
      triggers: ["Schedule"],
      aiSteps: 1,
      branches: 1,
      integrations: ["Google Sheets"],
    });
    expect(graphFrame(canvas)).toEqual({ x: 0, y: 0, width: 896, height: 96 });
  });
});

describe("catalog data", () => {
  const items = [
    listing("a", "Lead Generation & Outreach", true, 10),
    listing("b", "Lead Generation & Outreach", false, 40),
    listing("c", "Teaching & Training Demos", true, 50),
    listing("d", "Operations & Internal Process", true, 5),
  ];

  it("derives status from teaching groups and the active flag", () => {
    expect(workflowStatus(items[0])).toBe("production");
    expect(workflowStatus(items[1])).toBe("build");
    expect(workflowStatus(items[2])).toBe("teaching");
  });

  it("card data never carries the canvas", () => {
    const card = toWorkflowCardData(items[0]);
    expect(card).not.toHaveProperty("canvas");
    expect(card.nodeCount).toBe(10);
    expect(card.slug).toBe("a");
  });

  it("filters by scope, group and query", () => {
    const cards = items.map(toWorkflowCardData);
    expect(filterCatalog(cards, EMPTY_FILTER)).toHaveLength(4);
    expect(filterCatalog(cards, { ...EMPTY_FILTER, scope: "production" }).map((c) => c.id)).toEqual(["a", "d"]);
    expect(filterCatalog(cards, { ...EMPTY_FILTER, scope: "teaching" }).map((c) => c.id)).toEqual(["c"]);
    expect(
      filterCatalog(cards, { ...EMPTY_FILTER, group: "Lead Generation & Outreach" }).map((c) => c.id),
    ).toEqual(["a", "b"]);
    expect(filterCatalog(cards, { ...EMPTY_FILTER, q: "internal process" }).map((c) => c.id)).toEqual(["d"]);
    expect(filterCatalog(cards, { ...EMPTY_FILTER, q: "code" })).toHaveLength(4);
  });

  it("round-trips the URL filter", () => {
    const filter = { q: "outreach", group: "Lead Generation & Outreach", scope: "production" as const };
    expect(parseCatalogFilter(serializeCatalogFilter(filter))).toEqual(filter);
    expect(serializeCatalogFilter(EMPTY_FILTER)).toBe("");
    expect(parseCatalogFilter("?scope=bogus").scope).toBe("all");
  });

  it("features production work only, largest first, one per group first", () => {
    const featured = pickFeaturedWorkflows(items, 6).map((l) => l.id);
    expect(featured).toEqual(["a", "d"]);
  });
});
