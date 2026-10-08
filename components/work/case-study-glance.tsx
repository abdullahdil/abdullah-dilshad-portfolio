import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { condense, condenseFirst } from "@/components/work/case-study-content";
import type { CaseStudy } from "@/lib/content/types";

type CaseStudyGlanceProps = {
  study: CaseStudy;
  /** Anchor of the long-form story, for the "read the full story" link. */
  storyAnchor?: string;
};

type Tile = {
  key: string;
  label: string;
  body: React.ReactNode;
};

/**
 * "At a glance": the whole case in four tiles — problem, what was built, how
 * it stays reliable, and the result. Every line is condensed from fields
 * already on the record; metrics appear only when the record carries them.
 */
export function CaseStudyGlance({ study, storyAnchor }: CaseStudyGlanceProps) {
  const problem = condenseFirst([study.businessProblem, study.beforeState], 190);
  const built = condenseFirst([study.architectureDescription], 190);
  const result = condenseFirst([study.result], 210);
  const controls = study.reliabilityControls.slice(0, 3);
  const metrics = (study.resultMetrics ?? []).filter(
    (metric) => metric.value.trim() && metric.label.trim(),
  );

  const tiles: Tile[] = [];
  if (problem) tiles.push({ key: "problem", label: "Problem", body: <p>{problem}</p> });
  if (built) tiles.push({ key: "built", label: "What I built", body: <p>{built}</p> });
  if (controls.length > 0) {
    tiles.push({
      key: "reliability",
      label: "Reliability",
      body: (
        <ul className="space-y-1.5">
          {controls.map((control) => (
            <li key={control.name} className="flex gap-2">
              <span
                aria-hidden
                className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent"
              />
              <span>{condense(control.name, 80, 90)}</span>
            </li>
          ))}
          {study.reliabilityControls.length > controls.length ? (
            <li className="pl-3 text-on-surface-faint">
              +{study.reliabilityControls.length - controls.length} more below
            </li>
          ) : null}
        </ul>
      ),
    });
  }
  if (result || metrics.length > 0) {
    tiles.push({
      key: "result",
      label: "Result",
      body: (
        <>
          {metrics.length > 0 ? (
            <dl className="mb-3 flex flex-wrap gap-x-6 gap-y-2">
              {metrics.slice(0, 3).map((metric) => (
                <div key={metric.label} className="flex flex-col-reverse">
                  <dt className="text-body-sm text-on-surface-faint">{metric.label}</dt>
                  <dd className="font-heading text-headline-md text-on-surface">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {result ? <p>{result}</p> : null}
        </>
      ),
    });
  }

  if (tiles.length === 0) return null;

  // Never leave an empty cell in the hairline grid.
  const columns =
    tiles.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : tiles.length === 3
        ? "lg:grid-cols-3"
        : tiles.length === 2
          ? "sm:grid-cols-2"
          : "";

  return (
    <section aria-labelledby="glance-heading" className="pb-14 md:pb-20">
      <Container>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="glance-heading" className="section-eyebrow">
            At a glance
          </h2>
          {storyAnchor ? (
            <a
              href={`#${storyAnchor}`}
              className="group inline-flex items-center gap-1.5 font-label text-on-surface-faint transition-colors hover:text-on-surface"
            >
              Read the full story
              <ArrowDown
                className="h-3 w-3 transition-transform duration-200 group-hover:translate-y-0.5"
                aria-hidden
              />
            </a>
          ) : null}
        </div>

        <ul className={`mt-5 grid gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant ${columns}`}>
          {tiles.map((tile, index) => (
            <li
              key={tile.key}
              className="flex flex-col bg-surface-container p-5 md:p-6"
            >
              <p className="flex items-center gap-2 font-label text-on-surface-faint">
                <span className="tabular text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {tile.label}
              </p>
              <div className="mt-3 text-body-sm text-pretty text-on-surface-variant">
                {tile.body}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
