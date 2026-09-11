import { Brain, Plug, Terminal, Workflow, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
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
    <Section id="capabilities" tone="low" className="section-veil">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="What I work with"
          description="The practices that keep a workflow running once it is live — validation, error handling, retry and fallback paths, approval gates, duplicate prevention — and the integration surface those workflows reach. Tools change per project; the engineering around them does not."
          className="mb-14 md:mb-20"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {capabilities.map((group, index) => {
            const Icon = iconMap[group.icon];
            return (
              <section
                key={group.category}
                className="panel panel-depth px-6 py-7 md:px-7 md:py-8"
                aria-labelledby={`capability-${index}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-accent"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <h3
                    id={`capability-${index}`}
                    className="font-label text-on-surface"
                  >
                    {group.category}
                  </h3>
                  <span className="font-label tabular ml-auto text-on-surface-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-body-sm text-on-surface-variant"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
