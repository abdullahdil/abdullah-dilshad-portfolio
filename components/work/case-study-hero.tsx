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
    <header className="border-b border-outline-variant pb-12 pt-28 md:pb-16 md:pt-32">
      <Container>
        <Link
          href="/#work"
          className="mb-8 inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to work
        </Link>

        <p className="section-eyebrow mb-4">Case study</p>

        <h1 className="max-w-4xl font-heading text-display-lg text-on-surface">
          {study.title}
        </h1>

        <p className="mt-6 max-w-2xl text-body-lg text-on-surface-variant">
          {study.summary}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {study.tools.slice(0, 6).map((tool) => (
            <Badge key={tool.name} tone="primary">
              {tool.name}
            </Badge>
          ))}
        </div>
      </Container>

      {cover ? (
        <figure className="mt-12" aria-label={`${study.title} featured visual`}>
          <div className="relative mx-auto h-[min(50vw,480px)] w-full max-w-none px-margin-mobile md:px-margin-desktop xl:px-16">
            <div className="relative h-full w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-highest">
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                priority
                className="case-study-cover-media object-cover object-center"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            </div>
          </div>
          <figcaption className="sr-only">{cover.alt}</figcaption>
        </figure>
      ) : null}
    </header>
  );
}
