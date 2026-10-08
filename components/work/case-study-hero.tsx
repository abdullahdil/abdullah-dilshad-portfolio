import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { WorkflowCanvasThumbnail } from "@/components/public/workflow-canvas-thumbnail";
import { caseStudyChips } from "@/components/work/case-study-content";
import type { CaseStudy } from "@/lib/content/types";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

type CaseStudyHeroProps = {
  study: CaseStudy;
  /**
   * Optional: the study's linked workflows. When the study has no cover image
   * the first one with a real canvas becomes the cover, so every study opens
   * on the actual build rather than an empty frame.
   */
  relatedWorkflows?: PublicWorkflowListing[];
};

type Cover =
  | { kind: "image"; url: string; alt: string }
  | { kind: "canvas"; workflow: PublicWorkflowListing };

function resolveCover(
  study: CaseStudy,
  relatedWorkflows: PublicWorkflowListing[],
): Cover | null {
  if (study.featuredImageUrl) {
    return { kind: "image", url: study.featuredImageUrl, alt: study.title };
  }

  const withCanvas = relatedWorkflows.find(
    (workflow) => workflow.canvas && workflow.canvas.nodes.length > 0,
  );
  if (withCanvas) return { kind: "canvas", workflow: withCanvas };

  const galleryItem = study.galleryImages.find((item) => Boolean(item.url));
  if (galleryItem?.url) {
    return {
      kind: "image",
      url: galleryItem.url,
      alt: galleryItem.alt || galleryItem.caption || study.title,
    };
  }

  return null;
}

/**
 * Opener: title, one-line summary, fact chips and the cover. Two columns from
 * `lg` up so the cover sits beside the words instead of pushing the summary
 * rail below the fold.
 */
export function CaseStudyHero({ study, relatedWorkflows = [] }: CaseStudyHeroProps) {
  const cover = resolveCover(study, relatedWorkflows);
  const chips = caseStudyChips(study);

  return (
    <header className="hero-wash pb-10 pt-8 md:pb-14 md:pt-12">
      <Container>
        <Link
          href="/work"
          className="group inline-flex items-center gap-2 font-label text-on-surface-faint transition-colors hover:text-on-surface"
        >
          <ArrowLeft
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden
          />
          All work
        </Link>

        <div
          className={
            cover
              ? "mt-8 grid items-center gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14"
              : "mt-8 lg:mt-10"
          }
        >
          <div className="min-w-0">
            <p className="section-eyebrow">Case study</p>
            <h1 className="mt-3 max-w-[20ch] font-heading text-display-lg text-balance text-on-surface">
              {study.title}
            </h1>
            <p className="mt-5 max-w-[60ch] text-lead text-pretty">{study.summary}</p>

            {chips.length > 0 ? (
              <ul className="mt-7 flex flex-wrap gap-2" aria-label="Key facts">
                {chips.map((chip) => (
                  <li
                    key={chip.label}
                    className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container/70 px-3 py-1.5"
                  >
                    <span className="font-label text-on-surface-faint">{chip.label}</span>
                    <span className="text-body-sm text-on-surface">{chip.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {cover ? (
            <figure className="min-w-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-lowest text-accent shadow-sm">
                {cover.kind === "image" ? (
                  <Image
                    src={cover.url}
                    alt={cover.alt}
                    fill
                    preload
                    className="case-study-cover-media object-contain object-center"
                    sizes="(min-width: 1024px) 540px, 100vw"
                  />
                ) : (
                  <WorkflowCanvasThumbnail
                    canvas={cover.workflow.canvas!}
                    className="case-study-cover-media"
                  />
                )}
              </div>
              {cover.kind === "canvas" ? (
                <figcaption className="mt-3 flex items-center justify-between gap-3 text-body-sm text-on-surface-faint">
                  <span className="truncate">
                    <span className="sr-only">Workflow canvas: </span>
                    {cover.workflow.title}
                  </span>
                  <Link
                    href={`/workflows/${cover.workflow.id}`}
                    className="link-underline shrink-0 font-label text-on-surface-variant hover:text-on-surface"
                  >
                    Open canvas
                  </Link>
                </figcaption>
              ) : (
                <figcaption className="sr-only">{cover.alt}</figcaption>
              )}
            </figure>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
