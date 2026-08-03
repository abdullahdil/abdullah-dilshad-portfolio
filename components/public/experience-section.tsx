import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { listPublishedExperience } from "@/lib/repositories/experience";
import { cn } from "@/lib/utils";

export async function ExperienceSection() {
  const experience = await listPublishedExperience();

  return (
    <Section id="experience" tone="lowest">
      <Container>
        <h2 className="mb-12 text-center font-heading text-headline-lg text-on-surface md:mb-16">
          Engineering Journey
        </h2>

        <div className="relative mx-auto max-w-4xl space-y-12">
          <div
            className="absolute bottom-0 left-0 top-0 w-px bg-outline-variant/30 md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />

          {experience.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <article
                key={`${item.organization}-${item.period}`}
                className={cn(
                  "relative flex flex-col items-center gap-8 md:flex-row",
                  !isLeft && "md:flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "w-full md:w-1/2",
                    isLeft ? "md:text-right" : "md:text-left",
                  )}
                >
                  <div className="rounded-lg border border-outline-variant/10 bg-surface-low p-6 transition-colors hover:border-primary/50">
                    <span className="font-label text-primary">{item.period}</span>
                    <h3 className="mt-2 font-heading text-xl text-on-surface">
                      {item.role}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-on-surface">
                      {item.organization}
                    </p>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div
                  className="absolute left-[-4px] z-10 h-3 w-3 rounded-full bg-primary kinetic-glow md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                />

                <div className="hidden md:block md:w-1/2" aria-hidden />
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
