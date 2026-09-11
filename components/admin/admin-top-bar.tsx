"use client";

import { Menu } from "lucide-react";
import { StatusIndicator } from "@/components/ui/status-indicator";

type AdminTopBarProps = {
  title: string;
  description?: string;
  onMenuClick?: () => void;
};

export function AdminTopBar({ title, description, onMenuClick }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-outline-variant bg-background/85 px-margin-mobile py-4 backdrop-blur-md md:px-margin-desktop">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-outline-variant bg-surface-container p-2 text-on-surface lg:hidden"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-lg font-semibold tracking-tighter text-on-surface md:text-headline-md">
            {title}
          </h1>
          {description ? (
            <p className="truncate text-xs text-on-surface-faint">{description}</p>
          ) : null}
        </div>
      </div>
      <StatusIndicator label="Authenticated" className="hidden sm:flex" />
    </header>
  );
}
