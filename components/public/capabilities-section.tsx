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
    <Section id="capabilities">
      <Container>
        <h2 className="mb-4 font-heading text-headline-lg text-on-surface">
          Core Capabilities
        </h2>
        <p className="mb-12 text-on-surface-variant">
          The engine behind the automation.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {capabilities.map((group) => {
            const Icon = iconMap[group.icon];
            return (
              <div
                key={group.category}
                className="rounded-lg border border-outline-variant/10 bg-surface-container p-8 transition-all hover:bg-surface-bright"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mb-4 font-heading text-xl text-on-surface">
                  {group.category}
                </h3>
                <ul className="space-y-3 text-body-md text-on-surface-variant">
                  {group.items.slice(0, 6).map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
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
