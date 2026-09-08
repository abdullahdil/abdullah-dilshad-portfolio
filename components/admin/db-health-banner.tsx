import { AlertTriangle } from "lucide-react";
import type { DatabaseHealth } from "@/lib/repositories/db-health";

/**
 * Loud warning shown across the admin panel when the database is unreachable.
 * Without it, the public site's seed-content fallback hides the outage.
 */
export function DbHealthBanner({ health }: { health: DatabaseHealth }) {
  if (health.reachable) return null;

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-lg border border-error/40 bg-error/10 px-4 py-3"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-error">
          {health.configured
            ? "Database unreachable — the public site is showing seed content."
            : "Supabase is not configured — the public site is showing seed content."}
        </p>
        <p className="text-sm text-on-surface-variant">
          Edits made here cannot be saved until this is fixed. Visitors still see
          the built-in fallback content, so the site looks healthy from outside.
        </p>
        {health.detail ? (
          <p className="font-mono text-xs text-on-surface-variant">
            {health.detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
