"use client";

/**
 * Draggable, zoomable renderer for a parsed n8n workflow.
 *
 * Everything drawn here comes from a `WorkflowCanvas` (see
 * `lib/workflow-canvas/types.ts`) — this file knows nothing about raw n8n JSON.
 *
 * Geometry model: world coordinates are n8n canvas units. A single transform
 * layer carries `translate(x, y) scale(k)`, and both the SVG edge layer and the
 * HTML node layer live inside it, so edges and nodes can never drift apart.
 * Screen = pan + world * k; world = (screen - pan) / k.
 *
 * Performance: the live view lives in a ref and is written straight onto the
 * layer's `style.transform` inside a rAF. Panning and zooming therefore cause
 * zero React re-renders — the node subtree is rendered once per canvas.
 */

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { Maximize, Minus, Plus, RotateCcw } from "lucide-react";
import { iconForTypeKey } from "@/lib/workflow-canvas/icons";
import { StickyMarkdown } from "@/components/public/workflow-canvas-markdown";
import {
  ATTACHMENT_SCALE,
  buildEdgePaths,
  CANVAS_GROUND,
  contentFrame,
  edgeStroke,
  stickyFill,
  stickyStroke,
  worldFrame,
  WORLD_MARGIN,
} from "@/components/public/workflow-canvas-geometry";
import { cn } from "@/lib/utils";
import type { Point } from "@/components/public/workflow-canvas-geometry";
import type { CanvasNode, WorkflowCanvas } from "@/lib/workflow-canvas/types";

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.5;
/**
 * Breathing room, in screen px, left around the graph by fit-to-view. Capped at
 * a fraction of the viewport so a phone-sized dialog does not spend a third of
 * its width on margin.
 */
const FIT_PADDING = 56;
const FIT_PADDING_RATIO = 0.06;
const ZOOM_STEP = 1.25;
const KEY_PAN_STEP = 56;

/**
 * Hatched ground. One square tile carries two 45° stripes, so shifting the tile
 * by its own width moves the weave exactly one full period and the pattern is
 * seamless — which a `repeating-linear-gradient` cannot be, because its stop
 * offsets are absolute px and therefore refuse to scale with `background-size`.
 *
 * Tile side = stripe period × √2: at scale 1 that reproduces the original 9px
 * weave with 1px lines (1 / (S·√2) = 1/18 of the gradient line).
 */
const GROUND_TILE = 9 * Math.SQRT2;
/** Below this the weave turns into grey mush, so density stops tracking zoom. */
const GROUND_MIN_TILE = 7;
const GROUND_IMAGE = [
  "linear-gradient(45deg,",
  "var(--outline-variant) 0 5.5556%,",
  "transparent 5.5556% 50%,",
  "var(--outline-variant) 50% 55.5556%,",
  "transparent 55.5556% 100%)",
].join(" ");

type View = { k: number; x: number; y: number };

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export type WorkflowCanvasViewProps = {
  canvas: WorkflowCanvas;
  /** Accessible name for the canvas region. Defaults to the workflow name. */
  label?: string;
  className?: string;
};

