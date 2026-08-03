"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const bg = document.querySelector<HTMLElement>("[data-kinetic-bg]");
      if (!bg) return;
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      bg.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 140, 55, 0.15) 0%, transparent 70%)`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block">
        <AdminSidebar userEmail={userEmail} />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-surface-lowest/70 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AdminSidebar
          userEmail={userEmail}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="relative overflow-hidden lg:pl-64">
        <div
          data-kinetic-bg
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[600px] w-[600px] kinetic-gradient"
          aria-hidden
        />
        <AdminTopBar
          title={title}
          description={description}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main
          id="main-content"
          className="px-margin-mobile py-8 md:px-margin-desktop md:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
