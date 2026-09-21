import { describe, expect, it } from "vitest";
import { iconForTypeKey } from "@/lib/workflow-canvas/icons";
import { parseN8nWorkflow } from "@/lib/workflow-canvas/parse";
import {
  deriveIdentifiersFromNames,
  findLeakedIdentifiers,
  sanitizeN8nExport,
  sanitizeNodeName,
  sanitizeProse,
  sanitizeWorkflowName,
} from "@/lib/workflow-canvas/sanitize";

type RawNode = Record<string, unknown>;

/** A client export in the shape the n8n API returns it. */
function clientWorkflow() {
  return {
    name: "WF6 — Little Sicily · Weekly Report to Javeria",
    nodes: [
      {
        parameters: { rule: {} },
        id: "little-sicily-wf6-trigger",
        name: "Little Sicily Weekly Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [-120, 40],
      },
      {
        parameters: {
          resource: "sheet",
          operation: "read",
          documentId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        },
        id: "little-sicily-wf6-read",
        name: "TalkEarlyEd Subscribers Sheet",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4,
        position: [180, 40],
      },
      {
        parameters: { sendTo: "javeria@aimarklabs.com" },
        id: "little-sicily-wf6-mail",
        name: "Weekly Report to Javeria",
        type: "n8n-nodes-base.gmail",
        typeVersion: 2,
        position: [480, 40],
      },
      {
        parameters: {
          content:
            "## Little Sicily weekly report\nSends the digest to Mam Javeria at javeria@aimarklabs.com.\nDashboard: https://evoloai.app.n8n.cloud/workflow/abc123",
          height: 220,
          width: 360,
          color: 4,
        },
        id: "little-sicily-wf6-note",
        name: "Sticky Note",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [-160, -220],
      },
    ] satisfies RawNode[],
    connections: {
      "Little Sicily Weekly Trigger": {
        main: [[{ node: "TalkEarlyEd Subscribers Sheet", type: "main", index: 0 }]],
      },
      "TalkEarlyEd Subscribers Sheet": {
        main: [[{ node: "Weekly Report to Javeria", type: "main", index: 0 }]],
      },
    },
  };
}

describe("phase9 canvas sanitisation — client prefixes", () => {
  it.each([
    ["AiMark — 03A Cold Email Outreach (FINAL)", "Cold Email Outreach"],
    ["AiMark — 01 Lead Discovery (v2 UPDATED)", "Lead Discovery"],
    ["WF3b — Little Sicily · Approve / Reject", "Approve / Reject"],
    ["HireScreen — 02 Apply & Screen", "Apply & Screen"],
    ["TalkEarlyEd — 99 Error Handler", "Error Handler"],
    ["DMV — C Civics Generate", "Civics Generate"],
    ["DFA - API Start Run", "API Start Run"],
    ["Class Task - Smart Complaint Routing AI", "Smart Complaint Routing AI"],
    ["📚 Class 2: Essential n8n Nodes Masterclass", "Essential n8n Nodes Masterclass"],
    ["Ai Mark Labs Personalized Audit Engine", "Personalized Audit Engine"],
  ])("%s -> %s", (raw, expected) => {
    expect(sanitizeWorkflowName(raw, "Fallback")).toBe(expected);
  });

  it("keeps a number that is part of the title rather than a sequence marker", () => {
    expect(sanitizeWorkflowName("Uplift AI - 5 Min Urdu Story TTS", "Fallback")).toBe(
      "5 Min Urdu Story TTS",
    );
  });

  it("leaves a name that carries no client identifier alone", () => {
    const name = "Fill Employer Sheet Until N";
    expect(sanitizeWorkflowName(name, "Fallback")).toBe(name);
  });

  it("strips the namespace from a node label", () => {
    expect(sanitizeNodeName("TalkEarlyEd Subscribers Sheet", "googlesheets")).toBe(
      "Subscribers Sheet",
    );
    expect(sanitizeNodeName("Update CTE Queue Row", "googlesheets")).toBe("Update Queue Row");
  });
});

