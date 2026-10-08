import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CaseStudyHubCard } from "@/components/catalog/case-study-hub-card";
import { WorkflowCatalog } from "@/components/catalog/workflow-catalog";
import { workflowPath } from "@/components/catalog/workflow-data";
import { JsonLd } from "@/components/seo/json-ld-script";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  getPublishedCaseStudyCards,
  listPublishedCaseStudies,
} from "@/lib/repositories/case-studies";
import { listPublishedWorkflowListings } from "@/lib/repositories/site-content";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

const TITLE = "Work — case studies and workflow catalog";
const DESCRIPTION =
  "Three automation systems written up end to end, plus a searchable catalog of the workflows behind them: lead generation, hiring, content, research and operations.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/work",
});

export default async function WorkHubPage() {
  const [studies, cards, listings] = await Promise.all([
    listPublishedCaseStudies(),
    getPublishedCaseStudyCards(),
    listPublishedWorkflowListings(),
  ]);

  const canvasBySlug = new Map(cards.map((card) => [card.slug, card.previewCanvas]));
  const groupCount = new Set(listings.map((listing) => listing.category)).size;

  const jsonLd = [
    collectionPageJsonLd({ name: "Work", description: DESCRIPTION, path: "/work" }),
    itemListJsonLd([
      ...studies.map((study) => ({ name: study.title, path: `/work/${study.slug}` })),
      ...listings.map((listing) => ({ name: listing.title, path: workflowPath(listing) })),
    ]),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
    ]),
  ];

  return (
    <main id="main-content">
      <JsonLd data={jsonLd} />

      {/* Intro */}
      <Section space="tight" className="pt-16 md:pt-24" aria-labelledby="work-heading">
        <Container>
          <p className="section-eyebrow">Work</p>
          <h1
            id="work-heading"
            className="mt-4 max-w-[22ch] font-heading text-display-lg text-balance text-on-surface"
          >
            Case studies, and the systems behind them
          </h1>
          <p className="mt-6 max-w-[62ch] text-lead text-pretty">
            {`Three systems written up end to end — the problem, the build and the controls that keep it running. Below them, the full catalog: ${listings.length} workflows across ${groupCount} groups, each with its real canvas where one is published.`}
          </p>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-outline-variant pt-6">
            <Stat value={String(studies.length)} label="Case studies" />
            <Stat value={String(listings.length)} label="Workflows catalogued" />
            <Stat value={String(groupCount)} label="Groups" />
          </dl>

          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
            <JumpLink href="#case-studies">Case studies</JumpLink>
            <JumpLink href="#catalog">Workflow catalog</JumpLink>
          </nav>
        </Container>
      </Section>

      {/* Case studies */}
      <Section id="case-studies" divider aria-labelledby="case-studies-heading">
        <Container>
          <p className="section-eyebrow">Case studies</p>
          <h2
            id="case-studies-heading"
            className="mt-3 font-heading text-headline-lg text-balance text-on-surface"
          >
            Three systems, told end to end
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {studies.map((study, index) => (
              <CaseStudyHubCard
                key={study.slug}
                study={study}
                index={index + 1}
                canvas={canvasBySlug.get(study.slug) ?? null}
              />
            ))}
          </ol>
        </Container>
      </Section>

      {/* Catalog */}
      <Section id="catalog" divider tone="low" aria-labelledby="catalog-heading">
        <Container>
          <p className="section-eyebrow">Catalog</p>
          <h2
            id="catalog-heading"
            className="mt-3 font-heading text-headline-lg text-balance text-on-surface"
          >
            Every workflow, searchable
          </h2>
          <p className="mt-4 max-w-[62ch] text-body-md text-pretty text-on-surface-variant">
            Filter by group, or switch between production builds and the teaching
            demos I use in training. Each card opens the workflow’s own page with
            its full, zoomable canvas. The filter lives in the URL, so a filtered
            view can be shared as a link.
          </p>
          <div className="mt-10">
            <WorkflowCatalog listings={listings} />
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section divider space="tight" aria-labelledby="work-cta-heading">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="work-cta-heading" className="font-heading text-headline-md text-on-surface">
              Need a system like one of these?
            </h2>
            <p className="mt-2 max-w-[56ch] text-body-md text-pretty text-on-surface-variant">
              Tell me what is manual today and where it breaks. I’ll reply with how I
              would automate it, and where a human should stay in the loop.
            </p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-body-md font-medium text-on-primary transition-colors hover:bg-primary-fixed-dim"
          >
            Start a conversation
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </Section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-label text-on-surface-faint">{label}</dt>
      <dd className="tabular mt-1 font-heading text-headline-lg text-on-surface">{value}</dd>
    </div>
  );
}

function JumpLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-3.5 text-body-sm text-on-surface-variant transition-colors hover:border-outline-strong hover:text-on-surface"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 rotate-90" aria-hidden />
    </a>
  );
}
