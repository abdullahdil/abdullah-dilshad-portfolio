"use client";

/**
 * One workflow in the homepage catalog: a card whose whole surface opens the
 * canvas preview for that workflow.
 *
 * Two things here are easy to get wrong, so they are spelled out:
 *
 * 1. **One control, not a nest.** "Request access" is a real button that lives
 *    inside the card, and a `<button>` may not contain another. So the card is
 *    not a button — it holds an absolutely-positioned overlay button at `z-0`
 *    covering the whole card, with all visible content painted above it at
 *    `z-10`. The content layer is `pointer-events-none`, so an ordinary click
 *    lands on the overlay; the access-button wrapper switches pointer events
 *    back on, and because it sits above the overlay it takes its own clicks
 *    (the overlay never sees them). The overlay carries the accessible name,
 *    `aria-haspopup="dialog"`, and native Enter/Space + focus-ring behaviour.
 *
 * 2. **Cheap previews.** The canvas thumbnail is a static SVG with no listeners
 *    and no observers — see `workflow-canvas-thumbnail`. Dozens of these can be
 *    on screen at once. The interactive `WorkflowCanvasView` is mounted only
 *    inside the dialog, one at a time.
 */

import Image from "next/image";
import { useMemo, useState } from "react";
import { WorkflowAccessButton } from "@/components/public/workflow-access-button";
import { WorkflowCanvasDialog } from "@/components/public/workflow-canvas-dialog";
import { WorkflowCanvasThumbnail } from "@/components/public/workflow-canvas-thumbnail";
import { WorkflowToolIcons } from "@/components/public/workflow-tool-icons";
import { ToolChip } from "@/components/ui/tool-chip";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

const GLYPH_WIDTH = 320;
const GLYPH_HEIGHT = 200;

// ---------------------------------------------------------------------------
// Fallback glyph
// ---------------------------------------------------------------------------

/**
 * Workflows with neither a canvas nor an image still get a unique abstract
 * "flow diagram" glyph, deterministically generated from the id — a distinct
 * marker per card instead of a repeated icon. It is decorative only and never
 * pretends to be the real graph.
 */
function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type GlyphNode = { x: number; y: number; r: number; hub: boolean };
type GlyphEdge = { from: number; to: number };

function buildGlyph(seed: string): { nodes: GlyphNode[]; edges: GlyphEdge[] } {
  const random = mulberry32(hashSeed(seed));
  const nodeCount = 4 + Math.floor(random() * 3);
  const nodes: GlyphNode[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const t = nodeCount === 1 ? 0.5 : i / (nodeCount - 1);
    const x = 34 + t * (GLYPH_WIDTH - 68) + (random() - 0.5) * 18;
    const y = GLYPH_HEIGHT / 2 + (random() - 0.5) * (GLYPH_HEIGHT * 0.44);
    const hub = i === 0 || i === nodeCount - 1 || random() > 0.7;
    const r = hub ? 13 : 7;
    nodes.push({ x, y, r, hub });
  }

  const edges: GlyphEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ from: i, to: i + 1 });
  }
  if (nodes.length > 3 && random() > 0.45) {
    const from = Math.floor(random() * (nodes.length - 2));
    const to = Math.min(from + 2 + Math.floor(random() * 2), nodes.length - 1);
    if (to > from + 1) {
      edges.push({ from, to });
    }
  }

  return { nodes, edges };
}

/**
 * Decorative, token-coloured: strokes inherit `currentColor` from the wrapper so
 * the glyph reads correctly in both themes.
 */
function WorkflowGlyph({ seed }: { seed: string }) {
  const { nodes, edges } = useMemo(() => buildGlyph(seed), [seed]);

  return (
    <svg
      viewBox={`0 0 ${GLYPH_WIDTH} ${GLYPH_HEIGHT}`}
      className="h-full w-full p-8"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        const midX = (a.x + b.x) / 2;
        return (
          <path
            key={i}
            d={`M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={5}
            strokeOpacity={0.4}
          />
        );
      })}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill="currentColor"
          fillOpacity={node.hub ? 0.16 : 0}
          stroke="currentColor"
          strokeWidth={5}
          strokeOpacity={node.hub ? 0.85 : 0.5}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export type WorkflowCardProps = {
  workflow: PublicWorkflowListing;
  /** 1-based position in the visible list, drawn as the corner index. */
  position: number;
};

export function WorkflowCard({ workflow, position }: WorkflowCardProps) {
  const [open, setOpen] = useState(false);

  // A stored-but-empty canvas is not a graph — fall through to the next option.
  const canvas =
    workflow.canvas && workflow.canvas.nodes.length > 0 ? workflow.canvas : null;

  return (
    <li className="group panel panel-depth lift relative flex flex-col overflow-hidden">
      {/* Layer 1 (behind): the card-wide click target. */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <span className="sr-only">{`${workflow.title} — open preview`}</span>
      </button>

      {/* Layer 2 (in front, click-through): everything visible. */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        {/* Preview well. `surface-lowest` is the same ground the canvas paints on,
            so a canvas card and an image/glyph card read as one surface. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-outline-variant bg-surface-lowest text-accent">
          {canvas ? (
            <WorkflowCanvasThumbnail canvas={canvas} />
          ) : workflow.imageUrl ? (
            <Image
              src={workflow.imageUrl}
              alt={workflow.imageAlt || workflow.title}
              fill
              sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw"
              className="object-cover object-center"
            />
          ) : (
            <WorkflowGlyph seed={workflow.id} />
          )}

          <span className="font-label tabular absolute left-3 top-3 rounded-md border border-outline-variant bg-surface-container/85 px-1.5 py-0.5 text-on-surface-faint backdrop-blur-sm">
            {String(position).padStart(2, "0")}
          </span>

          {/* Quiet "this opens" hint. Fades in on hover or keyboard focus. */}
          <span className="font-label absolute bottom-3 right-3 rounded-md border border-outline-variant bg-surface-container/85 px-2 py-1 text-on-surface-variant opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
            {canvas ? "Open canvas" : "Open preview"}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-heading text-headline-sm text-balance text-on-surface">
            {workflow.title}
          </h3>
          <p className="mt-2 text-body-sm text-pretty text-on-surface-variant">
            {workflow.summary}
          </p>

          {workflow.outcomeTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {workflow.outcomeTags.slice(0, 3).map((tag) => (
                <ToolChip key={tag}>{tag}</ToolChip>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
            {canvas ? (
              <WorkflowToolIcons toolKeys={canvas.toolKeys} max={4} />
            ) : (
              <span />
            )}

            {/* Layer 3: the one place pointer events come back on, painted above
                the overlay so its clicks never reach the card target. */}
            <div className="pointer-events-auto">
              <WorkflowAccessButton
                workflowId={workflow.id}
                workflowTitle={workflow.title}
              />
            </div>
          </div>
        </div>
      </div>

      <WorkflowCanvasDialog
        open={open}
        onClose={() => setOpen(false)}
        title={workflow.title}
        canvas={canvas}
        summary={workflow.summary}
        outcomeTags={workflow.outcomeTags}
      />
    </li>
  );
}
