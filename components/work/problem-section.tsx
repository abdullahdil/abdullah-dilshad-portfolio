import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CaseStudy } from "@/lib/content/types";

type ProblemSectionProps = {
  study: CaseStudy;
};

export function ProblemSection({ study }: ProblemSectionProps) {
  return (
    <Section divider aria-labelledby="problem-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Problem</p>
        <h2
          id="problem-heading"
          className="mt-3 font-heading text-headline-lg text-balance text-on-surface"
        >
          The challenge
        </h2>

        <p className="mt-6 text-lead text-pretty">{study.businessProblem}</p>
        <p className="mt-5 text-body-lg text-pretty text-on-surface-variant">
          {study.beforeState}
        </p>

        {study.beforeIssues.length > 0 ? (
          <>
            <p className="mt-12 font-label text-on-surface-faint">Before</p>
            <ul className="mt-4">
              {study.beforeIssues.map((issue, index) => (
                <li
                  key={issue}
                  className="grid grid-cols-[2.25rem_1fr] gap-x-4 border-t border-outline-variant py-5 last:border-b"
                >
                  <span className="font-label pt-1 text-on-surface-faint tabular">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-body-md text-pretty text-on-surface-variant">
                    {issue}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Container>
    </Section>
  );
}
