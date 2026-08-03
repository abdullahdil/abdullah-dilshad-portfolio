import { cn } from "@/lib/utils";

type StatusIndicatorProps = {
  label: string;
  className?: string;
  pulse?: boolean;
};

export function StatusIndicator({
  label,
  className,
  pulse = true,
}: StatusIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2 w-2">
        {pulse ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
        ) : null}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <span className="font-label uppercase text-primary">{label}</span>
    </div>
  );
}
