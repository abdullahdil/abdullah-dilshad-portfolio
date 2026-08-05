import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CaseStudyCta() {
  return (
    <section
      className="border-t border-outline-variant/10 py-20 text-center md:py-24"
      aria-labelledby="case-cta-heading"
    >
      <Container>
        <h2
          id="case-cta-heading"
          className="mb-12 font-heading text-headline-lg text-on-surface md:text-display-lg"
        >
          Ready to automate your{" "}
          <br className="hidden sm:block" />
          <span className="text-primary">growth engine?</span>
        </h2>
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
          <Button href="/#contact" size="lg" variant="secondary" className="group glow-accent">
            Scale My Outreach
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-2"
              aria-hidden
            />
          </Button>
          <Button href="/#work" variant="outline" size="lg">
            View Other Projects
          </Button>
        </div>
      </Container>
    </section>
  );
}
