import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ToolChip } from "@/components/ui/tool-chip";
import { getPublishedCaseStudyCards } from "@/lib/repositories/case-studies";

const MAX_VISIBLE_TOOLS = 4;

export async function CaseStudiesSection() {
  const cards = await getPublishedCaseStudyCards();

  if (cards.length === 0) {
    return null;
  }

  return (
    <Section id="work" divider>
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          title="Case studies"
          description="Production automation systems across lead generation, internal operations, and customer support."
          action={
            <span className="font-label text-on-surface-faint">
              <span className="tabular">
                {String(cards.length).padStart(2, "0")}
              </span>{" "}
              studies
            </span>
          }
        />

        <ol className="mt-14 space-y-4">
          {cards.map((study, index) => {
            const visibleTools = study.tools.slice(0, MAX_VISIBLE_TOOLS);
            const hiddenToolCount = study.tools.length - visibleTools.length;

            return (
              <li key={study.slug}>
                {/* Each study is a raised panel: `.panel` carries the surface,
                    `.panel-depth` catches light on the top edge, `.lift` is the
                    approved 1px hover. */}
                <Link
                  href={`/work/${study.slug}`}
                  className="panel panel-depth lift group block px-5 md:px-7"
                >
                  <div className="grid grid-cols-1 items-start gap-x-8 gap-y-6 py-7 md:grid-cols-12 md:py-9">
                    <p className="font-label text-on-surface-faint md:col-span-1">
                      <span className="tabular">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </p>

                    <div className="md:col-span-6">
                      <h3 className="font-heading text-headline-md text-balance text-on-surface transition-colors duration-200 group-hover:text-accent">
                        {study.title}
                      </h3>
                      <p className="mt-2.5 max-w-[62ch] text-body-md text-pretty text-on-surface-variant">
                        {study.summary}
                      </p>

                      {visibleTools.length > 0 ? (
                        <div className="mt-5 flex flex-wrap items-center gap-1.5">
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
                    </div>

                    <div className="md:col-span-4">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-high">
                        {study.featuredImageUrl ? (
                          <Image
                            src={study.featuredImageUrl}
                            alt={study.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center px-4 text-center font-label text-on-surface-faint">
                            {study.previewLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:col-span-1 md:justify-end md:pt-1">
                      <span className="font-label text-on-surface-variant md:hidden">
                        Read
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-on-surface-faint transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-accent motion-reduce:transform-none"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
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
