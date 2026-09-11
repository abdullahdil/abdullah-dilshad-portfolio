"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ThemeToggle } from "@/components/public/theme-toggle";
import type { PublicNavLink } from "@/lib/repositories/site-content";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  links: PublicNavLink[];
  fullName: string;
  availabilityLabel: string;
  cvUrl: string;
};

export function SiteHeader({
  links,
  fullName,
  availabilityLabel,
  cvUrl,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const closeMenu = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Cheap passive scroll flag — drives the hairline only.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:text-on-primary"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-surface/85 backdrop-blur-md transition-colors duration-200",
          scrolled ? "border-b border-outline-variant" : "border-b border-transparent",
        )}
      >
        <Container className="flex h-14 items-center gap-4 md:h-16">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="whitespace-nowrap font-heading text-body-md font-semibold tracking-[-0.02em] text-on-surface transition-colors hover:text-accent"
          >
            {fullName}
          </Link>

          <nav
            className="ml-auto hidden items-center gap-7 md:flex"
            aria-label="Primary"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className="link-underline text-body-sm text-on-surface-variant transition-colors hover:text-on-surface aria-[current=page]:text-on-surface"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-6 md:gap-3">
            <span className="hidden sm:flex">
              <ThemeToggle />
            </span>
            <span className="hidden lg:flex">
              <Button href={cvUrl} download variant="secondary" size="sm">
                Download CV
                <Download className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
              </Button>
            </span>
            <button
              ref={menuButtonRef}
              type="button"
              className="-mr-2 rounded-full p-2 text-on-surface transition-colors hover:bg-surface-high md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" aria-hidden strokeWidth={2} />
              )}
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </Container>
      </header>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 z-[60] bg-surface transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex h-full flex-col">
          <Container className="flex h-14 items-center justify-between border-b border-outline-variant">
            <span className="font-label text-on-surface-faint">Menu</span>
            <button
              type="button"
              className="-mr-2 rounded-full p-2 text-on-surface transition-colors hover:bg-surface-high"
              onClick={closeMenu}
            >
              <X className="h-5 w-5" aria-hidden strokeWidth={2} />
              <span className="sr-only">Close menu</span>
            </button>
          </Container>

          <Container className="flex flex-1 flex-col overflow-y-auto py-2">
            <nav aria-label="Mobile" className="flex flex-col">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-baseline gap-4 border-b border-outline-variant py-4 text-on-surface"
                >
                  <span className="font-label text-on-surface-faint tabular">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-heading text-headline-md">{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-5 pb-8 pt-8">
              <StatusIndicator label={availabilityLabel} pulse={false} />
              <Button
                href={cvUrl}
                download
                variant="secondary"
                className="w-full"
                onClick={closeMenu}
              >
                Download CV
                <Download className="h-4 w-4" aria-hidden strokeWidth={2} />
              </Button>
              <div className="flex items-center justify-between border-t border-outline-variant pt-5">
                <span className="font-label text-on-surface-faint">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
