/**
 * `FeaturedWorkflows({ listings })` — the home page's strip of the strongest
 * production systems (largest real canvases, one per group where possible),
 * with a link through to the full catalog on `/work`.
 *
 * Server Component: thumbnails render to SVG here; no canvas JSON and no
 * client JS beyond the per-card "Request access" button.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pickFeaturedWorkflows, toWorkflowCardData } from "@/components/catalog/workflow-data";
import { WorkflowPreview } from "@/components/public/workflow-card";
import { WorkflowCardView } from "@/components/public/workflow-card-view";
import { cn } from "@/lib/utils";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

export type FeaturedWorkflowsProps = {
  /** Every published listing; the component picks the featured six itself. */
  listings: PublicWorkflowListing[];
  /** How many to show. Default 6. */
  count?: number;
  className?: string;
};

export function FeaturedWorkflows({ listings, count = 6, className }: FeaturedWorkflowsProps) {
  const featured = pickFeaturedWorkflows(listings, count);
  if (featured.length === 0) return null;

  return (
    <div className={className}>
      <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((listing) => (
          <WorkflowCardView
            key={listing.id}
            item={toWorkflowCardData(listing)}
            preview={<WorkflowPreview workflow={listing} />}
            showCategory
          />
        ))}
      </ol>

      <div className={cn("mt-8 flex justify-center")}>
        <Link
          href="/work#catalog"
          className="group inline-flex h-11 items-center gap-2 rounded-full border border-outline-strong px-6 text-body-md font-medium text-on-surface transition-colors hover:bg-surface-high"
        >
          {`View all ${listings.length} systems`}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>
    </div>
  );
}
