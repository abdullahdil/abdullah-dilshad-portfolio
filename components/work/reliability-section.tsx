import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type ReliabilitySectionProps = {
  study: CaseStudy;
};

export function ReliabilitySection({ study }: ReliabilitySectionProps) {
  return (
    <section className="mb-24 md:mb-32" aria-labelledby="reliability-heading">
      <Container>
        <div className="glass-card relative overflow-hidden rounded-lg p-8 md:p-12">
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary-container/10 blur-[120px]"
            aria-hidden
          />
          <div className="relative max-w-3xl">
            <h2
              id="reliability-heading"
              className="mb-8 font-heading text-headline-lg text-on-surface"
            >
              Reliability &amp; Governance
            </h2>
            <div className="space-y-8">
              {study.reliabilityControls.map((control) => (
                <div key={control.name} className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="mb-2 font-label text-lg text-on-surface">
                      {control.name}
                    </h3>
                    <p className="leading-relaxed text-on-surface-variant">
                      {control.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
