/**
 * Geometry and palette shared by the two renderers of a `WorkflowCanvas`:
 * the interactive `WorkflowCanvasView` and the static `WorkflowCanvasThumbnail`.
 *
 * Both draw the *same* graph, so the edge curves, the sticky hues and the world
 * frame live here once. Keeping them in a plain module (no `"use client"`, no
 * React) means the thumbnail can stay a pure function of its canvas, and an edge
 * can never bend one way in the card and another way in the dialog.
 *
 * All coordinates are n8n canvas units — the same space `CanvasNode.x/y` use.
 */

import type {
  CanvasBounds,
  CanvasEdge,
  CanvasNode,
  WorkflowCanvas,
} from "@/lib/workflow-canvas/types";

/** Extra world units painted around `bounds` (SVG overflow headroom). */
export const WORLD_MARGIN = 400;

/**
 * An `attachment` node is authored as a square box but drawn as a circle that
 * fills 55% of it — n8n's small sub-node. Both renderers use this one number, so
 * a dashed AI edge lands on the circle's rim rather than on the invisible box.
 */
export const ATTACHMENT_SCALE = 0.55;

/**
 * Caption geometry, in world units, matching `NodeCaption` at scale 1: a
 * 150px-wide centred block starting just under the chip. Fit-to-view has to
 * count it or the outermost node labels get cropped by the viewport edge.
 */
export const CAPTION_WIDTH = 150;
export const CAPTION_OFFSET = 6;
export const CAPTION_HEIGHT = 30;

/**
 * The canvas ground, shared by both renderers so the card preview and the
 * dialog are literally the same surface.
 *
 * `--surface-lowest` is the recessed end of the surface ramp: paper-white in
 * the light theme, near-black in the dark one. That is what a canvas wants to
 * be — a well cut *into* the page. The brighter end of the ramp reads as a pale
 * rectangle punched out of a dark page, which is what this used to be.
 */
export const CANVAS_GROUND = "var(--surface-lowest)";

/**
 * n8n sticky colour indices 1-7. Each hue is mixed into the current surface /
 * text tokens with `color-mix`, so one table serves both themes — the sticky
 * keeps its identity without punching a light rectangle into a dark page.
 */
const STICKY_HUES: Readonly<Record<number, string>> = {
  1: "#eab308",
  2: "#f97316",
  3: "#ef4444",
  4: "#22c55e",
  5: "#3b82f6",
  6: "#a855f7",
  7: "#64748b",
};

export function stickyHue(color: number): string {
  return STICKY_HUES[color] ?? STICKY_HUES[1];
}

/**
 * Sticky body: a translucent wash of the hue rather than a mix into a fixed
 * surface colour, so one value composites correctly over either ground — a
 * pastel on paper, a tinted dark region on near-black — and the note always
 * lifts slightly off the canvas instead of sitting flat on it.
 */
export function stickyFill(color: number): string {
  return `color-mix(in oklab, ${stickyHue(color)} 18%, transparent)`;
}

/** Sticky hairline. Opaque enough to hold the note's identity on either ground. */
export function stickyStroke(color: number): string {
  return `color-mix(in oklab, ${stickyHue(color)} 45%, transparent)`;
}

export function edgeStroke(kind: CanvasEdge["kind"]): string {
  if (kind === "error") return "var(--error)";
  if (kind === "ai") return "var(--accent)";
  // Derived from the text colour, so it inverts with the theme and keeps the
  // same apparent weight against `CANVAS_GROUND` in both.
  return "color-mix(in oklab, var(--on-surface) 46%, transparent)";
}

// ---------------------------------------------------------------------------
// Edge geometry
// ---------------------------------------------------------------------------

export type Point = { x: number; y: number };

/** Cubic bézier, plus its midpoint for label placement. */
export type EdgePath = { d: string; mid: Point };

/**
 * Half the *drawn* width/height of a node. Equal to the box for a normal chip;
 * shrunk for an attachment, whose visible circle is inset inside its box.
 */
