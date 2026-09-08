"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { navLinks, profileSeed } from "@/lib/content/seed";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-background/90 backdrop-blur-md">
        <Container className="flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="font-heading text-base font-semibold tracking-tight text-on-surface transition-colors hover:text-accent"
          >
            {profileSeed.fullName}
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-on-surface-variant lg:inline">
              {profileSeed.availabilityLabel}
            </span>
            <Button
              href={profileSeed.cvUrl}
              download
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Download CV
              <Download className="h-4 w-4" aria-hidden />
            </Button>
            <button
              type="button"
              className="rounded-md p-2 text-on-surface md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </Container>
      </header>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 z-[60] bg-background transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Menu</span>
            <button
              type="button"
              className="rounded-md p-2 text-on-surface"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav className="flex flex-col gap-6" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-heading text-2xl text-on-surface"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-4 border-t border-outline-variant pt-6">
            <p className="text-sm text-on-surface-variant">{profileSeed.availabilityLabel}</p>
            <Button
              href={profileSeed.cvUrl}
              download
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Download CV
              <Download className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
