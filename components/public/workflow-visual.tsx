import { WorkflowRunner } from "@/components/public/workflow-runner";
import { listPublishedHeroWorkflowSteps } from "@/lib/repositories/site-content";

type WorkflowVisualProps = {
  className?: string;
  compact?: boolean;
};

/**
 * Runnable pipeline schematic.
 *
 * This file stays a Server Component so the steps keep coming from
 * `listPublishedHeroWorkflowSteps()` (admin-editable at /admin/hero-workflow,
 * seeded from `heroWorkflowSeed`). The interaction — sequencing, the human
 * approval pause, retry-on-failure and the run log — lives in the client
 * component it renders. Nothing here is hardcoded to five steps or to any
 * particular step title.
 */
export async function WorkflowVisual({
  className,
  compact = false,
}: WorkflowVisualProps) {
  const steps = await listPublishedHeroWorkflowSteps();

  if (steps.length === 0) {
    return null;
  }

  return <WorkflowRunner steps={steps} className={className} compact={compact} />;
}
