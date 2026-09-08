import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type ResultSectionProps = {
  study: CaseStudy;
};

export function ResultSection({ study }: ResultSectionProps) {
  return (
    <section className="mb-16 md:mb-20" aria-labelledby="result-heading">
      <Container>
        <div className="rounded-lg border border-outline-variant/10 bg-surface-container p-8 md:p-12">
          <p className="mb-3 font-label uppercase text-primary">Result</p>
          <h2
            id="result-heading"
            className="mb-4 font-heading text-headline-lg text-on-surface"
          >
            What changed
          </h2>

          {study.resultMetrics && study.resultMetrics.length > 0 ? (
            <dl className="mb-8 grid grid-cols-1 gap-6 border-b border-outline-variant pb-8 sm:grid-cols-3">
              {study.resultMetrics.map((metric) => (
                <div key={metric.label}>
                  <dt className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-none tracking-tight text-accent">
                    {metric.value}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {metric.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <p className="max-w-3xl text-body-lg text-on-surface-variant">
            {study.result}
          </p>
        </div>
      </Container>
    </section>
  );
}
