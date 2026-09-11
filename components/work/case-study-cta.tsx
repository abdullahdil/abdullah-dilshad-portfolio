import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function CaseStudyCta() {
  return (
    <Section tone="low" space="tight" className="section-veil" aria-labelledby="case-cta-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Next step</p>
        <h2 id="case-cta-heading" className="mt-3 max-w-[24ch] font-heading text-headline-lg text-balance text-on-surface">
          Have a similar workflow to automate?
        </h2>
        <p className="mt-4 text-body-lg text-pretty text-on-surface-variant">
          I&apos;m open to remote roles, long-term contracts, and selected
          automation projects.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href="/#contact">
            Get in touch
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="/#work" variant="ghost">
            View other projects
          </Button>
        </div>
      </Container>
    </Section>
  );
}
