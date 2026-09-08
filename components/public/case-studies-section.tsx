import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublishedCaseStudyCards } from "@/lib/repositories/case-studies";

export async function CaseStudiesSection() {
  const cards = await getPublishedCaseStudyCards();

  return (
    <Section id="work">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="section-eyebrow mb-3">Selected work</p>
          <h2 className="font-heading text-headline-lg text-on-surface">Case studies</h2>
          <p className="mt-3 text-body-md text-on-surface-variant">
            Production automation systems across lead generation, internal operations,
            and customer support.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {cards.map((study) => (
            <Link
              key={study.slug}
              href={`/work/${study.slug}`}
              className="group flex flex-col rounded-lg border border-outline-variant bg-surface-low transition-colors hover:border-outline hover:bg-surface-high"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg bg-surface-highest">
                {study.featuredImageUrl ? (
                  <Image
                    src={study.featuredImageUrl}
                    alt={study.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6">
                    <p className="text-center text-sm text-on-surface-variant">
                      {study.tools.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  {study.tools.slice(0, 3).map((tool) => (
                    <Badge key={tool}>{tool}</Badge>
                  ))}
                </div>
                <h3 className="font-heading text-headline-md text-on-surface">
                  {study.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                  {study.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-on-surface group-hover:text-accent">
                  Read case study
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
