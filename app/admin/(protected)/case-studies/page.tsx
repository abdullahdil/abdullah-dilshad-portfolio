import { CaseStudyList } from "@/components/admin/case-study-list";
import { Button } from "@/components/ui/button";
import { listAdminCaseStudies } from "@/lib/repositories/admin/case-studies";

export const metadata = { title: "Case Studies" };

export default async function AdminCaseStudiesPage() {
  const items = await listAdminCaseStudies();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-headline-lg text-on-surface">Case Studies</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Create, edit, publish, and archive portfolio case studies.
          </p>
        </div>
        <Button href="/admin/case-studies/new" size="sm">
          New Case Study
        </Button>
      </div>
      <CaseStudyList items={items} />
    </div>
  );
}
