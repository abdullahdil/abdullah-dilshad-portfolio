import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "primary" | "secondary" | "tertiary";
};

const toneClasses = {
  neutral: "bg-surface-variant text-on-surface border-outline-variant/20",
  primary: "bg-primary/20 text-primary border-primary/20",
  secondary: "bg-secondary-container/40 text-secondary border-outline-variant/20",
  tertiary: "bg-surface-high text-on-surface-variant border-outline-variant/20",
} as const;

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-label text-xs uppercase",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
