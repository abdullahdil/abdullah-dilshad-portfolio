"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { workflowGroups } from "@/lib/content/workflows";

const CARD_PAGE_SIZE = 8;
const GLYPH_WIDTH = 320;
const GLYPH_HEIGHT = 240;

/**
 * Every workflow gets a unique abstract "flow diagram" glyph, deterministically
 * generated from its id. Avoids real n8n canvas screenshots (which would expose
 * node/service names this catalog intentionally keeps client-agnostic) while
 * still giving each card a distinct visual instead of a repeated icon.
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
type GlyphEdge = { from: number; to: number; opacity: number };

function buildGlyph(seed: string): { nodes: GlyphNode[]; edges: GlyphEdge[] } {
  const random = mulberry32(hashSeed(seed));
  const nodeCount = 5 + Math.floor(random() * 3);
  const nodes: GlyphNode[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const t = nodeCount === 1 ? 0.5 : i / (nodeCount - 1);
    const x = 30 + t * (GLYPH_WIDTH - 60) + (random() - 0.5) * 22;
    const y = GLYPH_HEIGHT / 2 + (random() - 0.5) * (GLYPH_HEIGHT * 0.5);
    const hub = i === 0 || i === nodeCount - 1 || random() > 0.65;
    const r = hub ? 7 + random() * 3 : 3 + random() * 2.5;
    nodes.push({ x, y, r, hub });
  }

  const edges: GlyphEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ from: i, to: i + 1, opacity: 0.35 + random() * 0.3 });
  }
  if (nodes.length > 3 && random() > 0.4) {
    const from = Math.floor(random() * (nodes.length - 2));
    const to = Math.min(from + 2 + Math.floor(random() * 2), nodes.length - 1);
    if (to > from + 1) {
      edges.push({ from, to, opacity: 0.2 + random() * 0.2 });
    }
  }

  return { nodes, edges };
}

function WorkflowGlyph({ seed }: { seed: string }) {
  const { nodes, edges } = useMemo(() => buildGlyph(seed), [seed]);

  return (
    <svg
      viewBox={`0 0 ${GLYPH_WIDTH} ${GLYPH_HEIGHT}`}
      className="h-full w-full"
      aria-hidden
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
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeOpacity={edge.opacity}
          />
        );
      })}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill="var(--accent)"
          fillOpacity={node.hub ? 0.18 : 0}
          stroke="var(--accent)"
          strokeWidth={node.hub ? 1.5 : 1.25}
          strokeOpacity={node.hub ? 0.8 : 0.5}
        />
      ))}
    </svg>
  );
}

export function WorkflowsSection() {
  const [activeCategory, setActiveCategory] = useState(
    workflowGroups[0]?.category ?? "",
  );
  const [expanded, setExpanded] = useState(false);

  const activeGroup = useMemo(
    () =>
      workflowGroups.find((group) => group.category === activeCategory) ??
      workflowGroups[0],
    [activeCategory],
  );

  if (!activeGroup) {
    return null;
  }

  const visibleItems = expanded
    ? activeGroup.items
    : activeGroup.items.slice(0, CARD_PAGE_SIZE);
  const hasMore = activeGroup.items.length > CARD_PAGE_SIZE;

  function selectCategory(category: string) {
    setActiveCategory(category);
    setExpanded(false);
  }

  return (
    <Section id="workflows" tone="lowest">
      <Container>
        <div className="mb-10 max-w-2xl">
          <p className="section-eyebrow mb-3">Workflows</p>
          <h2 className="font-heading text-headline-lg text-on-surface">
            Systems that replace manual work
          </h2>
          <p className="mt-3 text-body-md text-on-surface-variant">
            Production automations that cut handoffs, reduce follow-up, and keep
            teams focused on decisions instead of busywork.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3" aria-label="Workflow categories">
          {workflowGroups.map((group) => {
            const isActive = group.category === activeGroup.category;
            return (
              <button
                key={group.category}
                type="button"
                onClick={() => selectCategory(group.category)}
                aria-pressed={isActive}
                className={cn(
                  "whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-outline-variant bg-surface-high text-on-surface-variant hover:border-outline hover:text-on-surface",
                )}
              >
                {group.category}
              </button>
            );
          })}
        </div>

        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          {activeGroup.description}
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems.map((workflow) => (
            <div
              key={workflow.id}
              className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-low transition-colors hover:border-outline hover:bg-surface-high"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-surface-high to-surface-container">
                <div
                  className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl"
                  aria-hidden
                />
                <WorkflowGlyph seed={workflow.id} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-base font-medium text-on-surface">
                  {workflow.title}
                </h3>
                <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-on-surface-variant">
                  {workflow.summary}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show fewer" : `See all ${activeGroup.items.length} workflows`}
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
