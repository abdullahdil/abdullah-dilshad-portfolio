"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  FolderKanban,
  GitBranch,
  Image,
  KeyRound,
  LayoutDashboard,
  Library,
  Link2,
  LogOut,
  Mail,
  Plus,
  Puzzle,
  Settings,
  User,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { adminNavItems, profileSeed } from "@/lib/content/seed";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FolderKanban,
  Workflow,
  Image,
  Mail,
  KeyRound,
  User,
  Briefcase,
  Puzzle,
  Library,
  BadgeCheck,
  GitBranch,
  Link2,
  Settings,
};

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  userEmail?: string | null;
};

export function AdminSidebar({
  className,
  onNavigate,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "shell-wash flex h-full w-64 flex-col gap-4 border-r border-outline-variant bg-surface-lowest py-8",
        className,
      )}
    >
      <div className="mb-4 px-6">
        <h1 className="font-heading text-headline-md font-bold tracking-tighter text-on-surface">
          Abdullah<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-on-surface-faint">
          Command Center v2.4
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4" aria-label="Admin">
        {adminNavItems.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-r-full border border-transparent p-3 transition-colors duration-150",
                active
                  ? "border-outline-variant bg-surface-high text-on-surface"
                  : "text-on-surface-variant hover:bg-surface-high/60 hover:text-on-surface",
              )}
            >
              <Icon
                className={cn("h-5 w-5", active ? "text-accent" : "")}
                aria-hidden
              />
              <span className="font-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 border-t border-outline-variant px-6 pt-4">
        <Button
          href="/admin/case-studies/new"
          onClick={onNavigate}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Deploy Bot
        </Button>

        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-high font-heading text-sm font-semibold text-on-surface">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-label text-[12px] text-on-surface">
              {profileSeed.fullName}
            </p>
            <p className="truncate text-[10px] text-on-surface-faint">
              {userEmail ?? "Authorized admin"}
            </p>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            onClick={onNavigate}
            className="flex w-full items-center gap-3 rounded-full px-2 py-2 text-on-surface-variant transition-colors hover:text-error"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="font-label text-xs uppercase">Log Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
