"use client";

import { type CSSProperties, useCallback } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type {
  ArchitectureNode,
  CaseStudyStep,
  CaseStudyTool,
} from "@/lib/content/types";
import { cn } from "@/lib/utils";

type ArchitectureDiagramProps = {
  nodes: ArchitectureNode[];
  description: string;
  steps?: CaseStudyStep[];
  tools?: CaseStudyTool[];
};

function pickEvenly<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  if (max <= 1) return items.slice(0, 1);

  const result: T[] = [];
  for (let i = 0; i < max; i += 1) {
    const index = Math.round((i * (items.length - 1)) / (max - 1));
    result.push(items[index]!);
  }
  return result;
}

function resolveWorkflowNodes(
  nodes: ArchitectureNode[],
  steps: CaseStudyStep[] = [],
  tools: CaseStudyTool[] = [],
): ArchitectureNode[] {
  if (nodes.length > 0) return nodes;

  if (steps.length > 0) {
    return pickEvenly(steps, 7).map((step) => ({
      label: step.title,
      detail: `Step ${String(step.stepNumber).padStart(2, "0")}`,
    }));
  }

  if (tools.length > 0) {
    return tools.slice(0, 7).map((tool) => ({
      label: tool.name,
      detail: tool.category ?? "Integration",
    }));
  }

  return [];
}

/* Motion timing. Node n fades in at LEAD + n * STAGGER; the rail draws across
   the whole sequence so the line arrives at each node as it appears. */
const LEAD_MS = 90;
const STAGGER_MS = 80;
const NODE_MS = 280;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function revealTotal(count: number) {
  return LEAD_MS + Math.max(count - 1, 0) * STAGGER_MS + NODE_MS;
}

/**
 * Scroll reveal, expressed entirely in CSS and driven by one data attribute.
 *
 * Visibility is guaranteed by construction: the markup ships in its *end*
 * state, and the hidden ("armed") state only exists under `[data-arch="armed"]`,
 * an attribute that only ever appears when JS has run, the observer exists and
 * the user has not asked for reduced motion. No JS, a failed observer or a
 * reduced-motion preference therefore all land on "fully visible", never blank.
 */
const REVEAL_CSS = `
[data-arch="armed"] .arch-node { opacity: 0; transform: translateY(2px); }
[data-arch="revealed"] .arch-node {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity ${NODE_MS}ms ${EASE} var(--arch-delay, 0ms),
    transform ${NODE_MS}ms ${EASE} var(--arch-delay, 0ms);
}

[data-arch="armed"] .arch-rail-x { transform: scaleX(0); }
[data-arch="revealed"] .arch-rail-x {
  transform: scaleX(1);
  transition: transform var(--arch-draw, 600ms) ${EASE};
}
.arch-rail-x { transform-origin: left center; }

[data-arch="armed"] .arch-rail-y { transform: scaleY(0); }
[data-arch="revealed"] .arch-rail-y {
  transform: scaleY(1);
  transition: transform var(--arch-draw, 600ms) ${EASE};
}
.arch-rail-y { transform-origin: center top; }

/* One record travelling the rail, exactly once, after the reveal settles. */
.arch-pulse { position: absolute; inset: 0; opacity: 0; }
.arch-pulse::before {
  content: "";
  position: absolute;
  border-radius: 9999px;
  background-color: currentColor;
}
.arch-pulse-x::before { left: 0; top: 0; height: 3px; width: 2rem; }
.arch-pulse-y::before { top: 0; left: 0; width: 3px; height: 2rem; }
[data-arch="revealed"] .arch-pulse-x {
  animation: arch-run-x 900ms linear var(--arch-pulse-delay, 900ms) 1 both;
}
[data-arch="revealed"] .arch-pulse-y {
  animation: arch-run-y 900ms linear var(--arch-pulse-delay, 900ms) 1 both;
}
@keyframes arch-run-x {
  0% { opacity: 0; transform: translateX(-2rem); }
  18% { opacity: 0.75; }
  82% { opacity: 0.75; }
  100% { opacity: 0; transform: translateX(100%); }
}
@keyframes arch-run-y {
  0% { opacity: 0; transform: translateY(-2rem); }
  18% { opacity: 0.75; }
  82% { opacity: 0.75; }
  100% { opacity: 0; transform: translateY(100%); }
}

@media (prefers-reduced-motion: reduce) {
  [data-arch] .arch-node,
  [data-arch] .arch-rail-x,
  [data-arch] .arch-rail-y {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .arch-pulse { display: none !important; }
}
`;

/**
 * Callback ref rather than an effect: it runs in the commit phase, before the
 * browser paints, so arming cannot flash, and it never touches React state
 * (no `set-state-in-effect`). Returns its own cleanup.
 */
