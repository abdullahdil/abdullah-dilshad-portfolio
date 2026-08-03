import {
  ArrowUpRight,
  AudioLines,
  FormInput,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";
import { listPublishedTemplates } from "@/lib/repositories/templates";

const icons: LucideIcon[] = [Newspaper, FormInput, AudioLines];

export async function TemplatesSection() {
  const [profile, templates] = await Promise.all([
    getPublicProfile(),
    listPublishedTemplates(),
  ]);

  return (
    <Section id="templates" tone="container">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <div>
            <h2 className="font-heading text-headline-lg text-on-surface">
              Public n8n Work
            </h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Open templates published on the n8n creator profile.
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {templates.map((template, index) => {
            const Icon = icons[index] ?? Newspaper;
            return (
              <a
                key={template.title}
                href={template.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-lg border border-outline-variant/10 bg-surface-low p-6 transition-colors hover:border-primary/40 hover:bg-surface-bright"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <Badge tone="primary">Public template</Badge>
                </div>
                <h3 className="mb-3 font-heading text-xl leading-snug text-on-surface">
                  {template.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-on-surface-variant">
                  {template.description}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {template.tools.map((tool) => (
                    <Badge key={tool}>{tool}</Badge>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-1 font-label uppercase text-primary group-hover:underline">
                  View on n8n
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </a>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
