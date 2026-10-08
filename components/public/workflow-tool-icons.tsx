/**
 * The little stack of node-type badges n8n shows above a template preview,
 * with a `+N` overflow chip once the row runs out of room.
 */

import { NodeTypeIcon, nodeTypeLabel } from "@/components/public/workflow-node-icon";
import { cn } from "@/lib/utils";

type WorkflowToolIconsProps = {
  /** `WorkflowCanvas.toolKeys` — distinct node type keys, first-seen order. */
  toolKeys: string[];
  /** How many badges to draw before collapsing the rest into `+N`. */
  max?: number;
  className?: string;
};

export function WorkflowToolIcons({
  toolKeys,
  max = 6,
  className,
}: WorkflowToolIconsProps) {
  if (toolKeys.length === 0) return null;

  const shown = toolKeys.slice(0, max);
  const overflow = toolKeys.length - shown.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {shown.map((key) => {
        const label = nodeTypeLabel(key);
        return (
          <span
            key={key}
            title={label}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant bg-surface-bright text-on-surface-variant"
          >
            <NodeTypeIcon typeKey={key} className="h-3.5 w-3.5" />
            <span className="sr-only">{label}</span>
          </span>
        );
      })}

      {overflow > 0 ? (
        <span className="font-label inline-flex h-7 items-center justify-center rounded-md border border-outline-variant bg-surface-high px-2 text-on-surface-variant">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
