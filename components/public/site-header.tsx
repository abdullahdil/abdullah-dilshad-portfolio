"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { navLinks, profileSeed } from "@/lib/content/seed";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <header className="fixed top-0 z-50 w-full border-b border-outline-variant/10 bg-background/80 backdrop-blur-xl">
        <Container className="flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="min-w-0 truncate font-heading text-headline-md font-bold tracking-tighter text-on-surface transition-colors hover:text-primary"
          >
            {profileSeed.fullName}
          </Link>

          <nav
            className="hidden items-center gap-8 font-label uppercase tracking-wider md:flex"
            aria-label="Primary"
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  index === 0
                    ? "border-b-2 border-primary pb-1 font-bold text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden animate-pulse font-label text-primary md:inline-flex">
              {profileSeed.availabilityLabel}
            </span>
            <Button
              href="/resume"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Download CV
              <Download className="h-4 w-4" aria-hidden />
            </Button>
            <button
              type="button"
              className="rounded-full p-2 text-primary md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-6 w-6" aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </Container>
      </header>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-8">
          <div className="mb-12 flex items-center justify-between">
            <span className="font-label uppercase tracking-widest text-outline">
              Navigation
            </span>
            <button
              type="button"
              className="rounded-full p-2 text-on-surface"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav className="flex flex-col gap-8" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-heading text-headline-lg text-on-surface-variant transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-4 border-t border-outline-variant/10 pt-8">
            <p className="font-label uppercase text-primary">
              {profileSeed.availabilityLabel}
            </p>
            <Button href="/resume" className="w-full" onClick={() => setOpen(false)}>
              Download CV
              <Download className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
