"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { ArchitectureNode, CaseStudyStep } from "@/lib/content/types";

export type ArchitectureStripNode = ArchitectureNode & {
  /** Steps on the record that mention this node — resolved on the server. */
  steps: Pick<CaseStudyStep, "stepNumber" | "title" | "description">[];
};

type CaseStudyArchitectureProps = {
  nodes: ArchitectureStripNode[];
  description?: string;
};

/**
 * The system as a pipeline of focusable stages. Horizontal from `md` up,
 * vertical below. Each stage is a real `<button>` with `aria-expanded`; the
 * open stage's detail shows inline under it on small screens and in a shared
 * panel under the strip on wide ones. Plain HTML/CSS — no canvas, no WebGL.
 */
export function CaseStudyArchitecture({ nodes, description }: CaseStudyArchitectureProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (nodes.length === 0) return null;

  const panelId = `${baseId}-panel`;
  const inlineId = (index: number) => `${baseId}-node-${index}`;
  const active = openIndex === null ? null : nodes[openIndex];

  return (
    <div>
      {description ? (
        <p className="max-w-[68ch] text-body-lg text-pretty text-on-surface-variant">
          {description}
        </p>
      ) : null}

      <ol
        aria-label="System architecture"
        className={cn(
          "grid gap-2 md:grid-cols-[repeat(var(--stages),minmax(0,1fr))] md:gap-0",
          description ? "mt-8" : undefined,
        )}
        style={{ ["--stages" as string]: nodes.length }}
      >
            {nodes.map((node, index) => {
              const isOpen = openIndex === index;
              const isLast = index === nodes.length - 1;
              return (
                <li key={`${node.label}-${index}`} className="relative flex flex-col">
                  {/* Connector: vertical on mobile, horizontal from md. */}
                  {!isLast ? (
                    <>
                      <span
                        aria-hidden
                        className="absolute left-[1.375rem] top-11 bottom-[-0.5rem] w-px bg-outline-variant md:hidden"
                      />
                      <span
                        aria-hidden
                        className="absolute top-[1.375rem] left-1/2 right-[-50%] hidden h-px bg-outline-variant md:block"
                      />
                    </>
                  ) : null}

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${inlineId(index)} ${panelId}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={cn(
                      "group relative z-10 flex items-center gap-3 rounded-md p-1 text-left transition-colors md:flex-col md:items-center md:gap-3 md:px-1 md:py-1 md:text-center",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[0.75rem] transition-colors duration-200",
                        isOpen
                          ? "border-accent bg-accent text-on-accent"
                          : "border-outline-variant bg-surface-container text-on-surface-variant group-hover:border-outline-strong group-hover:text-on-surface",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-body-sm font-medium transition-colors",
                          isOpen ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface",
                        )}
                      >
                        {node.label}
                      </span>
                      <span className="block text-[0.75rem] leading-snug text-on-surface-faint md:mt-0.5">
                        {node.detail}
                      </span>
                    </span>
                  </button>

                  {/* Inline detail — small screens only. */}
                  <div
                    id={inlineId(index)}
                    hidden={!isOpen}
                    className="ml-12 mt-1 mb-2 md:hidden"
                  >
                    {isOpen ? <NodeDetail node={node} /> : null}
                  </div>
                </li>
              );
            })}
      </ol>

      {/* Shared detail panel — md and up. */}
      <div
        id={panelId}
        aria-live="polite"
        className="mt-8 hidden min-h-[7rem] rounded-lg border border-outline-variant bg-surface-container p-6 md:block"
      >
        {active ? (
          <>
            <p className="font-label text-accent">
              Stage {String((openIndex ?? 0) + 1).padStart(2, "0")} · {active.label}
            </p>
            <div className="mt-3">
              <NodeDetail node={active} />
            </div>
          </>
        ) : (
          <p className="text-body-sm text-on-surface-faint">
            Select a stage to see what it does.
          </p>
        )}
      </div>
    </div>
  );
}

function NodeDetail({ node }: { node: ArchitectureStripNode }) {
  if (node.steps.length === 0) {
    return <p className="text-body-sm text-on-surface-variant">{node.detail}</p>;
  }
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {node.steps.map((step) => (
        <li key={step.stepNumber} className="text-body-sm">
          <p className="font-medium text-on-surface">
            <span className="tabular mr-2 font-mono text-on-surface-faint">
              {String(step.stepNumber).padStart(2, "0")}
            </span>
            {step.title}
          </p>
          <p className="mt-1 text-pretty text-on-surface-variant">{step.description}</p>
        </li>
      ))}
    </ul>
  );
}
