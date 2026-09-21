"use client";

/**
 * The n8n-style preview frame: a modal that holds `WorkflowCanvasView` inside a
 * rounded, recessed panel, with the workflow title and its node-type row above.
 *
 * Every workflow card opens this dialog, including the ones with no stored
 * canvas — those get an honest empty state (title, summary, outcome tags and a
 * line saying the interactive canvas has not been added yet). A placeholder
 * graph is never drawn: the site must not imply a diagram that does not exist.
 *
 * The shared `Dialog` in `components/ui` is deliberately not reused here — it is
 * sized for forms and does not trap focus, which a full-bleed interactive canvas
 * needs. Focus handling (initial focus, Tab cycling, Escape, restore on close)
 * is implemented below.
 */

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Workflow, X } from "lucide-react";
import { WorkflowCanvasView } from "@/components/public/workflow-canvas";
import { WorkflowToolIcons } from "@/components/public/workflow-tool-icons";
import { ToolChip } from "@/components/ui/tool-chip";
import type { WorkflowCanvas } from "@/lib/workflow-canvas/types";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type WorkflowCanvasDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Null — or a stored canvas with no nodes — renders the empty state. */
  canvas: WorkflowCanvas | null;
  /** Shown in the empty state so the dialog still says something useful. */
  summary?: string;
  outcomeTags?: string[];
};

export function WorkflowCanvasDialog({
  open,
  onClose,
  title,
  canvas,
  summary,
  outcomeTags,
}: WorkflowCanvasDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /**
   * The dialog is rendered into `document.body` rather than in place.
   *
   * The workflow card carries `.lift`, whose hover rule sets a `transform`.
   * A transformed ancestor becomes the containing block for `position: fixed`
   * descendants, so an in-place dialog resolved against the *card* — and the
   * card's `overflow-hidden` then clipped it to a narrow strip. Portalling out
   * makes the modal immune to any ancestor transform, filter or containment.
   *
   * No mount flag is needed: `open` is false during SSR and only flips from a
   * user interaction, so `document` always exists by the time we portal. That
   * also keeps this clear of `react-hooks/set-state-in-effect`.
   */

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap the cycle at both ends so focus can never escape to the page.
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === "undefined") return null;

  // A valid-but-empty canvas is nothing to show — treat it as no canvas.
  const graph = canvas && canvas.nodes.length > 0 ? canvas : null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="absolute inset-0 bg-surface-lowest/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(88vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-strong bg-surface-highest p-2.5 shadow-lg sm:p-3"
      >
        <div className="flex items-start justify-between gap-3 px-1.5 pb-2.5 pt-1">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-heading truncate text-headline-sm text-on-surface"
            >
              {title}
            </h2>
            <p className="font-label mt-1 text-on-surface-faint">
              {graph
                ? `${graph.nodes.length} nodes · drag to pan · scroll to zoom`
                : "Workflow overview"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {graph ? (
              <WorkflowToolIcons
                toolKeys={graph.toolKeys}
                max={5}
                className="hidden sm:flex"
              />
            ) : null}
            <button
              ref={closeRef}
              type="button"
              aria-label="Close workflow canvas"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* The recessed canvas panel inside the frame. */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-outline-variant">
          {graph ? (
            <WorkflowCanvasView canvas={graph} label={title} />
          ) : (
            <CanvasUnavailable
              title={title}
              summary={summary}
              outcomeTags={outcomeTags}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Empty state for a workflow with no stored canvas. No graph, real or faked —
 * just what is actually known about the workflow, plus a plain line about the
 * missing diagram. The title is not repeated here: the dialog header above
 * already carries it (and is what `aria-labelledby` points at).
 */
function CanvasUnavailable({
  title,
  summary,
  outcomeTags,
}: {
  title: string;
  summary?: string;
  outcomeTags?: string[];
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-surface-lowest px-6 py-10">
      <div className="max-w-[56ch] text-center">
        <span
          className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-on-surface-variant"
          aria-hidden
        >
          <Workflow className="h-5 w-5" strokeWidth={1.75} />
        </span>

        {summary ? (
          <p className="mt-5 text-body-md text-pretty text-on-surface">
            {summary}
          </p>
        ) : null}

        {outcomeTags && outcomeTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {outcomeTags.map((tag) => (
              <ToolChip key={tag}>{tag}</ToolChip>
            ))}
          </div>
        ) : null}

        {/* One template literal rather than interleaved JSX text: a bare
            `{title}` between text lines loses the adjacent space when the
            expression sits at a line boundary, which read as "Enginehasn't". */}
        <p className="mt-6 text-body-sm text-pretty text-on-surface-faint">
          {`The interactive canvas for ${title} hasn't been published yet — request access below the card and I'll send the export over.`}
        </p>
      </div>
    </div>
  );
}
