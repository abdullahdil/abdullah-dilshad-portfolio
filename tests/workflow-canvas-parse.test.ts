import { describe, expect, it } from "vitest";
import { iconForTypeKey } from "@/lib/workflow-canvas/icons";
import { parseN8nWorkflow, parseN8nWorkflowJson } from "@/lib/workflow-canvas/parse";
import { NODE_SIZE, STICKY_DEFAULT_HEIGHT, STICKY_DEFAULT_WIDTH } from "@/lib/workflow-canvas/types";
import {
  MAX_WORKFLOW_CANVAS_CHARS,
  workflowCanvasInputSchema,
  workflowCanvasSchema,
} from "@/lib/validations/workflow-canvas";

/** A small but realistic export: webhook -> IF -> two branches. */
function branchingWorkflow() {
  return {
    name: "Lead router",
    nodes: [
      {
        parameters: { path: "lead" },
        id: "a1",
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [0, 0],
      },
      {
        parameters: { conditions: {} },
        id: "b2",
        name: "Is enterprise?",
        type: "n8n-nodes-base.if",
        typeVersion: 2,
        position: [200, 0],
      },
      {
        parameters: { resource: "sheet", operation: "append" },
        id: "c3",
        name: "Log deal",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4,
        position: [400, -100],
      },
      {
        parameters: { method: "post", url: "https://example.com" },
        id: "d4",
        name: "Notify",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4,
        position: [400, 100],
        disabled: true,
      },
    ],
    connections: {
      Webhook: { main: [[{ node: "Is enterprise?", type: "main", index: 0 }]] },
      "Is enterprise?": {
        main: [
          [{ node: "Log deal", type: "main", index: 0 }],
          [{ node: "Notify", type: "main", index: 0 }],
        ],
      },
    },
  };
}

/** An agent with a chat model, memory and a tool hanging off `ai_*` ports. */
function agentWorkflow() {
  return {
    name: "Support agent",
    nodes: [
      {
        id: "t1",
        name: "When chat message received",
        type: "@n8n/n8n-nodes-langchain.chatTrigger",
        position: [0, 0],
        parameters: {},
      },
      {
        id: "a1",
        name: "AI Agent",
        type: "@n8n/n8n-nodes-langchain.agent",
        position: [220, 0],
        parameters: {},
      },
      {
        id: "m1",
        name: "OpenAI Chat Model",
        type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
        position: [180, 180],
        parameters: {},
      },
      {
        id: "mem1",
        name: "Window Buffer Memory",
        type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
        position: [300, 180],
        parameters: {},
      },
      {
        id: "s1",
        name: "Send reply",
        type: "n8n-nodes-base.slack",
        position: [460, 0],
        parameters: { resource: "message", operation: "post" },
      },
    ],
    connections: {
      "When chat message received": { main: [[{ node: "AI Agent", type: "main", index: 0 }]] },
      "AI Agent": { main: [[{ node: "Send reply", type: "main", index: 0 }]] },
      "OpenAI Chat Model": {
        ai_languageModel: [[{ node: "AI Agent", type: "ai_languageModel", index: 0 }]],
      },
      "Window Buffer Memory": {
        ai_memory: [[{ node: "AI Agent", type: "ai_memory", index: 0 }]],
      },
    },
  };
}

function expectOk(result: ReturnType<typeof parseN8nWorkflow>) {
  if (!result.ok) throw new Error(`expected a parsed canvas, got: ${result.error}`);
  return result.canvas;
}

