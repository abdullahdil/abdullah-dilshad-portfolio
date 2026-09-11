import { ArrowRight, Download } from "lucide-react";
import { HeroPortrait } from "@/components/public/hero-portrait";
import { ProofStrip } from "@/components/public/proof-strip";
import { WorkflowVisual } from "@/components/public/workflow-visual";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function HeroSection() {
  const profile = await getPublicProfile();

  return (
    <>
      <section className="hero-wash pt-16 pb-20 md:pt-24 md:pb-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            {/* 7 columns of type — asymmetric against a 5-column portrait. */}
            <div className="min-w-0 lg:col-span-7">
              <StatusIndicator
                label={profile.availabilityLabel}
                pulse={false}
              />

              <h1 className="mt-7 max-w-[24ch] text-balance font-heading text-display-lg text-on-surface">
                {profile.heroHeadline}
              </h1>

              <p className="mt-7 max-w-[60ch] text-pretty text-lead">
                {profile.heroDescription}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href="#work" size="lg">
                  View case studies
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </Button>
                <Button
                  href={profile.cvUrl ?? "/resume"}
                  download={Boolean(profile.cvUrl)}
                  variant="ghost"
                  size="lg"
                >
                  <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Download CV
                </Button>
              </div>

              <p className="mt-12 font-label text-on-surface-faint">
                {profile.professionalTitle}
                <span aria-hidden className="mx-2">/</span>
                {profile.location}
              </p>
            </div>

            <div className="lg:col-span-5">
              <HeroPortrait alt={profile.fullName} src={profile.portraitUrl} />
            </div>
          </div>
        </Container>
      </section>

      <ProofStrip />

      {/* Its own full-width band, deliberately outside the hero's 7/5 grid so
          it never competes with the headline. */}
      <Section id="how-it-runs" tone="default" space="tight" divider>
        <Container>
          <SectionHeading
            eyebrow="How it runs"
            title="Run the workflow. It stops and asks you before anything irreversible."
            description="Step a record through the pipeline. It pauses at the approval gate and waits for your decision. Switch on failure injection to watch a step fail, retry, and recover."
          />
          <WorkflowVisual className="mt-10" />
        </Container>
      </Section>
    </>
  );
}
