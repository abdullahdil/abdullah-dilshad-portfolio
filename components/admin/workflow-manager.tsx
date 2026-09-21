"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  deleteWorkflowAction,
  deleteWorkflowGroupAction,
  deleteWorkflowImageAction,
  saveWorkflowAction,
  saveWorkflowCanvasAction,
  saveWorkflowGroupAction,
} from "@/lib/admin/actions/site-content";
import type { ActionResult } from "@/lib/admin/types";
import type {
  WorkflowGroupRow,
  WorkflowRow,
} from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { WorkflowCanvasView } from "@/components/public/workflow-canvas";
import { MAX_WORKFLOW_CANVAS_CHARS } from "@/lib/validations/workflow-canvas";
import { iconForTypeKey } from "@/lib/workflow-canvas/icons";
import { parseN8nWorkflowJson } from "@/lib/workflow-canvas/parse";
import type { WorkflowCanvasParseResult } from "@/lib/workflow-canvas/types";

function GroupEditor({ item }: { item?: WorkflowGroupRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveWorkflowGroupAction, null);
  const key = item?.id ?? "new";

  return (
    <form
      action={formAction}
      className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4"
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`category-${key}`}>Category name</Label>
          <Input
            id={`category-${key}`}
            name="category"
            required
            placeholder="Lead Generation & Outreach"
            defaultValue={item?.category ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`gorder-${key}`}>Display order</Label>
          <Input
            id={`gorder-${key}`}
            name="displayOrder"
            type="number"
            defaultValue={item?.display_order ?? 0}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`gdesc-${key}`}>Category description</Label>
          <Textarea
            id={`gdesc-${key}`}
            name="description"
            rows={2}
            defaultValue={item?.description ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={item?.is_published ?? true}
          />
          Published
        </label>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update category" : "Add category"}
      </Button>
    </form>
  );
}

function WorkflowImageRemover({ item }: { item: WorkflowRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(deleteWorkflowImageAction, null);

  if (!item.image_url) return null;

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="id" value={item.id} />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Removing…" : "Remove image"}
        </Button>
      </form>
      <FormResult result={state} />
    </div>
  );
}

function WorkflowEditor({
  groups,
  groupId,
  item,
}: {
  groups: WorkflowGroupRow[];
  groupId?: string;
  item?: WorkflowRow;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveWorkflowAction, null);
  const key = item?.id ?? `new-${groupId ?? "any"}`;

  return (
    <form
      action={formAction}
      className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4"
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`wtitle-${key}`}>Workflow title</Label>
          <Input
            id={`wtitle-${key}`}
            name="title"
            required
            placeholder="Prospect Discovery Engine"
            defaultValue={item?.title ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`wgroup-${key}`}>Category</Label>
          <Select
            id={`wgroup-${key}`}
            name="groupId"
            required
            defaultValue={item?.group_id ?? groupId ?? ""}
          >
            <option value="">Select a category…</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.category}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`wslug-${key}`}>Slug</Label>
          <Input
            id={`wslug-${key}`}
            name="slug"
            required
            placeholder="prospect-discovery-engine"
            defaultValue={item?.slug ?? ""}
          />
          <p className="text-xs text-on-surface-variant">
            Also seeds each card&apos;s generated diagram — changing it changes
            the artwork.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`wtags-${key}`}>Outcome tags</Label>
          <Input
            id={`wtags-${key}`}
            name="outcomeTags"
            placeholder="Lead gen, Pipeline"
            defaultValue={(item?.outcome_tags ?? []).join(", ")}
          />
          <p className="text-xs text-on-surface-variant">
            Comma-separated, up to 8.
          </p>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`wsummary-${key}`}>Summary</Label>
          <Textarea
            id={`wsummary-${key}`}
            name="summary"
            rows={3}
            defaultValue={item?.summary ?? ""}
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <ImageUploadField
            name="imageUrl"
            label="Workflow image"
            initialUrl={item?.image_url ?? ""}
            hint="JPEG, PNG, WebP, or GIF · max 5MB · replaces the generated diagram on the public card"
          />
          <div className="space-y-1.5">
            <Label htmlFor={`walt-${key}`}>Image alt text</Label>
            <Input
              id={`walt-${key}`}
              name="imageAlt"
              placeholder="Describe the image for screen readers"
              defaultValue={item?.image_alt ?? ""}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`worder-${key}`}>Display order</Label>
          <Input
            id={`worder-${key}`}
            name="displayOrder"
            type="number"
            defaultValue={item?.display_order ?? 0}
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item?.is_active ?? true}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={item?.is_published ?? true}
            />
            Published
          </label>
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update workflow" : "Add workflow"}
      </Button>
    </form>
  );
}


