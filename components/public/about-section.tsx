import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";

type RailFact = {
  term: string;
  value: string;
  href?: string;
};

export async function AboutSection() {
  const profile = await getPublicProfile();

  const facts: RailFact[] = [
    { term: "Location", value: profile.location },
    { term: "Availability", value: profile.availabilityLabel },
    { term: "Education", value: "BS Computer Science, FAST-NUCES" },
    {
      term: "Credential",
      value: "n8n Level 2",
      href: profile.credentialUrl ?? undefined,
    },
  ];

  if (profile.n8nProfileUrl) {
    facts.push({
      term: "n8n Profile",
      value: "n8n.io/creators",
      href: profile.n8nProfileUrl,
    });
  }

  return (
    <Section id="about" tone="low" className="section-veil">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Editorial column: narrow measure, magazine-set prose. */}
          <div className="lg:col-span-8">
            <p className="section-eyebrow mb-3">About</p>
            <h2 className="font-heading text-headline-xl text-balance text-on-surface">
              Reliable automation for fragmented operations
            </h2>

            <div className="mt-8 max-w-[68ch] space-y-6 text-body-lg text-pretty text-on-surface-variant">
              {profile.longBio.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Quiet rail: hairline-separated facts. */}
          <aside className="lg:col-span-4 lg:pt-2">
            <dl className="border-t border-outline-variant">
              {facts.map((fact) => (
                <div
                  key={fact.term}
                  className="flex items-baseline justify-between gap-6 border-b border-outline-variant py-3.5"
                >
                  <dt className="font-label shrink-0 text-on-surface-faint">
                    {fact.term}
                  </dt>
                  <dd className="text-body-sm text-right text-on-surface">
                    {fact.href ? (
                      <a
                        href={fact.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline text-on-surface hover:text-accent"
                      >
                        {fact.value}
                      </a>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
