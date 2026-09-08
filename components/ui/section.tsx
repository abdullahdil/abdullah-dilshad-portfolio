import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "lowest" | "container";
};

const toneClasses = {
  default: "bg-surface",
  lowest: "bg-surface-low",
  container: "bg-surface-container",
} as const;

export function Section({
  id,
  children,
  className,
  tone = "default",
}: SectionProps) {
  return (
    <section id={id} className={cn("py-24 md:py-28", toneClasses[tone], className)}>
      {children}
    </section>
  );
}
