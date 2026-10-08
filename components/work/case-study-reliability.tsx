import { ShieldCheck } from "lucide-react";
import type { ReliabilityControl } from "@/lib/content/types";

type CaseStudyReliabilityProps = {
  controls: ReliabilityControl[];
};

/** Reliability controls as a grid of name + description cards. */
export function CaseStudyReliability({ controls }: CaseStudyReliabilityProps) {
  if (controls.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {controls.map((control) => (
        <li key={control.name} className="panel panel-depth flex flex-col p-5">
          <p className="flex items-start gap-2.5 text-body-md font-medium text-on-surface">
            <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span className="text-balance">{control.name}</span>
          </p>
          {control.description ? (
            <p className="mt-2 text-body-sm text-pretty text-on-surface-variant">
              {control.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
