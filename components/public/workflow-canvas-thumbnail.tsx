/**
 * Static miniature of a real `WorkflowCanvas` — the preview inside workflow
 * cards, case-study cards and heroes.
 *
 * A pure function of its canvas: no `"use client"`, no hooks, no listeners.
 * Server Components render it straight to SVG markup, so a catalog of dozens
 * of cards ships zero canvas JSON and zero JS for its previews. (Client
 * components can still import it; it is just markup.)
 *
 * Legibility at card size is the whole job, so it deliberately differs from
 * the live canvas:
 *   - cropped to the *nodes'* bounds (stickies drawn as faint washes only),
 *     so the graph fills the card instead of floating in annotation space;
 *   - strokes use `vector-effect: non-scaling-stroke`, so edges stay ~1.5px
 *     however far a 6,000-unit-wide graph is shrunk;
 *   - nodes are filled by kind (trigger / AI / logic / integration) — colour,
 *     not tiny captions, is what reads at 340px;
 *   - node-type icons only when the graph is small enough for them to be seen.
 *
 * Markup budget: a catalog page carries ~59 of these twice (HTML + RSC
 * payload). So every node of one kind is ONE `<path>`, every edge of one kind
 * is ONE `<path>`, and coordinates are quantised to an 8-unit grid (a node is
 * 12x12). That keeps a 40-node graph around 2-3KB instead of ~25KB.
 */

import { NodeTypeIcon } from "@/components/public/workflow-node-icon";
import {
  ATTACHMENT_SCALE,
  buildEdgePaths,
  CANVAS_GROUND,
  classifyNode,
  edgeStroke,
  graphFrame,
  nodeKindFill,
  nodeKindStroke,
  stickyFill,
  type NodeKind,
} from "@/components/public/workflow-canvas-geometry";
import { cn } from "@/lib/utils";
import type { CanvasEdgeKind, WorkflowCanvas } from "@/lib/workflow-canvas/types";

/** Quantisation step, world units. */
const Q = 8;
const q = (value: number) => Math.round(value / Q);

/** Assumed preview box (16:10 card), px — sizes glyphs only. */
const PREVIEW_W = 360;
const PREVIEW_H = 225;
/** Draw node-type icons only when a node would render at least this many px. */
const GLYPH_MIN_PX = 22;

const KIND_ORDER: NodeKind[] = ["logic", "integration", "ai", "trigger"];

/** Rounded rect as a compact relative path; corners clockwise from top-left. */
function rr(x: number, y: number, w: number, h: number, c: [number, number, number, number]): string {
  const [tl, tr, br, bl] = c.map((r) => Math.max(0, Math.min(r, Math.floor(Math.min(w, h) / 2))));
  const arc = (r: number, dx: number, dy: number) => (r > 0 ? `a${r} ${r} 0 0 1 ${dx} ${dy}` : "");
  return [
    `M${x + tl} ${y}h${w - tl - tr}`,
    arc(tr, tr, tr),
    `v${h - tr - br}`,
    arc(br, -br, br),
    `h${-(w - br - bl)}`,
    arc(bl, -bl, -bl),
    `v${-(h - bl - tl)}`,
    arc(tl, tl, -tl),
    "z",
  ].join("");
}

/** Quantise every number in an absolute path string. */
function quantisePath(d: string): string {
  return d
    .replace(/-?\d+(?:\.\d+)?/g, (value) => String(q(Number(value))))
    .replace(/,\s*/g, " ")
    .replace(/\s+([MC])\s+/g, "$1")
    .replace(/^M\s+/, "M")
    .replace(/\s+C\s+/g, "C");
}

export type WorkflowCanvasThumbnailProps = {
  canvas: WorkflowCanvas;
  className?: string;
};

