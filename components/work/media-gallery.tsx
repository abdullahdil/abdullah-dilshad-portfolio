import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { CaseStudy } from "@/lib/content/types";

type MediaGalleryProps = {
  study: CaseStudy;
};

export function MediaGallery({ study }: MediaGalleryProps) {
  const images = study.galleryImages.filter((item) => Boolean(item.url));
  const placeholders =
    images.length > 0
      ? []
      : study.galleryPlaceholders.length > 0
        ? study.galleryPlaceholders
        : ["Screenshot placeholder", "Workflow detail placeholder", "Outcome placeholder"];

  return (
    <section className="mb-20 md:mb-28" aria-labelledby="gallery-heading">
      <Container>
        <h2
          id="gallery-heading"
          className="mb-4 font-heading text-headline-lg text-on-surface"
        >
          Screenshots &amp; Media
        </h2>
        <p className="mb-8 max-w-2xl text-body-md text-on-surface-variant">
          {images.length > 0
            ? "Selected production screenshots from this workflow."
            : "Production screenshots will appear here after upload in the admin case study editor."}
        </p>

        {images.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item) => (
              <li
                key={`${item.url}-${item.caption}`}
                className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container"
              >
                <div className="relative aspect-video bg-surface-highest">
                  <Image
                    src={item.url!}
                    alt={item.alt || item.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="border-t border-outline-variant/20 px-4 py-3 text-sm text-on-surface-variant">
                  {item.caption}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {placeholders.map((caption) => (
              <li
                key={caption}
                className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container"
              >
                <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-surface-highest p-6">
                  <ImageIcon
                    className="h-8 w-8 text-on-surface-variant opacity-60"
                    aria-hidden
                  />
                  <span className="font-label uppercase text-on-surface-variant">
                    Screenshot placeholder
                  </span>
                </div>
                <p className="border-t border-outline-variant/20 px-4 py-3 text-sm text-on-surface-variant">
                  {caption}
                </p>
              </li>
            ))}
          </ul>
        )}

        {study.demoVideoUrl ? (
          <div className="mt-8">
            <a
              href={study.demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-sm uppercase tracking-widest text-primary hover:underline"
            >
              {study.demoVideoLabel || "Watch demo"}
            </a>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