function drawnRadius(node: CanvasNode): { rx: number; ry: number } {
  const scale = node.shape === "attachment" ? ATTACHMENT_SCALE : 1;
  return { rx: (node.width * scale) / 2, ry: (node.height * scale) / 2 };
}

/** Centre of a node's drawn silhouette. */
function center(node: CanvasNode): Point {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

/** `main` / `error`: leave the source's right edge, enter the target's left. */
export function horizontalPath(source: CanvasNode, target: CanvasNode): EdgePath {
  const sc = center(source);
  const tc = center(target);
  const a: Point = { x: sc.x + drawnRadius(source).rx, y: sc.y };
  const b: Point = { x: tc.x - drawnRadius(target).rx, y: tc.y };
  // Wider gaps get a lazier curve; backward edges still bow outward.
  const bow = Math.max(60, Math.abs(b.x - a.x) * 0.5);
  const c1: Point = { x: a.x + bow, y: a.y };
  const c2: Point = { x: b.x - bow, y: b.y };
  return { d: cubic(a, c1, c2, b), mid: cubicMid(a, c1, c2, b) };
}

/**
 * `ai`: n8n hangs sub-nodes under the agent and joins them with a dashed,
 * vertical-ish curve between the two bottom connectors. The anchors flip when
 * the sub-node happens to sit above its agent.
 */
export function verticalPath(source: CanvasNode, target: CanvasNode): EdgePath {
  const sourceBelow = source.y >= target.y;
  const sc = center(source);
  const tc = center(target);
  const sr = drawnRadius(source).ry;
  const tr = drawnRadius(target).ry;
  const a: Point = { x: sc.x, y: sourceBelow ? sc.y - sr : sc.y + sr };
  const b: Point = { x: tc.x, y: sourceBelow ? tc.y + tr : tc.y - tr };
  const bow = Math.max(40, Math.abs(b.y - a.y) * 0.45);
  const c1: Point = { x: a.x, y: sourceBelow ? a.y - bow : a.y + bow };
  const c2: Point = { x: b.x, y: sourceBelow ? b.y + bow : b.y - bow };
  return { d: cubic(a, c1, c2, b), mid: cubicMid(a, c1, c2, b) };
}

function cubic(a: Point, c1: Point, c2: Point, b: Point): string {
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
}

/** B(0.5) for a cubic bézier reduces to (P0 + 3P1 + 3P2 + P3) / 8. */
function cubicMid(a: Point, c1: Point, c2: Point, b: Point): Point {
  return {
    x: (a.x + 3 * c1.x + 3 * c2.x + b.x) / 8,
    y: (a.y + 3 * c1.y + 3 * c2.y + b.y) / 8,
  };
}

export type ResolvedEdge = { edge: CanvasEdge; path: EdgePath };

/**
 * Resolve every edge to a curve once. Edges whose endpoints are missing from
 * the node table are dropped rather than thrown on — a stored canvas from an
 * older parser is a preview, not a contract.
 */
export function buildEdgePaths(canvas: WorkflowCanvas): ResolvedEdge[] {
  const nodeById = new Map<string, CanvasNode>();
  for (const node of canvas.nodes) nodeById.set(node.id, node);

  const out: ResolvedEdge[] = [];
  for (const edge of canvas.edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;
    out.push({
      edge,
      path:
        edge.kind === "ai"
          ? verticalPath(source, target)
          : horizontalPath(source, target),
    });
  }
  return out;
}

export type WorldFrame = { x: number; y: number; width: number; height: number };

/**
 * Everything that is actually *drawn*, in world units: the authored bounds
 * unioned with each node's caption block. This — not `bounds` — is the rectangle
 * fit-to-view has to frame, otherwise the leftmost and rightmost captions (which
 * are wider than their chips) and the bottom row of labels hang off the edge.
 */
export function contentFrame(canvas: WorkflowCanvas): WorldFrame {
  const { minX, minY, maxX, maxY } = canvas.bounds;
  let x0 = minX;
  const y0 = minY;
  let x1 = maxX;
  let y1 = maxY;

  for (const node of canvas.nodes) {
    const cx = node.x + node.width / 2;
    x0 = Math.min(x0, cx - CAPTION_WIDTH / 2);
    x1 = Math.max(x1, cx + CAPTION_WIDTH / 2);
    y1 = Math.max(y1, node.y + node.height + CAPTION_OFFSET + CAPTION_HEIGHT);
  }

  if (!Number.isFinite(x0) || !Number.isFinite(y0)) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }

  return {
    x: x0,
    y: y0,
    width: Math.max(1, x1 - x0),
    height: Math.max(1, y1 - y0),
  };
}

