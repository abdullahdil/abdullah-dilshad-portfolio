import { Workflow } from "lucide-react";
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

export function ArchitectureDiagram({
  nodes,
  description,
  steps = [],
  tools = [],
}: ArchitectureDiagramProps) {
  const workflowNodes = resolveWorkflowNodes(nodes, steps, tools);

  if (workflowNodes.length === 0) return null;

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

  return (
    <section
      aria-labelledby="architecture-heading"
      className="relative mb-20 overflow-hidden border-y border-outline-variant/10 bg-surface-lowest py-14 md:mb-28 md:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 kinetic-gradient opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1.5px 1.5px, rgba(45,212,191,0.55) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-primary/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-none px-margin-mobile md:px-margin-desktop xl:px-16">
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-3 font-label text-[11px] uppercase tracking-[0.2em] text-primary">
            Overall workflow
          </p>
          <h2
            id="architecture-heading"
            className="mb-4 font-heading text-headline-lg text-on-surface"
          >
            The big picture
          </h2>
          {summary ? (
            <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">
              {summary}
            </p>
          ) : null}
        </div>

        {/* Desktop / tablet: horizontal big-picture flow */}
        <div className="relative hidden md:block">
          <div
            className="absolute left-[3%] right-[3%] top-[2.75rem] h-px overflow-hidden opacity-50"
            aria-hidden
          >
            <div className="workflow-flow-line h-full w-full" />
          </div>

          <ol
            className="relative z-10 grid items-start gap-3 lg:gap-4"
            style={{
              gridTemplateColumns: `repeat(${workflowNodes.length}, minmax(0, 1fr))`,
            }}
          >
            {workflowNodes.map((node, index) => {
              const isHub = index === centerIndex;
              return (
                <li
                  key={`${node.label}-${index}`}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div
                    className={cn(
                      "workflow-node flex items-center justify-center rounded-2xl border transition-colors",
                      isHub
                        ? "h-[5.5rem] w-[5.5rem] border-primary bg-primary text-on-primary glow-accent"
                        : "h-[4.5rem] w-[4.5rem] border-outline-variant/25 bg-surface-high/90 text-primary glow-hover backdrop-blur-sm",
                    )}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {isHub ? (
                      <Workflow className="h-9 w-9" aria-hidden />
                    ) : (
                      <span className="font-heading text-xl tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="max-w-[9.5rem]">
                    <p
                      className={cn(
                        "font-heading text-base leading-snug text-on-surface",
                        isHub && "font-semibold text-primary",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">
                      {node.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Mobile: vertical big-picture spine */}
        <div className="relative md:hidden">
          <div
            className="absolute bottom-3 left-[1.4rem] top-3 w-px bg-gradient-to-b from-primary/60 via-primary/35 to-primary/15"
            aria-hidden
          />
          <ol className="space-y-5">
            {workflowNodes.map((node, index) => {
              const isHub = index === centerIndex;
              return (
                <li
                  key={`${node.label}-${index}`}
                  className="relative flex items-start gap-4"
                >
                  <div
                    className={cn(
                      "relative z-10 flex h-[2.85rem] w-[2.85rem] shrink-0 items-center justify-center rounded-xl border",
                      isHub
                        ? "border-primary bg-primary text-on-primary glow-accent"
                        : "border-outline-variant/25 bg-surface-high text-primary",
                    )}
                  >
                    {isHub ? (
                      <Workflow className="h-5 w-5" aria-hidden />
                    ) : (
                      <span className="font-label text-xs tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <p
                      className={cn(
                        "font-heading text-lg leading-snug text-on-surface",
                        isHub && "text-primary",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {node.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-10 text-center font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant md:mt-12">
          {workflowNodes.length} stages · end-to-end system view
        </p>
      </div>
    </section>
  );
}
