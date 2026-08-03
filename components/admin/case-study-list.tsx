import Link from "next/link";
import {
  deleteCaseStudyAction,
  setCaseStudyStatusAction,
} from "@/lib/admin/actions/case-studies";
import type { AdminCaseStudyListItem } from "@/lib/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusTone = {
  draft: "neutral",
  published: "primary",
  archived: "tertiary",
} as const;

export function CaseStudyList({ items }: { items: AdminCaseStudyListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="glass-panel rounded-lg p-8 text-on-surface-variant">
        No case studies yet. Create the first one to populate the portfolio.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant/10">
      <table className="w-full border-collapse text-left">
        <thead className="bg-surface-low font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {items.map((item) => (
            <tr key={item.id} className="bg-surface-container/40">
              <td className="px-4 py-4">
                <div className="font-medium text-on-surface">{item.title}</div>
                <div className="text-xs text-on-surface-variant">{item.slug}</div>
              </td>
              <td className="px-4 py-4">
                <Badge tone={statusTone[item.status]}>{item.status}</Badge>
              </td>
              <td className="px-4 py-4 text-sm text-on-surface-variant">
                {item.displayOrder}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button href={`/admin/case-studies/${item.id}/edit`} size="sm" variant="outline">
                    Edit
                  </Button>
                  {item.status === "published" ? (
                    <Link
                      href={`/work/${item.slug}`}
                      className="rounded-full border border-outline/30 px-3 py-1 text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary"
                      target="_blank"
                    >
                      View
                    </Link>
                  ) : null}
                  {item.status !== "published" ? (
                    <form action={setCaseStudyStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="published" />
                      <Button type="submit" size="sm">
                        Publish
                      </Button>
                    </form>
                  ) : (
                    <form action={setCaseStudyStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="draft" />
                      <Button type="submit" size="sm" variant="outline">
                        Unpublish
                      </Button>
                    </form>
                  )}
                  <form action={deleteCaseStudyAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" size="sm" variant="danger">
                      Delete
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
