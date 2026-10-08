import { ChevronDown } from "lucide-react";
import type { CaseStudyStep } from "@/lib/content/types";

type CaseStudyStepsProps = {
  steps: CaseStudyStep[];
};

/**
 * The pipeline as a compact numbered timeline. Titles are always visible so
 * the sequence scans in seconds; each description sits behind a native
 * `<details>` disclosure — keyboard- and screen-reader-accessible with no
 * client JavaScript.
 */
export function CaseStudySteps({ steps }: CaseStudyStepsProps) {
  if (steps.length === 0) return null;

  const ordered = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <ol className="relative grid gap-x-10 md:grid-cols-2">
      {ordered.map((step) => (
        <li key={step.stepNumber} className="hairline-b">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start gap-4 py-4 text-left marker:hidden [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <span className="tabular mt-0.5 w-6 shrink-0 font-mono text-[0.75rem] text-accent">
                {String(step.stepNumber).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-body-md font-medium text-on-surface">
                {step.title}
              </span>
              <ChevronDown
                aria-hidden
                className="mt-1 h-4 w-4 shrink-0 text-on-surface-faint transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="-mt-1 pb-5 pl-10 pr-8 text-body-sm text-pretty text-on-surface-variant">
              {step.description}
            </p>
          </details>
        </li>
      ))}
    </ol>
  );
}
