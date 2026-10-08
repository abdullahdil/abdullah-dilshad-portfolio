import { Check } from "lucide-react";
import { ToolChip } from "@/components/ui/tool-chip";
import type { CaseStudyTool } from "@/lib/content/types";

type CaseStudyStackProps = {
  tools: CaseStudyTool[];
  contribution: string[];
};

/** Tools used, beside "My contribution". */
export function CaseStudyStack({ tools, contribution }: CaseStudyStackProps) {
  const items = contribution.map((item) => item.trim()).filter(Boolean);
  if (tools.length === 0 && items.length === 0) return null;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
      {tools.length > 0 ? (
        <div>
          <h3 className="font-label text-on-surface-faint">Tools</h3>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tools.map((tool) => (
              <li key={tool.name} title={tool.category || undefined}>
                <ToolChip>{tool.name}</ToolChip>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div>
          <h3 className="font-label text-on-surface-faint">My contribution</h3>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 text-body-md text-pretty text-on-surface-variant">
                <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
