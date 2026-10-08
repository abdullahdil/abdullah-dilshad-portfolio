/**
 * A case study as a rich card on the `/work` hub. Every line is read off the
 * study record — domain, what it replaced (the "before" state), step count,
 * the first reliability controls and tools — so each card is distinct without
 * a word of new copy. The preview is the study's primary real canvas, when one
 * is linked.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { condense } from "@/components/work/case-study-content";
import { WorkflowCanvasThumbnail } from "@/components/public/workflow-canvas-thumbnail";
import { ToolChip } from "@/components/ui/tool-chip";
import type { CaseStudy } from "@/lib/content/types";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

export type CaseStudyHubCardProps = {
  study: CaseStudy;
  /** 1-based index, drawn as "Case 01". */
  index: number;
  canvas?: WorkflowCanvas | null;
};

export function CaseStudyHubCard({ study, index, canvas }: CaseStudyHubCardProps) {
  const href = `/work/${study.slug}`;
  const replaced = condense(study.beforeState || study.businessProblem, 150, 190);
  const controls = study.reliabilityControls.slice(0, 3);
  const tools = study.tools.slice(0, 4);
  const titleId = `case-${study.slug}`;

  return (
    <li className="group panel panel-depth lift relative flex flex-col overflow-hidden">
      <Link
        href={href}
        aria-labelledby={titleId}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        {canvas && canvas.nodes.length > 0 ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-outline-variant">
            <WorkflowCanvasThumbnail canvas={canvas} />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-label tabular text-on-surface-faint">
              {`Case ${String(index).padStart(2, "0")}`}
            </span>
            {study.previewLabel ? (
              <span className="font-label text-accent">{study.previewLabel}</span>
            ) : null}
          </div>

          <h3
            id={titleId}
            className="mt-3 font-heading text-headline-md text-balance text-on-surface"
          >
            {study.title}
          </h3>
          <p className="mt-3 text-body-md text-pretty text-on-surface-variant">
            {condense(study.summary, 180, 220)}
          </p>

          <dl className="mt-6 grid gap-4 border-t border-outline-variant pt-5 text-body-sm">
            {replaced ? (
              <div>
                <dt className="font-label text-on-surface-faint">What it replaced</dt>
                <dd className="mt-1 text-pretty text-on-surface">{replaced}</dd>
              </div>
            ) : null}
            {study.steps.length > 0 ? (
              <div>
                <dt className="font-label text-on-surface-faint">Pipeline</dt>
                <dd className="mt-1 text-on-surface">
                  {`${study.steps.length} steps, ${study.steps[0].title.toLowerCase()} → ${study.steps[study.steps.length - 1].title.toLowerCase()}`}
                </dd>
              </div>
            ) : null}
            {controls.length > 0 ? (
              <div>
                <dt className="font-label text-on-surface-faint">Key controls</dt>
                <dd className="mt-1">
                  <ul className="flex flex-col gap-1 text-on-surface">
                    {controls.map((control) => (
                      <li key={control.name} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {control.name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>

          {tools.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {tools.map((tool) => (
                <ToolChip key={tool.name}>{tool.name}</ToolChip>
              ))}
            </div>
          ) : null}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-body-sm font-medium text-on-surface">
            Read the case study
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </span>
        </div>
      </div>
    </li>
  );
}
