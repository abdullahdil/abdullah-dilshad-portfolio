import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";
import { listPublishedTemplates } from "@/lib/repositories/templates";

export async function TemplatesSection() {
  const [profile, templates] = await Promise.all([
    getPublicProfile(),
    listPublishedTemplates(),
  ]);

  return (
    <Section id="templates" tone="container">
      <Container>
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-eyebrow mb-3">Open source</p>
            <h2 className="font-heading text-headline-lg text-on-surface">
              Public n8n templates
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant">
              Reusable workflows published on the n8n creator profile.
            </p>
          </div>
          {profile.n8nProfileUrl ? (
            <Button
              href={profile.n8nProfileUrl}
              variant="outline"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View creator profile
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <a
              key={template.title}
              href={template.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-lg border border-outline-variant bg-surface-low p-6 transition-colors hover:border-outline hover:bg-surface-high"
            >
              <Badge tone="primary" className="mb-4 w-fit">
                Template
              </Badge>
              <h3 className="font-heading text-headline-md leading-snug text-on-surface">
                {template.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-on-surface-variant">
                {template.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {template.tools.map((tool) => (
                  <Badge key={tool}>{tool}</Badge>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-on-surface group-hover:text-accent">
                View on n8n
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
