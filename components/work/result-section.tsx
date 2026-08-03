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
          <p className="max-w-3xl text-body-lg text-on-surface-variant">
            {study.result}
          </p>
        </div>
      </Container>
    </section>
  );
}
