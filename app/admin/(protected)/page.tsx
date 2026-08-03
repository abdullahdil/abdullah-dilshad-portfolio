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
    },
    {
      label: "Active Drafts",
      value: String(drafts).padStart(2, "0"),
      hint: "Editable",
      icon: FileEdit,
      accent: "neutral" as const,
    },
    {
      label: "Submissions",
      value: String(unread).padStart(2, "0"),
      hint: "Unread",
      icon: Bell,
      accent: "urgent" as const,
    },
    {
      label: "CMS Health",
      value: "OK",
      hint: "CRUD live",
      icon: Cpu,
      accent: "neutral" as const,
    },
  ];

  const recent = caseStudies.slice(0, 4);

  return (
    <div className="space-y-12">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="font-heading text-headline-lg tracking-tighter text-on-surface">
            Infrastructure <span className="text-primary">Overview</span>
          </h2>
          <p className="mt-2 max-w-xl text-body-lg text-on-surface-variant">
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
              className={`glass-panel rounded-lg p-6 transition-all duration-300 hover:border-primary/40 ${
                stat.accent === "urgent" ? "border-primary/20 bg-primary/5" : ""
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`rounded-lg p-2 ${
                    stat.accent === "urgent"
                      ? "bg-primary text-on-primary"
                      : stat.accent === "primary"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="font-label text-[12px] text-on-surface-variant">
                  {stat.hint}
                </span>
              </div>
              <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {stat.label}
              </h3>
              <p className="mt-1 font-heading text-[42px] font-bold leading-tight text-on-surface">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="glass-panel flex flex-col overflow-hidden rounded-lg lg:col-span-2">
          <div className="flex items-center justify-between border-b border-outline-variant/10 p-6">
            <h4 className="font-heading text-[20px] text-on-surface">Case Studies</h4>
            <Link
              href="/admin/case-studies"
              className="font-label text-[12px] uppercase tracking-wider text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-low font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-on-surface-variant">
                      No case studies yet.{" "}
                      <Link href="/admin/case-studies/new" className="text-primary hover:underline">
                        Create one
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  recent.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-surface-variant/20"
                    >
                      <td className="px-6 py-4 font-label text-on-surface">{row.title}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {row.slug}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                        {row.displayOrder}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/case-studies/${row.id}/edit`}>
                          <MoreVertical
                            className="ml-auto h-5 w-5 text-on-surface-variant group-hover:text-primary"
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
          <div className="glass-panel rounded-lg p-6">
            <h4 className="mb-6 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden />
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
                    <span className="font-label text-[12px] text-on-surface-variant">
                      {item.label}
                    </span>
                    <span className="font-label text-[12px] text-on-surface">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-high">
                    <div
                      className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(255,140,55,0.5)]"
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
