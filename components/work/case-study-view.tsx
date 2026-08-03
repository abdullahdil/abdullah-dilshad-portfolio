import { ArchitectureDiagram } from "@/components/work/architecture-diagram";
import { CaseStudyCta } from "@/components/work/case-study-cta";
import { CaseStudyHero } from "@/components/work/case-study-hero";
import { CaseStudyNav } from "@/components/work/case-study-nav";
import { MediaGallery } from "@/components/work/media-gallery";
import { PipelineSteps } from "@/components/work/pipeline-steps";
import { ProblemSection } from "@/components/work/problem-section";
import { ReliabilitySection } from "@/components/work/reliability-section";
import { ResultSection } from "@/components/work/result-section";
import { ToolsContribution } from "@/components/work/tools-contribution";
import type { CaseStudy } from "@/lib/content/types";

type CaseStudyViewProps = {
  study: CaseStudy;
  previous: CaseStudy | null;
  next: CaseStudy | null;
};

export function CaseStudyView({ study, previous, next }: CaseStudyViewProps) {
  return (
    <article className="pb-margin-desktop pt-32">
      <CaseStudyHero study={study} />
      <ProblemSection study={study} />
      <ArchitectureDiagram
        nodes={study.architectureNodes}
        description={study.architectureDescription}
      />
      <ToolsContribution study={study} />
      <ReliabilitySection study={study} />
      <PipelineSteps study={study} />
      <MediaGallery study={study} />
      <ResultSection study={study} />
      <CaseStudyNav previous={previous} next={next} />
      <CaseStudyCta />
    </article>
  );
}
