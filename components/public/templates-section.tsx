import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PublicTemplate } from "@/lib/repositories/templates";

type TemplatesSectionProps = {
  templates: PublicTemplate[];
  n8nProfileUrl: string | null;
};

/** Public templates — links are exactly what the CMS / seed holds; none invented. */
export function TemplatesSection({ templates, n8nProfileUrl }: TemplatesSectionProps) {
  const linked = templates.filter((template) => template.externalUrl);
  if (linked.length === 0) return null;

  return (
    <Section id="templates" divider aria-labelledby="templates-title">
      <Container>
        <SectionHeading
          eyebrow="Open source"
          title="Public n8n templates"
          titleId="templates-title"
          description="Reusable workflows published in the official n8n template library."
          action={
            n8nProfileUrl ? (
              <Button
                href={n8nProfileUrl}
                variant="outline"
                size="sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Creator profile
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Button>
            ) : null
          }
        />

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {linked.map((template) => (
            <li key={template.title} className="flex">
              <a
                href={template.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="panel panel-depth lift group flex w-full flex-col px-5 py-5 md:px-6 md:py-6"
              >
                <span className="font-heading block text-body-lg font-semibold text-balance tracking-[-0.015em] text-on-surface transition-colors group-hover:text-accent">
                  {template.title}
                </span>
                <span className="mt-2 block text-body-sm text-pretty text-on-surface-variant">
                  {template.description}
                </span>
                {template.tools.length > 0 ? (
                  <span className="font-label mt-4 block text-on-surface-faint">
                    {template.tools.join(" · ")}
                  </span>
                ) : null}
                <span className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <span className="font-label tabular text-on-surface-faint">
                    {template.engagementCount
                      ? `${template.engagementCount.toLocaleString("en-US")} engagements`
                      : ""}
                  </span>
                  <span className="inline-flex items-center gap-1 text-body-sm font-medium text-on-surface-variant transition-colors group-hover:text-accent">
                    View on n8n
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