describe("phase9 canvas sanitisation — personal names", () => {
  it("removes a personal name and the connector that introduced it", () => {
    expect(sanitizeNodeName("Weekly Report to Javeria", "gmail")).toBe("Weekly Report");
    expect(sanitizeNodeName("Notify Rida — Rejected", "slack")).toBe("Notify — Rejected");
  });

  it("never substitutes a label that still names someone", () => {
    const out = sanitizeWorkflowName("WF3 — OLMDC · Javeria Design Approval", "Fallback");
    expect(out).toBe("Design Approval");
    expect(out).not.toMatch(/javeria/i);
  });

  it("anonymises a standalone mention in prose but keeps the sentence readable", () => {
    const out = sanitizeProse("Keep reviewer names exactly as: `Mam Javeria` and `Mam Hamna`.");
    expect(out).toBe("Keep reviewer names exactly as: `Reviewer 1` and `Reviewer 2`.");
  });

  it("drops an attributive mention entirely", () => {
    expect(sanitizeProse("## Farhan Task Tracker Automation")).toBe("## Task Tracker Automation");
  });

  it("keeps the spacing around markdown delimiters intact", () => {
    expect(sanitizeProse("Uses **Abdullah Goevolo Drive** and **Google Sheets**.")).toBe(
      "Uses **Drive** and **Google Sheets**.",
    );
  });
});

