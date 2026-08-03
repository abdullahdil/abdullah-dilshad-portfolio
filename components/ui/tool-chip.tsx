import { cn } from "@/lib/utils";

type ToolChipProps = {
  children: React.ReactNode;
  className?: string;
};

export function ToolChip({ children, className }: ToolChipProps) {
  return (
    <span
      className={cn(
        "rounded-full bg-surface-variant px-3 py-1 font-label text-[11px] text-on-surface",
        className,
      )}
    >
      {children}
    </span>
  );
}
