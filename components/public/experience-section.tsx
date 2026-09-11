import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPublishedExperience } from "@/lib/repositories/experience";

export async function ExperienceSection() {
  const experience = await listPublishedExperience();

  return (
    <Section id="experience" divider>
      <Container>
        <SectionHeading
          eyebrow="Experience"
          title="Where I've built automation"
          className="mb-14 md:mb-20"
        />

        <div className="hairline-t">
          {experience.map((item) => (
            <article
              key={`${item.organization}-${item.period}`}
              className="hairline-b grid gap-5 py-10 md:grid-cols-[13rem_1fr] md:gap-12 md:py-14"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
                <p className="font-label tabular text-on-surface">{item.period}</p>
                <p className="font-label text-on-surface-faint md:mt-2">
                  {item.location}
                </p>
                {item.isCurrent ? (
                  <p className="font-label text-accent md:mt-2">Current</p>
                ) : null}
              </div>

              <div className="max-w-[68ch]">
                <h3 className="font-heading text-headline-md text-balance text-on-surface">
                  {item.role}
                </h3>
                <p className="mt-1.5 text-body-md text-on-surface-variant">
                  {item.organization}
                </p>
                <p className="mt-4 text-body-md text-pretty text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
