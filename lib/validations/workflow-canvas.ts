import { z } from "zod";
import { parseN8nWorkflowJson } from "@/lib/workflow-canvas/parse";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

/**
 * Upper bound on a pasted n8n export, in UTF-16 code units (what `String.length`
 * and `z.string().max()` both count — not bytes, so a paste heavy in non-ASCII
 * is capped sooner in wire terms, which is the safe direction).
 *
 * It sits under Next's 1 MB default server-action body limit
 * (`next.config.ts` sets no `serverActions.bodySizeLimit`), leaving room for the
 * rest of the form. Above that the framework rejects the request with a generic
 * body-size error before the action runs, so the curated "too large" message
 * below would never be reachable. Exported so the admin textarea can count
 * against the same number the schema enforces.
 */
export const MAX_WORKFLOW_CANVAS_CHARS = 900_000;

/** Canvas coordinates and sizes are plain finite numbers in n8n units. */
const canvasUnitSchema = z.number().finite();

export const canvasNodeSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().max(200),
  type: z.string().max(200),
  typeKey: z.string().max(120),
  shape: z.enum(["trigger", "default", "attachment"]),
  x: canvasUnitSchema,
  y: canvasUnitSchema,
  width: canvasUnitSchema,
  height: canvasUnitSchema,
  subtitle: z.string().max(200),
  disabled: z.boolean(),
});

export const canvasStickySchema = z.object({
  id: z.string().min(1).max(200),
  content: z.string().max(5000),
  color: z.number().int().min(1).max(7),
  x: canvasUnitSchema,
  y: canvasUnitSchema,
  width: canvasUnitSchema,
  height: canvasUnitSchema,
});

export const canvasEdgeSchema = z.object({
  id: z.string().min(1).max(500),
  source: z.string().min(1).max(200),
  target: z.string().min(1).max(200),
  kind: z.enum(["main", "ai", "error"]),
  port: z.string().max(120),
  sourceIndex: z.number().int().min(0),
  targetIndex: z.number().int().min(0),
  label: z.string().max(60),
});

export const canvasBoundsSchema = z.object({
  minX: canvasUnitSchema,
  minY: canvasUnitSchema,
  maxX: canvasUnitSchema,
  maxY: canvasUnitSchema,
});

/** Validates a persisted `canvas_json` payload before it is rendered. */
export const workflowCanvasSchema = z.object({
  version: z.literal(1),
  name: z.string().max(300),
  nodes: z.array(canvasNodeSchema).max(500),
  stickies: z.array(canvasStickySchema).max(500),
  edges: z.array(canvasEdgeSchema).max(5000),
  bounds: canvasBoundsSchema,
  toolKeys: z.array(z.string().max(120)).max(500),
}) satisfies z.ZodType<WorkflowCanvas>;

/** Shared so the server action can short-circuit with the same wording. */
export const TOO_LARGE_MESSAGE = "That workflow export is too large to store.";

/**
 * The pasted source string, and nothing else — deliberately a bare string
 * schema so callers can compose it into their own form object. Empty clears
 * the canvas; anything else has to parse, and the parser's own message is
 * surfaced so the admin sees actionable guidance rather than "Invalid input".
 */
export const workflowCanvasInputSchema = z
  .string()
  .max(MAX_WORKFLOW_CANVAS_CHARS, TOO_LARGE_MESSAGE)
  .superRefine((value, ctx) => {
    if (value.trim() === "") return;
    // Zod runs a `superRefine` even when `.max()` above has already failed, so
    // an oversized paste would otherwise be JSON.parsed and graph-walked before
    // being rejected. Bail out here as well, and let `.max()` own the message.
    if (value.length > MAX_WORKFLOW_CANVAS_CHARS) return;
    const result = parseN8nWorkflowJson(value);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", message: result.error });
    }
  });

export type CanvasNodeInput = z.infer<typeof canvasNodeSchema>;
export type CanvasStickyInput = z.infer<typeof canvasStickySchema>;
export type CanvasEdgeInput = z.infer<typeof canvasEdgeSchema>;
export type WorkflowCanvasParsed = z.infer<typeof workflowCanvasSchema>;
export type WorkflowCanvasFieldInput = z.infer<typeof workflowCanvasInputSchema>;
