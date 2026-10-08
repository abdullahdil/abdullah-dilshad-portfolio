import { ArrowRight, Download } from "lucide-react";
import { HeroPortrait } from "@/components/public/hero-portrait";
import { ProofBand } from "@/components/public/proof-strip";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatusIndicator } from "@/components/ui/status-indicator";
import type { PublicProfile } from "@/lib/repositories/profile";
import type { PublicProofPoint } from "@/lib/repositories/site-content";

type HeroSectionProps = {
  profile: PublicProfile;
  systemCount: number;
  templateCount: number;
  featuredProof: PublicProofPoint[];
};

/**
 * The approved hero description is two long sentences; the hero only has room
 * for the first (what he builds). The second (how) is the "How I build"
 * section further down. Falls back to the whole text if it has no full stop.
 */
function valueLine(description: string): string {
  const match = description.match(/^.+?[.!?](?=\s|$)/);
  return (match?.[0] ?? description).trim();
}

/**
 * Hero + proof in one grid: copy | real portrait on desktop with proof
 * spanning beneath; on mobile copy → CTAs → portrait → proof. Everything is
 * server-rendered; the 3D machine lives in the "How I build" section.
 */
export function HeroSection({
  profile,
  systemCount,
  templateCount,
  featuredProof,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero-wash pt-10 pb-16 md:pt-16 md:pb-20 lg:pt-20"
    >
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-12">
          <div className="order-1 min-w-0 lg:col-span-7 lg:self-center">
            <StatusIndicator label={profile.availabilityLabel} pulse={false} />

            <h1
              id="hero-title"
              className="mt-6 text-balance font-heading text-display-hero text-on-surface"
            >
              {profile.heroHeadline}
            </h1>

            <p className="mt-6 max-w-[58ch] text-pretty text-lead">
              {valueLine(profile.heroDescription)}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/work" size="lg">
                View work
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Button>
              <Button
                href={profile.cvUrl ?? "/resume"}
                download={Boolean(profile.cvUrl)}
                variant="secondary"
                size="lg"
              >
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                Download CV
              </Button>
            </div>

          </div>

          <div className="order-2 lg:col-span-5 lg:self-center">
            <HeroPortrait
              alt={profile.fullName}
              src={profile.portraitUrl}
              caption={
                <>
                  <span className="block text-body-md font-medium text-on-surface">
                    {profile.fullName}
                  </span>
                  <span className="font-label mt-1 block text-on-surface-faint">
                    {profile.professionalTitle}
                    <span aria-hidden className="mx-1.5">
                      /
                    </span>
                    {profile.location}
                  </span>
                </>
              }
            />
          </div>

          <div className="order-3 lg:col-span-12">
            <h2 className="sr-only">Proof and credentials</h2>
            <ProofBand
              systemCount={systemCount}
              templateCount={templateCount}
              n8nProfileUrl={profile.n8nProfileUrl}
              credentialUrl={profile.credentialUrl}
              featured={featuredProof}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
