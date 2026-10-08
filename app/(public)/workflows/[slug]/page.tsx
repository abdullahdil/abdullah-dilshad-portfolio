import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import {
  drawableCanvas,
  workflowFacts,
  workflowPath,
  workflowSlug,
  workflowStatus,
  type WorkflowStatus,
} from "@/components/catalog/workflow-data";
import { WorkflowAccessButton } from "@/components/public/workflow-access-button";
import { WorkflowCanvasView } from "@/components/public/workflow-canvas";
import { NODE_KIND_LABELS, nodeKindFill, nodeKindStroke } from "@/components/public/workflow-canvas-geometry";
import { WorkflowStatusChip } from "@/components/public/workflow-card-view";
import { WorkflowToolIcons } from "@/components/public/workflow-tool-icons";
import { JsonLd } from "@/components/seo/json-ld-script";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ToolChip } from "@/components/ui/tool-chip";
import { getPublishedCaseStudiesForWorkflow } from "@/lib/repositories/case-studies";
import {
  getPublishedWorkflowBySlug,
  listPublishedWorkflowListings,
} from "@/lib/repositories/site-content";
import { workflowJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type WorkflowPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const listings = await listPublishedWorkflowListings();
  return listings.map((listing) => ({ slug: workflowSlug(listing) }));
}

const STATUS_COPY: Readonly<Record<WorkflowStatus, string>> = {
  production: "Production build",
  teaching: "Teaching demo",
  build: "Build",
};

