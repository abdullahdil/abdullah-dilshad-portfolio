/**
 * Static miniature of a real `WorkflowCanvas` — the preview that fills a
 * workflow card on the homepage.
 *
 * Deliberately NOT `WorkflowCanvasView`: a homepage can show dozens of these,
 * and the interactive canvas carries a ResizeObserver, a non-passive wheel
 * listener, pointer capture and a rAF loop *each*. This renders one plain
 * `<svg>` per card with:
 *
 *   - no state, no effects, no refs, no observers, no event listeners;
 *   - auto-fit done by the browser via `viewBox` + `preserveAspectRatio`, so
 *     there is no measurement pass and therefore no layout shift on mount;
 *   - `pointer-events: none` on the whole graph, so it can never swallow a
 *     page scroll, a drag, or the card's own click target.
 *
 * Geometry, hues and silhouettes come from `workflow-canvas-geometry`, the same
 * module the interactive canvas uses — the miniature is the same drawing, small.
 */

import { iconForTypeKey } from "@/lib/workflow-canvas/icons";
import {
  ATTACHMENT_SCALE,
  buildEdgePaths,
  CANVAS_GROUND,
  edgeStroke,
  roundedRectPath,
  stickyFill,
  stickyStroke,
  worldFrame,
} from "@/components/public/workflow-canvas-geometry";
import { cn } from "@/lib/utils";
import type { CanvasNode, WorkflowCanvas } from "@/lib/workflow-canvas/types";

/** World units of breathing room around `bounds` inside the viewBox. */
const THUMB_MARGIN = 72;
/** Caption type size in world units — matches the live canvas at scale 1. */
const CAPTION_SIZE = 12;
const CAPTION_MAX_CHARS = 22;
const STICKY_MAX_CHARS = 30;

function truncate(value: string, max: number): string {
  const text = value.trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * The first line of a sticky that carries meaning, with the markdown furniture
 * (heading hashes, bullets, emphasis) stripped. Enough to label the region the
 * sticky covers without trying to lay out prose at thumbnail scale.
 */
function stickyHeadline(content: string): string {
  for (const raw of content.split("\n")) {
    const line = raw
      .replace(/^[#>\s-]+/, "")
      .replace(/[*_`]/g, "")
      .trim();
    if (line.length > 0) return truncate(line, STICKY_MAX_CHARS);
  }
  return "";
}

export type WorkflowCanvasThumbnailProps = {
  canvas: WorkflowCanvas;
  className?: string;
};

export function WorkflowCanvasThumbnail({
  canvas,
  className,
}: WorkflowCanvasThumbnailProps) {
  const world = worldFrame(canvas.bounds, THUMB_MARGIN);
  const paths = buildEdgePaths(canvas);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none h-full w-full select-none", className)}
      style={{
        backgroundColor: CANVAS_GROUND,
        // Same hatched ground as the live canvas, fixed to the box rather than
        // to the graph — there is no pan here for it to track.
        backgroundImage:
          "repeating-linear-gradient(45deg, var(--outline-variant) 0 1px, transparent 1px 9px)",
      }}
    >
      <svg
        className="h-full w-full"
        viewBox={`${world.x} ${world.y} ${world.width} ${world.height}`}
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        {/* Stickies paint behind everything else. */}
        {canvas.stickies.map((sticky) => {
          const headline = stickyHeadline(sticky.content);
          return (
            <g key={sticky.id}>
              <rect
                x={sticky.x}
                y={sticky.y}
                width={sticky.width}
                height={sticky.height}
                rx={10}
                fill={stickyFill(sticky.color)}
                stroke={stickyStroke(sticky.color)}
                strokeWidth={1.5}
              />
              {headline ? (
                <text
                  x={sticky.x + 12}
                  y={sticky.y + 12 + CAPTION_SIZE}
                  fontSize={CAPTION_SIZE + 1}
                  fontWeight={600}
                  fill="var(--on-surface)"
                >
                  {headline}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Edges. */}
        {paths.map(({ edge, path }) => (
          <path
            key={edge.id}
            d={path.d}
            fill="none"
            stroke={edgeStroke(edge.kind)}
            strokeWidth={edge.kind === "ai" ? 1.5 : 2}
            strokeLinecap="round"
            strokeDasharray={edge.kind === "ai" ? "4 4" : undefined}
          />
        ))}

        {/* Nodes. */}
        {canvas.nodes.map((node) => (
          <ThumbnailNode key={node.id} node={node} />
        ))}
      </svg>
    </div>
  );
}

/** Chips fill with `surface-bright`, the one surface that lifts off the ground in both themes. */
function ThumbnailNode({ node }: { node: CanvasNode }) {
  const icon = iconForTypeKey(node.typeKey);
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;
  const isAttachment = node.shape === "attachment";
  // Sub-nodes are the small circle hanging under an agent, as in n8n.
  const radius = (Math.min(node.width, node.height) * ATTACHMENT_SCALE) / 2;
  const glyphSize = isAttachment ? radius * 0.95 : node.height * 0.42;

  return (
    <g opacity={node.disabled ? 0.45 : 1}>
      {isAttachment ? (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="var(--surface-bright)"
          stroke="var(--outline)"
          strokeWidth={1.5}
        />
      ) : (
        <path
          d={roundedRectPath(
            node.x,
            node.y,
            node.width,
            node.height,
            // Triggers keep n8n's rounded-left "start" silhouette.
            node.shape === "trigger"
              ? [node.height / 2, 10, 10, node.height / 2]
              : [10, 10, 10, 10],
          )}
          fill="var(--surface-bright)"
          stroke={node.disabled ? "var(--outline-variant)" : "var(--outline)"}
          strokeWidth={1.5}
        />
      )}

      <text
        x={centerX}
        y={centerY}
        fontSize={glyphSize}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {icon.glyph}
      </text>

      <text
        x={centerX}
        y={node.y + node.height + CAPTION_SIZE + 4}
        fontSize={CAPTION_SIZE}
        fontWeight={500}
        textAnchor="middle"
        fill="var(--on-surface)"
      >
        {truncate(node.name, CAPTION_MAX_CHARS)}
      </text>
    </g>
  );
}
