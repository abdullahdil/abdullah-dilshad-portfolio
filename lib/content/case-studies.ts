import type { CaseStudy } from "@/lib/content/types";
import { workflowGroups } from "@/lib/content/workflows";
import { mapSeedWorkflowToPublicListing } from "@/lib/repositories/mappers";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";

/**
 * Verified case-study narratives only.
 * Source: CONTENT_TRUTH.md + project brief.
 * No fabricated metrics or unverified tools.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "ai-lead-generation-outreach-engine",
    title: "AI Lead Generation and Outreach Engine",
    summary:
      "An event-driven pipeline that carries a prospect from discovery through enrichment, LLM personalization, and Gmail delivery, with deduplication, reply detection, and a structured write-back to CRM or Google Sheets.",
    accent: "primary",
    previewLabel: "Lead Gen Architecture",
    businessProblem:
      "Prospect discovery, enrichment, personalization, outreach, and CRM updates depended on disconnected manual steps.",
    beforeState:
      "Lead data moved between research tools, spreadsheets, email, and manual follow-up without one traceable workflow.",
    beforeIssues: [
      "Prospect research and enrichment happened in separate tools with no shared state.",
      "Personalization and outreach drafting were repeated manually for each lead.",
      "Reply handling and CRM updates relied on ad hoc follow-up instead of a consistent process.",
    ],
    architectureDescription:
      "Prospects move through discovery, enrichment, normalization, AI-assisted qualification, personalization, optional human review, Gmail outreach, reply detection, and a write-back to CRM or Google Sheets. Each stage is a separate step with its own validation and guard conditions, orchestrated in n8n.",
    architectureNodes: [
      { label: "Trigger", detail: "Scheduled or manual start" },
      { label: "Apify", detail: "Prospect discovery" },
      { label: "Hunter.io", detail: "Contact enrichment" },
      { label: "n8n", detail: "Orchestration hub" },
      { label: "LLM APIs", detail: "Qualify and personalize" },
      { label: "Gmail", detail: "Outreach delivery" },
      { label: "Sheets / CRM", detail: "Structured output" },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Scheduled or manual trigger",
        description:
          "The workflow starts on a schedule or from a controlled manual run when a new prospect batch is ready.",
      },
      {
        stepNumber: 2,
        title: "Prospect discovery through Apify",
        description:
          "Apify collects prospect records based on the defined targeting criteria and returns structured profile data.",
      },
      {
        stepNumber: 3,
        title: "Contact enrichment through Hunter.io",
        description:
          "Hunter.io resolves work contact details and returns enrichment signals used in later validation steps.",
      },
      {
        stepNumber: 4,
        title: "Data normalization and validation",
        description:
          "Incoming fields are cleaned, required values are checked, and incomplete or low-quality records are filtered out.",
      },
      {
        stepNumber: 5,
        title: "AI-assisted qualification",
        description:
          "An LLM reviews the normalized prospect context and scores or classifies fit before personalization continues.",
      },
      {
        stepNumber: 6,
        title: "LLM personalization",
        description:
          "Claude API or OpenAI API drafts outreach copy from the validated prospect and company context.",
      },
      {
        stepNumber: 7,
        title: "Human review where required",
        description:
          "Higher-risk or higher-value leads can pause for approval before any outreach is sent.",
      },
      {
        stepNumber: 8,
        title: "Gmail outreach",
        description:
          "Approved messages are sent through the Gmail API with send guards to avoid duplicate delivery.",
      },
      {
        stepNumber: 9,
        title: "Reply detection",
        description:
          "Inbound replies are detected so follow-up logic stops, branches, or escalates.",
      },
      {
        stepNumber: 10,
        title: "Google Sheets or CRM update",
        description:
          "Status, notes, and key fields are written back to Google Sheets or the connected CRM record.",
      },
      {
        stepNumber: 11,
        title: "Error logging and notification",
        description:
          "Failed branches are logged and operators are notified so issues can be inspected without silent data loss.",
      },
    ],
    tools: [
      { name: "n8n", category: "Automation" },
      { name: "Apify", category: "Discovery" },
      { name: "Hunter.io", category: "Enrichment" },
      { name: "Claude API", category: "AI" },
      { name: "OpenAI API", category: "AI" },
      { name: "Gmail API", category: "Delivery" },
      { name: "Google Sheets", category: "Data" },
      { name: "REST APIs", category: "Integration" },
      { name: "Webhooks", category: "Integration" },
    ],
    contribution: [
      "Process mapping",
      "Workflow architecture",
      "API integration",
      "Data normalization",
      "Prompt design",
      "Duplicate prevention",
      "Reply detection",
      "Error handling",
      "Testing",
      "Deployment",
    ],
    reliabilityControls: [
      {
        name: "Input validation",
        description:
          "Incomplete or invalid prospect records are rejected before enrichment and outreach continue.",
      },
      {
        name: "Deduplication",
        description:
          "Existing contacts and recent sends are checked so the same prospect is not processed twice.",
      },
      {
        name: "Idempotency",
        description:
          "Re-runs use stable identifiers so retries do not create duplicate CRM rows or repeated emails.",
      },
      {
        name: "Send guards",
        description:
          "Outreach only continues after validation and, when configured, human approval.",
      },
      {
        name: "Retry branches",
        description:
          "Transient API failures are retried with bounded attempts before escalating to an error path.",
      },
      {
        name: "Reply detection",
        description:
          "Detected replies stop unnecessary follow-up and keep the conversation state accurate.",
      },
      {
        name: "Human review",
        description:
          "Selected leads can require approval so brand-sensitive messaging stays under operator control.",
      },
      {
        name: "Structured logging",
        description:
          "Key events and failures are logged in a form that supports later debugging and auditability.",
      },
    ],
    result:
      "Replaced a fragmented manual process with a scheduled and traceable automation system that handles prospect data, personalization, outreach operations, and CRM updates with minimal manual intervention.",
    resultMetrics: [],
    featuredImageUrl: "/images/case-study-lead-gen-architecture.png",
    demoVideoUrl: null,
    galleryImages: [],
    galleryPlaceholders: [
      "Prospect intake and enrichment flow",
      "Personalization and approval branch",
      "Reply detection and CRM write-back",
    ],
    demoVideoLabel: "Demo video coming soon",
  },
  {
    slug: "internal-operations-automation-system",
    title: "Internal Operations Automation System",
    summary:
      "An event-driven system that validates and classifies incoming requests, assigns an owner, gates sensitive steps behind Slack approval, and keeps CRM and spreadsheet records in step with the current status.",
    accent: "secondary",
    previewLabel: "Ops Pipeline Visual",
    businessProblem:
      "Assignments, approvals, updates, and reporting depended on fragmented messages and repeated manual follow-up.",
    beforeState:
      "Work moved between direct messages, spreadsheets, email, and verbal updates without a consistent operating process.",
    beforeIssues: [
      "Requests arrived through inconsistent channels with missing required fields.",
      "Ownership and approval state were unclear across Slack, spreadsheets, and email.",
      "Status reporting and CRM updates required repeated manual chasing.",
    ],
    architectureDescription:
      "Each request or status change is an event: it is validated, classified, assigned an owner, announced in Slack, tracked through approval states, synchronized into CRM or Google Sheets, and closed with a completion report. Failed branches raise operator alerts instead of stalling silently. n8n carries the orchestration.",
    architectureNodes: [
      { label: "Request", detail: "New work or status event" },
      { label: "Validate", detail: "Required-field checks" },
      { label: "Classify", detail: "Route by request type" },
      { label: "n8n", detail: "Orchestration hub" },
      { label: "Slack", detail: "Notify and approve" },
      { label: "Sheets / CRM", detail: "Status records" },
      { label: "Report", detail: "Completion summary" },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "New request or status trigger",
        description:
          "The workflow starts when a new operational request arrives or an existing item changes status.",
      },
      {
        stepNumber: 2,
        title: "Input validation",
        description:
          "Required fields are checked so incomplete requests are returned or held before routing continues.",
      },
      {
        stepNumber: 3,
        title: "Request classification",
        description:
          "Rules and optional LLM assistance classify the request so it can be assigned to the right path.",
      },
      {
        stepNumber: 4,
        title: "Team-member assignment",
        description:
          "Ownership is assigned based on request type, availability rules, or predefined routing logic.",
      },
      {
        stepNumber: 5,
        title: "Slack notification",
        description:
          "The assigned owner and relevant channel receive a structured Slack notification with context.",
      },
      {
        stepNumber: 6,
        title: "Status tracking",
        description:
          "Each transition is recorded so the request's current state and owner stay visible while it moves through the process.",
      },
      {
        stepNumber: 7,
        title: "Human approval",
        description:
          "Approval checkpoints pause sensitive or high-impact actions until an operator confirms.",
      },
      {
        stepNumber: 8,
        title: "CRM or Google Sheets update",
        description:
          "Approved outcomes and current status are synchronized into CRM or spreadsheet records.",
      },
      {
        stepNumber: 9,
        title: "Completion report",
        description:
          "Finished work produces a concise completion summary for operators or stakeholders.",
      },
      {
        stepNumber: 10,
        title: "Error notification",
        description:
          "Failures trigger operator alerts so broken handoffs do not disappear into chat history.",
      },
    ],
    tools: [
      { name: "n8n", category: "Automation" },
      { name: "Slack", category: "Collaboration" },
      { name: "Google Sheets", category: "Data" },
      { name: "Claude API", category: "AI" },
      { name: "REST APIs", category: "Integration" },
      { name: "Webhooks", category: "Integration" },
    ],
    contribution: [
      "Process mapping",
      "Workflow architecture",
      "Routing logic",
      "Slack integration",
      "Approval states",
      "CRM synchronization",
      "Error handling",
      "Testing",
      "Deployment",
    ],
    reliabilityControls: [
      {
        name: "Required-field validation",
        description:
          "Requests missing critical fields are blocked before assignment or approval starts.",
      },
      {
        name: "Status guards",
        description:
          "Transitions only move forward when the current state allows the next action.",
      },
      {
        name: "Duplicate prevention",
        description:
          "Repeated triggers for the same request do not create parallel ownership threads.",
      },
      {
        name: "Approval checkpoints",
        description:
          "Sensitive updates wait for explicit human confirmation before they are finalized.",
      },
      {
        name: "Retries",
        description:
          "Temporary integration failures retry within safe limits before escalation.",
      },
      {
        name: "Error notifications",
        description:
          "Operators receive actionable alerts when a branch fails or stalls.",
      },
      {
        name: "Traceable records",
        description:
          "Each request leaves a durable trail in Sheets or CRM for later review.",
      },
    ],
    result:
      "Converted disconnected team handoffs into a consistent event-driven process with clearer ownership, approval states, and faster system updates.",
    resultMetrics: [],
    featuredImageUrl: null,
    demoVideoUrl: null,
    galleryImages: [],
    galleryPlaceholders: [
      "Request intake and routing",
      "Slack approval checkpoint",
      "Status sync and completion report",
    ],
    demoVideoLabel: "Demo video coming soon",
  },
  {
    slug: "rag-customer-support-workflow",
    title: "AI Complaint Triage and Routing",
    summary:
      "An intake pipeline that reads an inbound message, judges tone and urgency against an explicit rubric, and routes it — with the model bound to a declared schema so every downstream branch is deterministic.",
    accent: "tertiary",
    previewLabel: "Intake and routing",
    narrative: [
      {
        id: "the-inbox",
        body: [
          "An inbound support inbox has no natural ordering. A note saying the packaging was slightly dented and a message from someone threatening to post a one-star review and demand a refund land in the same place, in the same format, looking identical in a list.",
          "The work of triage is reading each one and deciding three things: what is this about, how angry is this person, and does it need an answer in the next hour or by Friday. It takes maybe thirty seconds per message and it is genuinely skilled — it needs comprehension, not keyword matching. 'This is the third time I've had to write to you' contains no urgent words and is extremely urgent.",
          "It's also done worst exactly when it matters most. On a quiet morning every message gets read properly. On the day something goes wrong and forty complaints arrive at once, triage collapses into skimming, and the one message that needed an immediate response is the one that waits until Thursday.",
          "These two workflows are demonstrations of a pattern for that problem — teaching builds rather than client deployments, and worth presenting as such. What they show is how to let a model do the reading while keeping the system around it predictable.",
        ],
        heading: "Everything arrives looking the same",
      },
      {
        id: "the-problem-with-models",
        body: [
          "The tempting version of this is simple: send the message to a model, ask 'is this urgent?', act on the answer. That falls apart immediately in production.",
          "A model asked an open question replies with a sentence. Sometimes 'Yes, this appears urgent.' Sometimes 'This is high urgency.' Sometimes a paragraph of reasoning with the answer in the middle. Sometimes 'HIGH'. You end up writing string matching against natural language, and every model update reshuffles the phrasing.",
          "That isn't a prompt problem. It's a contract problem. The system needs a value it can switch on, and free text is not that.",
        ],
        heading: "Why you cannot branch on a sentence",
        showWorkflowsAfter: true,
      },
      {
        id: "structured",
        body: [
          "So the complaint router takes a submission from a public form and passes it to a classification agent that is bound to a declared output schema. The agent does not return prose. It returns an object with named fields: a summary of the complaint, a category, the customer's emotional state, an urgency level, and a recommended action.",
          "That schema is the entire design. Once the model must answer in a fixed shape, everything downstream becomes ordinary software — the fuzzy step is contained to exactly one node, and every node after it is deterministic and testable.",
          "The classification rubric is written explicitly into the prompt rather than left to the model's judgement. Anger, threatened bad reviews, refund demands and long waits are high urgency. Genuine but non-critical problems are medium. Simple feedback is low. Writing the rubric down makes the behaviour reviewable by the person who owns the inbox — they can read the rule and disagree with it, which they could never do with a vibe.",
          "Even with a schema, the code doesn't fully trust the output. A normalisation step coerces the urgency into exactly three permitted values and defaults to the middle one if anything unexpected arrives. Defaulting to medium is a deliberate choice: an unexpected value should degrade to 'handle it normally', never to 'ignore it'.",
          "The same step merges the original form submission back into the data, so nothing downstream can lose the customer's actual words while carrying the model's interpretation of them. And both routing branches end at a confirmation page, so there is no path where someone submits a complaint and sees nothing happen.",
        ],
        heading: "Binding the model to a schema",
      },
      {
        id: "guidance",
        body: [
          "The second workflow is a guidance agent. A student submits a profile — background, current skills, interests, goal, time available — and receives a tailored recommendation.",
          "Here the output is meant to be prose, so the control moves entirely into prompt design. The model is required to recommend exactly one skill rather than hedging across three, and to produce a fixed six-part structure. A preparation step normalises the incoming field names before the prompt sees them, so the prompt isn't quietly coupled to the form's internal naming.",
          "It is worth being accurate about what this one is not. It has no branching, no retry logic, no persistence, and no error path. It is a clean demonstration of prompt-level control over an open-ended answer, and nothing more. The complaint router is the one that shows the full pattern; this one shows the narrower half of it.",
        ],
        heading: "The same idea with a looser grip",
      },
      {
        id: "result",
        body: [
          "The idea worth taking from these is narrow and reusable: when a model's output has to drive a decision, bind it to a schema, normalise the result before you branch on it, choose a safe default for the unexpected case, and make sure every branch ends somewhere a person can see.",
          "Do that, and the model handles the part that genuinely needs reading comprehension — tone, intent, urgency, the complaint that never uses an urgent word — while everything around it stays inspectable. When something goes wrong you can point at exactly one step and ask whether it judged correctly, instead of debugging a paragraph.",
          "That containment is what makes model output safe to build on. It's the difference between a demo that works when you try it and a system somebody else can run.",
        ],
        heading: "The transferable part",
      },
    ],
    businessProblem:
      "Inbound complaints arrive undifferentiated, so an urgent message can wait behind a trivial one — and manual triage degrades exactly when volume spikes.",
    beforeState:
      "Every message had to be read by a person to decide what it was about, how upset the sender was, and how quickly it needed an answer.",
    beforeIssues: [
      "Urgent and trivial complaints looked identical in the inbox.",
      "Urgency often had to be read from tone, not keywords, so simple filters missed it.",
      "Under load, triage collapsed into skimming and the messages that mattered most waited longest.",
    ],
    architectureDescription:
      "A public form submission goes to a classification agent bound to a declared output schema, using an explicit urgency rubric written into the prompt. A normalisation step coerces the urgency into three permitted values, defaulting to medium, and merges the original submission back in. A single branch on urgency then sends the matching email, and both paths end at a confirmation page. n8n carries the orchestration.",
    architectureNodes: [
      { label: "Form", detail: "Complaint submitted" },
      { label: "Classify", detail: "Schema-bound AI agent" },
      { label: "Normalise", detail: "Coerce urgency, keep original" },
      { label: "Route", detail: "High urgency or normal" },
      { label: "Notify", detail: "Urgent or normal email" },
      { label: "Confirm", detail: "Success page for the sender" },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Complaint submitted",
        description:
          "A customer submits a complaint through a public form, which starts the workflow.",
      },
      {
        stepNumber: 2,
        title: "Schema-bound classification",
        description:
          "An AI agent bound to a structured output schema returns a summary, category, emotional state, urgency level, and recommended action.",
      },
      {
        stepNumber: 3,
        title: "Explicit urgency rubric",
        description:
          "The prompt spells out the rubric: anger, threatened bad reviews, refund demands and long waits are high; genuine non-critical problems are medium; simple feedback is low.",
      },
      {
        stepNumber: 4,
        title: "Normalisation",
        description:
          "A code step coerces urgency into exactly three permitted values, defaults to medium on anything unexpected, and merges the original submission back in.",
      },
      {
        stepNumber: 5,
        title: "Urgency routing",
        description:
          "A single deterministic branch separates high-urgency complaints from everything else.",
      },
      {
        stepNumber: 6,
        title: "Email on the matching path",
        description:
          "The urgent path and the normal path each send their own email.",
      },
      {
        stepNumber: 7,
        title: "Confirmation",
        description:
          "Both branches end at a confirmation page, so no submission disappears without a response.",
      },
    ],
    tools: [
      { name: "n8n", category: "Automation" },
      { name: "OpenAI API", category: "AI" },
      { name: "Structured outputs", category: "AI" },
      { name: "Gmail API", category: "Delivery" },
    ],
    contribution: [
      "Workflow design",
      "Prompt and rubric design",
      "Output schema design",
      "Normalisation logic",
      "Routing logic",
      "Testing",
    ],
    reliabilityControls: [
      {
        name: "Schema-bound output",
        description:
          "The model must answer in a declared shape, so no branch ever parses free text.",
      },
      {
        name: "Explicit rubric",
        description:
          "Urgency rules are written into the prompt, so the person who owns the inbox can review and change them.",
      },
      {
        name: "Safe default",
        description:
          "An unexpected urgency value degrades to medium — handle it normally — never to ignore it.",
      },
      {
        name: "Original input preserved",
        description:
          "The customer's own words travel alongside the model's interpretation through every downstream step.",
      },
      {
        name: "Visible outcome on every path",
        description:
          "Both routing branches end at a confirmation page, so a submission never vanishes silently.",
      },
    ],
    result:
      "Two teaching builds that demonstrate a reusable pattern: contain the model to one schema-bound step, normalise its output before branching, default safely, and end every branch somewhere a person can see.",
    resultMetrics: [],
    featuredImageUrl: null,
    demoVideoUrl: null,
    relatedWorkflowIds: [
      "smart-complaint-routing-demo",
      "career-guidance-agent-demo",
    ],
    galleryImages: [],
    galleryPlaceholders: [
      "Complaint intake form",
      "Schema-bound classification",
      "Urgency routing and confirmation",
    ],
    demoVideoLabel: "Demo video coming soon",
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudyIndex(slug: string): number {
  return caseStudies.findIndex((study) => study.slug === slug);
}

export function getAdjacentCaseStudies(slug: string): {
  previous: CaseStudy | null;
  next: CaseStudy | null;
} {
  const index = getCaseStudyIndex(slug);
  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? caseStudies[index - 1] : null,
    next: index < caseStudies.length - 1 ? caseStudies[index + 1] : null,
  };
}

export function getCaseStudyCards() {
  return caseStudies.map((study) => ({
    slug: study.slug,
    title: study.title,
    summary: study.summary,
    tools: study.tools.map((tool) => tool.name),
    accent: study.accent,
    previewLabel: study.previewLabel,
    featuredImageUrl: study.featuredImageUrl ?? null,
  }));
}

/**
 * Resolves a case study's `relatedWorkflowIds` against the seed workflow
 * catalog, preserving the authored order and dropping ids that no longer
 * exist. This is the no-Supabase fallback for the related-workflows section:
 * the public repository uses it whenever the database is unavailable.
 */
export function getSeedRelatedWorkflows(
  study: Pick<CaseStudy, "relatedWorkflowIds">,
): PublicWorkflowListing[] {
  const ids = study.relatedWorkflowIds ?? [];
  if (ids.length === 0) return [];

  const byId = new Map<string, PublicWorkflowListing>();
  for (const group of workflowGroups) {
    for (const item of group.items) {
      byId.set(item.id, mapSeedWorkflowToPublicListing(item));
    }
  }

  return ids
    .map((id) => byId.get(id))
    .filter((item): item is PublicWorkflowListing => item !== undefined);
}
