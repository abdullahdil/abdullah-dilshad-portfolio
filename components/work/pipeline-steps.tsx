import { Zap } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type PipelineStepsProps = {
  study: CaseStudy;
};

export function PipelineSteps({ study }: PipelineStepsProps) {
  return (
    <section className="mb-20 md:mb-28" aria-labelledby="pipeline-heading">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-24">
              <h2
                id="pipeline-heading"
                className="mb-6 font-heading text-headline-lg text-on-surface"
              >
                Workflow Pipeline
              </h2>
              <p className="mb-8 text-on-surface-variant">
                How the system moves work from intake through execution with
                validation, approvals, and logging along the way.
              </p>
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5" aria-hidden />
                  <span className="font-label uppercase">Outcome focus</span>
                </div>
                <p className="text-body-md text-on-surface">{study.result}</p>
              </div>
            </div>
          </div>

          <ol className="relative space-y-10 border-l border-outline-variant/30 pl-10 md:pl-12 lg:w-2/3">
            {study.steps.map((step) => (
              <li key={step.stepNumber} className="relative">
                <div className="absolute -left-[3.35rem] top-0 flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container font-label text-primary md:-left-[3.85rem]">
                  {String(step.stepNumber).padStart(2, "0")}
                </div>
                <h3 className="mb-3 font-heading text-headline-md text-on-surface">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
