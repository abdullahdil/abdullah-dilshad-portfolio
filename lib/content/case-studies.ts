import type { CaseStudy } from "@/lib/content/types";

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
      "An end-to-end workflow connecting prospect discovery, enrichment, LLM personalization, email delivery, reply detection, duplicate prevention, and structured CRM output.",
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
      "A multi-stage n8n workflow that moves prospects from discovery through enrichment, AI-assisted qualification and personalization, optional human review, Gmail outreach, reply detection, and structured CRM or spreadsheet updates.",
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
        title: "Claude / OpenAI personalization",
        description:
          "Claude API or OpenAI API drafts personalized outreach copy from the validated prospect and company context.",
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
          "Inbound replies are detected so follow-up logic can stop, branch, or escalate appropriately.",
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
    featuredImageUrl: null,
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
      "A cross-team automation system for task routing, Slack notifications, CRM updates, status reporting, content approvals, and operational coordination.",
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
      "An event-driven n8n system that validates incoming requests, classifies work, assigns owners, notifies teams in Slack, tracks approval and status, updates CRM or Google Sheets, and produces completion reports with error notifications.",
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
          "Progress states are recorded so the request remains visible as it moves through the process.",
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
    title: "RAG Customer Support Workflow",
    summary:
      "A knowledge-grounded support workflow that retrieves relevant context, generates responses, evaluates routing confidence, and escalates unresolved cases to humans.",
    accent: "tertiary",
    previewLabel: "RAG System Schematic",
    businessProblem:
      "Common support questions required repeated manual knowledge lookup and response preparation.",
    beforeState:
      "Messages were reviewed manually, answers were searched from internal content, and difficult cases were escalated inconsistently.",
    beforeIssues: [
      "Agents spent time re-finding the same internal knowledge for recurring questions.",
      "Response quality depended on who happened to handle the ticket.",
      "Escalation decisions were inconsistent when confidence was low.",
    ],
    architectureDescription:
      "A knowledge-grounded support workflow that normalizes the customer query, retrieves relevant context from a vector knowledge base, assembles grounded prompts, generates a draft response, evaluates confidence, and either replies or escalates to a human with Slack or email notification and interaction logging.",
    architectureNodes: [
      { label: "Query", detail: "Customer message in" },
      { label: "Normalize", detail: "Clean and structure input" },
      { label: "Retrieve", detail: "Knowledge lookup" },
      { label: "n8n", detail: "Orchestration hub" },
      { label: "LLM API", detail: "Draft grounded reply" },
      { label: "Route", detail: "Respond or escalate" },
      { label: "Notify / Log", detail: "Slack, email, records" },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Customer query received",
        description:
          "A support message enters the workflow through the connected intake channel or webhook.",
      },
      {
        stepNumber: 2,
        title: "Query normalization",
        description:
          "The message is cleaned and structured so retrieval and routing operate on consistent input.",
      },
      {
        stepNumber: 3,
        title: "Knowledge retrieval",
        description:
          "Relevant passages are retrieved from the vector knowledge base for the current question.",
      },
      {
        stepNumber: 4,
        title: "Context assembly",
        description:
          "Retrieved material is assembled into a grounded context package for the language model.",
      },
      {
        stepNumber: 5,
        title: "LLM response generation",
        description:
          "The LLM API drafts a response constrained to the retrieved context and support instructions.",
      },
      {
        stepNumber: 6,
        title: "Confidence or rule evaluation",
        description:
          "Routing rules or confidence checks decide whether the draft can continue or should escalate.",
      },
      {
        stepNumber: 7,
        title: "Response or human escalation",
        description:
          "High-confidence answers continue toward response paths; uncertain cases move to a human queue.",
      },
      {
        stepNumber: 8,
        title: "Slack or email notification",
        description:
          "Operators are notified when escalation or review is required, with the relevant context attached.",
      },
      {
        stepNumber: 9,
        title: "Interaction logging",
        description:
          "The query, retrieved context summary, decision path, and outcome are logged for later review.",
      },
    ],
    tools: [
      { name: "n8n", category: "Automation" },
      { name: "LLM API", category: "AI" },
      { name: "Vector knowledge base", category: "Retrieval" },
      { name: "Slack", category: "Collaboration" },
      { name: "Email", category: "Delivery" },
      { name: "Webhooks", category: "Integration" },
    ],
    contribution: [
      "Architecture",
      "Knowledge-ingestion workflow",
      "Retrieval orchestration",
      "Prompt design",
      "Routing logic",
      "Escalation workflow",
      "Testing",
      "Deployment",
    ],
    reliabilityControls: [
      {
        name: "Grounded-context requirement",
        description:
          "Responses are only drafted when relevant retrieved context is available.",
      },
      {
        name: "Missing-context fallback",
        description:
          "If retrieval returns insufficient material, the workflow falls back instead of inventing an answer.",
      },
      {
        name: "Low-confidence escalation",
        description:
          "Uncertain cases are routed to humans instead of being auto-sent.",
      },
      {
        name: "Error routes",
        description:
          "Integration or model failures follow a defined error branch with operator visibility.",
      },
      {
        name: "Human review",
        description:
          "Escalated tickets preserve enough context for a person to finish the response safely.",
      },
      {
        name: "Interaction logging",
        description:
          "Each run stores enough detail to inspect quality, routing, and failure modes later.",
      },
    ],
    result:
      "Created a repeatable support workflow that automates knowledge retrieval and response preparation while preserving human control for uncertain cases.",
    featuredImageUrl: null,
    demoVideoUrl: null,
    galleryImages: [],
    galleryPlaceholders: [
      "Query intake and retrieval",
      "Grounded draft generation",
      "Escalation and logging path",
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
