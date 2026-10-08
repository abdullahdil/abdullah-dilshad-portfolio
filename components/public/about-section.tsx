import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { PublicProfile } from "@/lib/repositories/profile";

type RailFact = {
  term: string;
  value: string;
  href?: string;
};

/**
 * Home keeps About short: the opening paragraph of the CMS long bio plus its
 * closing paragraph (education + availability). The full bio lives on /resume.
 */
export function AboutSection({ profile }: { profile: PublicProfile }) {
  const bio = profile.longBio.filter(Boolean);
  const paragraphs =
    bio.length > 1 ? [bio[0], bio[bio.length - 1]] : bio.slice(0, 1);

  const facts: RailFact[] = [
    { term: "Location", value: profile.location },
    { term: "Availability", value: profile.availabilityLabel },
    { term: "Education", value: "BS Computer Science, FAST-NUCES" },
  ];

  return (
    <Section id="about" divider aria-labelledby="about-title">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <p className="section-eyebrow mb-3">About</p>
            <h2
              id="about-title"
              className="font-heading text-headline-xl text-balance text-on-surface"
            >
              I build automations that know when to stop and ask
            </h2>

            <div className="mt-7 max-w-[66ch] space-y-5 text-body-lg text-pretty text-on-surface-variant">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <Link
              href="/resume"
              className="group mt-7 inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface transition-colors hover:text-accent"
            >
              <span className="link-underline">Full background and CV</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </div>

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
                    {fact.value}
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
