import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { WorkflowVisual } from "@/components/public/workflow-visual";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function HeroSection() {
  const profile = await getPublicProfile();
  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-16 pt-28">
      <div
        className="pointer-events-none absolute inset-0 kinetic-gradient"
        aria-hidden
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          <div className="space-y-8 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-low px-4 py-1 font-label text-on-surface-variant">
              <span
                className="h-2 w-2 rounded-full bg-primary kinetic-glow"
                aria-hidden
              />
              {profile.professionalTitle.toUpperCase()}
            </div>

            <h1 className="font-heading text-display-lg tracking-tighter text-on-surface">
              I build AI automation systems that{" "}
              <span className="inline-block whitespace-nowrap rotate-[-2deg] bg-primary-container px-3 py-1 text-on-primary-container sm:px-4">
                replace manual work
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-body-lg text-on-surface-variant lg:mx-0">
              {profile.heroDescription}
            </p>

            <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row lg:justify-start">
              <Button href="#contact" size="lg" className="group w-full sm:w-auto">
                Start Automating
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Button>
              <Button
                href="#work"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                View Projects
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5 lg:justify-start lg:pl-20 xl:pl-24">
            <div className="relative w-full max-w-[16rem] sm:max-w-[18rem] lg:max-w-[20rem]">
              <div
                className="absolute -inset-4 rounded-full bg-primary/15 blur-2xl kinetic-glow"
                aria-hidden
              />
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-primary/40 bg-surface-low shadow-[0_0_60px_-12px_rgba(45,212,191,0.4)]">
                {profile.portraitUrl ? (
                  <Image
                    src={profile.portraitUrl}
                    alt={profile.fullName}
                    fill
                    className="object-cover"
                    sizes="20rem"
                    priority
                  />
                ) : (
                  <div
                    className="relative flex h-full w-full items-center justify-center bg-surface-container"
                    aria-label={`${profile.fullName} portrait placeholder`}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 2px 2px, rgba(45,212,191,0.55) 1px, transparent 0)",
                        backgroundSize: "18px 18px",
                      }}
                      aria-hidden
                    />
                    <span className="relative z-10 font-heading text-5xl font-bold tracking-tighter text-primary sm:text-6xl lg:text-7xl">
                      {initials || "AD"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-16 md:mt-20">
          <div className="overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-lowest">
            <WorkflowVisual compact />
          </div>
        </div>
      </Container>
    </section>
  );
}
