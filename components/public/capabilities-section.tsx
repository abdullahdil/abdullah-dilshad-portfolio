import { Brain, Plug, Terminal, Workflow, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { listPublishedCapabilities } from "@/lib/repositories/capabilities";

const iconMap: Record<"Workflow" | "Brain" | "Plug" | "Terminal", LucideIcon> = {
  Workflow,
  Brain,
  Plug,
  Terminal,
};

export async function CapabilitiesSection() {
  const capabilities = await listPublishedCapabilities();

  return (
    <Section id="capabilities" tone="lowest">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="section-eyebrow mb-3">Capabilities</p>
          <h2 className="font-heading text-headline-lg text-on-surface">
            What I work with
          </h2>
          <p className="mt-3 text-body-md text-on-surface-variant">
            Tools and practices used across production automation projects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {capabilities.map((group) => {
            const Icon = iconMap[group.icon];
            return (
              <div
                key={group.category}
                className="rounded-lg border border-outline-variant bg-surface-low p-6 md:p-8"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant bg-surface-high">
                    <Icon className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <h3 className="font-heading text-headline-md text-on-surface">
                    {group.category}
                  </h3>
                </div>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.items.slice(0, 8).map((item) => (
                    <li key={item} className="text-sm text-on-surface-variant">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
