"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

type ToastProps = {
  open: boolean;
  message: string;
  tone?: ToastTone;
  onDismiss: () => void;
  durationMs?: number;
  className?: string;
};

const toneClasses: Record<ToastTone, string> = {
  success: "border-primary/40 bg-surface-container text-primary",
  error: "border-error/40 bg-surface-container text-error",
  info: "border-secondary/40 bg-surface-container text-secondary",
};

export function Toast({
  open,
  message,
  tone = "info",
  onDismiss,
  durationMs = 4000,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [open, onDismiss, durationMs]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-[90] max-w-sm rounded-lg border px-4 py-3 text-body-md shadow-xl",
        toneClasses[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p>{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="font-label uppercase text-on-surface-variant hover:text-on-surface"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
