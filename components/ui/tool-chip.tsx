import { cn } from "@/lib/utils";

type ToolChipProps = {
  children: React.ReactNode;
  className?: string;
};

export function ToolChip({ children, className }: ToolChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-outline-variant bg-surface-high px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.02em] text-on-surface-variant",
        className,
      )}
    >
      {children}
    </span>
  );
}
