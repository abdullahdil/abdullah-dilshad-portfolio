import { Container } from "@/components/ui/container";
import { ToolChip } from "@/components/ui/tool-chip";
import type { CaseStudy } from "@/lib/content/types";

type ToolsContributionProps = {
  study: CaseStudy;
};

export function ToolsContribution({ study }: ToolsContributionProps) {
  return (
    <section className="mb-20 md:mb-28" aria-labelledby="tools-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2
              id="tools-heading"
              className="mb-6 font-heading text-headline-lg text-on-surface"
            >
              Tools
            </h2>
            <ul className="flex flex-wrap gap-2">
              {study.tools.map((tool) => (
                <li key={tool.name}>
                  <ToolChip>
                    {tool.category ? `${tool.name} · ${tool.category}` : tool.name}
                  </ToolChip>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-6 font-heading text-headline-lg text-on-surface">
              Contribution
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {study.contribution.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-outline-variant/30 bg-surface-container px-4 py-3 text-body-md text-on-surface"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
