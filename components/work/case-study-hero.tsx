import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type CaseStudyHeroProps = {
  study: CaseStudy;
};

function resolveCover(study: CaseStudy): { url: string; alt: string } | null {
  if (study.featuredImageUrl) {
    return { url: study.featuredImageUrl, alt: study.title };
  }

  const galleryItem = study.galleryImages.find((item) => Boolean(item.url));
  if (galleryItem?.url) {
    return {
      url: galleryItem.url,
      alt: galleryItem.alt || galleryItem.caption || study.title,
    };
  }

  return null;
}

export function CaseStudyHero({ study }: CaseStudyHeroProps) {
  const cover = resolveCover(study);

  return (
    <header className="mb-0">
      <Container className="mb-10 text-center md:mb-14">
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

      <figure
        className="relative w-full overflow-hidden border-t border-outline-variant/10 bg-surface-lowest"
        aria-label={cover ? `${study.title} featured visual` : undefined}
      >
        <div className="relative h-[min(62vw,420px)] w-full md:h-[min(46vw,640px)]">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              priority
              className="case-study-cover-media object-cover object-center"
              sizes="100vw"
            />
          ) : (
            <div
              className="absolute inset-0"
              aria-hidden
            >
              <div className="absolute inset-0 kinetic-gradient opacity-90" />
              <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1.5px 1.5px, rgba(45,212,191,0.55) 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
              <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-[90px]" />
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/55"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background/70 to-transparent md:w-28"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background/70 to-transparent md:w-28"
            aria-hidden
          />
        </div>
        {cover ? <figcaption className="sr-only">{cover.alt}</figcaption> : null}
      </figure>
    </header>
  );
}
