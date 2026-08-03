import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "lowest" | "container";
};

const toneClasses = {
  default: "bg-surface",
  lowest: "bg-surface-lowest",
  container: "bg-surface-container",
} as const;

export function Section({
  id,
  children,
  className,
  tone = "default",
}: SectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-24", toneClasses[tone], className)}>
      {children}
    </section>
  );
}
