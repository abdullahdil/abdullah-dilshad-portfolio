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
      className="border-y border-outline-variant bg-surface-low py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-none px-margin-mobile md:px-margin-desktop xl:px-16">
        <div className="mb-10 max-w-2xl md:mb-12">
          <p className="section-eyebrow mb-3">Architecture</p>
          <h2 id="architecture-heading" className="font-heading text-headline-lg text-on-surface">
            System overview
          </h2>
          {summary ? (
            <p className="mt-3 text-body-md text-on-surface-variant">{summary}</p>
          ) : null}
        </div>

        <div className="relative hidden md:block">
          <div
            className="absolute left-[3%] right-[3%] top-8 h-px bg-outline-variant"
            aria-hidden
          />

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
                      "flex items-center justify-center rounded-md border",
                      isHub
                        ? "h-16 w-16 border-accent bg-accent text-on-accent"
                        : "h-14 w-14 border-outline-variant bg-surface-high text-on-surface",
                    )}
                  >
                    {isHub ? (
                      <Workflow className="h-6 w-6" aria-hidden />
                    ) : (
                      <span className="font-heading text-lg tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="max-w-[9.5rem]">
                    <p
                      className={cn(
                        "text-sm font-medium leading-snug text-on-surface",
                        isHub && "text-accent",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-on-surface-variant">
                      {node.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative md:hidden">
          <div
            className="absolute bottom-3 left-5 top-3 w-px bg-outline-variant"
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
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                      isHub
                        ? "border-accent bg-accent text-on-accent"
                        : "border-outline-variant bg-surface-high text-on-surface",
                    )}
                  >
                    {isHub ? (
                      <Workflow className="h-4 w-4" aria-hidden />
                    ) : (
                      <span className="text-xs tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className={cn(
                        "text-base font-medium leading-snug text-on-surface",
                        isHub && "text-accent",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">{node.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
