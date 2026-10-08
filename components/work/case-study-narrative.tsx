import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { narrativeSectionId } from "@/components/work/case-study-content";
import { CaseStudyToc } from "@/components/work/case-study-toc";
import type { CaseStudy, CaseStudyNarrativeSection } from "@/lib/content/types";

/** Anchor of the long-form story region — the summary rail links here. */
export const FULL_STORY_ID = "full-story";

type CaseStudyNarrativeProps = {
  /** Already resolved by `resolveCaseStudyNarrative`. */
  sections: CaseStudyNarrativeSection[];
};

/**
 * "The full story": the long-form prose, kept intact for readers who want it,
 * below the scannable summary. Long-form reading, so the rules are
 * typographic — one measure held at ~68ch, a real paragraph rhythm, headings
 * only where the story turns, colour from the theme tokens only.
 *
 * From `lg` up a sticky contents rail with a reading-progress line sits
 * beside the prose (only when the story has at least two headed sections).
 *
 * Renders nothing when there is no prose to show.
 */
export function CaseStudyNarrative({ sections }: CaseStudyNarrativeProps) {
  const usable = sections.filter((section) => section.body.length > 0);
  if (usable.length === 0) {
    return null;
  }

  const toc = usable
    .map((section, index) => ({
      id: narrativeSectionId(section, index),
      label: section.heading ?? "",
    }))
    .filter((entry) => entry.label);
  const showToc = toc.length >= 2;

  return (
    <Section divider id={FULL_STORY_ID} aria-labelledby="full-story-heading" className="scroll-mt-16">
      <Container>
        <div
          className={
            showToc
              ? "lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16"
              : undefined
          }
        >
          {showToc ? (
            <aside className="hidden lg:block">
              <CaseStudyToc entries={toc} />
            </aside>
          ) : null}

          <div className="min-w-0" data-story-body>
            <p className="section-eyebrow">Read in depth</p>
            <h2
              id="full-story-heading"
              className="mt-3 font-heading text-headline-xl text-balance text-on-surface"
            >
              The full story
            </h2>

            <div className="mt-10 md:mt-12">
              {usable.map((section, sectionIndex) => (
                <section
                  key={narrativeSectionId(section, sectionIndex)}
                  id={narrativeSectionId(section, sectionIndex)}
                  aria-labelledby={
                    section.heading
                      ? `${narrativeSectionId(section, sectionIndex)}-heading`
                      : undefined
                  }
                  className={
                    sectionIndex === 0 ? "scroll-mt-24" : "mt-14 scroll-mt-24 md:mt-16"
                  }
                >
                  {section.heading ? (
                    <h3
                      id={`${narrativeSectionId(section, sectionIndex)}-heading`}
                      className="font-heading text-headline-lg text-balance text-on-surface"
                    >
                      {section.heading}
                    </h3>
                  ) : null}

                  <div
                    className={[
                      "max-w-[68ch] space-y-6 text-pretty",
                      section.heading ? "mt-6" : "",
                      sectionIndex === 0
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
          </div>
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
