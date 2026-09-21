/**
 * The one path a pasted n8n export takes on its way into the database.
 *
 * `lib/workflow-canvas/sanitize.ts` documents the contract this module
 * enforces: the raw paste is never stored or parsed. It is sanitised first, the
 * parse runs on the sanitised object, and the sanitised export — not the paste —
 * is what is kept as `canvas_source`. Both canvas columns are readable with the
 * anon key, so this is the only thing standing between a real client export and
 * the public site.
 *
 * The importer (`import-canvases.tmp.ts`) does the same three steps by hand
 * against the live n8n API; this is that sequence made reusable so the admin CMS
 * cannot drift away from it. Pure and dependency-free: no Supabase, no
 * `next/cache`, so it is directly testable.
 */

import { parseN8nWorkflow } from "@/lib/workflow-canvas/parse";
import { findLeakedIdentifiers, sanitizeN8nExport } from "@/lib/workflow-canvas/sanitize";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

export type PreparedWorkflowCanvas = {
  /** The parsed canvas, for `canvas_json`. */
  canvas: WorkflowCanvas;
  /** The sanitised export, pretty-printed — the only thing `canvas_source` may hold. */
  source: string;
  /** Every human-readable string this changed, for an admin-facing summary. */
  replacements: ReturnType<typeof sanitizeN8nExport>["replacements"];
};

export type PrepareWorkflowCanvasResult =
  | ({ ok: true } & PreparedWorkflowCanvas)
  | { ok: false; error: string };

export type PrepareWorkflowCanvasOptions = {
  /** Used when sanitising empties the workflow name — normally the portfolio title. */
  fallbackName?: string;
};

/**
 * Takes the text an admin pasted and returns exactly what should be written, or
 * a message explaining why nothing should be.
 */
export function prepareWorkflowCanvas(
  text: string,
  options?: PrepareWorkflowCanvasOptions,
): PrepareWorkflowCanvasResult {
  const trimmed = text.trim();
  if (trimmed === "") {
    return { ok: false, error: "Paste the workflow JSON exported from n8n first." };
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(trimmed);
  } catch {
    return {
      ok: false,
      error:
        "That is not valid JSON. Copy the workflow again from n8n (Download, or select all nodes and copy) and paste the whole thing.",
    };
  }

  if (typeof decoded !== "object" || decoded === null || Array.isArray(decoded)) {
    return {
      ok: false,
      error: "That JSON is not an n8n workflow export — it should be an object with a `nodes` array.",
    };
  }

  // Sanitise FIRST. Everything below works on `clean`; `decoded` is dropped.
  const raw = decoded as Record<string, unknown>;
  const { workflow: clean, replacements } = sanitizeN8nExport(
    { name: raw.name, nodes: raw.nodes, connections: raw.connections },
    { fallbackName: options?.fallbackName },
  );
  const source = JSON.stringify(clean, null, 2);

  const parsed = parseN8nWorkflow(JSON.parse(source));
  if (!parsed.ok) return { ok: false, error: parsed.error };

  // The gate reads exactly what would be written, not an approximation of it.
  const leaks = [
    ...new Set([
      ...findLeakedIdentifiers(source),
      ...findLeakedIdentifiers(JSON.stringify(parsed.canvas)),
    ]),
  ];
  if (leaks.length > 0) {
    return {
      ok: false,
      error: `That export still names ${leaks.slice(0, 5).join(", ")} after sanitising, and both canvas columns are publicly readable. Rename it in n8n (or edit the sticky note) and paste again — nothing was saved.`,
    };
  }

  return { ok: true, canvas: parsed.canvas, source, replacements };
}
