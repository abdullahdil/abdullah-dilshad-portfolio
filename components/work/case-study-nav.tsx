import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type CaseStudyNavProps = {
  previous: CaseStudy | null;
  next: CaseStudy | null;
};

export function CaseStudyNav({ previous, next }: CaseStudyNavProps) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Case study pagination"
      className="border-t border-outline-variant py-12 md:py-16"
    >
      <Container className="grid gap-10 sm:grid-cols-2 sm:gap-8">
        {previous ? (
          <Link
            href={`/work/${previous.slug}`}
            className="group flex min-w-0 flex-col gap-3 text-on-surface"
          >
            <span className="inline-flex items-center gap-2 font-label text-on-surface-faint transition-colors group-hover:text-on-surface">
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                aria-hidden
              />
              Previous
            </span>
            <span className="font-heading text-headline-md text-balance text-on-surface">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" aria-hidden />
        )}

        {next ? (
          <Link
            href={`/work/${next.slug}`}
            className="group flex min-w-0 flex-col gap-3 text-on-surface sm:items-end sm:text-right"
          >
            <span className="inline-flex items-center gap-2 font-label text-on-surface-faint transition-colors group-hover:text-on-surface">
              Next
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
            <span className="font-heading text-headline-md text-balance text-on-surface">
              {next.title}
            </span>
          </Link>
        ) : null}
      </Container>
    </nav>
  );
}
