import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { PublicProofPoint } from "@/lib/repositories/site-content";
import { cn } from "@/lib/utils";

/**
 * Figures allowed on the site, verbatim from CONTENT_TRUTH.md → "Defensible
 * proof". Do not add a figure here that is not in that list.
 */
const PAID_WORKFLOWS = { value: "~30", label: "Paid production workflows delivered" };
const ENGAGEMENTS = {
  value: "3,800+",
  label: "Combined engagements on public n8n templates",
};

type Figure = { value: string; label: string; href?: string; external?: boolean };
type Credential = { title: string; detail: string; href?: string | null };

type ProofBandProps = {
  /** Count of catalogued systems — rendered only when the catalog has items. */
  systemCount: number;
  templateCount: number;
  n8nProfileUrl: string | null;
  credentialUrl: string | null;
  /** CMS proof points flagged "featured" — rendered as the quiet stack line. */
  featured?: PublicProofPoint[];
  className?: string;
};

/**
 * Proof directly under the hero copy: approved numbers on the left, verifiable
 * credentials (each one a link to its public source) on the right. Every value
 * is either counted from data or taken from CONTENT_TRUTH.md.
 */
export function ProofBand({
  systemCount,
  templateCount,
  n8nProfileUrl,
  credentialUrl,
  featured = [],
  className,
}: ProofBandProps) {
  const figures: Figure[] = [PAID_WORKFLOWS];
  if (systemCount > 0) {
    figures.push({
      value: String(systemCount),
      label: "Automation systems catalogued",
      href: "/work#catalog",
    });
  }
  if (templateCount > 0) {
    figures.push({
      value: String(templateCount),
      label: "Public templates in the n8n library",
      href: n8nProfileUrl ?? undefined,
      external: true,
    });
  }
  figures.push({ ...ENGAGEMENTS, href: n8nProfileUrl ?? undefined, external: true });

  const credentials: Credential[] = [
    {
      title: "n8n Verified Creator",
      detail: "Official template library",
      href: n8nProfileUrl,
    },
    {
      title: "n8n Course Level 2",
      detail: "Completed · community badge",
      href: credentialUrl,
    },
    { title: "BS Computer Science", detail: "FAST-NUCES · 2025" },
  ];

  return (
    <div className={cn("panel panel-depth overflow-hidden", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <ul className="grid grid-cols-2 lg:col-span-7 lg:grid-cols-4">
          {figures.map((figure) => {
            const body = (
              <>
                <span className="tabular block font-heading text-headline-md tracking-tight text-on-surface">
                  {figure.value}
                </span>
                <span className="mt-1.5 block text-body-sm text-pretty text-on-surface-variant">
                  {figure.label}
                </span>
              </>
            );
            const cell =
              "border-b border-r border-outline-variant px-5 py-5 even:border-r-0 md:px-6 lg:border-b-0 lg:even:border-r lg:last:border-r-0";
            return figure.href ? (
              <li key={figure.label} className={cn(
                  cell,
                  "relative transition-colors has-[a:hover]:bg-surface-high/60",
                )}>
                {body}
                <Link
                  href={figure.href}
                  {...(figure.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="absolute inset-0 focus-visible:outline-offset-[-2px]"
                >
                  <span className="sr-only">
                    {figure.value} {figure.label}
                    {figure.external ? " (opens in a new tab)" : ""}
                  </span>
                </Link>
              </li>
            ) : (
              <li key={figure.label} className={cell}>
                {body}
              </li>
            );
          })}
        </ul>

        <ul className="grid grid-cols-1 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
          {credentials.map((credential) => {
            const inner = (
              <>
                <span className="min-w-0">
                  <span className="block text-body-sm font-medium text-on-surface">
                    {credential.title}
                  </span>
                  <span className="font-label mt-0.5 block text-on-surface-faint">
                    {credential.detail}
                  </span>
                </span>
                {credential.href ? (
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-on-surface-faint transition-colors group-hover:text-accent"
                    strokeWidth={2}
                    aria-hidden
                  />
                ) : null}
              </>
            );
            const row =
              "flex items-center justify-between gap-4 px-5 py-3.5 md:px-6";
            return (
              <li
                key={credential.title}
                className="border-b border-outline-variant last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-r-0 lg:border-b lg:border-l"
              >
                {credential.href ? (
                  <a
                    href={credential.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(row, "group transition-colors hover:bg-surface-high/50")}
                  >
                    {inner}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <div className={row}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {featured.length > 0 ? (
        <dl className="border-t border-outline-variant px-5 py-3.5 md:px-6">
          {featured.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6"
            >
              <dt className="font-label shrink-0 text-on-surface-faint">
                {item.value}
              </dt>
              <dd className="text-body-sm text-pretty text-on-surface-variant">
                {item.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
