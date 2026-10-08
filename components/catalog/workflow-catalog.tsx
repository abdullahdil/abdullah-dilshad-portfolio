/**
 * `WorkflowCatalog({ listings, initialFilter? })` — the full, filterable
 * catalog of published workflows.
 *
 * A Server Component on purpose: it renders every card's preview (the canvas
 * thumbnail SVG) here, strips the canvases off, and hands the client island
 * only small card records plus ready-made markup. The canvases themselves
 * never reach the browser as JSON.
 */

import { WorkflowCatalogClient } from "@/components/catalog/workflow-catalog-client";
import {
  isTeachingCategory,
  toWorkflowCardData,
  type CatalogFilter,
} from "@/components/catalog/workflow-data";
import { WorkflowPreview } from "@/components/public/workflow-card";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

export type WorkflowCatalogProps = {
  /** Flat list, in display order (`listPublishedWorkflowListings`). */
  listings: PublicWorkflowListing[];
  /** Server-side starting filter; the URL (?group=&q=&scope=) wins on the client. */
  initialFilter?: Partial<CatalogFilter>;
};

export function WorkflowCatalog({ listings, initialFilter }: WorkflowCatalogProps) {
  const groups: { name: string; teaching: boolean }[] = [];
  for (const listing of listings) {
    if (!groups.some((group) => group.name === listing.category)) {
      groups.push({ name: listing.category, teaching: isTeachingCategory(listing.category) });
    }
  }
  // Teaching material goes last so the chip row leads with delivered work.
  groups.sort((a, b) => Number(a.teaching) - Number(b.teaching));

  const items = listings.map((listing) => ({
    data: toWorkflowCardData(listing),
    preview: <WorkflowPreview workflow={listing} />,
  }));

  return (
    <WorkflowCatalogClient
      items={items}
      groups={groups.map((group) => group.name)}
      initialFilter={{
        q: initialFilter?.q ?? "",
        group: initialFilter?.group ?? null,
        scope: initialFilter?.scope ?? "all",
      }}
    />
  );
}
