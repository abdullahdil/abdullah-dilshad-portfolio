/**
 * `WorkflowCard({ workflow, position })` — the listing-level card used by case
 * studies (and anything else that already holds a full `PublicWorkflowListing`).
 * Renders the server-compatible thumbnail itself and adds an in-place canvas
 * quick-view; the card surface links to `/workflows/[slug]`.
 *
 * The presentational shell lives in `workflow-card-view.tsx`.
 */

import Image from "next/image";
import { WorkflowCanvasThumbnail } from "@/components/public/workflow-canvas-thumbnail";
import {
  WorkflowCardView,
  WorkflowGlyph,
} from "@/components/public/workflow-card-view";
import { WorkflowQuickView } from "@/components/public/workflow-quick-view";
import { drawableCanvas, toWorkflowCardData } from "@/components/catalog/workflow-data";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

export {
  WorkflowCardView,
  WorkflowGlyph,
  WorkflowStatusChip,
  type WorkflowCardViewProps,
} from "@/components/public/workflow-card-view";

/** Preview well content for a listing: real thumbnail, then image, then glyph. */
export function WorkflowPreview({ workflow }: { workflow: PublicWorkflowListing }) {
  const canvas = drawableCanvas(workflow.canvas);
  if (canvas) return <WorkflowCanvasThumbnail canvas={canvas} />;
  if (workflow.imageUrl) {
    return (
      <Image
        src={workflow.imageUrl}
        alt={workflow.imageAlt || workflow.title}
        fill
        sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw"
        className="object-cover object-center"
      />
    );
  }
  return <WorkflowGlyph seed={workflow.id} />;
}

// ---------------------------------------------------------------------------
// Listing card (original API)
// ---------------------------------------------------------------------------

export type WorkflowCardProps = {
  workflow: PublicWorkflowListing;
  /** 1-based position in the visible list, drawn as the corner index. */
  position: number;
  /** Offer the in-place canvas dialog next to "Request access". Default true. */
  quickView?: boolean;
};

export function WorkflowCard({ workflow, position, quickView = true }: WorkflowCardProps) {
  const canvas = drawableCanvas(workflow.canvas);

  return (
    <WorkflowCardView
      item={toWorkflowCardData(workflow)}
      position={position}
      preview={<WorkflowPreview workflow={workflow} />}
      extraAction={
        quickView && canvas ? (
          <WorkflowQuickView
            title={workflow.title}
            canvas={canvas}
            summary={workflow.summary}
            outcomeTags={workflow.outcomeTags}
          />
        ) : null
      }
    />
  );
}
