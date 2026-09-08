import {
  Bot,
  Brain,
  Database,
  Filter,
  Mail,
  Plug,
  Send,
  ShieldCheck,
  Terminal,
  UserCheck,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { listPublishedHeroWorkflowSteps } from "@/lib/repositories/site-content";
import type { PublicHeroWorkflowStep } from "@/lib/repositories/site-content";
import { cn } from "@/lib/utils";

const iconMap: Record<PublicHeroWorkflowStep["icon"], LucideIcon> = {
  Webhook,
  Database,
  Brain,
  UserCheck,
  Send,
  Workflow,
  Plug,
  Terminal,
  Bot,
  Filter,
  Mail,
  ShieldCheck,
};

type WorkflowVisualProps = {
  className?: string;
  compact?: boolean;
};

export async function WorkflowVisual({ className, compact = false }: WorkflowVisualProps) {
  const heroWorkflowSeed = await listPublishedHeroWorkflowSteps();
  return (
    <div className={cn("px-6 py-8 md:px-10", className)}>
      <ol className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-2">
        {heroWorkflowSeed.map((node, index) => {
          const Icon = iconMap[node.icon];
          const isLast = index === heroWorkflowSeed.length - 1;

          return (
            <li key={node.title} className="flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-high">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
              </div>

              <div className="min-w-0 flex-1 md:flex-none">
                <p className="text-sm font-medium text-on-surface">{node.title}</p>
                {!compact ? (
                  <p className="mt-0.5 text-xs text-on-surface-variant">{node.description}</p>
                ) : null}
              </div>

              {!isLast ? (
                <div
                  className="mt-5 hidden h-px flex-1 bg-outline-variant md:block"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
