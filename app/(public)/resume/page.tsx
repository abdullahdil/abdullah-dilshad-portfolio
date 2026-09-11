import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";
import { listPublishedExperience } from "@/lib/repositories/experience";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download or request Abdullah Dilshad’s CV.",
  alternates: { canonical: "/resume" },
};

export default async function ResumePage() {
  const [profile, experience] = await Promise.all([
    getPublicProfile(),
    listPublishedExperience(),
  ]);

  const cvIsFile =
    Boolean(profile.cvUrl) &&
    profile.cvUrl !== "/resume" &&
    (/^https?:\/\//i.test(profile.cvUrl ?? "") || profile.cvUrl!.startsWith("/"));

  return (
    <main id="main-content">
      <Section space="tight">
        <Container size="narrow">
          <p className="section-eyebrow">Resume</p>
          <h1 className="mt-3 font-heading text-headline-xl text-balance text-on-surface">
            {profile.fullName}
          </h1>
          <p className="mt-3 text-body-md text-on-surface-variant">
            {profile.professionalTitle}
          </p>
          <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-outline-variant pt-6 sm:grid-cols-2">
            <div>
              <dt className="font-label text-on-surface-faint">Location</dt>
              <dd className="mt-1 text-body-sm text-on-surface">{profile.location}</dd>
            </div>
            <div>
              <dt className="font-label text-on-surface-faint">Availability</dt>
              <dd className="mt-1 text-body-sm text-on-surface">
                {profile.availabilityLabel}
              </dd>
            </div>
            <div>
              <dt className="font-label text-on-surface-faint">Email</dt>
              <dd className="mt-1 text-body-sm">
                <a
                  href={`mailto:${profile.email}`}
                  className="link-underline text-on-surface"
                >
                  {profile.email}
                </a>
              </dd>
            </div>
            {profile.linkedinUrl ? (
              <div>
                <dt className="font-label text-on-surface-faint">LinkedIn</dt>
                <dd className="mt-1 text-body-sm">
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-on-surface"
                  >
                    {profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/i, "")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-8 max-w-[68ch] text-pretty text-body-md text-on-surface-variant">
            {cvIsFile
              ? `Download ${profile.fullName}'s CV as a PDF, or connect on LinkedIn.`
              : `A downloadable CV PDF will appear here after upload in the admin media library. Until then, contact ${profile.fullName} directly or use LinkedIn.`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {cvIsFile ? (
              <Button href={profile.cvUrl!} download>
                Download CV
              </Button>
            ) : (
              <Button href={`mailto:${profile.email}`}>Request CV by email</Button>
            )}
            {profile.linkedinUrl ? (
              <Button
                href={profile.linkedinUrl}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View LinkedIn
              </Button>
            ) : null}
          </div>
        </Container>
      </Section>

      {experience.length > 0 ? (
        <Section divider space="tight">
          <Container size="narrow">
            <h2 className="section-eyebrow">Experience</h2>
            <ol className="mt-8">
              {experience.map((entry) => (
                <li
                  key={`${entry.organization}-${entry.period}`}
                  className="grid gap-2 border-t border-outline-variant py-7 first:border-t-0 first:pt-0 sm:grid-cols-12 sm:gap-6"
                >
                  <p className="font-label tabular text-on-surface-faint sm:col-span-4 sm:pt-1">
                    {entry.period}
                  </p>
                  <div className="sm:col-span-8">
                    <h3 className="font-heading text-headline-sm text-on-surface">
                      {entry.role}
                    </h3>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {entry.organization} · {entry.location}
                    </p>
                    <p className="mt-3 max-w-[68ch] text-pretty text-body-sm text-on-surface-variant">
                      {entry.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      ) : null}
    </main>
  );
}
