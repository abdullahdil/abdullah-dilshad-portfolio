import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CaseStudy } from "@/lib/content/types";

type MediaGalleryProps = {
  study: CaseStudy;
};

export function MediaGallery({ study }: MediaGalleryProps) {
  const images = study.galleryImages.filter((item) => Boolean(item.url));

  if (images.length === 0 && !study.demoVideoUrl) {
    return null;
  }

  return (
    <Section tone="low" className="section-veil" aria-labelledby="gallery-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Media</p>
        <h2 id="gallery-heading" className="mt-3 font-heading text-headline-lg text-balance text-on-surface">
          Screenshots and media
        </h2>
        <p className="mt-6 text-lead text-pretty">
          Selected production screenshots from this workflow.
        </p>
      </Container>

      {images.length > 0 ? (
        <Container size="wide" className="mt-12 md:mt-16">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item) => (
              <li key={`${item.url}-${item.caption}`}>
                <figure className="panel panel-depth overflow-hidden">
                  <div className="relative aspect-[4/3] bg-surface-high">
                    <Image
                      src={item.url!}
                      alt={item.alt || item.caption}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    />
                  </div>
                  <figcaption className="border-t border-outline-variant px-4 py-3 text-body-sm text-on-surface-variant">
                    {item.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}

      {study.demoVideoUrl ? (
        <Container size="narrow" className="mt-10">
          <a
            href={study.demoVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-label text-on-surface transition-colors hover:text-accent"
          >
            {study.demoVideoLabel || "Watch demo"}
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </Container>
      ) : null}
    </Section>
  );
}
