import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { WorkflowCard } from "@/components/public/workflow-card";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

type CaseStudyWorkflowsProps = {
  /**
   * Already resolved by `getPublishedCaseStudyWorkflows` — the repository owns
   * both the Supabase read and the seed fallback, so this component never
   * touches data of its own.
   */
  workflows: PublicWorkflowListing[];
};

/**
 * The real n8n canvases behind a case study, in the admin's order.
 *
 * Reuses the homepage catalog's `WorkflowCard` verbatim: same thumbnail, same
 * pan/zoom dialog, same "Request access" button, so a workflow looks and
 * behaves identically wherever it appears.
 *
 * Renders nothing at all when a study has no links — no heading, no empty
 * grid, no gap in the page rhythm. That is the common case today (a study may
 * declare no related workflows, and the join table may not exist yet), so it
 * is the path that must stay boring.
 */
export function CaseStudyWorkflows({ workflows }: CaseStudyWorkflowsProps) {
  if (workflows.length === 0) {
    return null;
  }

  return (
    <Section divider aria-labelledby="related-workflows-heading">
      <Container size="narrow">
        <p className="section-eyebrow">Workflows</p>
        <h2
          id="related-workflows-heading"
          className="mt-3 font-heading text-headline-lg text-balance text-on-surface"
        >
          The workflows behind it
        </h2>
        <p className="mt-6 text-lead text-pretty">
          The production canvases this system runs on. Open one to pan and zoom
          the graph, or request access to the full build.
        </p>
      </Container>

      <Container size="wide" className="mt-12 md:mt-16">
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              position={index + 1}
            />
          ))}
        </ol>
      </Container>
    </Section>
  );
}
