/**
 * Presentational workflow card — no hooks, no canvas. The whole surface links
 * to the workflow's own page (`/workflows/[slug]`); "Request access" and any
 * extra action are real buttons inside it.
 *
 * Layering (a link may not contain buttons): an absolutely-positioned `<Link>`
 * covers the card at `z-0`; visible content paints above it at `z-10` with
 * `pointer-events-none`, so ordinary clicks fall through to the link; the
 * action row switches pointer events back on and takes its own clicks.
 *
 * The preview arrives as a ReactNode, so a Server Component renders the
 * thumbnail and a client island (the catalog) receives markup, never canvas
 * JSON. Kept apart from `workflow-card.tsx` so the catalog's client bundle
 * does not pull in the canvas dialog.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WorkflowAccessButton } from "@/components/public/workflow-access-button";
import { WorkflowToolIcons } from "@/components/public/workflow-tool-icons";
import {
  WORKFLOW_STATUS_LABELS,
  type WorkflowCardData,
  type WorkflowStatus,
} from "@/components/catalog/workflow-data";
import { ToolChip } from "@/components/ui/tool-chip";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Fallback glyph
// ---------------------------------------------------------------------------

const GLYPH_WIDTH = 320;
const GLYPH_HEIGHT = 200;

/**
 * Workflows with neither a canvas nor an image still get a unique abstract
 * "flow diagram" glyph, deterministically generated from the id. Decorative
 * only — it never pretends to be the real graph.
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

export function WorkflowGlyph({ seed }: { seed: string }) {
  const random = mulberry32(hashSeed(seed));
  const nodeCount = 4 + Math.floor(random() * 3);
  const nodes: { x: number; y: number; r: number; hub: boolean }[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const t = i / (nodeCount - 1);
    const x = 34 + t * (GLYPH_WIDTH - 68) + (random() - 0.5) * 18;
    const y = GLYPH_HEIGHT / 2 + (random() - 0.5) * (GLYPH_HEIGHT * 0.44);
    const hub = i === 0 || i === nodeCount - 1 || random() > 0.7;
    nodes.push({ x, y, r: hub ? 13 : 7, hub });
  }

  return (
    <svg
      viewBox={`0 0 ${GLYPH_WIDTH} ${GLYPH_HEIGHT}`}
      className="h-full w-full p-8 text-accent"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      {nodes.slice(1).map((b, i) => {
        const a = nodes[i];
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
// Status chip
// ---------------------------------------------------------------------------

const STATUS_CLASSES: Readonly<Record<WorkflowStatus, string>> = {
  production: "border-transparent bg-accent-soft text-accent",
  teaching: "border-outline-variant bg-surface-high text-on-surface-variant",
  build: "border-outline-variant bg-surface-container text-on-surface-faint",
};

export function WorkflowStatusChip({
  status,
  className,
}: {
  status: WorkflowStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-label inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {status === "production" ? (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      ) : null}
      {WORKFLOW_STATUS_LABELS[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Presentational card
// ---------------------------------------------------------------------------

export type WorkflowCardViewProps = {
  item: WorkflowCardData;
  /** Server-rendered thumbnail (or image / glyph). */
  preview: React.ReactNode;
  /** 1-based position drawn as the corner index; omit to hide it. */
  position?: number;
  /** Extra action next to "Request access" (e.g. the canvas quick-view). */
  extraAction?: React.ReactNode;
  /** Show the group name above the title (useful in mixed lists). */
  showCategory?: boolean;
  headingLevel?: "h2" | "h3";
};

export function WorkflowCardView({
  item,
  preview,
  position,
  extraAction,
  showCategory = false,
  headingLevel: Heading = "h3",
}: WorkflowCardViewProps) {
  const href = `/workflows/${item.slug}`;

  return (
    <li className="group panel panel-depth lift relative flex flex-col overflow-hidden">
      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <span className="sr-only">{`${item.title} — view workflow`}</span>
      </Link>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-outline-variant bg-surface-lowest">
          {preview}

          {position !== undefined ? (
            <span className="font-label tabular absolute left-3 top-3 rounded-md border border-outline-variant bg-surface-container/85 px-1.5 py-0.5 text-on-surface-faint backdrop-blur-sm">
              {String(position).padStart(2, "0")}
            </span>
          ) : null}

          <WorkflowStatusChip
            status={item.status}
            className="absolute right-3 top-3 backdrop-blur-sm"
          />

          {item.nodeCount > 0 ? (
            <span className="font-label tabular absolute bottom-3 left-3 rounded-md border border-outline-variant bg-surface-container/85 px-1.5 py-0.5 text-on-surface-variant backdrop-blur-sm">
              {`${item.nodeCount} nodes`}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {showCategory ? (
            <p className="font-label text-on-surface-faint">{item.category}</p>
          ) : null}
          <Heading
            className={cn(
              "font-heading text-headline-sm text-balance text-on-surface",
              showCategory && "mt-1.5",
            )}
          >
            <span className="inline-flex items-start gap-1">
              {item.title}
              <ArrowUpRight
                aria-hidden
                className="mt-1 h-4 w-4 shrink-0 text-on-surface-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
              />
            </span>
          </Heading>
          <p className="mt-2 line-clamp-3 text-body-sm text-pretty text-on-surface-variant">
            {item.summary}
          </p>

          {item.outcomeTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.outcomeTags.slice(0, 3).map((tag) => (
                <ToolChip key={tag}>{tag}</ToolChip>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
            {item.toolKeys.length > 0 ? (
              <WorkflowToolIcons toolKeys={item.toolKeys} max={4} />
            ) : (
              <span />
            )}

            <div className="pointer-events-auto flex items-center gap-2">
              {extraAction}
              <WorkflowAccessButton workflowId={item.id} workflowTitle={item.title} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