describe("phase9 canvas sanitisation — secrets", () => {
  it("replaces a webhook URL with a readable stand-in", () => {
    const out = sanitizeProse(
      "Apply at https://YOUR-INSTANCE.app.n8n.cloud/webhook/hr-cv-apply?job=CODE today.",
    );
    expect(out).toBe("Apply at the webhook URL today.");
    expect(out).not.toMatch(/https?:\/\//);
  });

  it("removes inboxes, connection strings and opaque ids", () => {
    const out = sanitizeProse(
      "Mail ops@example.com, store in 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms via mongodb+srv://u:p@cluster0.example.net/db.",
    );
    expect(out).not.toMatch(/@example\.com/);
    expect(out).not.toMatch(/1BxiMVs0XRA5/);
    expect(out).not.toMatch(/mongodb/);
  });

  it("drops rather than labels a secret inside a node name", () => {
    expect(sanitizeNodeName("Read 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", "googlesheets")).toBe(
      "Read",
    );
  });

  it("leaves a table name that merely looks long alone", () => {
    expect(sanitizeProse("Writes to `Applications_Archive`.")).toBe(
      "Writes to `Applications_Archive`.",
    );
  });
});

describe("phase9 canvas sanitisation — fallbacks", () => {
  it("falls back to the node type label when nothing survives", () => {
    expect(sanitizeNodeName("AiMark", "googlesheets")).toBe(iconForTypeKey("googlesheets").label);
    expect(sanitizeNodeName("", "httprequest")).toBe(iconForTypeKey("httprequest").label);
  });

  it("never leaves a redaction marker or an empty label", () => {
    const out = sanitizeNodeName("TalkEarlyEd", "webhook");
    expect(out).not.toBe("");
    expect(out).not.toMatch(/redact|xxx/i);
  });

  it("falls back to the supplied title when the workflow name was only markers", () => {
    expect(sanitizeWorkflowName("DFA - WF_MAIN_PROD", "Analyst Run Pipeline")).toBe(
      "Analyst Run Pipeline",
    );
  });
});

describe("phase9 canvas sanitisation — structure preservation", () => {
  const raw = clientWorkflow();
  const { workflow } = sanitizeN8nExport(raw, { fallbackName: "Weekly Client Report" });
  const before = parseN8nWorkflow(raw);
  const after = parseN8nWorkflow(workflow);

  it("parses both the raw and the sanitised export", () => {
    expect(before.ok).toBe(true);
    expect(after.ok).toBe(true);
  });

  it("keeps node count, positions and types identical", () => {
    if (!before.ok || !after.ok) throw new Error("parse failed");
    expect(after.canvas.nodes.length).toBe(before.canvas.nodes.length);
    expect(after.canvas.stickies.length).toBe(before.canvas.stickies.length);
    expect(after.canvas.nodes.map((node) => [node.x, node.y, node.type])).toEqual(
      before.canvas.nodes.map((node) => [node.x, node.y, node.type]),
    );
    expect(after.canvas.bounds).toEqual(before.canvas.bounds);
    expect(after.canvas.toolKeys).toEqual(before.canvas.toolKeys);
  });

  it("rewrites the connections map so the graph survives the renames", () => {
    if (!before.ok || !after.ok) throw new Error("parse failed");
    expect(after.canvas.edges.length).toBe(before.canvas.edges.length);
    expect(after.canvas.edges.map((edge) => [edge.port, edge.sourceIndex, edge.targetIndex])).toEqual(
      before.canvas.edges.map((edge) => [edge.port, edge.sourceIndex, edge.targetIndex]),
    );
    const names = after.canvas.nodes.map((node) => node.name);
    const source = after.canvas.nodes.find((node) => node.id === after.canvas.edges[0]?.source);
    expect(names).toContain(source?.name);
  });

  it("keeps the sticky geometry and colour", () => {
    if (!before.ok || !after.ok) throw new Error("parse failed");
    expect(after.canvas.stickies[0]).toMatchObject({
      color: before.canvas.stickies[0]?.color,
      width: before.canvas.stickies[0]?.width,
      height: before.canvas.stickies[0]?.height,
      x: before.canvas.stickies[0]?.x,
      y: before.canvas.stickies[0]?.y,
    });
  });

  it("gives every node a unique name and id after renaming", () => {
    const nodes = (workflow as { nodes: Array<{ id: string; name: string }> }).nodes;
    expect(new Set(nodes.map((node) => node.name)).size).toBe(nodes.length);
    expect(new Set(nodes.map((node) => node.id)).size).toBe(nodes.length);
  });

  it("prunes parameters down to what the canvas renders", () => {
    const nodes = (workflow as { nodes: Array<{ parameters: Record<string, unknown> }> }).nodes;
    expect(nodes[1]?.parameters).toEqual({ resource: "sheet", operation: "read" });
    expect(nodes[2]?.parameters).toEqual({});
  });

  it("reports what it changed", () => {
    const { replacements } = sanitizeN8nExport(raw, { fallbackName: "Weekly Client Report" });
    expect(replacements.length).toBeGreaterThan(0);
    expect(replacements.some((entry) => /Little Sicily/i.test(entry.from))).toBe(true);
  });
});

describe("phase9 canvas sanitisation — verification gate", () => {
  it("finds nothing in a sanitised export or its parsed canvas", () => {
    const raw = clientWorkflow();
    const { workflow } = sanitizeN8nExport(raw, { fallbackName: "Weekly Client Report" });
    const parsed = parseN8nWorkflow(workflow);
    if (!parsed.ok) throw new Error("parse failed");
    expect(findLeakedIdentifiers(JSON.stringify(workflow))).toEqual([]);
    expect(findLeakedIdentifiers(JSON.stringify(parsed.canvas))).toEqual([]);
  });

  it("still catches an identifier, an inbox and a URL in the raw export", () => {
    const hits = findLeakedIdentifiers(JSON.stringify(clientWorkflow()));
    expect(hits).toContain("Javeria");
    expect(hits.some((hit) => hit.includes("@aimarklabs.com"))).toBe(true);
    expect(hits.some((hit) => hit.startsWith("https://"))).toBe(true);
  });
});

describe("phase9 canvas sanitisation — identifier derivation", () => {
  it("picks namespaces out of live workflow names", () => {
    const derived = deriveIdentifiersFromNames([
      "Acme Foods — 01 Intake",
      "Acme Foods — 02 Publish",
      "BrightPath · Weekly Digest",
      "Send Weekly Digest",
    ]);
    expect(derived).toContain("Acme Foods");
    expect(derived).toContain("BrightPath");
  });

  it("does not mistake shared vocabulary for a client name", () => {
    const derived = deriveIdentifiersFromNames([
      "Social Media Publishing — 01",
      "Social Media Publishing — 02",
      "Lead Discovery — Weekly",
      "Lead Discovery — Daily",
    ]);
    expect(derived).not.toContain("Social Media Publishing");
    expect(derived).not.toContain("Lead Discovery");
  });

  it("applies derived namespaces alongside the hardcoded floor", () => {
    expect(sanitizeNodeName("Acme Foods Intake Sheet", "googlesheets", {
      identifiers: ["Acme Foods"],
    })).toBe("Intake Sheet");
  });
});
