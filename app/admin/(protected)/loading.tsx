export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 rounded bg-surface-high" />
      <div className="h-4 w-72 max-w-full rounded bg-surface-high" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-28 rounded-lg bg-surface-high" />
        <div className="h-28 rounded-lg bg-surface-high" />
        <div className="h-28 rounded-lg bg-surface-high" />
        <div className="h-28 rounded-lg bg-surface-high" />
      </div>
      <div className="h-64 rounded-lg bg-surface-high" />
    </div>
  );
}
