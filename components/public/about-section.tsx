import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function AboutSection() {
  const profile = await getPublicProfile();

  return (
    <Section id="about" tone="lowest">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="section-eyebrow mb-3">About</p>
            <h2 className="font-heading text-headline-lg text-on-surface">
              Reliable automation for fragmented operations
            </h2>
          </div>

          <div className="space-y-5 text-body-lg text-on-surface-variant">
            {profile.longBio.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}

            <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-outline-variant pt-8 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-on-surface-variant">Location</dt>
                <dd className="mt-1 text-sm font-medium text-on-surface">{profile.location}</dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Availability</dt>
                <dd className="mt-1 text-sm font-medium text-on-surface">Remote</dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Education</dt>
                <dd className="mt-1 text-sm font-medium text-on-surface">
                  BS Computer Science, FAST-NUCES
                </dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Credential</dt>
                <dd className="mt-1 text-sm font-medium text-on-surface">
                  {profile.credentialUrl ? (
                    <a
                      href={profile.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      n8n Level 2
                    </a>
                  ) : (
                    "n8n Level 2"
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}
