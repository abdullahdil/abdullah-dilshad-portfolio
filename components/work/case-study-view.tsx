import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  CaseStudyArchitecture,
  type ArchitectureStripNode,
} from "@/components/work/case-study-architecture";
import { stepsForNode } from "@/components/work/case-study-content";
import { CaseStudyCta } from "@/components/work/case-study-cta";
import { CaseStudyGlance } from "@/components/work/case-study-glance";
import { CaseStudyHero } from "@/components/work/case-study-hero";
import {
  CaseStudyNarrative,
  FULL_STORY_ID,
  resolveCaseStudyNarrative,
} from "@/components/work/case-study-narrative";
import { CaseStudyNav } from "@/components/work/case-study-nav";
import { CaseStudyReliability } from "@/components/work/case-study-reliability";
import { CaseStudyStack } from "@/components/work/case-study-stack";
import { CaseStudySteps } from "@/components/work/case-study-steps";
import { CaseStudyWorkflows } from "@/components/work/case-study-workflows";
import type { CaseStudy } from "@/lib/content/types";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

type CaseStudyViewProps = {
  study: CaseStudy;
  previous: CaseStudy | null;
  next: CaseStudy | null;
  /** Empty for a study with no linked workflows — the section then vanishes. */
  relatedWorkflows?: PublicWorkflowListing[];
  /** Optional direct CV link for the closing CTA; falls back to `/resume`. */
  cvUrl?: string | null;
};

/**
 * A case study in two depths. The top of the page answers a recruiter in
 * thirty seconds — hero, a four-tile summary, the system as an interactive
 * pipeline, the steps, the reliability controls, the stack and the real
 * workflows. "The full story" follows for anyone who wants the long read.
 *
 * Every block renders nothing when its data is empty, so a sparse record (or
 * the no-Supabase seed path) still produces a coherent page.
 */
export function CaseStudyView({
  study,
  previous,
  next,
  relatedWorkflows = [],
  cvUrl,
}: CaseStudyViewProps) {
  const narrative = resolveCaseStudyNarrative(study);
  const hasStory = narrative.length > 0;

  const architecture: ArchitectureStripNode[] = study.architectureNodes.map((node) => ({
    ...node,
    steps: stepsForNode(node, study.steps).map(({ stepNumber, title, description }) => ({
      stepNumber,
      title,
      description,
    })),
  }));

  return (
    <article>
      <CaseStudyHero study={study} relatedWorkflows={relatedWorkflows} />
      <CaseStudyGlance study={study} storyAnchor={hasStory ? FULL_STORY_ID : undefined} />

      {architecture.length > 0 ? (
        <Block id="architecture" eyebrow="Architecture" title="How the system fits together">
          <CaseStudyArchitecture nodes={architecture} />
        </Block>
      ) : null}

      {study.steps.length > 0 ? (
        <Block id="steps" eyebrow="Pipeline" title={`${study.steps.length} steps, end to end`}>
          <CaseStudySteps steps={study.steps} />
        </Block>
      ) : null}

      {study.reliabilityControls.length > 0 ? (
        <Block id="reliability" eyebrow="Reliability" title="What keeps it running">
          <CaseStudyReliability controls={study.reliabilityControls} />
        </Block>
      ) : null}

      {study.tools.length > 0 || study.contribution.length > 0 ? (
        <Block id="stack" eyebrow="Stack & role" title="Tools and my contribution">
          <CaseStudyStack tools={study.tools} contribution={study.contribution} />
        </Block>
      ) : null}

      {relatedWorkflows.length > 0 ? (
        <Block
          id="workflows"
          eyebrow="Workflows"
          title="The workflows behind it"
          intro="The production canvases this system runs on. Open one to explore the full graph."
        >
          <CaseStudyWorkflows workflows={relatedWorkflows} />
        </Block>
      ) : null}

      <CaseStudyNarrative sections={narrative} />
      <CaseStudyNav previous={previous} next={next} />
      <CaseStudyCta cvUrl={cvUrl} />
    </article>
  );
}

function Block({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <Section id={id} divider space="tight" aria-labelledby={headingId} className="scroll-mt-16">
      <Container>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2
          id={headingId}
          className="mt-3 font-heading text-headline-lg text-balance text-on-surface"
        >
          {title}
        </h2>
        {intro ? (
          <p className="mt-3 max-w-[60ch] text-body-md text-pretty text-on-surface-variant">
            {intro}
          </p>
        ) : null}
        <div className="mt-8 md:mt-10">{children}</div>
      </Container>
    </Section>
  );
}
