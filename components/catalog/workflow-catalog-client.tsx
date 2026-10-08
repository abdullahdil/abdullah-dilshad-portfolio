"use client";

/**
 * Client half of the workflow catalog: search, group chips and the
 * production / teaching toggle, with the filter mirrored in the URL
 * (`?group=&q=&scope=`) so any filtered view is a shareable link.
 *
 * The URL is the single source of truth, read through `useSyncExternalStore`:
 * the server snapshot is the page's initial filter (normally "show all"), so
 * the prerendered HTML carries every card for crawlers and no-JS visitors, and
 * hydration then applies whatever filter the link carried. `useSearchParams`
 * is avoided on purpose — on a static route it would bail the whole island
 * out to client rendering and ship an empty catalog in the HTML.
 */

import { useCallback, useId, useMemo, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";
import { WorkflowCardView } from "@/components/public/workflow-card-view";
import {
  filterCatalog,
  matchesQuery,
  matchesScope,
  parseCatalogFilter,
  serializeCatalogFilter,
  type CatalogFilter,
  type CatalogScope,
  type WorkflowCardData,
} from "@/components/catalog/workflow-data";
import { cn } from "@/lib/utils";

export type CatalogItem = {
  data: WorkflowCardData;
  /** Server-rendered preview markup (thumbnail / image / glyph). */
  preview: React.ReactNode;
};

type WorkflowCatalogClientProps = {
  items: CatalogItem[];
  /** Group names in chip order. */
  groups: string[];
  initialFilter: CatalogFilter;
};

const URL_EVENT = "workflow-catalog:url";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_EVENT, onChange);
  };
}

function readSearch() {
  return window.location.search;
}

const SCOPES: { value: CatalogScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "production", label: "Production" },
  { value: "teaching", label: "Teaching & demos" },
];

export function WorkflowCatalogClient({
  items,
  groups,
  initialFilter,
}: WorkflowCatalogClientProps) {
  const searchId = useId();
  const serverSearch = serializeCatalogFilter(initialFilter);
  const search = useSyncExternalStore(subscribe, readSearch, () => serverSearch);
  const filter = useMemo(() => parseCatalogFilter(search), [search]);

  const setFilter = useCallback((patch: Partial<CatalogFilter>) => {
    const next = { ...parseCatalogFilter(window.location.search), ...patch };
    const url = `${window.location.pathname}${serializeCatalogFilter(next)}${window.location.hash}`;
    // Next 16 integrates native history calls with its router.
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(URL_EVENT));
  }, []);

  const data = useMemo(() => items.map((item) => item.data), [items]);
  const visible = useMemo(() => {
    const keep = new Set(filterCatalog(data, filter).map((item) => item.id));
    return items.filter((item) => keep.has(item.data.id));
  }, [items, data, filter]);

  // Counts answer "what would I get if I clicked this?" — each control is
  // counted against the *other* active filters, not its own.
  const scopeCounts = useMemo(() => {
    const base = data.filter(
      (item) => (!filter.group || item.category === filter.group) && matchesQuery(item, filter.q),
    );
    return Object.fromEntries(
      SCOPES.map((scope) => [scope.value, base.filter((i) => matchesScope(i, scope.value)).length]),
    ) as Record<CatalogScope, number>;
  }, [data, filter.group, filter.q]);

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of data) {
      if (!matchesScope(item, filter.scope) || !matchesQuery(item, filter.q)) continue;
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return counts;
  }, [data, filter.scope, filter.q]);
  const allGroupsCount = [...groupCounts.values()].reduce((a, b) => a + b, 0);

  const filtered = filter.q !== "" || filter.group !== null || filter.scope !== "all";

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            Search workflows
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-faint"
          />
          <input
            id={searchId}
            type="search"
            value={filter.q}
            onChange={(event) => setFilter({ q: event.target.value })}
            placeholder="Search by outcome, tool or task"
            autoComplete="off"
            maxLength={100}
            className="h-11 w-full rounded-full border border-outline-variant bg-surface-container pl-10 pr-10 text-body-md text-on-surface placeholder:text-on-surface-faint focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          {filter.q ? (
            <button
              type="button"
              onClick={() => setFilter({ q: "" })}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-faint hover:bg-surface-high hover:text-on-surface"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Clear search</span>
            </button>
          ) : null}
        </div>

        <div
          role="group"
          aria-label="Kind of work"
          className="inline-flex w-full rounded-full border border-outline-variant bg-surface-container p-1 sm:w-auto"
        >
          {SCOPES.map((scope) => {
            const active = filter.scope === scope.value;
            return (
              <button
                key={scope.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter({ scope: scope.value })}
                className={cn(
                  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-body-sm transition-colors sm:flex-none",
                  active
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {scope.label}
                <span className={cn("tabular text-[0.75rem]", active ? "opacity-80" : "text-on-surface-faint")}>
                  {scopeCounts[scope.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter by group"
        className="-mx-margin-mobile mt-5 flex gap-2 overflow-x-auto px-margin-mobile pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      >
        <GroupChip
          label="All groups"
          count={allGroupsCount}
          active={filter.group === null}
          onClick={() => setFilter({ group: null })}
        />
        {groups.map((group) => {
          const count = groupCounts.get(group) ?? 0;
          if (count === 0 && filter.group !== group) return null;
          return (
            <GroupChip
              key={group}
              label={group}
              count={count}
              active={filter.group === group}
              onClick={() => setFilter({ group: filter.group === group ? null : group })}
            />
          );
        })}
      </div>

      <p aria-live="polite" className="font-label mt-6 text-on-surface-faint">
        {filtered
          ? `Showing ${visible.length} of ${items.length} workflows`
          : `${items.length} workflows`}
      </p>

      {visible.length > 0 ? (
        <ol className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <WorkflowCardView
              key={item.data.id}
              item={item.data}
              preview={item.preview}
              showCategory={filter.group === null}
            />
          ))}
        </ol>
      ) : (
        <div className="panel mt-4 flex flex-col items-center px-6 py-14 text-center">
          <p className="font-heading text-headline-sm text-on-surface">
            No workflows match that filter
          </p>
          <p className="mt-2 max-w-[48ch] text-body-sm text-pretty text-on-surface-variant">
            Try a broader word — an outcome like “outreach” or a tool like “Sheets” —
            or clear the filters to see the full catalog.
          </p>
          <button
            type="button"
            onClick={() => setFilter({ q: "", group: null, scope: "all" })}
            className="mt-6 inline-flex h-10 items-center rounded-full border border-outline-strong px-4.5 text-body-md text-on-surface hover:bg-surface-high"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function GroupChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-body-sm transition-colors",
        active
          ? "border-transparent bg-accent-soft text-accent"
          : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-outline-strong hover:text-on-surface",
      )}
    >
      {label}
      <span className="tabular text-[0.75rem] opacity-75">{count}</span>
    </button>
  );
}
