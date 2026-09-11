"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ToolChip } from "@/components/ui/tool-chip";
import { WorkflowAccessButton } from "@/components/public/workflow-access-button";
import { cn } from "@/lib/utils";
import type { PublicWorkflowGroup } from "@/lib/repositories/site-content";

const LIST_PAGE_SIZE = 6;
const GLYPH_WIDTH = 320;
const GLYPH_HEIGHT = 240;

/**
 * Every workflow gets a unique abstract "flow diagram" glyph, deterministically
 * generated from its id. Avoids real n8n canvas screenshots (which would expose
 * node/service names this catalog intentionally keeps client-agnostic) while
 * still giving each row a distinct marker instead of a repeated icon.
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
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
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

export function WorkflowsSection({
  groups,
}: {
  groups: PublicWorkflowGroup[];
}) {
  const [activeCategory, setActiveCategory] = useState(
    groups[0]?.category ?? "",
  );
  const [expanded, setExpanded] = useState(false);

  const activeGroup = useMemo(
    () =>
      groups.find((group) => group.category === activeCategory) ?? groups[0],
    [groups, activeCategory],
  );

  if (!activeGroup) {
    return null;
  }

  const visibleItems = expanded
    ? activeGroup.items
    : activeGroup.items.slice(0, LIST_PAGE_SIZE);
  const hasMore = activeGroup.items.length > LIST_PAGE_SIZE;

  function selectCategory(category: string) {
    setActiveCategory(category);
    setExpanded(false);
  }

  return (
    <Section id="workflows" tone="low" className="section-veil">
      <Container>
        <SectionHeading
          eyebrow="Workflows"
          title="Systems that replace manual work"
          description="Production automations that cut handoffs, reduce follow-up, and keep teams focused on decisions instead of busywork."
        />

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
          {/* Taxonomy rail */}
          <nav
            aria-label="Workflow categories"
            className="panel panel-depth px-5 py-5 lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
          >
            <p className="font-label mb-3 text-on-surface-faint">Categories</p>
            <ul className="hairline-t">
              {groups.map((group) => {
                const isActive = group.category === activeGroup.category;
                return (
                  <li
                    key={group.category}
                    className="border-b border-outline-variant last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => selectCategory(group.category)}
                      aria-pressed={isActive}
                      className={cn(
                        "group flex w-full items-baseline justify-between gap-4 py-3.5 text-left transition-colors duration-200",
                        isActive
                          ? "text-accent"
                          : "text-on-surface-variant hover:text-on-surface",
                      )}
                    >
                      <span className="flex items-baseline gap-2.5">
                        <span
                          className={cn(
                            "inline-block h-px w-4 shrink-0 translate-y-[-0.3em] transition-colors duration-200",
                            isActive ? "bg-accent" : "bg-outline-variant",
                          )}
                          aria-hidden
                        />
                        <span className="text-body-md font-medium">
                          {group.category}
                        </span>
                      </span>
                      <span className="font-label tabular shrink-0 text-on-surface-faint">
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Active group */}
          <div className="lg:col-span-8">
            <p className="max-w-[68ch] text-body-md text-pretty text-on-surface-variant">
              {activeGroup.description}
            </p>

            <ol className="mt-8 hairline-t">
              {visibleItems.map((workflow, index) => (
                <li
                  key={workflow.id}
                  className="hairline-b flex items-start gap-4 py-6 sm:gap-6"
                >
                  <span className="font-label tabular hidden shrink-0 pt-1 text-on-surface-faint sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md border border-outline-variant bg-surface-high text-accent sm:w-20">
                    {workflow.imageUrl ? (
                      <Image
                        src={workflow.imageUrl}
                        alt={workflow.imageAlt || workflow.title}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <WorkflowGlyph seed={workflow.id} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-headline-sm text-balance text-on-surface">
                      {workflow.title}
                    </h3>
                    <p className="mt-1.5 max-w-[62ch] text-body-sm text-pretty text-on-surface-variant">
                      {workflow.summary}
                    </p>
                    {workflow.outcomeTags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {workflow.outcomeTags.slice(0, 3).map((tag) => (
                          <ToolChip key={tag}>{tag}</ToolChip>
                        ))}
                      </div>
                    ) : null}

                    {/* Sits in its own block after the copy, outside any future
                        row-level click target, so row interaction stays intact. */}
                    <div className="mt-4">
                      <WorkflowAccessButton
                        workflowId={workflow.id}
                        workflowTitle={workflow.title}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {hasMore ? (
              <div className="mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded
                    ? "Show fewer"
                    : `See all ${activeGroup.items.length} workflows`}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
