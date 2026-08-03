import type { ActionResult } from "@/lib/admin/types";

export function FormResult({ result }: { result: ActionResult | null }) {
  if (!result) return null;

  if (result.ok) {
    if (!result.message) return null;
    return (
      <p
        className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
        role="status"
      >
        {result.message}
      </p>
    );
  }

  return (
    <p
      className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
      role="alert"
    >
      {result.error}
    </p>
  );
}
