"use client";

/**
 * Small "peek at the canvas" button for a workflow card. Opens the pan/zoom
 * dialog in place; the card itself links to the full workflow page. Used only
 * where the canvas is already on the page (case studies), so it adds no
 * payload of its own.
 */

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { WorkflowCanvasDialog } from "@/components/public/workflow-canvas-dialog";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

type WorkflowQuickViewProps = {
  title: string;
  canvas: WorkflowCanvas;
  summary?: string;
  outcomeTags?: string[];
};

export function WorkflowQuickView({
  title,
  canvas,
  summary,
  outcomeTags,
}: WorkflowQuickViewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-3 text-body-sm text-on-surface-variant transition-colors hover:border-outline-strong hover:text-on-surface"
      >
        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        Canvas
        <span className="sr-only">{` — open the ${title} canvas`}</span>
      </button>
      <WorkflowCanvasDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        canvas={canvas}
        summary={summary}
        outcomeTags={outcomeTags}
      />
    </>
  );
}
