import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ToolChip } from "@/components/ui/tool-chip";
import { WorkflowCanvasThumbnail } from "@/components/public/workflow-canvas-thumbnail";
import type { getPublishedCaseStudyCards } from "@/lib/repositories/case-studies";
import { cn } from "@/lib/utils";

export type CaseStudyCardData = Awaited<
  ReturnType<typeof getPublishedCaseStudyCards>
>[number];

const MAX_VISIBLE_TOOLS = 3;

/**
 * Selected work: the case studies as three distinct cards, each led by its
 * real workflow canvas (server-rendered thumbnail — no client JS) so the
 * visitor sees the system before reading about it.
 */
export function CaseStudiesSection({ cards }: { cards: CaseStudyCardData[] }) {
  if (cards.length === 0) return null;

  return (
    <Section id="work" divider aria-labelledby="work-title">
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          title="Case studies"
          titleId="work-title"
          description="Production automation systems across lead generation, internal operations, and customer support."
          action={
            <Link
              href="/work"
              className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface transition-colors hover:text-accent"
            >
              <span className="link-underline">All work</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          }
        />

        <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((study, index) => {
            const visibleTools = study.tools.slice(0, MAX_VISIBLE_TOOLS);
            const hiddenToolCount = study.tools.length - visibleTools.length;

            return (
              <li
                key={study.slug}
                className={cn(
                  "flex",
                  // Three cards on two columns would orphan the last one.
                  cards.length % 2 === 1 &&
                    index === cards.length - 1 &&
                    "md:col-span-2 lg:col-span-1",
                )}
              >
                <Link
                  href={`/work/${study.slug}`}
                  className="panel panel-depth lift group flex w-full flex-col overflow-hidden"
                >
                  <div
                    className={cn(
                      "relative aspect-[16/10] w-full overflow-hidden border-b border-outline-variant",
                      study.previewCanvas ? "bg-surface-lowest" : "bg-surface-high",
                    )}
                  >
                    {study.previewCanvas ? (
                      <WorkflowCanvasThumbnail canvas={study.previewCanvas} />
                    ) : study.featuredImageUrl ? (
                      <Image
                        src={study.featuredImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center px-4 text-center font-label text-on-surface-faint">
                        {study.previewLabel}
                      </span>
                    )}
                    <span className="font-label tabular absolute left-3 top-3 rounded-md border border-outline-variant bg-surface-container/85 px-2 py-1 text-on-surface-variant backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col px-5 pt-5 pb-5 md:px-6">
                    <h3 className="font-heading text-headline-sm text-balance text-on-surface transition-colors duration-200 group-hover:text-accent">
                      {study.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-4 text-body-sm text-pretty text-on-surface-variant">
                      {study.summary}
                    </p>

                    {visibleTools.length > 0 ? (
                      <div className="mt-4 flex flex-wrap items-center gap-1.5">
                        {visibleTools.map((tool) => (
                          <ToolChip key={tool}>{tool}</ToolChip>
                        ))}
                        {hiddenToolCount > 0 ? (
                          <span className="font-label text-on-surface-faint">
                            +<span className="tabular">{hiddenToolCount}</span>
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <span className="mt-auto flex items-center gap-1.5 pt-5 text-body-sm font-medium text-on-surface-variant transition-colors group-hover:text-on-surface">
                      Read case study
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
