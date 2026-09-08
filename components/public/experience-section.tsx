import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { listPublishedExperience } from "@/lib/repositories/experience";

export async function ExperienceSection() {
  const experience = await listPublishedExperience();

  return (
    <Section id="experience">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="section-eyebrow mb-3">Experience</p>
          <h2 className="font-heading text-headline-lg text-on-surface">
            Where I&apos;ve built automation
          </h2>
        </div>

        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {experience.map((item) => (
            <article
              key={`${item.organization}-${item.period}`}
              className="grid gap-4 py-8 md:grid-cols-[12rem_1fr] md:gap-12"
            >
              <div>
                <p className="text-sm font-medium text-accent">{item.period}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{item.location}</p>
              </div>
              <div>
                <h3 className="font-heading text-headline-md text-on-surface">{item.role}</h3>
                <p className="mt-1 text-sm font-medium text-on-surface">{item.organization}</p>
                <p className="mt-3 text-body-md text-on-surface-variant">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