/** How long to sit still after the last keystroke before parsing. */
const CANVAS_PARSE_DEBOUNCE_MS = 350;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * Whether a row already carries a canvas.
 *
 * Reads both columns because either one alone is enough to mean "done", and
 * tolerates `undefined` — the columns are absent from `select("*")` until the
 * canvas migration is applied, and the page has to keep rendering either way.
 */
function rowHasCanvas(item: WorkflowRow): boolean {
  return Boolean(item.canvas_source ?? item.canvas_json);
}

type CanvasCheck = {
  result: WorkflowCanvasParseResult;
  bytes: number;
};

/**
 * Paste-and-preview for a workflow's n8n export.
 *
 * Its own <form> and its own action on purpose: `saveWorkflowAction` never
 * touches `canvas_json` / `canvas_source`, so editing a workflow's title can
 * never wipe a stored paste, and saving a canvas never rewrites the row.
 *
 * The parse that runs here is feedback only. `saveWorkflowCanvasAction`
 * re-parses server-side and that result is what gets persisted.
 *
 * Collapsed by default: the workflows page carries the whole catalog, and
 * mounting sixty live canvas previews at once is not something anyone asked
 * for. Expanding is per workflow, and a save leaves the row open where it is.
 */
function WorkflowCanvasEditor({
  item,
  hasCanvas,
  onCanvasChange,
}: {
  item: WorkflowRow;
  hasCanvas: boolean;
  onCanvasChange: (id: string, hasCanvas: boolean) => void;
}) {
  // The action is called directly rather than through `useActionState` so the
  // "did this row just get a canvas?" signal can be handed to the parent from
  // the same place the result lands — no effect, no `set-state-in-effect`.
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, startSaving] = useTransition();

  const [open, setOpen] = useState(false);
  // Controlled: a large paste has to survive a failed save, and React 19
  // resets uncontrolled fields once the action settles.
  const [source, setSource] = useState(item.canvas_source ?? "");
  const [check, setCheck] = useState<CanvasCheck | null>(null);
  const [checking, startCheck] = useTransition();
  const [showPreview, setShowPreview] = useState(true);
  const [clipboardNote, setClipboardNote] = useState<string | null>(null);
  const key = item.id;

  // Debounced so a 2MB paste is parsed once, when typing stops, rather than on
  // every keystroke. The work stays off the render path entirely.
  useEffect(() => {
    const text = source.trim();
    const timer = window.setTimeout(() => {
      startCheck(() => {
        if (!text) {
          setCheck(null);
          return;
        }
        // Size-checked before parsing so a runaway file can never be walked.
        if (source.length > MAX_WORKFLOW_CANVAS_CHARS) {
          setCheck({
            result: {
              ok: false,
              error: `That export is ${formatBytes(source.length)} — too large to store. The limit is ${formatBytes(MAX_WORKFLOW_CANVAS_CHARS)}.`,
            },
            bytes: source.length,
          });
          return;
        }
        setCheck({
          result: parseN8nWorkflowJson(text),
          bytes: new TextEncoder().encode(text).length,
        });
      });
    }, text ? CANVAS_PARSE_DEBOUNCE_MS : 0);
    return () => window.clearTimeout(timer);
  }, [source]);

  /**
   * Sends one canvas payload. An empty `nextSource` is the clear branch — the
   * action nulls both columns rather than storing an empty graph.
   */
  function save(nextSource: string) {
    const data = new FormData();
    data.set("id", item.id);
    data.set("canvasSource", nextSource);
    // Sanitising can empty an export's own name; the portfolio title is what
    // the canvas falls back to rather than a generic placeholder.
    data.set("canvasFallbackName", item.title);
    startSaving(async () => {
      const result = await saveWorkflowCanvasAction(null, data);
      setState(result);
      if (result.ok) {
        // What was stored is the sanitised export, not the paste. Refilling
        // from it keeps the textarea, the preview and the public canvas in
        // agreement, and makes a re-save a no-op rather than a second sanitise
        // of text that is already clean.
        if (typeof result.source === "string") setSource(result.source);
        onCanvasChange(item.id, nextSource.trim().length > 0);
      }
    });
  }

  function clearCanvas() {
    setSource("");
    setCheck(null);
    save("");
  }

  async function pasteFromClipboard() {
    setClipboardNote(null);
    try {
      const text = await navigator.clipboard?.readText();
      if (typeof text === "string" && text.trim()) {
        setSource(text);
        return;
      }
      setClipboardNote("Clipboard is empty — paste into the box instead.");
    } catch {
      // Unsupported browser, insecure origin, or the user said no. Never block
      // the flow on it; the textarea is always there.
      setClipboardNote("Clipboard access unavailable — paste with ⌘V / Ctrl+V.");
    }
  }

  const canvas = check?.result.ok ? check.result.canvas : null;
  // `parseN8nWorkflowJson` returns ok:true for a payload with an empty `nodes`
  // array. That is nothing to render and nothing worth storing, so the save
  // button is blocked on it the same way a parse failure blocks it.
  const parseError = check
    ? check.result.ok
      ? check.result.canvas.nodes.length === 0
        ? "That export parsed, but it has no nodes — there is nothing to show."
        : null
      : check.result.error
    : null;

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container px-3 py-2">
        <Badge tone={hasCanvas ? "primary" : "neutral"}>
          {hasCanvas ? "Canvas ready" : "No canvas yet"}
        </Badge>
        <Button
          type="button"
          size="sm"
          variant={hasCanvas ? "outline" : "primary"}
          onClick={() => setOpen(true)}
        >
          {hasCanvas ? "Edit canvas" : "Add canvas"}
        </Button>
        {state ? <FormResult result={state} /> : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (pending || parseError) return;
        save(source);
      }}
      className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4"
    >
      <input type="hidden" name="id" value={item.id} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone={hasCanvas ? "primary" : "neutral"}>
          {hasCanvas ? "Canvas ready" : "No canvas yet"}
        </Badge>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Collapse
        </Button>
      </div>
      <FormResult result={state} />

      <div className="space-y-1.5">
        <Label htmlFor={`wcanvas-${key}`}>Workflow canvas</Label>
        <Textarea
          id={`wcanvas-${key}`}
          name="canvasSource"
          rows={8}
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-xs"
          placeholder='Paste the n8n export here — {"nodes": [...], "connections": {...}}'
          value={source}
          onChange={(event) => setSource(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              if (pending || parseError) return;
              save(source);
            }
          }}
        />
        <p className="text-xs text-on-surface-variant">
          Download a workflow from n8n and paste the JSON, then ⌘/Ctrl+Enter to
          save. Visitors get the interactive canvas below. Leave it empty to
          remove the canvas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={pasteFromClipboard}
        >
          Paste from clipboard
        </Button>
        <span>
          {source ? formatBytes(check?.bytes ?? source.length) : "Empty"}
        </span>
        {checking ? <span>Checking…</span> : null}
        {clipboardNote ? <span>{clipboardNote}</span> : null}
      </div>

      {parseError ? (
        <p
          className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          role="alert"
        >
          {parseError}
        </p>
      ) : null}

      {canvas ? (
        <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
          <p className="text-sm text-primary" role="status">
            {plural(canvas.nodes.length, "node")},{" "}
            {plural(canvas.stickies.length, "sticky note")},{" "}
            {plural(canvas.edges.length, "connection")}
          </p>
          {canvas.toolKeys.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {canvas.toolKeys.map((toolKey) => {
                const icon = iconForTypeKey(toolKey);
                return (
                  <span
                    key={toolKey}
                    className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-low px-2 py-0.5 text-xs text-on-surface-variant"
                  >
                    <span aria-hidden="true">{icon.glyph}</span>
                    {icon.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {canvas && showPreview ? (
        canvas.nodes.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-outline-variant/15 bg-surface-low">
            <WorkflowCanvasView canvas={canvas} />
          </div>
        ) : (
          <p className="rounded-lg border border-outline-variant/15 bg-surface-low px-3 py-4 text-sm text-on-surface-variant">
            That export is valid but has no nodes — nothing to preview.
          </p>
        )
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending || Boolean(parseError)}>
          {pending ? "Saving…" : "Save canvas"}
        </Button>
        {canvas ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowPreview((value) => !value)}
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
        ) : null}
        {hasCanvas ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={clearCanvas}
          >
            Remove canvas
          </Button>
        ) : null}
      </div>
    </form>
  );
}

type CanvasFilter = "all" | "missing" | "has";

const FILTER_LABELS: Record<CanvasFilter, string> = {
  all: "All",
  missing: "Missing canvas",
  has: "Has canvas",
};

export function WorkflowManager({
  groups,
  workflows,
}: {
  groups: WorkflowGroupRow[];
  workflows: WorkflowRow[];
}) {
  // Saves are optimistic for display only: `revalidatePath` refreshes the rows
  // from the server, but the badge and the counter should flip the instant the
  // action returns ok rather than waiting for the round trip.
  const [canvasOverrides, setCanvasOverrides] = useState<
    Record<string, boolean>
  >({});
  const [filter, setFilter] = useState<CanvasFilter>("all");
  const [query, setQuery] = useState("");

  const handleCanvasChange = useCallback((id: string, hasCanvas: boolean) => {
    setCanvasOverrides((previous) => ({ ...previous, [id]: hasCanvas }));
  }, []);

  const hasCanvasFor = useCallback(
    (item: WorkflowRow) => canvasOverrides[item.id] ?? rowHasCanvas(item),
    [canvasOverrides],
  );

  const covered = useMemo(
    () => workflows.filter(hasCanvasFor).length,
    [workflows, hasCanvasFor],
  );
  const total = workflows.length;
  const remaining = total - covered;

  const needle = query.trim().toLowerCase();
  const matches = useCallback(
    (item: WorkflowRow) => {
      if (filter === "missing" && hasCanvasFor(item)) return false;
      if (filter === "has" && !hasCanvasFor(item)) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.slug.toLowerCase().includes(needle)
      );
    },
    [filter, needle, hasCanvasFor],
  );

  const narrowed = filter !== "all" || needle.length > 0;

  return (
    <div className="space-y-10">
      <section className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-heading text-title-lg text-on-surface">
            Canvas coverage
          </h3>
          <p className="text-sm text-on-surface-variant" role="status">
            Canvas added for <strong className="text-on-surface">{covered}</strong>{" "}
            of {plural(total, "workflow")}
            {remaining > 0 ? ` — ${remaining} still to paste.` : " — all done."}
          </p>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-high"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${total === 0 ? 0 : (covered / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(FILTER_LABELS) as CanvasFilter[]).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "primary" : "outline"}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {FILTER_LABELS[value]}
              {value === "missing" ? ` (${remaining})` : null}
            </Button>
          ))}
          <Input
            aria-label="Filter workflows by title or slug"
            placeholder="Filter by title or slug…"
            className="max-w-xs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-title-lg text-on-surface">
          New category
        </h3>
        <GroupEditor />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-title-lg text-on-surface">
          New workflow
        </h3>
        {groups.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Add a category first — every workflow belongs to one.
          </p>
        ) : (
          <WorkflowEditor groups={groups} />
        )}
      </section>

      <div className="space-y-10">
        {groups.map((group) => {
          const items = workflows.filter((row) => row.group_id === group.id);
          const visible = items.filter(matches);

          // While a filter is on, a category with nothing left to do gets out
          // of the way — the point of the queue is to be short.
          if (narrowed && visible.length === 0) return null;

          const groupRemaining = items.filter(
            (row) => !hasCanvasFor(row),
          ).length;

          return (
            <section key={group.id} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={group.is_published ? "primary" : "neutral"}>
                  {group.category}
                </Badge>
                <span className="text-xs text-on-surface-variant">
                  {narrowed
                    ? `${visible.length} of ${plural(items.length, "workflow")}`
                    : plural(items.length, "workflow")}
                  {groupRemaining > 0
                    ? ` · ${groupRemaining} missing a canvas`
                    : items.length > 0
                      ? " · all have a canvas"
                      : ""}
                </span>
                <form action={deleteWorkflowGroupAction}>
                  <input type="hidden" name="id" value={group.id} />
                  <Button type="submit" size="sm" variant="danger">
                    Delete category + its workflows
                  </Button>
                </form>
              </div>

              <GroupEditor item={group} />

              <div className="space-y-3 border-l border-outline-variant/20 pl-4">
                {visible.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-on-surface">
                        {item.title}
                      </span>
                      <Badge tone={hasCanvasFor(item) ? "primary" : "neutral"}>
                        {hasCanvasFor(item) ? "Canvas ✓" : "No canvas"}
                      </Badge>
                      {item.is_published ? null : (
                        <Badge tone="neutral">Draft</Badge>
                      )}
                      {item.is_active ? null : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                      <WorkflowImageRemover item={item} />
                      <form action={deleteWorkflowAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" size="sm" variant="danger">
                          Delete
                        </Button>
                      </form>
                    </div>
                    <WorkflowCanvasEditor
                      item={item}
                      hasCanvas={hasCanvasFor(item)}
                      onCanvasChange={handleCanvasChange}
                    />
                    <WorkflowEditor
                      groups={groups}
                      groupId={group.id}
                      item={item}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
