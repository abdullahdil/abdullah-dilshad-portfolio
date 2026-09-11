import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ToolChip } from "@/components/ui/tool-chip";
import type { CaseStudy } from "@/lib/content/types";

type ToolsContributionProps = {
  study: CaseStudy;
};

export function ToolsContribution({ study }: ToolsContributionProps) {
  if (study.tools.length === 0 && study.contribution.length === 0) return null;

  return (
    <Section divider aria-labelledby="tools-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="section-eyebrow">My role</p>
            <h2 id="tools-heading" className="mt-3 font-heading text-headline-lg text-balance text-on-surface">
              What I built
            </h2>
            {study.contribution.length > 0 ? (
              <ul className="mt-10">
                {study.contribution.map((item, index) => (
                  <li
                    key={item}
                    className="grid grid-cols-[2.25rem_1fr] gap-x-4 border-t border-outline-variant py-5 last:border-b"
                  >
                    <span className="font-label pt-1 text-on-surface-faint tabular">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-body-md text-pretty text-on-surface">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {study.tools.length > 0 ? (
            <div className="lg:col-span-5">
              <h3 className="font-label text-on-surface-faint">Tools</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {study.tools.map((tool) => (
                  <li key={tool.name}>
                    <ToolChip>
                      {tool.category ? `${tool.name} · ${tool.category}` : tool.name}
                    </ToolChip>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
