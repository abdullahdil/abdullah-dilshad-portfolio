import { ArrowRight } from "lucide-react";
import { HeroPortrait } from "@/components/public/hero-portrait";
import { ProofStrip } from "@/components/public/proof-strip";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function HeroSection() {
  const profile = await getPublicProfile();

  return (
    <section className="border-b border-outline-variant pt-28 pb-20 md:pt-32 md:pb-24">
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-20">
          <div className="w-full min-w-0 flex-1">
            <p className="section-eyebrow mb-6">{profile.professionalTitle}</p>

            <h1 className="max-w-[18ch] font-heading text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-on-surface sm:max-w-[20ch]">
              {profile.heroHeadline}
            </h1>

            <p className="mt-6 max-w-2xl text-body-lg text-on-surface-variant">
              {profile.heroDescription}
            </p>

            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <Button href="#work" size="lg" className="w-full sm:w-auto">
                View case studies
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                href={profile.cvUrl ?? "/resume"}
                download={Boolean(profile.cvUrl)}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Download CV
              </Button>
            </div>

            <p className="mt-6 text-sm text-on-surface-variant">
              {profile.location} · Remote availability
            </p>
          </div>

          <div className="w-full shrink-0 lg:w-[22rem] xl:w-[26rem]">
            <HeroPortrait alt={profile.fullName} src={profile.portraitUrl} />
          </div>
        </div>

        <div className="mt-16 border-t border-outline-variant pt-12">
          <ProofStrip />
        </div>
      </Container>
    </section>
  );
}
