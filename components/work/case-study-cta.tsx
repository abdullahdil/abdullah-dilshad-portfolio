import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CaseStudyCta() {
  return (
    <section
      className="border-t border-outline-variant py-20 md:py-24"
      aria-labelledby="case-cta-heading"
    >
      <Container className="max-w-2xl text-center">
        <h2
          id="case-cta-heading"
          className="font-heading text-headline-lg text-on-surface"
        >
          Have a similar workflow to automate?
        </h2>
        <p className="mt-4 text-body-md text-on-surface-variant">
          I&apos;m open to remote roles, long-term contracts, and selected automation
          projects.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/#contact" size="lg">
            Get in touch
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="/#work" variant="outline" size="lg">
            View other projects
          </Button>
        </div>
      </Container>
    </section>
  );
}
