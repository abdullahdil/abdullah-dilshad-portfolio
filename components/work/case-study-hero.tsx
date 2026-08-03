import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type CaseStudyHeroProps = {
  study: CaseStudy;
};

export function CaseStudyHero({ study }: CaseStudyHeroProps) {
  return (
    <header className="mb-20 text-center md:mb-24">
      <Container>
        <Link
          href="/#work"
          className="mb-8 inline-flex items-center gap-2 font-label uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Work
        </Link>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden />
          <span className="font-label text-[12px] uppercase tracking-widest">
            Case Study: Production Automation
          </span>
        </div>

        <h1 className="mb-8 font-heading text-display-lg-mobile leading-none text-on-surface md:text-display-lg">
          {study.title.split(" and ").length > 1 ? (
            <>
              {study.title.split(" and ")[0]} &amp;{" "}
              <br className="hidden sm:block" />
              <span className="text-primary-container">
                {study.title.split(" and ").slice(1).join(" and ")}
              </span>
            </>
          ) : (
            study.title
          )}
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-body-lg text-on-surface-variant">
          {study.summary}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {study.tools.slice(0, 6).map((tool) => (
            <Badge key={tool.name} tone="primary">
              {tool.name}
            </Badge>
          ))}
        </div>
      </Container>
    </header>
  );
}
