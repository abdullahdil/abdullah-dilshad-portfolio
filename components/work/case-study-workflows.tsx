import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WorkflowCanvasThumbnail } from "@/components/public/workflow-canvas-thumbnail";
import { ToolChip } from "@/components/ui/tool-chip";
import { cn } from "@/lib/utils";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

type CaseStudyWorkflowsProps = {
  /**
   * Already resolved by `getPublishedCaseStudyWorkflows` — the repository owns
   * both the Supabase read and the seed fallback, so this component never
   * touches data of its own.
   */
  workflows: PublicWorkflowListing[];
};

/** `/workflows/[slug]` — the listing id is the workflow slug. */
export function workflowHref(workflow: Pick<PublicWorkflowListing, "id">): string {
  return `/workflows/${encodeURIComponent(workflow.id)}`;
}

/**
 * The real workflows behind a case study, each linking to its own page where
 * the full canvas can be explored. Server-rendered: the thumbnail is a static
 * SVG, so this grid ships no client JavaScript.
 *
 * The grid is sized to the count so it never strands an orphan card: one
 * card is centred at a readable width, two sit side by side and centred,
 * three or more flow into three columns.
 *
 * Renders nothing when a study has no linked workflows.
 */
export function CaseStudyWorkflows({ workflows }: CaseStudyWorkflowsProps) {
  if (workflows.length === 0) return null;

  const count = workflows.length;
  const layout =
    count === 1
      ? "mx-auto max-w-xl"
      : count === 2
        ? "mx-auto max-w-4xl sm:grid-cols-2"
        : count === 4
          ? "sm:grid-cols-2"
          : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={cn("grid grid-cols-1 gap-5", layout)}>
      {workflows.map((workflow) => {
        const canvas =
          workflow.canvas && workflow.canvas.nodes.length > 0 ? workflow.canvas : null;
        return (
          <li key={workflow.id} className="min-w-0">
            <Link
              href={workflowHref(workflow)}
              className="group panel panel-depth lift flex h-full flex-col overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-outline-variant bg-surface-lowest text-accent">
                {canvas ? (
                  <WorkflowCanvasThumbnail canvas={canvas} />
                ) : (
                  <div
                    aria-hidden
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, var(--outline-variant) 0 1px, transparent 1px 9px)",
                    }}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="flex items-start justify-between gap-3 font-heading text-headline-sm text-balance text-on-surface">
                  {workflow.title}
                  <ArrowUpRight
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-faint transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none"
                  />
                </h3>
                {workflow.summary ? (
                  <p className="mt-2 line-clamp-3 text-body-sm text-pretty text-on-surface-variant">
                    {workflow.summary}
                  </p>
                ) : null}
                {workflow.outcomeTags.length > 0 ? (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {workflow.outcomeTags.slice(0, 3).map((tag) => (
                      <ToolChip key={tag}>{tag}</ToolChip>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
