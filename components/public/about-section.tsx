import { Terminal } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function AboutSection() {
  const profile = await getPublicProfile();

  return (
    <Section id="about" tone="lowest">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="aspect-square overflow-hidden rounded-lg border border-outline-variant/10 bg-surface-high p-6 md:p-10">
              <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-lowest p-6 md:p-8">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.15]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(255,140,55,0.5) 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                  }}
                  aria-hidden
                />
                <div className="relative z-10">
                  <p className="font-label uppercase text-primary">System panel</p>
                  <p className="mt-3 font-heading text-5xl font-bold tracking-tighter text-on-surface md:text-6xl">
                    AD
                  </p>
                  <p className="mt-2 text-body-md text-on-surface-variant">
                    {profile.professionalTitle}
                  </p>
                </div>
                <div className="relative z-10 space-y-3 border-t border-outline-variant/20 pt-6">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">Location</span>
                    <span className="text-right text-on-surface">{profile.location}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">Availability</span>
                    <span className="text-right text-primary">Remote</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">Credential</span>
                    {profile.credentialUrl ? (
                      <a
                        href={profile.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface hover:text-primary"
                      >
                        n8n Level 2
                      </a>
                    ) : (
                      <span className="text-on-surface">n8n Level 2</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-outline-variant/10 bg-surface-container p-4 sm:absolute sm:-bottom-4 sm:right-4 sm:mt-0 sm:max-w-[260px]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Terminal className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase text-on-surface-variant">
                    Current focus
                  </p>
                  <p className="text-body-md font-bold text-on-surface">
                    Production AI workflows
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 lg:pt-0">
            <p className="mb-3 font-label uppercase tracking-widest text-primary">
              The Engineer
            </p>
            <h2 className="mb-8 font-heading text-headline-lg text-on-surface">
              Reliable automation for fragmented operations.
            </h2>
            <div className="space-y-6 text-body-lg text-on-surface-variant">
              {profile.longBio.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
