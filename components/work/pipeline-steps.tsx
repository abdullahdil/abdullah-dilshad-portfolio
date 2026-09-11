import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CaseStudy } from "@/lib/content/types";

type PipelineStepsProps = {
  study: CaseStudy;
};

export function PipelineSteps({ study }: PipelineStepsProps) {
  if (study.steps.length === 0) return null;

  return (
    <Section divider aria-labelledby="pipeline-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Pipeline</p>
        <h2 id="pipeline-heading" className="mt-3 font-heading text-headline-lg text-balance text-on-surface">
          How the workflow runs
        </h2>
        <p className="mt-6 text-lead text-pretty">
          Work moves from intake through execution, with validation, approvals,
          and logging along the way.
        </p>

        <ol className="mt-12">
          {study.steps.map((step) => (
            <li
              key={step.stepNumber}
              className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-outline-variant py-7 last:border-b sm:grid-cols-[4rem_1fr] sm:gap-x-6 sm:py-8"
            >
              <span className="font-label pt-1.5 text-on-surface-faint tabular">
                {String(step.stepNumber).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-headline-md text-balance text-on-surface">
                  {step.title}
                </h3>
                <p className="mt-3 text-body-md text-pretty text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
