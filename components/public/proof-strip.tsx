import { listPublishedProofPoints } from "@/lib/repositories/site-content";
import { cn } from "@/lib/utils";

export async function ProofStrip() {
  const items = await listPublishedProofPoints();

  return (
    <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "border-l border-outline-variant pl-4",
            item.featured &&
              "sm:col-span-2 lg:col-span-4 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8",
          )}
        >
          <dt
            className={cn(
              "font-heading font-semibold tracking-tight text-on-surface",
              item.featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
            )}
          >
            {item.value}
          </dt>
          <dd
            className={cn(
              "mt-1 text-on-surface-variant",
              item.featured ? "max-w-4xl text-base md:text-lg" : "text-sm",
            )}
          >
            {item.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
