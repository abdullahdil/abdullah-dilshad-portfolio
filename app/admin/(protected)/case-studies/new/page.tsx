import { CaseStudyForm } from "@/components/admin/case-study-form";
import { emptyCaseStudyInput } from "@/lib/admin/case-study-defaults";

export const metadata = { title: "New Case Study" };

export default function NewCaseStudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">New Case Study</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Nested workflow fields use JSON. Keep content aligned with CONTENT_TRUTH.md.
        </p>
      </div>
      <CaseStudyForm mode="create" initial={emptyCaseStudyInput} />
    </div>
  );
}
