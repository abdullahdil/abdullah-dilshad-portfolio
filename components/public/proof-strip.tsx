import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { listPublishedProofPoints } from "@/lib/repositories/site-content";
import { cn } from "@/lib/utils";

/**
 * Proof band under the hero. The figures sit on one raised panel — the first
 * layered surface on the page — while the featured line stays plain type below
 * it. Cells inside the panel are still hairline-separated: no tiles, no colour.
 */
export async function ProofStrip() {
  const items = await listPublishedProofPoints();
  const figures = items.filter((item) => !item.featured);
  const featured = items.filter((item) => item.featured);

  if (items.length === 0) return null;

  return (
    <Section tone="low" space="tight" className="section-veil">
      <Container>
        {figures.length > 0 ? (
          <div className="panel panel-depth px-6 py-7 md:px-8 md:py-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-0">
              {figures.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "border-t border-outline-variant pt-4 first:border-t-0 first:pt-0",
                    "sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5",
                    "sm:odd:border-l-0 sm:odd:pl-0",
                    "lg:border-l lg:pl-6 lg:odd:border-l lg:odd:pl-6",
                    "lg:first:border-l-0 lg:first:pl-0",
                  )}
                >
                  <dt className="tabular font-heading text-headline-sm tracking-tight text-on-surface">
                    {item.value}
                  </dt>
                  <dd className="mt-2 font-label text-on-surface-faint">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {featured.length > 0 ? (
          <dl className={cn(figures.length > 0 && "mt-9")}>
            {featured.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8"
              >
                <dt className="font-label shrink-0 text-on-surface-faint md:w-40">
                  {item.value}
                </dt>
                <dd className="max-w-[72ch] text-pretty text-body-md text-on-surface-variant">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
    </Section>
  );
}