/** The authored bounds, padded — the rectangle both renderers paint into. */
export function worldFrame(bounds: CanvasBounds, margin: number): WorldFrame {
  const { minX, minY, maxX, maxY } = bounds;
  return {
    x: minX - margin,
    y: minY - margin,
    width: Math.max(1, maxX - minX) + margin * 2,
    height: Math.max(1, maxY - minY) + margin * 2,
  };
}

// ---------------------------------------------------------------------------
// Node silhouettes
// ---------------------------------------------------------------------------

/**
 * Rounded rectangle as an SVG path, with per-corner radii, so the thumbnail can
 * reproduce n8n's rounded-left "start" silhouette (which `<rect rx>` cannot).
 * Corners run clockwise from the top-left.
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  corners: [number, number, number, number],
): string {
  const limit = Math.min(width, height) / 2;
  const [tl, tr, br, bl] = corners.map((r) => Math.max(0, Math.min(r, limit)));

  return [
    `M ${x + tl} ${y}`,
    `H ${x + width - tr}`,
    `A ${tr} ${tr} 0 0 1 ${x + width} ${y + tr}`,
    `V ${y + height - br}`,
    `A ${br} ${br} 0 0 1 ${x + width - br} ${y + height}`,
    `H ${x + bl}`,
    `A ${bl} ${bl} 0 0 1 ${x} ${y + height - bl}`,
    `V ${y + tl}`,
    `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}`,
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Node kinds — the colour language shared by thumbnails, facts and legends
// ---------------------------------------------------------------------------

/**
 * What a node *does*, coarsely. Derived from the parser's `typeKey` / `shape`,
 * never authored, so it can only ever describe the graph that is stored.
 */
export type NodeKind = "trigger" | "ai" | "logic" | "integration";

const AI_KEYS = new Set([
  "agent",
  "openai",
  "anthropic",
  "chainllm",
  "chainsummarization",
  "informationextractor",
  "textclassifier",
  "sentimentanalysis",
  "outputparserstructured",
  "outputparserautofixing",
  "googlegemini",
]);
const AI_PREFIXES = ["lmchat", "lm", "embeddings", "vectorstore", "memory", "tool", "outputparser"];

const LOGIC_KEYS = new Set([
  "code",
  "function",
  "functionitem",
  "set",
  "if",
  "switch",
  "merge",
  "filter",
  "splitinbatches",
  "splitout",
  "aggregate",
  "itemlists",
  "wait",
  "noop",
  "stopanderror",
  "executeworkflow",
  "respondtowebhook",
  "datetime",
  "dateandtime",
  "sort",
  "limit",
  "removeduplicates",
  "comparedatasets",
  "renamekeys",
  "summarize",
  "html",
  "xml",
  "markdown",
  "crypto",
  "form",
]);

export function classifyNode(node: Pick<CanvasNode, "typeKey" | "shape">): NodeKind {
  if (node.shape === "trigger") return "trigger";
  const key = node.typeKey.toLowerCase();
  if (key.endsWith("trigger")) return "trigger";
  if (AI_KEYS.has(key) || AI_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return "ai";
  }
  if (LOGIC_KEYS.has(key)) return "logic";
  return "integration";
}

/**
 * One hue per kind, mixed into transparency (like the sticky palette) so the
 * same value reads on the paper and the near-black ground. `logic` is the
 * neutral text colour on purpose: glue code should recede behind the steps
 * that touch the outside world.
 */
