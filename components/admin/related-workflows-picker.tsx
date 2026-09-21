"use client";

import { useMemo, useState } from "react";
import type { AdminWorkflowOption } from "@/lib/repositories/admin/case-studies";
import { MAX_CASE_STUDY_WORKFLOW_LINKS } from "@/lib/validations/case-study";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

type RelatedWorkflowsPickerProps = {
  name?: string;
  options: AdminWorkflowOption[];
  initialSelectedIds?: string[];
  /** Set when the options could not be loaded, so the picker explains itself. */
  loadError?: string | null;
  /**
   * False when the options / current links could not be read. The form submits
   * this as a hidden flag so the action can tell "the admin deliberately
   * cleared every link" (loaded, empty array) apart from "the picker never had
   * the links to begin with" (not loaded) and skip the destructive replace.
   */
  loaded?: boolean;
  loadedFieldName?: string;
};

const UNGROUPED = "Ungrouped";

function Badge({
  tone,
  children,
}: {
  tone: "warn" | "muted";
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        tone === "warn"
          ? "rounded-full bg-error-container px-2 py-0.5 font-label text-xs text-on-error-container"
          : "rounded-full bg-surface-highest px-2 py-0.5 font-label text-xs text-on-surface-variant"
      }
    >
      {children}
    </span>
  );
}

export function RelatedWorkflowsPicker({
  name = "relatedWorkflowIdsJson",
  options,
  initialSelectedIds = [],
  loadError = null,
  loaded = true,
  loadedFieldName = "relatedWorkflowsLoaded",
}: RelatedWorkflowsPickerProps) {
  const byId = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );

  // Drop ids that no longer resolve to a workflow so the form can never submit
  // a dangling foreign key.
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialSelectedIds.filter((id) => byId.has(id)),
  );
  const [query, setQuery] = useState("");

  const json = useMemo(() => JSON.stringify(selectedIds), [selectedIds]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const atCap = selectedIds.length >= MAX_CASE_STUDY_WORKFLOW_LINKS;

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const buckets = new Map<string, AdminWorkflowOption[]>();

    for (const option of options) {
      if (needle) {
        const haystack =
          `${option.title} ${option.slug} ${option.category}`.toLowerCase();
        if (!haystack.includes(needle)) continue;
      }
      const key = option.category || UNGROUPED;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(option);
      else buckets.set(key, [option]);
    }

    return [...buckets.entries()];
  }, [options, query]);

  const matchCount = groups.reduce((total, [, items]) => total + items.length, 0);

  function toggle(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= MAX_CASE_STUDY_WORKFLOW_LINKS) return current;
      return [...current, id];
    });
  }

  function move(index: number, delta: number) {
    setSelectedIds((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = current.slice();
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={json} />
      <input
        type="hidden"
        name={loadedFieldName}
        value={loaded ? "1" : "0"}
      />

      <div>
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Related workflows
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Their n8n canvases render on this case study, in the order below. The
          first one is the primary preview. Up to{" "}
          {MAX_CASE_STUDY_WORKFLOW_LINKS}.
        </p>
      </div>

      {loadError ? (
        <p className="text-sm text-error" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="rounded-lg border border-outline-variant/15 bg-surface-low p-4">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Selected ({selectedIds.length})
        </p>
        {selectedIds.length === 0 ? (
          <p className="mt-2 text-sm text-on-surface-variant">
            No workflows linked yet.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {selectedIds.map((id, index) => {
              const option = byId.get(id);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-outline-variant/20 bg-surface-container px-3 py-2"
                >
                  <span className="font-label text-xs text-on-surface-variant">
                    {index + 1}
                  </span>
                  <span className="text-sm text-on-surface">
                    {option?.title ?? id}
                  </span>
                  {index === 0 ? <Badge tone="muted">Primary</Badge> : null}
                  {option && !option.hasCanvas ? (
                    <Badge tone="warn">No canvas</Badge>
                  ) : null}
                  {option && !option.isPublished ? (
                    <Badge tone="warn">Unpublished</Badge>
                  ) : null}
                  <span className="ml-auto flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${option?.title ?? id} up`}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => move(index, 1)}
                      disabled={index === selectedIds.length - 1}
                      aria-label={`Move ${option?.title ?? id} down`}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggle(id)}
                      aria-label={`Remove ${option?.title ?? id}`}
                    >
                      Remove
                    </Button>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relatedWorkflowSearch">Find a workflow</Label>
        <Input
          id="relatedWorkflowSearch"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, slug or category"
        />
        <p className="text-sm text-on-surface-variant">
          {matchCount} of {options.length} workflows shown.
          {atCap ? " Link limit reached — remove one to add another." : ""}
        </p>
      </div>

      <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-outline-variant/15 bg-surface-low p-4">
        {groups.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No workflows match.</p>
        ) : (
          groups.map(([category, items]) => (
            <div key={category} className="space-y-2">
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                {category}
              </p>
              <ul className="space-y-1">
                {items.map((option) => {
                  const checked = selectedSet.has(option.id);
                  return (
                    <li key={option.id}>
                      <label className="flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 text-sm text-on-surface hover:bg-surface-high">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && atCap}
                          onChange={() => toggle(option.id)}
                          className="rounded border-outline-variant"
                        />
                        <span>{option.title}</span>
                        {option.hasCanvas ? (
                          <Badge tone="muted">Canvas</Badge>
                        ) : (
                          <Badge tone="warn">No canvas</Badge>
                        )}
                        {option.isPublished ? null : (
                          <Badge tone="warn">Unpublished</Badge>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
