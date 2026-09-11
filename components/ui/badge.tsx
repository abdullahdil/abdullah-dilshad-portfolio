import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "primary" | "secondary" | "tertiary";
};

const toneClasses = {
  neutral: "border-outline-variant bg-surface-high text-on-surface-variant",
  primary: "border-transparent bg-accent-soft text-accent",
  secondary: "border-outline-variant bg-surface-high text-on-surface-variant",
  tertiary: "border-outline-variant bg-surface-container text-on-surface-variant",
} as const;

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.75rem] font-medium leading-5",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
