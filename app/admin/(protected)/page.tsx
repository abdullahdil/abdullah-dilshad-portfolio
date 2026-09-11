import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  FileEdit,
  Cpu,
  MoreVertical,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminCaseStudies } from "@/lib/repositories/admin/case-studies";
import { countUnreadMessages } from "@/lib/repositories/admin/messages";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const caseStudies = await listAdminCaseStudies();
  const published = caseStudies.filter((item) => item.status === "published").length;
  const drafts = caseStudies.filter((item) => item.status === "draft").length;

  let unread = 0;
  try {
    unread = await countUnreadMessages();
  } catch {
    unread = 0;
  }

  const stats = [
    {
      label: "Live Projects",
      value: String(published).padStart(2, "0"),
      hint: "Published",
      icon: Rocket,
      accent: "primary" as const,
      primary: true,
    },
    {
      label: "Active Drafts",
      value: String(drafts).padStart(2, "0"),
      hint: "Editable",
      icon: FileEdit,
      accent: "neutral" as const,
      primary: true,
    },
    {
      label: "Submissions",
      value: String(unread).padStart(2, "0"),
      hint: "Unread",
      icon: Bell,
      accent: "urgent" as const,
      primary: true,
    },
    {
      label: "CMS Health",
      value: "OK",
      hint: "CRUD live",
      icon: Cpu,
      accent: "neutral" as const,
      primary: false,
    },
  ];

  const recent = caseStudies.slice(0, 4);

  return (
    <div className="space-y-12">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="font-heading text-headline-lg tracking-tighter text-on-surface">
            Infrastructure Overview
          </h2>
          <p className="mt-2 max-w-xl text-body-md text-on-surface-variant">
            Authenticated command center with live content management.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/settings" variant="outline" size="sm">
            Update Availability
          </Button>
          <Button href="/admin/case-studies/new" variant="secondary" size="sm">
            Create New Project
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`panel p-6 ${stat.primary ? "panel-depth lift" : ""}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`rounded-lg border p-2 ${
                    stat.accent === "urgent"
                      ? "border-outline-variant bg-accent-soft text-accent"
                      : "border-outline-variant bg-surface-high text-on-surface-variant"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="font-label text-on-surface-faint">
                  {stat.hint}
                </span>
              </div>
              <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {stat.label}
              </h3>
              <p className="tabular mt-1 font-heading text-[42px] font-semibold leading-tight tracking-tighter text-on-surface">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="panel panel-depth flex flex-col overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h4 className="font-heading text-headline-sm text-on-surface">Case Studies</h4>
            <Link
              href="/admin/case-studies"
              className="link-underline font-label text-on-surface-variant hover:text-on-surface"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-outline-variant bg-surface-high font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-on-surface-variant">
                      No case studies yet.{" "}
                      <Link href="/admin/case-studies/new" className="link-underline text-accent">
                        Create one
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  recent.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-surface-high/70"
                    >
                      <td className="px-6 py-4 text-body-sm font-medium text-on-surface">{row.title}</td>
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                        {row.slug}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-outline-variant bg-surface-high px-3 py-1 font-label text-on-surface-variant">
                          {row.status}
                        </span>
                      </td>
                      <td className="tabular px-6 py-4 text-[13px] text-on-surface-variant">
                        {row.displayOrder}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/case-studies/${row.id}/edit`}>
                          <MoreVertical
                            className="ml-auto h-5 w-5 text-on-surface-faint transition-colors group-hover:text-on-surface"
                            aria-hidden
                          />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="panel p-6">
            <h4 className="mb-6 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              CMS Status
            </h4>
            <div className="space-y-6">
              {[
                { label: "Auth", value: "Active", width: "100%" },
                { label: "Content CRUD", value: "Active", width: "100%" },
                { label: "Media / Inbox", value: "Active", width: "100%" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between">
                    <span className="font-label text-on-surface-variant">
                      {item.label}
                    </span>
                    <span className="font-label text-on-surface">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-highest">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
