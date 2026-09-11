/**
 * Verified local seed content for Phase 1–3.
 * Source of truth: CONTENT_TRUTH.md
 */

import { getCaseStudyCards } from "@/lib/content/case-studies";

export const profileSeed = {
  fullName: "Abdullah Dilshad",
  professionalTitle: "AI Automation Engineer · Systems & Integrations",
  heroHeadline: "I build AI automation systems that replace manual work.",
  heroDescription:
    "I build and run production automation that connects AI models, APIs, and business systems across lead generation, internal operations, inbox management, customer support, reporting, and content operations. Every workflow is engineered to keep running: validation before anything moves, error handling with bounded retries and fallbacks, duplicate prevention, and human approval before anything irreversible.",
  location: "Islamabad, Pakistan",
  availabilityLabel: "Available for Remote Work",
  availabilityStatus: "available" as const,
  email: "abdullahdilshad111@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/abdullah-dilshad",
  githubUrl: null as string | null,
  n8nProfileUrl: "https://n8n.io/creators/abdullahmil/",
  credentialUrl:
    "https://community.n8n.io/badges/105/completed-n8n-course-level-2?username=abdullahmil",
  cvUrl: "/Abdullah-Dilshad-CV.pdf",
  shortBio:
    "AI Automation Engineer based in Islamabad, building production automation systems that connect AI models, APIs, and business tools — engineered for reliability and traceability, with human approval on the steps that matter.",
  longBio: [
    "I'm Abdullah Dilshad, an AI Automation Engineer based in Islamabad, Pakistan. I build production automation systems that connect AI models, APIs, business tools, and the people who need to approve what those systems do.",
    "Getting a workflow to production is the whole job. A demo runs once; a production system has to keep running, so I engineer for the parts that decide whether it does: validation before anything moves, error handling with bounded retries and fallbacks, idempotent steps and duplicate prevention, status guards so work cannot skip a stage, and human-in-the-loop approval before anything irreversible. Every run leaves a traceable record, so a failure can be found and explained rather than guessed at.",
    "That work covers approximately 30 paid production workflows across lead generation, internal operations, inbox management, customer support, reporting, and content operations — scheduled and event-driven systems integrated with REST APIs, OAuth-connected SaaS tools, CRMs, Gmail, Slack, and Google Sheets.",
    "I work in Python, JavaScript, and Node.js, run automation in Docker, and ship with CI/CD on GitHub Actions. n8n is the orchestration layer on many of those builds: I completed n8n Course Level 2 and publish as a Verified Creator in the official template library.",
    "I hold a BS in Computer Science from FAST-NUCES and I'm open to international remote roles and long-term contracts.",
  ],
};

export const proofStripSeed = [
  {
    value: "BS Computer Science",
    label: "FAST-NUCES · Graduated Sep 2025",
  },
  {
    value: "AI Automation Engineer",
    label: "AiMark Labs · Aug 2025–Present",
  },
  {
    value: "30 workflows",
    label: "Paid production automations delivered",
  },
  {
    value: "n8n Level 2",
    label: "3 public templates · Creator profile",
  },
  {
    value: "Core stack",
    label: "Claude / OpenAI APIs · RAG · Vector DBs · Agent workflows · MCP · Python · REST APIs · n8n",
    featured: true,
  },
] as const;

export const heroWorkflowSeed = [
  {
    title: "Business Trigger",
    description: "Scheduled or event-driven start",
    icon: "Webhook" as const,
  },
  {
    title: "Data Enrichment",
    description: "Normalize and enrich records",
    icon: "Database" as const,
  },
  {
    title: "AI-Assisted Decision",
    description: "Qualify, classify, or draft",
    icon: "Brain" as const,
  },
  {
    title: "Human Approval",
    description: "Review before critical actions",
    icon: "UserCheck" as const,
  },
  {
    title: "Business Action",
    description: "Notify, send, or update systems",
    icon: "Send" as const,
  },
] as const;

export const contactOpportunityTypes = [
  "Full-time remote role",
  "Long-term contract",
  "Automation project",
  "Collaboration",
  "Other",
] as const;

