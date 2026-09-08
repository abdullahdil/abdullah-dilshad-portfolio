import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "primary" | "secondary" | "tertiary";
};

const toneClasses = {
  neutral: "bg-surface-high text-on-surface-variant border-outline-variant",
  primary: "bg-accent/10 text-accent border-accent/20",
  secondary: "bg-surface-high text-on-surface-variant border-outline-variant",
  tertiary: "bg-surface-container text-on-surface-variant border-outline-variant",
} as const;

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