describe("parseN8nWorkflow — happy path", () => {
  it("parses a branching workflow into nodes, edges and metadata", () => {
    const canvas = expectOk(parseN8nWorkflow(branchingWorkflow()));

    expect(canvas.version).toBe(1);
    expect(canvas.name).toBe("Lead router");
    expect(canvas.nodes.map((node) => node.id)).toEqual(["a1", "b2", "c3", "d4"]);
    expect(canvas.stickies).toEqual([]);
    expect(canvas.toolKeys).toEqual(["webhook", "if", "googlesheets", "httprequest"]);
  });

  it("derives shapes, sizes, subtitles and the disabled flag", () => {
    const canvas = expectOk(parseN8nWorkflow(branchingWorkflow()));
    const [webhook, ifNode, sheets, http] = canvas.nodes;

    expect(webhook.shape).toBe("trigger");
    expect(webhook.width).toBe(NODE_SIZE);
    expect(webhook.height).toBe(NODE_SIZE);
    expect(ifNode.shape).toBe("default");
    expect(sheets.subtitle).toBe("append: sheet");
    expect(http.subtitle).toBe("POST");
    expect(http.disabled).toBe(true);
    expect(webhook.disabled).toBe(false);
  });

  it("labels IF branches true/false and leaves single outputs unlabelled", () => {
    const canvas = expectOk(parseN8nWorkflow(branchingWorkflow()));

    const fromWebhook = canvas.edges.filter((edge) => edge.source === "a1");
    expect(fromWebhook).toHaveLength(1);
    expect(fromWebhook[0].label).toBe("");
    expect(fromWebhook[0].kind).toBe("main");

    const fromIf = canvas.edges.filter((edge) => edge.source === "b2");
    expect(fromIf.map((edge) => [edge.target, edge.sourceIndex, edge.label])).toEqual([
      ["c3", 0, "true"],
      ["d4", 1, "false"],
    ]);
  });

  it("uses the branch index as the label for switch-style nodes", () => {
    const payload = {
      nodes: [
        { id: "s", name: "Route", type: "n8n-nodes-base.switch", position: [0, 0] },
        { id: "x", name: "A", type: "n8n-nodes-base.noOp", position: [200, 0] },
        { id: "y", name: "B", type: "n8n-nodes-base.noOp", position: [200, 120] },
      ],
      connections: {
        Route: {
          main: [[{ node: "A", type: "main", index: 0 }], [{ node: "B", type: "main", index: 0 }]],
        },
      },
    };

    const canvas = expectOk(parseN8nWorkflow(payload));
    expect(canvas.edges.map((edge) => edge.label)).toEqual(["0", "1"]);
  });

  it("accepts nodes nested under workflow/data", () => {
    const nested = { data: branchingWorkflow() };
    expect(expectOk(parseN8nWorkflow(nested)).nodes).toHaveLength(4);

    const wrapped = { workflow: branchingWorkflow() };
    expect(expectOk(parseN8nWorkflow(wrapped)).nodes).toHaveLength(4);
  });

  it("renders nodes with no connections block at all", () => {
    const payload = {
      name: "Solo",
      nodes: [{ id: "one", name: "Only", type: "n8n-nodes-base.set", position: [10, 20] }],
    };

    const canvas = expectOk(parseN8nWorkflow(payload));
    expect(canvas.nodes).toHaveLength(1);
    expect(canvas.edges).toEqual([]);
  });
});

describe("parseN8nWorkflow — sticky notes", () => {
  it("extracts stickies with explicit size and colour, keeping them out of nodes", () => {
    const payload = {
      nodes: [
        {
          id: "sticky-1",
          name: "Sticky Note",
          type: "n8n-nodes-base.stickyNote",
          position: [-40, -60],
          parameters: {
            content: "## Intake\nRuns on every form submit.",
            height: 320,
            width: 480,
            color: 4,
          },
        },
        { id: "n1", name: "Set", type: "n8n-nodes-base.set", position: [0, 0] },
      ],
    };

    const canvas = expectOk(parseN8nWorkflow(payload));
    expect(canvas.nodes.map((node) => node.id)).toEqual(["n1"]);
    expect(canvas.toolKeys).toEqual(["set"]);
    expect(canvas.stickies).toEqual([
      {
        id: "sticky-1",
        content: "## Intake\nRuns on every form submit.",
        color: 4,
        x: -40,
        y: -60,
        width: 480,
        height: 320,
      },
    ]);
  });

  it("falls back to the default size and colour 1", () => {
    const payload = {
      nodes: [
        {
          id: "sticky-1",
          name: "Sticky Note",
          type: "n8n-nodes-base.stickyNote",
          position: [0, 0],
          parameters: { content: "Plain note" },
        },
      ],
    };

    const [sticky] = expectOk(parseN8nWorkflow(payload)).stickies;
    expect(sticky.width).toBe(STICKY_DEFAULT_WIDTH);
    expect(sticky.height).toBe(STICKY_DEFAULT_HEIGHT);
    expect(sticky.color).toBe(1);
    expect(sticky.content).toBe("Plain note");
  });

  it("sorts the largest sticky first so it paints behind the others", () => {
    const payload = {
      nodes: [
        {
          id: "small",
          name: "Small",
          type: "n8n-nodes-base.stickyNote",
          position: [0, 0],
          parameters: { content: "small", width: 200, height: 100 },
        },
        {
          id: "big",
          name: "Big",
          type: "n8n-nodes-base.stickyNote",
          position: [0, 0],
          parameters: { content: "big", width: 900, height: 600 },
        },
      ],
    };

    expect(expectOk(parseN8nWorkflow(payload)).stickies.map((s) => s.id)).toEqual(["big", "small"]);
  });
});