export function WorkflowCanvasView({
  canvas,
  label,
  className,
}: WorkflowCanvasViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const zoomLabelRef = useRef<HTMLSpanElement>(null);

  const viewRef = useRef<View>({ k: 1, x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<Point | null>(null);
  const pinchRef = useRef<{ dist: number; k: number } | null>(null);
  const fittedRef = useRef(false);
  /**
   * Zoom floor. Normally `MIN_SCALE`, but a big graph in a small viewport has to
   * fit *below* it — otherwise fit-to-view clamps and the outer nodes sit
   * outside the frame. Fit lowers the floor to whatever it needed.
   */
  const minScaleRef = useRef(MIN_SCALE);

  const clampScale = useCallback(
    (k: number) => Math.min(MAX_SCALE, Math.max(minScaleRef.current, k)),
    [],
  );

  const describedById = useId();

  const nodeById = useMemo(() => {
    const map = new Map<string, CanvasNode>();
    for (const node of canvas.nodes) map.set(node.id, node);
    return map;
  }, [canvas.nodes]);

  /** Edges resolved to geometry once — they never move after that. */
  const paths = useMemo(() => buildEdgePaths(canvas), [canvas]);

  const world = useMemo(
    () => worldFrame(canvas.bounds, WORLD_MARGIN),
    [canvas.bounds],
  );

  /** What fit-to-view has to frame: boxes *and* the captions under them. */
  const content = useMemo(() => contentFrame(canvas), [canvas]);

  // --- view plumbing -------------------------------------------------------

  const paint = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const { k, x, y } = viewRef.current;
      const layer = layerRef.current;
      if (layer) layer.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
      // The ground lives on the viewport (so it always covers it) but tracks the
      // graph: position follows the pan, tile size follows the scale. Two style
      // writes on an element we already hold a ref to — still zero re-renders.
      const viewport = viewportRef.current;
      if (viewport) {
        const tile = Math.max(GROUND_MIN_TILE, GROUND_TILE * k);
        viewport.style.backgroundSize = `${tile}px ${tile}px`;
        viewport.style.backgroundPosition = `${x}px ${y}px`;
      }
      if (zoomLabelRef.current) {
        zoomLabelRef.current.textContent = `${Math.round(k * 100)}%`;
      }
    });
  }, []);

  const setView = useCallback(
    (next: View) => {
      viewRef.current = { ...next, k: clampScale(next.k) };
      paint();
    },
    [clampScale, paint],
  );

  /**
   * Zoom about a fixed screen point: the world point under the cursor must land
   * back under the cursor, so pan = screen - world * k'.
   */
  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const { k, x, y } = viewRef.current;
      const nextK = clampScale(k * factor);
      if (nextK === k) return;
      setView({
        k: nextK,
        x: px - ((px - x) / k) * nextK,
        y: py - ((py - y) / k) * nextK,
      });
    },
    [clampScale, setView],
  );

  /** Zoom about the viewport centre — what the buttons and `+`/`-` use. */
  const zoomCenter = useCallback(
    (factor: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    [zoomAt],
  );

  /**
   * Fit-to-view: scale so the authored `bounds` (plus padding) fit inside the
   * viewport, then centre them. Runs on first layout, so a workflow lands framed
   * whatever its absolute n8n coordinates happen to be.
   */
  const fitToView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { clientWidth: vw, clientHeight: vh } = viewport;
    if (vw === 0 || vh === 0) return;

    const pad = Math.min(FIT_PADDING, vw * FIT_PADDING_RATIO, vh * FIT_PADDING_RATIO);
    const { x: cx, y: cy, width: gw, height: gh } = content;
    const k = Math.min(
      Math.max(vw - pad * 2, 1) / gw,
      Math.max(vh - pad * 2, 1) / gh,
      // Never blow a two-node graph up past life size.
      1.1,
    );

    // A graph too big for MIN_SCALE still has to fit, so the floor gives way.
    minScaleRef.current = Math.min(MIN_SCALE, k);

    setView({
      k,
      x: (vw - gw * k) / 2 - cx * k,
      y: (vh - gh * k) / 2 - cy * k,
    });
  }, [content, setView]);

  // Fit once the viewport actually has a size (dialogs mount at 0x0).
  useEffect(() => {
    fittedRef.current = false;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      if (fittedRef.current) return;
      if (viewport.clientWidth === 0 || viewport.clientHeight === 0) return;
      fittedRef.current = true;
      fitToView();
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fitToView]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // --- wheel ---------------------------------------------------------------

  // Bound imperatively: React's synthetic wheel handler is passive, so
  // `preventDefault()` there would not stop the page from scrolling. Because the
  // listener lives on the viewport, it only ever fires with the pointer over it.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      // deltaMode 1 is lines, 2 is pages — normalise to something pixel-ish.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      const factor = Math.exp((-event.deltaY * unit) / 420);
      zoomAt(factor, event.clientX, event.clientY);
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // --- pointer -------------------------------------------------------------

  const endGesture = useCallback(() => {
    dragRef.current = null;
    pinchRef.current = null;
    const layer = layerRef.current;
    if (layer) layer.style.transition = "";
    viewportRef.current?.classList.remove("cursor-grabbing");
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Links inside stickies stay clickable; everything else pans.
    if (
      event.target instanceof Element &&
      event.target.closest("a, button, [data-no-pan]")
    ) {
      return;
    }

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);

    if (pointersRef.current.size === 1) {
      dragRef.current = { x: event.clientX, y: event.clientY };
      // The transition is for button-driven zoom; it would lag a live drag.
      if (layerRef.current) layerRef.current.style.transition = "none";
      event.currentTarget.classList.add("cursor-grabbing");
    } else if (pointersRef.current.size === 2) {
      dragRef.current = null;
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { dist: Math.hypot(b.x - a.x, b.y - a.y), k: viewRef.current.k };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (dist > 0 && pinch.dist > 0) {
        const target = clampScale((pinch.k * dist) / pinch.dist);
        zoomAt(
          target / viewRef.current.k,
          (a.x + b.x) / 2,
          (a.y + b.y) / 2,
        );
      }
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    const { k, x, y } = viewRef.current;
    setView({
      k,
      x: x + (event.clientX - drag.x),
      y: y + (event.clientY - drag.y),
    });
    dragRef.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (pointersRef.current.size === 0) endGesture();
    else pinchRef.current = null;
  }

  // --- keyboard ------------------------------------------------------------

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? KEY_PAN_STEP * 3 : KEY_PAN_STEP;
    const { k, x, y } = viewRef.current;

    switch (event.key) {
      case "ArrowLeft":
        setView({ k, x: x + step, y });
        break;
      case "ArrowRight":
        setView({ k, x: x - step, y });
        break;
      case "ArrowUp":
        setView({ k, x, y: y + step });
        break;
      case "ArrowDown":
        setView({ k, x, y: y - step });
        break;
      case "+":
      case "=":
        zoomCenter(ZOOM_STEP);
        break;
      case "-":
      case "_":
        zoomCenter(1 / ZOOM_STEP);
        break;
      case "0":
        fitToView();
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  const title = label ?? canvas.name ?? "Workflow canvas";

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        ref={viewportRef}
        role="application"
        aria-roledescription="Workflow canvas"
        aria-label={`${title} — drag to pan, scroll to zoom`}
        aria-describedby={describedById}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "h-full w-full cursor-grab touch-none select-none overflow-hidden",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
        )}
        style={{
          // Hatched ground. Painted on the viewport, not on the transform layer,
          // so it covers the frame at every zoom level; `paint()` keeps its
          // position and tile size in step with the graph.
          backgroundColor: CANVAS_GROUND,
          backgroundImage: GROUND_IMAGE,
          backgroundSize: `${GROUND_TILE}px ${GROUND_TILE}px`,
          backgroundPosition: "0px 0px",
        }}
      >
        <div
          ref={layerRef}
          className="origin-top-left transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{ transform: "translate(0px, 0px) scale(1)" }}
        >
          {/* Stickies paint behind everything else. */}
          {canvas.stickies.map((sticky) => (
            <div
              key={sticky.id}
              className="absolute overflow-hidden rounded-lg p-3 text-[11px] leading-snug"
              style={{
                left: sticky.x,
                top: sticky.y,
                width: sticky.width,
                height: sticky.height,
                backgroundColor: stickyFill(sticky.color),
                border: `1px solid ${stickyStroke(sticky.color)}`,
                color: "var(--on-surface)",
              }}
            >
              <StickyMarkdown content={sticky.content} />
            </div>
          ))}

          {/* Edge layer. Positioned on the same world origin as the nodes. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute overflow-visible"
            style={{
              left: world.x,
              top: world.y,
              width: world.width,
              height: world.height,
            }}
            viewBox={`${world.x} ${world.y} ${world.width} ${world.height}`}
          >
            {paths.map(({ edge, path }) => (
              <g key={edge.id}>
                <path
                  d={path.d}
                  fill="none"
                  stroke={edgeStroke(edge.kind)}
                  strokeWidth={edge.kind === "ai" ? 1.5 : 2}
                  strokeLinecap="round"
                  strokeDasharray={edge.kind === "ai" ? "4 4" : undefined}
                />
                {edge.label ? (
                  <text
                    x={path.mid.x}
                    y={path.mid.y - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--on-surface)"
                    stroke={CANVAS_GROUND}
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {edge.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>

          {/* Node layer. */}
          {canvas.nodes.map((node) => (
            <CanvasNodeChip key={node.id} node={node} />
          ))}
        </div>
      </div>

      <CanvasControls
        zoomLabelRef={zoomLabelRef}
        onFit={fitToView}
        onZoomIn={() => zoomCenter(ZOOM_STEP)}
        onZoomOut={() => zoomCenter(1 / ZOOM_STEP)}
        onReset={fitToView}
      />

      {/* Screen-reader fallback: the graph as a readable outline, so the canvas
          is never an opaque blob to assistive tech. */}
      <div id={describedById} className="sr-only">
        <p>
          {`${title}: ${canvas.nodes.length} nodes, ${canvas.edges.length} connections. Pan with the arrow keys, zoom with plus and minus, press 0 to fit.`}
        </p>
        <ul>
          {canvas.nodes.map((node) => {
            const outgoing = canvas.edges.filter((e) => e.source === node.id);
            return (
              <li key={node.id}>
                {`${node.name} (${iconForTypeKey(node.typeKey).label}${
                  node.disabled ? ", disabled" : ""
                })`}
                {outgoing.length > 0
                  ? ` connects to ${outgoing
                      .map((e) => nodeById.get(e.target)?.name ?? e.target)
                      .join(", ")}`
                  : " — end of branch"}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function CanvasNodeChip({ node }: { node: CanvasNode }) {
  const icon = iconForTypeKey(node.typeKey);

  if (node.shape === "attachment") {
    // Sub-node: the small circle that hangs beneath an agent.
    const size = Math.min(node.width, node.height) * ATTACHMENT_SCALE;
    return (
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          opacity: node.disabled ? 0.45 : 1,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full border border-outline bg-surface-bright text-[13px] shadow-xs"
          style={{ width: size, height: size }}
          title={icon.label}
        >
          <span aria-hidden>{icon.glyph}</span>
        </div>
        <NodeCaption node={node} />
      </div>
    );
  }

  const isTrigger = node.shape === "trigger";

  return (
    <div
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        opacity: node.disabled ? 0.45 : 1,
      }}
    >
      {/* `surface-bright` is the raised end of the ramp — unchanged paper in
          the light theme, and the one surface that lifts clearly off
          `CANVAS_GROUND` in the dark one. */}
      <div
        className={cn(
          "flex h-full w-full items-center justify-center border bg-surface-bright text-[20px] shadow-sm",
          node.disabled ? "border-outline-variant" : "border-outline",
        )}
        style={{
          // Trigger nodes keep n8n's rounded-left "start" silhouette.
          borderRadius: isTrigger
            ? `${node.height / 2}px 10px 10px ${node.height / 2}px`
            : "10px",
        }}
        title={icon.label}
      >
        <span aria-hidden>{icon.glyph}</span>
      </div>
      <NodeCaption node={node} />
    </div>
  );
}

/** Name (and optional subtitle) under the chip, centred and out of flow. */
function NodeCaption({ node }: { node: CanvasNode }) {
  return (
    <div className="absolute left-1/2 top-full w-[150px] -translate-x-1/2 pt-1.5 text-center">
      <p className="truncate text-[11px] font-medium leading-tight text-on-surface">
        {node.name}
      </p>
      {node.subtitle ? (
        <p className="truncate text-[10px] leading-tight text-on-surface-faint">
          {node.subtitle}
        </p>
      ) : null}
    </div>
  );
}

function CanvasControls({
  zoomLabelRef,
  onFit,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoomLabelRef: React.RefObject<HTMLSpanElement | null>;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div
      data-no-pan
      className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container/95 p-1 shadow-md backdrop-blur-sm"
    >
      <ControlButton label="Fit to screen" onClick={onFit}>
        <Maximize className="h-3.5 w-3.5" aria-hidden />
      </ControlButton>
      <ControlButton label="Zoom in" onClick={onZoomIn}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </ControlButton>
      <ControlButton label="Zoom out" onClick={onZoomOut}>
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </ControlButton>
      <ControlButton label="Reset view" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      </ControlButton>
      <span
        ref={zoomLabelRef}
        aria-hidden
        className="font-label tabular w-11 pr-1 text-right text-on-surface-faint"
      >
        100%
      </span>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface"
    >
      {children}
    </button>
  );
}
