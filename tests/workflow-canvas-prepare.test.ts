import { describe, expect, it } from "vitest";
import { workflowCanvasSchema } from "@/lib/validations/workflow-canvas";
import { parseN8nWorkflowJson } from "@/lib/workflow-canvas/parse";
import { prepareWorkflowCanvas } from "@/lib/workflow-canvas/prepare";
import { findLeakedIdentifiers } from "@/lib/workflow-canvas/sanitize";

type RawNode = Record<string, unknown>;

/**
 * A client export in the shape an admin would paste it: client namespaces in the
 * workflow and node names, a colleague's first name, an inbox and an instance
 * URL inside a sticky note, and a Google file id in a parameter.
 */
function clientPaste(): string {
  return JSON.stringify({
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
  });
}

/**
 * `prepareWorkflowCanvas` is the whole of what the save path does with a paste
 * before it writes, so asserting on its two outputs is asserting on the exact
 * strings that reach `canvas_json` and `canvas_source` — both of which the anon
 * key can read on any published row.
 */
describe("phase9 canvas save path — nothing identifying is persisted", () => {
  it("would have leaked if the paste were stored as-is", () => {
    // The control. This is what the save path persisted before the sanitiser
    // was wired in: the untouched paste, plus a canvas parsed straight from it.
    const paste = clientPaste();
    const direct = parseN8nWorkflowJson(paste);
    expect(direct.ok).toBe(true);
    if (!direct.ok) return;

    expect(findLeakedIdentifiers(paste).length).toBeGreaterThan(0);
    expect(findLeakedIdentifiers(JSON.stringify(direct.canvas))).toEqual(
      expect.arrayContaining([
        "Little Sicily",
        "TalkEarlyEd",
        "Javeria",
        "javeria@aimarklabs.com",
      ]),
    );
  });

  it("persists neither a client identifier nor an inbox, name or URL", () => {
    const prepared = prepareWorkflowCanvas(clientPaste(), { fallbackName: "Weekly digest" });
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;

    // The gate inside `prepareWorkflowCanvas` uses the same oracle, so this is
    // belt-and-braces — it fails loudly if that gate is ever bypassed.
    expect(findLeakedIdentifiers(prepared.source)).toEqual([]);
    expect(findLeakedIdentifiers(JSON.stringify(prepared.canvas))).toEqual([]);
    expect(prepared.replacements.length).toBeGreaterThan(0);
  });

  it("keeps the graph intact while renaming, and stores a valid canvas", () => {
    const prepared = prepareWorkflowCanvas(clientPaste(), { fallbackName: "Weekly digest" });
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;

    // Same node count, same sticky, same edges — renaming rewrote the
    // connection keys rather than dropping them.
    expect(prepared.canvas.nodes).toHaveLength(3);
    expect(prepared.canvas.stickies).toHaveLength(1);
    expect(prepared.canvas.edges).toHaveLength(2);
    expect(workflowCanvasSchema.safeParse(prepared.canvas).success).toBe(true);
  });

  it("round-trips: re-saving what was stored changes nothing", () => {
    // The admin editor prefills from `canvas_source`, so a save of an untouched
    // reopen has to be a no-op rather than a second pass of sanitising.
    const first = prepareWorkflowCanvas(clientPaste(), { fallbackName: "Weekly digest" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = prepareWorkflowCanvas(first.source, { fallbackName: "Weekly digest" });
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    expect(second.source).toBe(first.source);
    expect(second.canvas).toEqual(first.canvas);
  });

  it("refuses anything that is not an n8n export, and says why", () => {
    expect(prepareWorkflowCanvas("   ")).toEqual({
      ok: false,
      error: expect.stringContaining("Paste the workflow JSON"),
    });
    expect(prepareWorkflowCanvas("{nope")).toEqual({
      ok: false,
      error: expect.stringContaining("not valid JSON"),
    });
    expect(prepareWorkflowCanvas("[1,2,3]")).toEqual({
      ok: false,
      error: expect.stringContaining("not an n8n workflow export"),
    });
  });
});
