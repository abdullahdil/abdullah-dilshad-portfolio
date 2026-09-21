/**
 * Shared contract for the n8n workflow canvas feature.
 *
 * Raw n8n workflow JSON (the payload you get from "Download" in the n8n editor,
 * or from `GET /workflows/:id` on the API) is pasted into the admin panel,
 * parsed once by `lib/workflow-canvas/parse.ts`, and rendered by the client
 * canvas in `components/public/workflow-canvas.tsx`.
 *
 * Nothing downstream of the parser ever touches raw n8n shapes — the parser is
 * the single place that knows about `position` tuples, `connections` maps and
 * `n8n-nodes-base.stickyNote`.
 */

/** n8n's own canvas grid: a regular node occupies a 96x96 box at `position`. */
export const NODE_SIZE = 96;

/** Sticky notes default to 240x160 in n8n when width/height are absent. */
export const STICKY_DEFAULT_WIDTH = 240;
export const STICKY_DEFAULT_HEIGHT = 160;

/** How a node is drawn. Derived from the n8n node type, never authored. */
export type CanvasNodeShape =
  /** Rounded-left "start" shape — trigger / webhook / schedule / chat trigger. */
  | "trigger"
  /** Standard rounded square. */
  | "default"
  /** Small circle hanging under an agent — language models, memory, tools. */
  | "attachment";

/** Non-sticky node on the canvas. Coordinates are n8n canvas units. */
export type CanvasNode = {
  /** Stable id. Falls back to the node name when n8n omits `id`. */
  id: string;
  /** Display name, exactly as authored in n8n. */
  name: string;
  /** Full n8n type, e.g. `n8n-nodes-base.webhook`. */
  type: string;
  /** Last dot-segment of `type`, lowercased — the icon lookup key. */
  typeKey: string;
  shape: CanvasNodeShape;
  /** Top-left corner, n8n canvas units. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Short secondary line under the name, e.g. `read: sheet`. May be empty. */
  subtitle: string;
  /** True when the node is disabled in n8n — rendered at reduced opacity. */
  disabled: boolean;
};

/** A sticky note — the coloured annotation panels behind the graph. */
export type CanvasSticky = {
  id: string;
  /** Raw markdown content from the sticky's `content` parameter. */
  content: string;
  /** n8n sticky colour index 1-7; 1 is the default yellow. */
  color: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Which port family an edge belongs to — drives stroke style. */
export type CanvasEdgeKind = "main" | "ai" | "error";

export type CanvasEdge = {
  id: string;
  /** Source `CanvasNode.id`. */
  source: string;
  /** Target `CanvasNode.id`. */
  target: string;
  kind: CanvasEdgeKind;
  /** The raw n8n connection key, e.g. `main`, `ai_languageModel`. */
  port: string;
  /** Output index on the source node (branch index for IF/Switch). */
  sourceIndex: number;
  /** Input index on the target node. */
  targetIndex: number;
  /** Optional edge label, e.g. `true` / `false` on an IF node. */
  label: string;
};

/** Axis-aligned bounds of everything on the canvas, in n8n units. */
export type CanvasBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

/** The parsed, render-ready graph. This is what gets persisted as `canvas_json`. */
export type WorkflowCanvas = {
  /** Schema version so stored payloads can be migrated later. */
  version: 1;
  /** Workflow name from the pasted JSON; empty when absent. */
  name: string;
  nodes: CanvasNode[];
  stickies: CanvasSticky[];
  edges: CanvasEdge[];
  bounds: CanvasBounds;
  /** Distinct `typeKey`s present, in first-seen order — powers the icon row. */
  toolKeys: string[];
};

/** Thrown-free parse result so callers can surface a message in the admin UI. */
export type WorkflowCanvasParseResult =
  | { ok: true; canvas: WorkflowCanvas }
  | { ok: false; error: string };
