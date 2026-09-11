import { caseStudies } from "@/lib/content/case-studies";
import { workflowGroups } from "@/lib/content/workflows";
import type { Passage } from "@/lib/demo/types";

/**
 * The demo's corpus is built once, at module load, from content that already
 * ships in the repo — the approved case-study narratives and the workflow
 * catalogue. Nothing is scraped, nothing is invented, and no visitor-supplied
 * text ever enters the index.
 */

function passage(
  id: string,
  sourceTitle: string,
  sourceHref: string,
  section: string,
  text: string,
): Passage {
  return { id, sourceTitle, sourceHref, section, text: text.trim() };
}

function buildCaseStudyPassages(): Passage[] {
  return caseStudies.flatMap((study) => {
    const href = `/work/${study.slug}`;
    const out: Passage[] = [
      passage(`${study.slug}:summary`, study.title, href, "Summary", study.summary),
      passage(
        `${study.slug}:problem`,
        study.title,
        href,
        "Business problem",
        `${study.businessProblem} ${study.beforeState}`,
      ),
      passage(
        `${study.slug}:before`,
        study.title,
        href,
        "Before automation",
        study.beforeIssues.join(" "),
      ),
      passage(
        `${study.slug}:architecture`,
        study.title,
        href,
        "Architecture",
        `${study.architectureDescription} Components: ${study.architectureNodes
          .map((node) => `${node.label} — ${node.detail}`)
          .join("; ")}.`,
      ),
      passage(
        `${study.slug}:tools`,
        study.title,
        href,
        "Tools used",
        `Tools used in ${study.title}: ${study.tools
          .map((tool) => (tool.category ? `${tool.name} (${tool.category})` : tool.name))
          .join(", ")}.`,
      ),
      passage(
        `${study.slug}:contribution`,
        study.title,
        href,
        "My contribution",
        `On ${study.title} Abdullah handled: ${study.contribution.join(", ")}.`,
      ),
      passage(
        `${study.slug}:reliability`,
        study.title,
        href,
        "Reliability controls",
        study.reliabilityControls
          .map((control) => `${control.name}: ${control.description}`)
          .join(" "),
      ),
      passage(`${study.slug}:result`, study.title, href, "Result", study.result),
    ];

    // Steps are short; pair them so a retrieved passage carries enough context
    // to answer "how does it work" without pulling the whole pipeline.
    for (let index = 0; index < study.steps.length; index += 2) {
      const pair = study.steps.slice(index, index + 2);
      out.push(
        passage(
          `${study.slug}:steps-${index}`,
          study.title,
          href,
          `Workflow steps ${pair[0]?.stepNumber}–${pair[pair.length - 1]?.stepNumber}`,
          pair
            .map((step) => `${step.stepNumber}. ${step.title}: ${step.description}`)
            .join(" "),
        ),
      );
    }

    return out;
  });
}

function buildWorkflowPassages(): Passage[] {
  return workflowGroups.flatMap((group) =>
    group.items.map((item) =>
      passage(
        `workflow:${item.id}`,
        `${group.category} workflows`,
        "/#workflows",
        item.title,
        `${item.title}. ${item.summary}${
          item.outcomeTags?.length ? ` Outcomes: ${item.outcomeTags.join(", ")}.` : ""
        }`,
      ),
    ),
  );
}

/** The full passage index. Built once per server process. */
export const demoPassages: Passage[] = [
  ...buildCaseStudyPassages(),
  ...buildWorkflowPassages(),
].filter((item) => item.text.length > 0);
