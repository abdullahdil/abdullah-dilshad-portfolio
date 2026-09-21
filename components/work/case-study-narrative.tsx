import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CaseStudy, CaseStudyNarrativeSection } from "@/lib/content/types";

type CaseStudyNarrativeProps = {
  /** Already resolved by `resolveCaseStudyNarrative`. */
  sections: CaseStudyNarrativeSection[];
  /**
   * True for the opening run of the story: it carries the section eyebrow and
   * sets its very first paragraph as a lead. A continuation run (the part that
   * follows the canvases) passes false so the page does not restate itself.
   */
  lead?: boolean;
};

/**
 * The prose the page is now built around: what was built, how it was built,
 * and what it saved — told as a story rather than as a spec sheet.
 *
 * Long-form reading, so the rules are typographic: one narrow measure held at
 * ~68ch, a real paragraph rhythm instead of stacked cards, headings only where
 * the story actually turns, and colour drawn entirely from the existing theme
 * tokens so it reads the same in light and dark.
 *
 * Renders nothing when there is no prose to show.
 */
export function CaseStudyNarrative({
  sections,
  lead = true,
}: CaseStudyNarrativeProps) {
  const usable = sections.filter((section) => section.body.length > 0);
  if (usable.length === 0) {
    return null;
  }

  // Stable heading ids so each run of prose can name its own region, and so a
  // section with an authored `id` stays deep-linkable.
  const headingId = (section: CaseStudyNarrativeSection, index: number) =>
    section.heading
      ? `${section.id ?? `${lead ? "story" : "story-more"}-${index}`}-heading`
      : undefined;

  return (
    <Section divider aria-labelledby={headingId(usable[0], 0)}>
      <Container size="narrow">
        {lead ? <p className="section-eyebrow">The story</p> : null}

        <div className={lead ? "mt-8" : undefined}>
          {usable.map((section, sectionIndex) => (
            <section
              key={section.id ?? section.heading ?? section.body[0].slice(0, 48)}
              id={section.id}
              className={
                sectionIndex === 0 ? "scroll-mt-24" : "mt-14 scroll-mt-24 md:mt-20"
              }
            >
              {section.heading ? (
                <h2
                  id={headingId(section, sectionIndex)}
                  className="font-heading text-headline-lg text-balance text-on-surface"
                >
                  {section.heading}
                </h2>
              ) : null}

              <div
                className={[
                  "max-w-[68ch] space-y-6 text-pretty",
                  section.heading ? "mt-6" : "",
                  // The opening paragraph of the whole story is set as a lead;
                  // everything after it settles into the body measure.
                  lead && sectionIndex === 0
                    ? "text-lead"
                    : "text-body-lg text-on-surface-variant",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {section.body.map((paragraph, paragraphIndex) => (
                  <p key={`${paragraphIndex}-${paragraph.slice(0, 32)}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/**
 * The story a case study should tell, with a fallback that keeps the page
 * coherent while the real narrative is still being written.
 *
 * When `study.narrative` is absent the page would otherwise be a hero, some
 * canvases and nothing else, so the prose the record already holds is reused
 * in narrative order — problem, then system, then outcome. Nothing here is
 * invented: every paragraph is an existing verified field, and the list-shaped
 * fields (before issues, steps, tools, reliability controls) are deliberately
 * excluded because the page is no longer a point structure.
 */
export function resolveCaseStudyNarrative(
  study: CaseStudy,
): CaseStudyNarrativeSection[] {
  const authored = (study.narrative ?? []).filter(
    (section) => section.body.length > 0,
  );
  if (authored.length > 0) {
    return authored;
  }

  const fallback: CaseStudyNarrativeSection[] = [
    {
      id: "the-problem",
      heading: "The problem",
      body: [study.businessProblem, study.beforeState],
    },
    {
      id: "what-we-built",
      heading: "What we built",
      body: [study.architectureDescription],
      // Put the real canvases right after the description of the system they
      // implement, rather than stranding them at the end of the page.
      showWorkflowsAfter: true,
    },
    {
      id: "what-changed",
      heading: "What changed",
      body: [study.result],
    },
  ];

  return fallback
    .map((section) => ({
      ...section,
      body: section.body.map((paragraph) => paragraph.trim()).filter(Boolean),
    }))
    .filter((section) => section.body.length > 0);
}
