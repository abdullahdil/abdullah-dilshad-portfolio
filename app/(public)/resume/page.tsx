import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getPublicProfile } from "@/lib/repositories/profile";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download or request Abdullah Dilshad’s CV.",
  alternates: { canonical: "/resume" },
};

export default async function ResumePage() {
  const profile = await getPublicProfile();
  const cvIsFile =
    Boolean(profile.cvUrl) &&
    profile.cvUrl !== "/resume" &&
    /^https?:\/\//i.test(profile.cvUrl ?? "");

  return (
    <main id="main-content" className="pb-16 pt-28">
      <Container className="max-w-2xl">
        <h1 className="mb-4 font-heading text-headline-lg text-on-surface">Resume</h1>
        <p className="mb-8 text-body-md text-on-surface-variant">
          {cvIsFile
            ? `Download ${profile.fullName}'s CV as a PDF, or connect on LinkedIn.`
            : `A downloadable CV PDF will appear here after upload in the admin media library. Until then, contact ${profile.fullName} directly or use LinkedIn.`}
        </p>
        <div className="flex flex-wrap gap-4">
          {cvIsFile ? (
            <Button href={profile.cvUrl!} target="_blank" rel="noopener noreferrer">
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
    </main>
  );
}
