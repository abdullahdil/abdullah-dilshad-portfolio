import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  /** Points at the section's heading id so the region gets an accessible name. */
  "aria-labelledby"?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "lowest" | "container" | "low";
  /** Hairline rule along the top edge — the primary section separator. */
  divider?: boolean;
  /** Vertical rhythm. `tight` for dense strips, `loose` for the hero. */
  space?: "tight" | "default" | "loose";
};

const toneClasses = {
  default: "bg-surface",
  lowest: "bg-surface-lowest",
  low: "bg-surface-low",
  container: "bg-surface-container",
} as const;

const spaceClasses = {
  tight: "py-12 md:py-16",
  default: "py-20 md:py-28",
  loose: "py-24 md:py-36",
} as const;

export function Section({
  id,
  children,
  className,
  tone = "default",
  divider = false,
  space = "default",
  "aria-labelledby": ariaLabelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        spaceClasses[space],
        toneClasses[tone],
        divider && "border-t border-outline-variant",
        className,
      )}
    >
      {children}
    </section>
  );
}
