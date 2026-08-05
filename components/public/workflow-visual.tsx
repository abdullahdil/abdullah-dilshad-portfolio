import {
  Brain,
  Database,
  Send,
  UserCheck,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { heroWorkflowSeed } from "@/lib/content/seed";
import { cn } from "@/lib/utils";

const iconMap: Record<(typeof heroWorkflowSeed)[number]["icon"], LucideIcon> = {
  Webhook,
  Database,
  Brain,
  UserCheck,
  Send,
};

type WorkflowVisualProps = {
  className?: string;
  compact?: boolean;
};

export function WorkflowVisual({ className, compact = false }: WorkflowVisualProps) {
  return (
    <div className={cn("relative p-5 sm:p-8 md:p-10", className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(45,212,191,0.5) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative z-10 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="mx-auto flex w-max min-w-full items-start justify-center gap-0 px-1">
          {heroWorkflowSeed.map((node, index) => {
            const Icon = iconMap[node.icon];
            const isLast = index === heroWorkflowSeed.length - 1;

            return (
              <li key={node.title} className="flex items-start">
                <div
                  className={cn(
                    "flex flex-col items-center text-center",
                    compact ? "w-[88px] sm:w-[104px]" : "w-[100px] sm:w-[120px]",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full border border-primary/40 bg-surface-highest glow-accent",
                      compact
                        ? "h-14 w-14 sm:h-16 sm:w-16"
                        : "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "text-primary",
                        compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6 sm:h-7 sm:w-7",
                      )}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 font-label text-[9px] uppercase leading-tight tracking-wider text-on-surface sm:text-[10px]">
                    {node.title}
                  </p>
                  {!compact ? (
                    <p className="mt-1 text-[10px] leading-snug text-on-surface-variant">
                      {node.description}
                    </p>
                  ) : null}
                </div>

                {!isLast ? (
                  <div
                    className={cn(
                      "mt-7 shrink-0 self-start sm:mt-8",
                      compact ? "w-4 sm:w-6 md:w-8" : "w-5 sm:w-8 md:w-10",
                    )}
                    aria-hidden
                  >
                    <div className="h-px w-full bg-primary/35" />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="relative z-10 mt-6 text-center font-label text-xs uppercase tracking-widest text-on-surface-variant">
        Reference automation model
      </p>
    </div>
  );
}