export function WorkflowCanvasThumbnail({ canvas, className }: WorkflowCanvasThumbnailProps) {
  const frame = graphFrame(canvas);
  // Margin scales with the graph so tiny and huge graphs both breathe.
  const margin = Math.max(48, Math.max(frame.width, frame.height) * 0.06);
  const vb = {
    x: q(frame.x - margin),
    y: q(frame.y - margin),
    w: Math.max(1, q(frame.width + margin * 2)),
    h: Math.max(1, q(frame.height + margin * 2)),
  };
  const pxPerUnit = Math.min(PREVIEW_W / vb.w, PREVIEW_H / vb.h);
  const showGlyphs = (96 / Q) * pxPerUnit >= GLYPH_MIN_PX;

  // One path per node kind (+ one for disabled nodes).
  const nodePaths = new Map<NodeKind | "disabled", string[]>();
  for (const node of canvas.nodes) {
    const key = node.disabled ? "disabled" : classifyNode(node);
    let shape: string;
    if (node.shape === "attachment") {
      const d = Math.max(2, q(Math.min(node.width, node.height) * ATTACHMENT_SCALE));
      const cx = q(node.x + node.width / 2);
      const cy = q(node.y + node.height / 2);
      const r = Math.floor(d / 2);
      shape = rr(cx - r, cy - r, r * 2, r * 2, [r, r, r, r]);
    } else {
      const w = Math.max(2, q(node.width));
      const h = Math.max(2, q(node.height));
      const corner = 2;
      shape = rr(
        q(node.x),
        q(node.y),
        w,
        h,
        node.shape === "trigger" ? [h / 2, corner, corner, h / 2] : [corner, corner, corner, corner],
      );
    }
    const list = nodePaths.get(key) ?? [];
    list.push(shape);
    nodePaths.set(key, list);
  }

  // One path per edge kind.
  const edgePaths = new Map<CanvasEdgeKind, string[]>();
  for (const { edge, path } of buildEdgePaths(canvas)) {
    const list = edgePaths.get(edge.kind) ?? [];
    list.push(quantisePath(path.d));
    edgePaths.set(edge.kind, list);
  }

  // Stickies: one faint path per colour.
  const stickyPaths = new Map<number, string[]>();
  for (const sticky of canvas.stickies) {
    const list = stickyPaths.get(sticky.color) ?? [];
    list.push(`M${q(sticky.x)} ${q(sticky.y)}h${q(sticky.width)}v${q(sticky.height)}h${-q(sticky.width)}z`);
    stickyPaths.set(sticky.color, list);
  }

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none h-full w-full select-none", className)}
      style={{
        backgroundColor: CANVAS_GROUND,
        // A quiet dot grid instead of the old hatching: texture without noise.
        backgroundImage:
          "radial-gradient(color-mix(in oklab, var(--on-surface) 9%, transparent) 1px, transparent 1.2px)",
        backgroundSize: "14px 14px",
      }}
    >
      <svg
        className="h-full w-full"
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        {[...stickyPaths].map(([color, parts]) => (
          <path key={`s${color}`} d={parts.join("")} fill={stickyFill(color)} opacity={0.6} />
        ))}

        {[...edgePaths].map(([kind, parts]) => (
          <path
            key={`e${kind}`}
            d={parts.join("")}
            fill="none"
            stroke={edgeStroke(kind)}
            strokeWidth={kind === "ai" ? 1.25 : 1.6}
            strokeLinecap="round"
            strokeDasharray={kind === "ai" ? "3 3" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {[...KIND_ORDER, "disabled" as const].map((key) => {
          const parts = nodePaths.get(key);
          if (!parts) return null;
          const kind = key === "disabled" ? "logic" : key;
          return (
            <path
              key={`n${key}`}
              d={parts.join("")}
              fill={nodeKindFill(kind)}
              stroke={nodeKindStroke(kind)}
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
              opacity={key === "disabled" ? 0.4 : undefined}
            />
          );
        })}

        {showGlyphs ? (
          <g style={{ color: "var(--on-surface)" }}>
            {canvas.nodes.map((node) => {
              const size = node.shape === "attachment" ? 3 : 6;
              return (
                <NodeTypeIcon
                  key={node.id}
                  typeKey={node.typeKey}
                  x={q(node.x + node.width / 2) - size / 2}
                  y={q(node.y + node.height / 2) - size / 2}
                  size={size}
                  strokeWidth={2}
                />
              );
            })}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
