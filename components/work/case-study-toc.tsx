"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TocEntry = { id: string; label: string };

type CaseStudyTocProps = {
  entries: TocEntry[];
};

/**
 * Sticky contents rail for the long-form story (desktop only — the parent
 * hides it below `lg`). Highlights the section being read and draws a thin
 * reading-progress line. Plain anchor links, so it works without JavaScript;
 * the script only adds the active state and the progress fill.
 */
export function CaseStudyToc({ entries }: CaseStudyTocProps) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const targets = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    targets.forEach((target) => observer.observe(target));

    // Reading progress through the story body, written straight to the DOM
    // (no re-render per scroll frame).
    const body = document.querySelector("[data-story-body]");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!body || !barRef.current) return;
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const read = Math.min(Math.max((window.innerHeight * 0.3 - rect.top) / Math.max(total, 1), 0), 1);
      barRef.current.style.transform = `scaleY(${read})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [entries]);

  return (
    <nav aria-label="Story contents" className="sticky top-24">
      <p className="font-label text-on-surface-faint">Contents</p>
      <div className="relative mt-4">
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-outline-variant" />
        <span
          ref={barRef}
          aria-hidden
          className="absolute inset-y-0 left-0 w-px origin-top bg-accent transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{ transform: "scaleY(0)" }}
        />
        <ol className="space-y-1">
          {entries.map((entry) => {
            const active = entry.id === activeId;
            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "block py-1.5 pl-4 text-body-sm text-pretty transition-colors",
                    active
                      ? "text-on-surface"
                      : "text-on-surface-faint hover:text-on-surface-variant",
                  )}
                >
                  {entry.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
