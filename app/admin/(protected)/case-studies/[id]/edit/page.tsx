import { notFound } from "next/navigation";
import { CaseStudyForm } from "@/components/admin/case-study-form";
import { getAdminCaseStudyById } from "@/lib/repositories/admin/case-studies";

export const metadata = { title: "Edit Case Study" };

type EditCaseStudyPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditCaseStudyPage({
  params,
  searchParams,
}: EditCaseStudyPageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const study = await getAdminCaseStudyById(id);
  if (!study) notFound();

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
      </div>
      <CaseStudyForm
        mode="edit"
        id={study.id}
        initial={{
          title: study.title,
          slug: study.slug,
          summary: study.summary,
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
      />
    </div>
  );
}