export async function generateMetadata({ params }: WorkflowPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workflow = await getPublishedWorkflowBySlug(slug);
  if (!workflow) return { title: "Workflow not found", robots: { index: false } };

  return buildPageMetadata({
    title: `${workflow.title} — ${workflow.category}`,
    description: workflow.summary,
    path: workflowPath(workflow),
    type: "article",
    // The segment's opengraph-image.tsx supplies the social card.
    image: null,
  });
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { slug } = await params;
  const workflow = await getPublishedWorkflowBySlug(slug);
  if (!workflow) notFound();

  const [listings, caseStudies] = await Promise.all([
    listPublishedWorkflowListings(),
    getPublishedCaseStudiesForWorkflow(workflowSlug(workflow)),
  ]);

  const canvas = drawableCanvas(workflow.canvas);
  const facts = canvas ? workflowFacts(canvas) : null;
  const status = workflowStatus(workflow);

  const siblings = listings.filter((listing) => listing.category === workflow.category);
  const index = siblings.findIndex((listing) => listing.id === workflow.id);
  const previous = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const groupHref = `/work?group=${encodeURIComponent(workflow.category)}#catalog`;

  return (
    <main id="main-content">
      <JsonLd data={workflowJsonLd(workflow)} />

      <Section space="tight" className="pt-10 md:pt-14" aria-labelledby="workflow-title">
        <Container>
          <nav aria-label="Breadcrumb">
            <ol className="font-label flex flex-wrap items-center gap-1.5 text-on-surface-faint">
              <li>
                <Link href="/work" className="hover:text-on-surface">
                  Work
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link href={groupHref} className="hover:text-on-surface">
                  {workflow.category}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li aria-current="page" className="text-on-surface-variant">
                {workflow.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
            <div>
              <WorkflowStatusChip status={status} />
              <h1
                id="workflow-title"
                className="mt-4 font-heading text-display-lg text-balance text-on-surface"
              >
                {workflow.title}
              </h1>
              <p className="mt-5 max-w-[62ch] text-lead text-pretty">{workflow.summary}</p>

              {workflow.outcomeTags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {workflow.outcomeTags.map((tag) => (
                    <ToolChip key={tag}>{tag}</ToolChip>
                  ))}
                </div>
              ) : null}

              {caseStudies.length > 0 ? (
                <p className="mt-6 text-body-md text-on-surface-variant">
                  <span className="font-label mr-2 text-on-surface-faint">Part of case study</span>
                  {caseStudies.map((study, i) => (
                    <span key={study.slug}>
                      {i > 0 ? ", " : null}
                      <Link
                        href={`/work/${study.slug}`}
                        className="font-medium text-on-surface underline decoration-outline-strong underline-offset-4 hover:decoration-accent"
                      >
                        {study.title}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>

            <aside className="panel flex flex-col gap-5 self-start p-5">
              <dl className="grid grid-cols-2 gap-4">
                <Fact label="Status" value={STATUS_COPY[status]} />
                <Fact label="Group" value={workflow.category} />
                {facts ? (
                  <>
                    <Fact label="Nodes" value={String(facts.nodeCount)} />
                    <Fact label="Connections" value={String(facts.connectionCount)} />
                    <Fact
                      label={facts.triggers.length > 1 ? "Triggers" : "Trigger"}
                      value={facts.triggers.length > 0 ? facts.triggers.join(", ") : "Called by another workflow"}
                    />
                    <Fact label="AI steps" value={String(facts.aiSteps)} />
                    <Fact label="Decision points" value={String(facts.branches)} />
                  </>
                ) : null}
              </dl>
              {canvas ? (
                <div>
                  <p className="font-label text-on-surface-faint">Node types</p>
                  <WorkflowToolIcons toolKeys={canvas.toolKeys} max={12} className="mt-2" />
                </div>
              ) : null}
              <div className="border-t border-outline-variant pt-5">
                <p className="text-body-sm text-pretty text-on-surface-variant">
                  Want the build itself? Request the export and I’ll follow up by email.
                </p>
                <WorkflowAccessButton
                  workflowId={workflow.id}
                  workflowTitle={workflow.title}
                  className="mt-3"
                />
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Canvas */}
      <Section space="tight" className="pt-0 md:pt-0" aria-labelledby="canvas-heading">
        {/* Text aligns to the site container; only the canvas frame runs wider. */}
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="canvas-heading" className="font-heading text-headline-sm text-on-surface">
              The canvas
            </h2>
            {canvas ? (
              <p className="font-label text-on-surface-faint">
                Drag to pan · Ctrl/⌘ + scroll or pinch to zoom · arrows and +/− on keyboard
              </p>
            ) : null}
          </div>
        </Container>

        {canvas ? (
          <Container size="wide" className="mt-4">
            <div className="relative h-[min(78vh,780px)] min-h-[420px] overflow-hidden rounded-2xl border border-outline-strong bg-surface-highest p-1.5 shadow-sm sm:p-2">
              <div className="relative h-full overflow-hidden rounded-xl border border-outline-variant">
                <WorkflowCanvasView canvas={canvas} label={workflow.title} wheelZoom="modifier" />
              </div>
            </div>
          </Container>
        ) : null}

        <Container>
          {canvas ? (
            <KindLegend />
          ) : (
            <div className="panel mt-4 px-6 py-14 text-center">
              <p className="mx-auto max-w-[56ch] text-body-md text-pretty text-on-surface-variant">
                {`The canvas for ${workflow.title} hasn't been published yet — request access above and I'll send the export over.`}
              </p>
            </div>
          )}

          {facts && facts.integrations.length > 0 ? (
            <div className="mt-8">
              <h3 className="font-label text-on-surface-faint">Connects to</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {facts.integrations.map((label) => (
                  <ToolChip key={label}>{label}</ToolChip>
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Prev / next within the group */}
      {previous || next ? (
        <Section divider space="tight" aria-label={`More in ${workflow.category}`}>
          <Container>
            <p className="section-eyebrow">{`More in ${workflow.category}`}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={workflowPath(previous)}
                  className="panel lift group flex flex-col gap-1 p-5"
                >
                  <span className="font-label inline-flex items-center gap-1.5 text-on-surface-faint">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                    Previous
                  </span>
                  <span className="font-heading text-headline-sm text-on-surface">{previous.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <Link
                  href={workflowPath(next)}
                  className="panel lift group flex flex-col gap-1 p-5 sm:items-end sm:text-right"
                >
                  <span className="font-label inline-flex items-center gap-1.5 text-on-surface-faint">
                    Next
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="font-heading text-headline-sm text-on-surface">{next.title}</span>
                </Link>
              ) : null}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* CTA */}
      <Section divider space="tight" aria-labelledby="workflow-cta-heading">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="workflow-cta-heading" className="font-heading text-headline-md text-on-surface">
              Need something like this?
            </h2>
            <p className="mt-2 max-w-[56ch] text-body-md text-pretty text-on-surface-variant">
              Tell me what the process looks like today. I’ll reply with how I would
              build it and where a human should stay in the loop.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-body-md font-medium text-on-primary transition-colors hover:bg-primary-fixed-dim"
            >
              Start a conversation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/work#catalog"
              className="inline-flex h-11 items-center rounded-full border border-outline-strong px-6 text-body-md text-on-surface transition-colors hover:bg-surface-high"
            >
              All workflows
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-label text-on-surface-faint">{label}</dt>
      <dd className="mt-1 text-body-sm text-pretty text-on-surface">{value}</dd>
    </div>
  );
}

function KindLegend() {
  const kinds = ["trigger", "ai", "integration", "logic"] as const;
  return (
    <ul className="font-label mt-3 flex flex-wrap gap-x-5 gap-y-2 text-on-surface-faint">
      <li className="sr-only">Nodes are coloured by kind:</li>
      {kinds.map((kind) => (
        <li key={kind} className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="h-3 w-3 rounded-[4px] border"
            style={{ backgroundColor: nodeKindFill(kind), borderColor: nodeKindStroke(kind) }}
          />
          {NODE_KIND_LABELS[kind]}
        </li>
      ))}
    </ul>
  );
}
