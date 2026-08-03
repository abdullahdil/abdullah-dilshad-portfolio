import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type ProblemSectionProps = {
  study: CaseStudy;
};

export function ProblemSection({ study }: ProblemSectionProps) {
  return (
    <section className="mb-24 md:mb-32" aria-labelledby="problem-heading">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="glass-card relative col-span-12 overflow-hidden rounded-lg p-8 md:col-span-8">
            <div
              className="pointer-events-none absolute right-0 top-0 h-64 w-64 bg-primary/10 blur-[100px]"
              aria-hidden
            />
            <h2
              id="problem-heading"
              className="relative mb-6 font-heading text-headline-md text-on-surface"
            >
              The Challenge
            </h2>
            <p className="relative mb-6 text-body-lg leading-relaxed text-on-surface-variant">
              {study.businessProblem}
            </p>
            <p className="relative mb-6 text-body-md text-on-surface-variant">
              {study.beforeState}
            </p>
            <ul className="relative space-y-3">
              {study.beforeIssues.map((issue) => (
                <li
                  key={issue}
                  className="rounded-lg border border-outline-variant/10 bg-surface-high px-4 py-3 text-sm text-on-surface-variant"
                >
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card col-span-12 flex flex-col justify-between rounded-lg p-8 md:col-span-4">
            <div>
              <h3 className="mb-6 font-heading text-headline-md text-on-surface">
                Core Impact
              </h3>
              <ul className="space-y-4">
                {study.contribution.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="text-on-surface">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                Result focus
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">{study.result}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
