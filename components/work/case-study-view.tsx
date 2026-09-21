import { CaseStudyCta } from "@/components/work/case-study-cta";
import { CaseStudyHero } from "@/components/work/case-study-hero";
import {
  CaseStudyNarrative,
  resolveCaseStudyNarrative,
} from "@/components/work/case-study-narrative";
import { CaseStudyNav } from "@/components/work/case-study-nav";
import { CaseStudyWorkflows } from "@/components/work/case-study-workflows";
import type { CaseStudy } from "@/lib/content/types";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

type CaseStudyViewProps = {
  study: CaseStudy;
  previous: CaseStudy | null;
  next: CaseStudy | null;
  /** Empty for a study with no linked workflows — the section then vanishes. */
  relatedWorkflows?: PublicWorkflowListing[];
};

/**
 * A case study is a story, not a spec sheet: the opener and its cover, then
 * the prose — what the business was dealing with, what was built, how it was
 * built and what it gave back — with the real n8n canvases dropped in at the
 * moment the story describes the system, then the next study and the CTA.
 *
 * Where the canvases land is the narrative's own call: the first section that
 * sets `showWorkflowsAfter` splits the prose and the canvases sit in the seam,
 * so the reader sees the build while it is being described rather than as an
 * appendix. With no such marker the canvases simply follow the whole story.
 *
 * The earlier list sections (problem/before, architecture diagram, pipeline
 * steps, reliability controls, tools and contribution, media gallery, result
 * metrics) are no longer in the reading order. Their data is untouched on the
 * record and in the CMS — only the rendering is gone.
 */
export function CaseStudyView({
  study,
  previous,
  next,
  relatedWorkflows = [],
}: CaseStudyViewProps) {
  const narrative = resolveCaseStudyNarrative(study);
  const splitIndex = narrative.findIndex((section) => section.showWorkflowsAfter);
  const hasSplit = splitIndex !== -1;

  const opening = hasSplit ? narrative.slice(0, splitIndex + 1) : narrative;
  const continuation = hasSplit ? narrative.slice(splitIndex + 1) : [];

  return (
    <article>
      <CaseStudyHero study={study} />
      <CaseStudyNarrative sections={opening} />
      <CaseStudyWorkflows workflows={relatedWorkflows} />
      <CaseStudyNarrative sections={continuation} lead={false} />
      <CaseStudyNav previous={previous} next={next} />
      <CaseStudyCta />
    </article>
  );
}
