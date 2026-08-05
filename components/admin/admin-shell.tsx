"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  title: string;
  description?: string;
  userEmail?: string | null;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  userEmail,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block">
        <AdminSidebar userEmail={userEmail} />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-surface-lowest/70 transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AdminSidebar
          userEmail={userEmail}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="relative lg:pl-64">
        <div
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[280px] w-[280px] kinetic-gradient opacity-40"
          aria-hidden
        />
        <AdminTopBar
          title={title}
          description={description}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main
          id="main-content"
          className="px-margin-mobile py-8 md:px-margin-desktop md:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