function useScrollReveal() {
  return useCallback((root: HTMLDivElement | null) => {
    if (!root) return;
    if (typeof window === "undefined") return;

    // Reduced motion: leave the markup in its end state, untouched.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // No observer support: same — visible, just not animated.
    if (typeof IntersectionObserver === "undefined") return;

    let observer: IntersectionObserver;
    try {
      // Tall rails would never hit a flat 30%, so cap the threshold by height.
      const height = root.offsetHeight || 1;
      const threshold = Math.min(0.3, (window.innerHeight * 0.45) / height);

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect(); // animate once, then stop watching
          root.dataset.arch = "revealed";
        },
        { threshold },
      );
      root.dataset.arch = "armed";
      observer.observe(root);
    } catch {
      delete root.dataset.arch; // anything unexpected → stay visible
      return;
    }

    return () => {
      observer.disconnect();
    };
  }, []);
}

export function ArchitectureDiagram({
  nodes,
  description,
  steps = [],
  tools = [],
}: ArchitectureDiagramProps) {
  const revealRef = useScrollReveal();
  const workflowNodes = resolveWorkflowNodes(nodes, steps, tools);

  const hubIndex = workflowNodes.findIndex((node) =>
    node.label.toLowerCase().includes("n8n"),
  );
  const centerIndex =
    hubIndex === -1 ? Math.floor(workflowNodes.length / 2) : hubIndex;
  const usedFallback = nodes.length === 0;
  const summary =
    description.trim() ||
    (usedFallback
      ? "How work moves through this system from intake to outcome."
      : "");

  if (workflowNodes.length === 0) return null;

  const total = revealTotal(workflowNodes.length);
  const motionVars = {
    "--arch-draw": `${total - NODE_MS + 120}ms`,
    "--arch-pulse-delay": `${total + 160}ms`,
  } as CSSProperties;

  return (
    <Section tone="low" className="section-veil" aria-labelledby="architecture-heading">
      <style href="arch-diagram-reveal" precedence="default">
        {REVEAL_CSS}
      </style>
      <Container size="narrow">
        <p className="section-eyebrow">Architecture</p>
        <h2 id="architecture-heading" className="mt-3 font-heading text-headline-lg text-balance text-on-surface">
          System overview
        </h2>
        {summary ? (
          <p className="mt-6 text-lead text-pretty">{summary}</p>
        ) : null}
      </Container>

      {/* Wide breakout: the diagram is the one element allowed past the measure. */}
      <Container size="wide" className="mt-12 md:mt-16">
        <div ref={revealRef} style={motionVars}>
          {/* Desktop rail. Scrolls rather than squashing on narrow desktops. */}
          <div className="hidden overflow-x-auto md:block">
            <div className="relative min-w-[42rem] pb-1">
              <div
                className="arch-rail-x absolute left-0 right-0 top-[1.4375rem] h-px bg-outline-variant"
                aria-hidden
              />
              <div
                className="absolute left-0 right-0 top-[calc(1.4375rem_-_1px)] h-[3px] overflow-hidden"
                aria-hidden
              >
                <span className="arch-pulse arch-pulse-x text-accent" />
              </div>
              <ol
                className="relative grid items-start gap-x-4"
                style={{
                  gridTemplateColumns: `repeat(${workflowNodes.length}, minmax(0, 1fr))`,
                }}
              >
                {workflowNodes.map((node, index) => {
                  const isHub = index === centerIndex;
                  return (
                    <li
                      key={`${node.label}-${index}`}
                      className="arch-node flex flex-col items-center gap-4 text-center"
                      style={
                        {
                          "--arch-delay": `${LEAD_MS + index * STAGGER_MS}ms`,
                        } as CSSProperties
                      }
                    >
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full border bg-surface font-label tabular",
                          isHub
                            ? "border-accent text-accent"
                            : "border-outline-variant text-on-surface-faint",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="block max-w-[10rem]">
                        <span
                          className={cn(
                            "block text-headline-sm text-balance",
                            isHub ? "text-accent" : "text-on-surface",
                          )}
                        >
                          {node.label}
                        </span>
                        <span className="mt-1.5 block text-body-sm text-on-surface-variant">
                          {node.detail}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Mobile: the same sequence, stacked on a vertical rail. */}
          <div className="relative md:hidden">
            <div
              className="arch-rail-y absolute bottom-6 left-[1.4375rem] top-6 w-px bg-outline-variant"
              aria-hidden
            />
            <div
              className="absolute bottom-6 left-[calc(1.4375rem_-_1px)] top-6 w-[3px] overflow-hidden"
              aria-hidden
            >
              <span className="arch-pulse arch-pulse-y text-accent" />
            </div>
            <ol>
              {workflowNodes.map((node, index) => {
                const isHub = index === centerIndex;
                return (
                  <li
                    key={`${node.label}-${index}`}
                    className="arch-node relative flex items-start gap-4 py-3"
                    style={
                      {
                        "--arch-delay": `${LEAD_MS + index * STAGGER_MS}ms`,
                      } as CSSProperties
                    }
                  >
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-surface-low font-label tabular",
                        isHub
                          ? "border-accent text-accent"
                          : "border-outline-variant text-on-surface-faint",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 pt-1.5">
                      <span
                        className={cn(
                          "block text-headline-sm",
                          isHub ? "text-accent" : "text-on-surface",
                        )}
                      >
                        {node.label}
                      </span>
                      <span className="mt-1 block text-body-sm text-on-surface-variant">
                        {node.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
