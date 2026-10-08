import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ToolChip } from "@/components/ui/tool-chip";
import type { PublicCapabilityGroup } from "@/lib/repositories/capabilities";
import type { PublicExperience } from "@/lib/repositories/experience";

type ExperienceSectionProps = {
  experience: PublicExperience[];
  capabilities: PublicCapabilityGroup[];
};

/**
 * Experience as a compact timeline beside the verified capability list.
 * Capabilities are plain grouped chips — no meters, no levels, no years
 * (CONTENT_TRUTH.md → Capabilities).
 */
export function ExperienceSection({
  experience,
  capabilities,
}: ExperienceSectionProps) {
  return (
    <Section
      id="experience"
      tone="low"
      className="section-veil"
      aria-labelledby="experience-title"
    >
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Experience"
              title="Where I've built automation"
              titleId="experience-title"
            />

            <ol className="mt-10 border-l border-outline-variant">
              {experience.map((item) => (
                <li
                  key={`${item.organization}-${item.period}`}
                  className="relative pb-9 pl-6 last:pb-0"
                >
                  <span
                    aria-hidden
                    className={
                      item.isCurrent
                        ? "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface-low"
                        : "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-outline-strong bg-surface-low ring-4 ring-surface-low"
                    }
                  />
                  <p className="font-label tabular text-on-surface-faint">
                    {item.period}
                    <span aria-hidden className="mx-1.5">
                      ·
                    </span>
                    {item.location}
                  </p>
                  <h3 className="mt-2 text-body-lg font-semibold tracking-[-0.015em] text-on-surface">
                    {item.role}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {item.organization}
                    {item.isCurrent ? (
                      <span className="font-label ml-2 text-accent">Current</span>
                    ) : null}
                  </p>
                  <p className="mt-2.5 max-w-[60ch] text-body-sm text-pretty text-on-surface-variant">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div id="capabilities" className="scroll-mt-24 lg:col-span-6">
            <SectionHeading
              eyebrow="Capabilities"
              title="What I work with"
              titleId="capabilities-title"
            />

            <div className="mt-10 space-y-7">
              {capabilities.map((group) => (
                <section
                  key={group.category}
                  aria-label={group.category}
                  className="border-t border-outline-variant pt-4"
                >
                  <h3 className="font-label text-on-surface">{group.category}</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item}>
                        <ToolChip>{item}</ToolChip>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
