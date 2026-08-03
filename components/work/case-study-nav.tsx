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
      className="mb-16 border-y border-outline-variant/20 py-8"
    >
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between">
        {previous ? (
          <Link
            href={`/work/${previous.slug}`}
            className="group flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-outline-variant/30 bg-surface-container p-5 transition-colors hover:border-primary/40"
          >
            <span className="inline-flex items-center gap-2 font-label uppercase text-on-surface-variant group-hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Previous
            </span>
            <span className="font-heading text-lg text-on-surface">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div className="hidden flex-1 sm:block" />
        )}

        {next ? (
          <Link
            href={`/work/${next.slug}`}
            className="group flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-outline-variant/30 bg-surface-container p-5 text-right transition-colors hover:border-primary/40 sm:items-end"
          >
            <span className="inline-flex items-center gap-2 font-label uppercase text-on-surface-variant group-hover:text-primary">
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-heading text-lg text-on-surface">{next.title}</span>
          </Link>
        ) : null}
      </Container>
    </nav>
  );
}
