import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CaseStudy } from "@/lib/content/types";

type ReliabilitySectionProps = {
  study: CaseStudy;
};

export function ReliabilitySection({ study }: ReliabilitySectionProps) {
  if (study.reliabilityControls.length === 0) return null;

  return (
    <Section tone="low" className="section-veil" aria-labelledby="reliability-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Reliability</p>
        <h2 id="reliability-heading" className="mt-3 font-heading text-headline-lg text-balance text-on-surface">
          Reliability and governance
        </h2>
        <p className="mt-6 text-lead text-pretty">
          Each control below exists for a specific failure mode — invalid input,
          a repeated trigger, a failing API call, or a case a person should
          decide.
        </p>

        <dl className="mt-12">
          {study.reliabilityControls.map((control, index) => (
            <div
              key={control.name}
              className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-outline-variant py-7 last:border-b sm:grid-cols-[4rem_1fr] sm:gap-x-6 sm:py-8"
            >
              <span className="font-label pt-1.5 text-on-surface-faint tabular">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <dt className="font-heading text-headline-md text-balance text-on-surface">
                  {control.name}
                </dt>
                <dd className="mt-3 text-body-md text-pretty text-on-surface-variant">
                  {control.description}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
