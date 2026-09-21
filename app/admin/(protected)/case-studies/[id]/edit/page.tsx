import { notFound } from "next/navigation";
import { CaseStudyForm } from "@/components/admin/case-study-form";
import {
  getAdminCaseStudyById,
  listAdminCaseStudyWorkflows,
  listAdminWorkflowOptions,
} from "@/lib/repositories/admin/case-studies";

export const metadata = { title: "Edit Case Study" };

type EditCaseStudyPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string;
    linkError?: string;
    linksSkipped?: string;
  }>;
};

export default async function EditCaseStudyPage({
  params,
  searchParams,
}: EditCaseStudyPageProps) {
  const { id } = await params;
  const { saved, linkError, linksSkipped } = await searchParams;
  const study = await getAdminCaseStudyById(id);
  if (!study) notFound();

  // The picker is additive: if the workflow-link tables are not reachable the
  // rest of the editor must still load, so failures degrade to an empty picker
  // with an explanation rather than a 500.
  const [workflowOptions, workflowLinks] = await Promise.all([
    listAdminWorkflowOptions().catch(() => null),
    listAdminCaseStudyWorkflows(study.id).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Edit Case Study</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Editing <span className="text-primary">{study.slug}</span>
        </p>
        {saved ? (
          <p className="mt-2 text-sm text-primary" role="status">
            Case study created successfully.
          </p>
        ) : null}
        {linksSkipped ? (
          <p className="mt-2 text-sm text-error" role="alert">
            Related workflows could not be loaded, so none were linked to the
            new case study. Pick them below and save again.
          </p>
        ) : null}
        {linkError ? (
          <p className="mt-2 text-sm text-error" role="alert">
            The case study was created, but its related workflows could not be
            saved. Re-pick them below and save again.
          </p>
        ) : null}
      </div>
      <CaseStudyForm
        mode="edit"
        id={study.id}
        initial={{
          title: study.title,
          slug: study.slug,
          summary: study.summary,
          narrative: study.narrative ?? [],
          businessProblem: study.businessProblem,
          beforeState: study.beforeState,
          beforeIssues: study.beforeIssues,
          architectureDescription: study.architectureDescription,
          architectureNodes: study.architectureNodes,
          steps: study.steps,
          tools: study.tools,
          contribution: study.contribution,
          reliabilityControls: study.reliabilityControls,
          result: study.result,
          accent: study.accent,
          previewLabel: study.previewLabel,
          status: study.status,
          featuredImageUrl: study.featuredImageUrl ?? "",
          demoVideoUrl: study.demoVideoUrl ?? "",
          galleryImages: study.galleryImages,
          galleryPlaceholders: study.galleryPlaceholders,
          demoVideoLabel: study.demoVideoLabel,
          displayOrder: study.displayOrder,
          isFeatured: study.isFeatured,
        }}
        workflowOptions={workflowOptions ?? []}
        initialWorkflowIds={(workflowLinks ?? []).map((link) => link.workflowId)}
        workflowOptionsLoaded={Boolean(workflowOptions && workflowLinks)}
        workflowOptionsError={
          workflowOptions && workflowLinks
            ? null
            : "Workflow links could not be loaded. Saving will leave the existing links unchanged."
        }
      />
    </div>
  );
}
