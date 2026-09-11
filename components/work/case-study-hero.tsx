import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

function stackLabel(study: CaseStudy): string | null {
  if (study.tools.length === 0) return null;
  const named = study.tools.slice(0, 4).map((tool) => tool.name);
  const rest = study.tools.length - named.length;
  return rest > 0 ? `${named.join(" · ")} +${rest}` : named.join(" · ");
}

export function CaseStudyHero({ study }: CaseStudyHeroProps) {
  const cover = resolveCover(study);
  const stack = stackLabel(study);

  const meta: { label: string; value: string }[] = [];
  if (stack) meta.push({ label: "Stack", value: stack });
  if (study.steps.length > 0) {
    meta.push({
      label: "Pipeline",
      value: `${study.steps.length} steps`,
    });
  }
  if (study.reliabilityControls.length > 0) {
    meta.push({
      label: "Controls",
      value: `${study.reliabilityControls.length} reliability controls`,
    });
  }

  return (
    <header className="hero-wash pb-14 pt-10 md:pb-20 md:pt-16">
      <Container size="narrow">
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2 font-label text-on-surface-faint transition-colors hover:text-on-surface"
        >
          <ArrowLeft
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Back to work
        </Link>

        <p className="section-eyebrow mt-10 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>Case study</span>
          {study.previewLabel ? (
            <>
              <span aria-hidden>/</span>
              <span>{study.previewLabel}</span>
            </>
          ) : null}
        </p>

        <h1 className="mt-4 font-heading text-display-lg text-balance text-on-surface">
          {study.title}
        </h1>

        <p className="mt-6 text-lead text-pretty">{study.summary}</p>

        {meta.length > 0 ? (
          <dl className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label} className="hairline-t pt-4">
                <dt className="font-label text-on-surface-faint">{item.label}</dt>
                <dd className="mt-2 text-body-sm text-on-surface">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>

      {cover ? (
        <Container size="wide" className="mt-14 md:mt-16">
          <figure>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-high">
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                priority
                className="case-study-cover-media object-contain object-center"
                sizes="(max-width: 1320px) 100vw, 1320px"
              />
            </div>
            <figcaption className="sr-only">{cover.alt}</figcaption>
          </figure>
        </Container>
      ) : null}
    </header>
  );
}
