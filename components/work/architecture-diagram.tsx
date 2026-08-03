import { Workflow } from "lucide-react";
import type { ArchitectureNode } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type ArchitectureDiagramProps = {
  nodes: ArchitectureNode[];
  description: string;
};

export function ArchitectureDiagram({
  nodes,
  description,
}: ArchitectureDiagramProps) {
  const hubIndex = nodes.findIndex((node) =>
    node.label.toLowerCase().includes("n8n"),
  );
  const centerIndex = hubIndex === -1 ? Math.floor(nodes.length / 2) : hubIndex;

  return (
    <section
      aria-labelledby="architecture-heading"
      className="mb-24 border-y border-outline-variant/10 bg-surface-lowest py-16 md:mb-32 md:py-24"
    >
      <div className="mx-auto w-full max-w-none px-margin-mobile md:px-margin-desktop xl:px-16">
        <div className="mb-12 text-center md:mb-16">
          <h2
            id="architecture-heading"
            className="mb-4 font-heading text-headline-lg text-on-surface"
          >
            Architecture &amp;{" "}
            <span className="text-primary">Technical Stack</span>
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="relative hidden py-4 md:block">
          <div
            className="absolute left-0 right-0 top-[2.75rem] h-px bg-[repeating-linear-gradient(90deg,#ff8c37_0,#ff8c37_4px,transparent_4px,transparent_8px)] opacity-30"
            aria-hidden
          />
          <ol
            className="relative z-10 grid gap-4 lg:gap-6"
            style={{
              gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))`,
            }}
          >
            {nodes.map((node, index) => {
              const isHub = index === centerIndex;
              return (
                <li
                  key={node.label}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-high transition-colors glow-hover",
                      isHub
                        ? "h-20 w-20 border-primary bg-primary text-on-primary glow-orange"
                        : "h-16 w-16",
                    )}
                  >
                    {isHub ? (
                      <Workflow className="h-8 w-8" aria-hidden />
                    ) : (
                      <span className="font-label text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-label text-on-surface",
                        isHub && "font-bold text-primary",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-tight text-on-surface-variant">
                      {node.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative md:hidden">
          <div
            className="absolute bottom-4 left-6 top-4 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-primary/50"
            aria-hidden
          />
          <ol className="space-y-4">
            {nodes.map((node, index) => {
              const isHub = index === centerIndex;
              return (
                <li key={node.label} className="relative flex items-center gap-4">
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-high",
                      isHub && "border-primary bg-primary text-on-primary",
                    )}
                  >
                    {isHub ? (
                      <Workflow className="h-5 w-5" aria-hidden />
                    ) : (
                      <span className="font-label text-xs text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 rounded-lg border border-outline-variant/10 bg-surface-container px-4 py-3">
                    <p
                      className={cn(
                        "font-label text-on-surface",
                        isHub && "text-primary",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="text-xs text-on-surface-variant">{node.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
