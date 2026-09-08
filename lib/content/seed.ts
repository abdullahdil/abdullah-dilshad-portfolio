/**
 * Verified local seed content for Phase 1–3.
 * Source of truth: CONTENT_TRUTH.md
 */

import { getCaseStudyCards } from "@/lib/content/case-studies";

export const profileSeed = {
  fullName: "Abdullah Dilshad",
  professionalTitle: "AI Automation Engineer · n8n Specialist",
  heroHeadline:
    "I design n8n systems that turn manual business processes into reliable, monitored automation.",
  heroDescription:
    "n8n Level 2 Certified Developer and Verified Template Creator. I build production automation across lead generation, internal operations, and customer support — with error handling, duplicate guards, and human approval built in, not bolted on.",
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
    "n8n Level 2 Certified Developer based in Islamabad, building production automation that connects AI models, APIs, and human approval processes.",
  longBio: [
    "I'm Abdullah Dilshad, an AI Automation Engineer and n8n Level 2 Certified Developer based in Islamabad, Pakistan. I design production workflows that connect AI models, APIs, business tools, and human approval processes.",
    "Most automation breaks quietly. My work focuses on the parts that keep it running: error handling, retry and fallback logic, duplicate prevention, and human-in-the-loop approval before anything irreversible happens. I have delivered 25+ paid production workflows across lead generation, internal operations, inbox management, customer support, reporting, and content operations.",
    "I'm also a Verified Creator in the n8n official template library, with published templates deployed by developers worldwide. I hold a BS in Computer Science from FAST-NUCES, and I work with teams across European and US time zones on remote roles and long-term contracts.",
  ],
};

export const proofStripSeed = [
  {
    value: "BS Computer Science",
    label: "FAST-NUCES · Graduated Sep 2025",
  },
  {
    value: "AI Automation Engineer",
    label: "AiMark Labs · Apr 2025–Present",
  },
  {
    value: "25+ workflows",
    label: "Paid production automations delivered",
  },
  {
    value: "n8n Level 2",
    label: "3+ public templates · Creator profile",
  },
  {
    value: "Core stack",
    label: "n8n · Claude / OpenAI APIs · REST APIs · Gmail · Slack · Google Sheets",
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
    period: "April 2025–Present",
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
      "n8n",
      "Event-driven workflows",
      "Webhooks",
      "Scheduling",
      "Error handling",
      "Retry and fallback logic",
      "Human-in-the-loop approval",
      "Duplicate prevention",
    ],
  },
  {
    category: "AI and LLM Workflows",
    icon: "Brain" as const,
    accent: "secondary" as const,
    items: [
      "Claude API",
      "OpenAI API",
      "RAG workflows",
      "Structured outputs",
      "Prompt design",
      "Classification",
      "Routing",
      "LLM orchestration",
    ],
  },
  {
    category: "Integrations",
    icon: "Plug" as const,
    accent: "tertiary" as const,
    items: [
      "REST APIs",
      "OAuth",
      "Gmail API",
      "Slack",
      "Google Sheets",
      "Meta Graph API",
      "Apify",
      "Hunter.io",
      "CRM integrations",
      "SaaS integrations",
    ],
  },
  {
    category: "Engineering Tools",
    icon: "Terminal" as const,
    accent: "primary" as const,
    items: [
      "JavaScript",
      "Node.js",
      "JSON transformation",
      "Git",
      "GitHub",
      "Postman",
      "Linux",
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
  { href: "/admin/media", label: "Media", icon: "Image" },
  { href: "/admin/messages", label: "Messages", icon: "Mail" },
  { href: "/admin/profile", label: "Profile", icon: "User" },
  { href: "/admin/experience", label: "Experience", icon: "Briefcase" },
  { href: "/admin/capabilities", label: "Capabilities", icon: "Puzzle" },
  { href: "/admin/templates", label: "Templates", icon: "Library" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
] as const;
