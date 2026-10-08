import {
  CopyCheck,
  GitBranch,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { HERO_STAGES, HeroMachine } from "@/components/hero-3d";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

type Principle = { icon: LucideIcon; title: string; body: string };

/**
 * Wording is lifted from the approved hero description and long bio
 * (CONTENT_TRUTH.md → Hero; lib/content/seed.ts → profileSeed.longBio[1]) and
 * the verified "Automation Engineering" capabilities. Retries were confirmed by
 * the owner on 2026-10-08. Add nothing here that is not in those sources.
 */
const PRINCIPLES: Principle[] = [
  {
    icon: ShieldCheck,
    title: "Validation first",
    body: "Inputs are validated before anything moves.",
  },
  {
    icon: GitBranch,
    title: "Guard conditions",
    body: "Status guards so work cannot skip a stage.",
  },
  {
    icon: RotateCcw,
    title: "Retries and fallbacks",
    body: "Bounded retries and coded fallback paths when a step fails.",
  },
  {
    icon: CopyCheck,
    title: "Duplicate prevention",
    body: "Idempotent steps that keep the same work from running twice.",
  },
  {
    icon: UserCheck,
    title: "Human approval",
    body: "A person approves before anything irreversible.",
  },
  {
    icon: ScrollText,
    title: "Traceable runs",
    body: "Every run leaves a record, so a failure can be found and explained.",
  },
];

export function ReliabilitySection() {
  return (
    <Section id="how-i-build" divider aria-labelledby="how-i-build-title">
      <Container>
        <SectionHeading
          eyebrow="How I build"
          title="Engineered to keep running"
          titleId="how-i-build-title"
          description="A demo runs once; a production system has to keep running. These are the parts that decide whether it does."
        />

        {/* The five canonical stages (CONTENT_TRUTH.md → Hero → Workflow
            visual) as a studio-lit machine, shown as a wide band: the object is
            ~3:1, so a side-by-side column left dead space. Client island:
            poster first, WebGL after idle, paused off-screen. */}
        <HeroMachine
          steps={HERO_STAGES}
          stageAspect="aspect-[16/9] sm:aspect-[12/5]"
          className="mx-auto mt-10 w-full max-w-5xl"
        />

        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-outline-variant bg-outline-variant sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-surface-container px-6 py-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-accent-soft text-accent">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <h3 className="text-body-md font-semibold tracking-[-0.01em] text-on-surface">
                  {title}
                </h3>
              </div>
              <p className="mt-3 text-body-sm text-pretty text-on-surface-variant">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