const KIND_HUES: Readonly<Record<NodeKind, string>> = {
  trigger: "#d97706",
  ai: "#8b5cf6",
  logic: "var(--on-surface)",
  integration: "#0ea5e9",
};

export function nodeKindStroke(kind: NodeKind): string {
  return kind === "logic"
    ? "color-mix(in oklab, var(--on-surface) 55%, transparent)"
    : KIND_HUES[kind];
}

export function nodeKindFill(kind: NodeKind): string {
  return `color-mix(in oklab, ${KIND_HUES[kind]} ${kind === "logic" ? 10 : 22}%, var(--surface-bright))`;
}

export const NODE_KIND_LABELS: Readonly<Record<NodeKind, string>> = {
  trigger: "Trigger",
  ai: "AI step",
  logic: "Logic",
  integration: "Integration",
};

/**
 * Tight frame around the nodes only (stickies ignored). Thumbnails crop to
 * this so a card shows the graph, not acres of annotation panel.
 */
export function graphFrame(canvas: WorkflowCanvas): WorldFrame {
  if (canvas.nodes.length === 0) {
    const { minX, minY, maxX, maxY } = canvas.bounds;
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const node of canvas.nodes) {
    x0 = Math.min(x0, node.x);
    y0 = Math.min(y0, node.y);
    x1 = Math.max(x1, node.x + node.width);
    y1 = Math.max(y1, node.y + node.height);
  }
  return { x: x0, y: y0, width: Math.max(1, x1 - x0), height: Math.max(1, y1 - y0) };
}

// ---------------------------------------------------------------------------
// Fit-to-view
// ---------------------------------------------------------------------------

/** Below this scale node captions (11px at k=1) stop being readable. */
export const MIN_LEGIBLE_SCALE = 0.45;
/** Never blow a two-node graph up past life size. */
export const MAX_FIT_SCALE = 1.1;
/** Upper bound for the "legible" view of a graph too wide to fit whole. */
export const MAX_PAN_FIT_SCALE = 0.8;

export type FitMode = "overview" | "legible";

export type FitResult = {
  k: number;
  x: number;
  y: number;
  /** The content is wider / taller than the viewport at this scale. */
  overflowX: boolean;
  overflowY: boolean;
};

/**
 * Pure fit maths, in screen px. `overview` frames the whole graph whatever the
 * scale (the "fit" button). `legible` does the same unless that would drop
 * below `MIN_LEGIBLE_SCALE` — then it fits the height (clamped to a readable
 * range), anchors the graph's *start* (left edge) in view and reports the
 * overflow so the caller can show a pan hint. Never fails on a zero-size box.
 */
export function computeFit(
  content: WorldFrame,
  viewportWidth: number,
  viewportHeight: number,
  mode: FitMode,
  padding: number,
): FitResult {
  const vw = Math.max(1, viewportWidth);
  const vh = Math.max(1, viewportHeight);
  const pad = Math.max(0, padding);
  const fitW = Math.max(vw - pad * 2, 1) / content.width;
  const fitH = Math.max(vh - pad * 2, 1) / content.height;
  const whole = Math.min(fitW, fitH, MAX_FIT_SCALE);

  const centred = (k: number): FitResult => ({
    k,
    x: (vw - content.width * k) / 2 - content.x * k,
    y: (vh - content.height * k) / 2 - content.y * k,
    overflowX: false,
    overflowY: false,
  });

  if (mode === "overview" || whole >= MIN_LEGIBLE_SCALE) return centred(whole);

  const k = Math.min(MAX_PAN_FIT_SCALE, Math.max(MIN_LEGIBLE_SCALE, fitH));
  const drawnW = content.width * k;
  const drawnH = content.height * k;
  const overflowX = drawnW > vw - pad * 2 + 0.5;
  const overflowY = drawnH > vh - pad * 2 + 0.5;

  return {
    k,
    x: overflowX ? pad - content.x * k : (vw - drawnW) / 2 - content.x * k,
    y: overflowY ? pad - content.y * k : (vh - drawnH) / 2 - content.y * k,
    overflowX,
    overflowY,
  };
}