describe("parseN8nWorkflow — AI sub-nodes", () => {
  it("marks ai-only sources as small attachments and tags their edges", () => {
    const canvas = expectOk(parseN8nWorkflow(agentWorkflow()));
    const byId = new Map(canvas.nodes.map((node) => [node.id, node]));

    expect(byId.get("m1")?.shape).toBe("attachment");
    expect(byId.get("m1")?.width).toBe(48);
    expect(byId.get("m1")?.height).toBe(48);
    // Attachments keep the coordinates the author gave them.
    expect(byId.get("m1")?.x).toBe(180);
    expect(byId.get("m1")?.y).toBe(180);
    expect(byId.get("mem1")?.shape).toBe("attachment");

    expect(byId.get("t1")?.shape).toBe("trigger");
    expect(byId.get("a1")?.shape).toBe("default");
    expect(byId.get("s1")?.shape).toBe("default");

    const aiEdges = canvas.edges.filter((edge) => edge.kind === "ai");
    expect(aiEdges.map((edge) => edge.port).sort()).toEqual(["ai_languageModel", "ai_memory"]);
    expect(aiEdges.every((edge) => edge.target === "a1")).toBe(true);
    expect(aiEdges.every((edge) => edge.label === "")).toBe(true);
  });

  it("classifies the error port as an error edge", () => {
    const payload = {
      nodes: [
        { id: "a", name: "Call API", type: "n8n-nodes-base.httpRequest", position: [0, 0] },
        { id: "b", name: "Alert", type: "n8n-nodes-base.slack", position: [200, 0] },
      ],
      connections: { "Call API": { error: [[{ node: "Alert", type: "error", index: 0 }]] } },
    };

    const [edge] = expectOk(parseN8nWorkflow(payload)).edges;
    expect(edge.kind).toBe("error");
    expect(edge.port).toBe("error");
  });
});

