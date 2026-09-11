import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicProfile } from "@/lib/repositories/profile";
import { listPublishedTemplates } from "@/lib/repositories/templates";

export async function TemplatesSection() {
  const [profile, templates] = await Promise.all([
    getPublicProfile(),
    listPublishedTemplates(),
  ]);

  return (
    <Section id="templates" divider>
      <Container>
        <SectionHeading
          eyebrow="Open source"
          title="Public n8n templates"
          description="Reusable workflows published on the n8n creator profile."
          className="mb-12 md:mb-16"
          action={
            profile.n8nProfileUrl ? (
              <Button
                href={profile.n8nProfileUrl}
                variant="outline"
                size="sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                View creator profile
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Button>
            ) : null
          }
        />

        <ul className="mt-2 hairline-t">
          {templates.map((template, index) => (
            <li key={template.title} className="hairline-b">
              <a
                href={template.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-3 py-7 md:grid-cols-[3rem_1fr_auto] md:items-baseline md:gap-8"
              >
                <span className="font-label tabular text-on-surface-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="block max-w-[68ch]">
                  <span className="font-heading block text-headline-sm text-balance text-on-surface">
                    {template.title}
                  </span>
                  <span className="mt-1.5 block text-body-sm text-pretty text-on-surface-variant">
                    {template.description}
                  </span>
                  <span className="mt-3 block font-label tabular text-on-surface-faint">
                    {template.tools.join(" · ")}
                    {template.engagementCount
                      ? ` · ${template.engagementCount} engagements`
                      : ""}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant transition-colors group-hover:text-accent">
                  <span className="link-underline">View on n8n</span>
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
