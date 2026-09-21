"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { WorkflowCard } from "@/components/public/workflow-card";
import { cn } from "@/lib/utils";
import type { PublicWorkflowGroup } from "@/lib/repositories/site-content";

const LIST_PAGE_SIZE = 6;

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

            {/* Cards, not rows: the preview has to be big enough to read, which
                a horizontal list cannot give it. One column below 640px, two
                above — each card's preview is then ~320px+ wide on desktop. */}
            <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {visibleItems.map((workflow, index) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  position={index + 1}
                />
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