describe("parseN8nWorkflow — tolerance", () => {
  it("drops connections whose endpoints do not resolve", () => {
    const payload = {
      nodes: [{ id: "a", name: "Webhook", type: "n8n-nodes-base.webhook", position: [0, 0] }],
      connections: {
        Webhook: { main: [[{ node: "Deleted node", type: "main", index: 0 }]] },
        "Ghost source": { main: [[{ node: "Webhook", type: "main", index: 0 }]] },
      },
    };

    const canvas = expectOk(parseN8nWorkflow(payload));
    expect(canvas.edges).toEqual([]);
    expect(canvas.nodes).toHaveLength(1);
  });

  it("ignores unknown keys and survives a malformed connections block", () => {
    const payload = {
      name: "Odd",
      meta: { instanceId: "x" },
      pinData: {},
      nodes: [{ id: "a", name: "Set", type: "n8n-nodes-base.set", position: [0, 0], extra: true }],
      connections: { Set: { main: "not-an-array" } },
    };

    expect(expectOk(parseN8nWorkflow(payload)).edges).toEqual([]);
  });

  it("returns an actionable error for JSON with no nodes array", () => {
    const result = parseN8nWorkflow({ name: "Nope" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('"nodes"');
  });

  it("returns an error for a non-object payload", () => {
    expect(parseN8nWorkflow("[]").ok).toBe(false);
    expect(parseN8nWorkflow(null).ok).toBe(false);
    expect(parseN8nWorkflow(42).ok).toBe(false);
  });

  it("rejects workflows above the node ceiling", () => {
    const nodes = Array.from({ length: 501 }, (_, index) => ({
      id: `n${index}`,
      name: `Node ${index}`,
      type: "n8n-nodes-base.noOp",
      position: [index * 10, 0],
    }));

    const result = parseN8nWorkflow({ nodes });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("501");
  });
});

describe("parseN8nWorkflowJson", () => {
  it("parses a JSON string", () => {
    const canvas = expectOk(parseN8nWorkflowJson(JSON.stringify(branchingWorkflow())));
    expect(canvas.name).toBe("Lead router");
  });

  it("reports malformed JSON instead of throwing", () => {
    const result = parseN8nWorkflowJson('{"nodes": [');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("not valid JSON");
  });

  it("reports empty input", () => {
    const result = parseN8nWorkflowJson("   ");
    expect(result.ok).toBe(false);
  });
});

describe("bounds", () => {
  it("covers every node and sticky using their real sizes", () => {
    const payload = {
      nodes: [
        { id: "a", name: "A", type: "n8n-nodes-base.set", position: [0, 0] },
        { id: "b", name: "B", type: "n8n-nodes-base.set", position: [500, 300] },
        {
          id: "s",
          name: "Sticky Note",
          type: "n8n-nodes-base.stickyNote",
          position: [-100, -80],
          parameters: { content: "x", width: 300, height: 200 },
        },
      ],
    };

    expect(expectOk(parseN8nWorkflow(payload)).bounds).toEqual({
      minX: -100,
      minY: -80,
      maxX: 500 + NODE_SIZE,
      maxY: 300 + NODE_SIZE,
    });
  });

  it("zeroes the bounds for an empty canvas", () => {
    const canvas = expectOk(parseN8nWorkflow({ nodes: [] }));
    expect(canvas.bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    expect(canvas.toolKeys).toEqual([]);
  });
});

describe("determinism", () => {
  it("produces identical output across repeated parses", () => {
    const text = JSON.stringify(agentWorkflow());
    const first = expectOk(parseN8nWorkflowJson(text));
    const second = expectOk(parseN8nWorkflowJson(text));

    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("ignores the key order of the connections object", () => {
    const base = agentWorkflow();
    const reordered = {
      ...base,
      connections: Object.fromEntries(Object.entries(base.connections).reverse()),
    };

    expect(expectOk(parseN8nWorkflow(reordered)).edges).toEqual(
      expectOk(parseN8nWorkflow(base)).edges,
    );
  });
});

describe("validation schemas", () => {
  it("accepts a parsed canvas", () => {
    const canvas = expectOk(parseN8nWorkflow(agentWorkflow()));
    expect(workflowCanvasSchema.safeParse(canvas).success).toBe(true);
  });

  it("round-trips a parsed canvas through JSON without loss", () => {
    const canvas = expectOk(parseN8nWorkflow(agentWorkflow()));
    const roundTripped: unknown = JSON.parse(JSON.stringify(canvas));

    // The Data agent re-validates stored jsonb with this schema, so the parser
    // must only ever emit JSON-safe values.
    expect(workflowCanvasSchema.parse(roundTripped)).toEqual(canvas);
    expect(roundTripped).toEqual(canvas);
  });

  it("rejects a canvas with a bad sticky colour", () => {
    const canvas = expectOk(parseN8nWorkflow(branchingWorkflow()));
    const broken = {
      ...canvas,
      stickies: [{ id: "s", content: "", color: 99, x: 0, y: 0, width: 10, height: 10 }],
    };
    expect(workflowCanvasSchema.safeParse(broken).success).toBe(false);
  });

  it("allows an empty admin field and surfaces the parser message otherwise", () => {
    expect(workflowCanvasInputSchema.safeParse("").success).toBe(true);
    expect(workflowCanvasInputSchema.safeParse(JSON.stringify(branchingWorkflow())).success).toBe(
      true,
    );

    const bad = workflowCanvasInputSchema.safeParse("{nope");
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toContain("not valid JSON");
  });

  it("caps the pasted source at the exported byte limit", () => {
    expect(MAX_WORKFLOW_CANVAS_CHARS).toBeGreaterThan(0);
    const oversized = "x".repeat(MAX_WORKFLOW_CANVAS_CHARS + 1);
    expect(workflowCanvasInputSchema.safeParse(oversized).success).toBe(false);
  });
});

describe("iconForTypeKey", () => {
  it("returns hand-written entries for common nodes", () => {
    expect(iconForTypeKey("googlesheets").label).toBe("Google Sheets");
    expect(iconForTypeKey("httpRequest").label).toBe("HTTP Request");
    expect(iconForTypeKey("agent").glyph).not.toBe("");
  });

  it("derives a readable fallback for unknown keys", () => {
    const icon = iconForTypeKey("someVendorThing");
    expect(icon.label).toBe("Somevendorthing");
    expect(icon.glyph).not.toBe("");
    expect(iconForTypeKey("").label).toBe("Node");
  });
});
