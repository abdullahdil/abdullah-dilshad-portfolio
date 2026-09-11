import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CaseStudy } from "@/lib/content/types";

type ResultSectionProps = {
  study: CaseStudy;
};

export function ResultSection({ study }: ResultSectionProps) {
  const metrics = study.resultMetrics ?? [];

  return (
    <Section divider aria-labelledby="result-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Result</p>
        <h2 id="result-heading" className="mt-3 font-heading text-headline-lg text-balance text-on-surface">
          What changed
        </h2>
        <p className="mt-6 text-lead text-pretty">{study.result}</p>
      </Container>

      {metrics.length > 0 ? (
        <Container className="mt-12 md:mt-16">
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-t border-outline-variant pt-6">
                <dt className="font-heading text-display-lg tabular text-on-surface">
                  {metric.value}
                </dt>
                <dd className="mt-3 max-w-[26ch] text-body-sm text-pretty text-on-surface-variant">
                  {metric.label}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      ) : null}
    </Section>
  );
}