export const navLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#workflows", label: "Workflows" },
  { href: "/#experience", label: "Experience" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;

export const caseStudySeed = getCaseStudyCards();

export const experienceSeed = [
  {
    organization: "AiMark Labs",
    role: "AI Automation Engineer",
    location: "Islamabad, Pakistan",
    period: "August 2025–Present",
    isCurrent: true,
    description:
      "Designs and deploys AI-powered automation systems for lead generation, internal operations, content workflows, client reporting, and API-connected business processes.",
  },
  {
    organization: "Independent Clients",
    role: "n8n Developer and AI Automation Engineer",
    location: "Remote",
    period: "August 2024–April 2025",
    isCurrent: false,
    description:
      "Delivered paid production workflows across lead generation, inbox management, customer support, data synchronization, and business process automation.",
  },
  {
    organization: "n8n Official Template Library",
    role: "Workflow Template Creator",
    location: "Remote",
    period: "2024–Present",
    isCurrent: true,
    description:
      "Publishes reusable automation templates for the n8n community, with three currently listed public workflows.",
  },
] as const;

export const capabilitiesSeed = [
  {
    category: "Automation Engineering",
    icon: "Workflow" as const,
    accent: "primary" as const,
    items: [
      "Event-driven workflows",
      "Error handling",
      "Retry and fallback logic",
      "Human-in-the-loop approval",
      "Duplicate prevention",
      "Webhooks",
      "Scheduling",
      "n8n",
    ],
  },
  {
    category: "AI and LLM Engineering",
    icon: "Brain" as const,
    accent: "secondary" as const,
    items: [
      "LLM orchestration",
      "Agent workflows and tool calling",
      "RAG workflows",
      "Vector databases",
      "MCP integrations",
      "Claude API",
      "OpenAI API",
      "Structured outputs",
      "Prompt design",
      "Classification",
      "Routing",
    ],
  },
  {
    category: "Integrations and APIs",
    icon: "Plug" as const,
    accent: "tertiary" as const,
    items: [
      "REST APIs",
      "OAuth",
      "CRM integrations",
      "SaaS integrations",
      "Gmail API",
      "Slack",
      "Google Sheets",
      "Meta Graph API",
      "Apify",
      "Hunter.io",
    ],
  },
  {
    category: "Engineering and Delivery",
    icon: "Terminal" as const,
    accent: "primary" as const,
    items: [
      "Python",
      "JavaScript",
      "Node.js",
      "Docker",
      "CI/CD with GitHub Actions",
      "Linux",
      "Git",
      "GitHub",
      "JSON transformation",
      "Postman",
      "Cloud-hosted automation",
    ],
  },
] as const;

export const templatesSeed = [
  {
    title: "Get a daily cybersecurity news digest on Telegram and Slack with GPT-4",
    description:
      "Public n8n template that aggregates cybersecurity news into a daily digest delivered to Telegram and Slack.",
    externalUrl: "https://n8n.io/creators/abdullahmil/",
    tools: ["n8n", "GPT-4", "Telegram", "Slack"],
    accent: "primary" as const,
  },
  {
    title:
      "Automated form response system with Google Sheets, Slack, Gmail and Contacts",
    description:
      "Public n8n template for capturing form submissions and coordinating responses across Sheets, Slack, Gmail, and Contacts.",
    externalUrl: "https://n8n.io/creators/abdullahmil/",
    tools: ["n8n", "Google Sheets", "Slack", "Gmail"],
    accent: "secondary" as const,
  },
  {
    title:
      "Transcribe and summarize audio with Whisper, from Google Drive to Notion",
    description:
      "Public n8n template that transcribes audio from Google Drive with Whisper and writes summaries to Notion.",
    externalUrl: "https://n8n.io/creators/abdullahmil/",
    tools: ["n8n", "Whisper", "Google Drive", "Notion"],
    accent: "tertiary" as const,
  },
] as const;

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/case-studies", label: "Case Studies", icon: "FolderKanban" },
  { href: "/admin/workflows", label: "Workflows", icon: "Workflow" },
  { href: "/admin/media", label: "Media", icon: "Image" },
  { href: "/admin/messages", label: "Messages", icon: "Mail" },
  { href: "/admin/access-requests", label: "Access Requests", icon: "KeyRound" },
  { href: "/admin/profile", label: "Profile", icon: "User" },
  { href: "/admin/experience", label: "Experience", icon: "Briefcase" },
  { href: "/admin/capabilities", label: "Capabilities", icon: "Puzzle" },
  { href: "/admin/templates", label: "Templates", icon: "Library" },
  { href: "/admin/proof-points", label: "Proof Strip", icon: "BadgeCheck" },
  { href: "/admin/hero-workflow", label: "Hero Diagram", icon: "GitBranch" },
  { href: "/admin/navigation", label: "Navigation", icon: "Link2" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
] as const;
