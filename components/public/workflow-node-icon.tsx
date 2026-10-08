/**
 * Monochrome node-type icons for the public canvas, thumbnails and tool rows.
 *
 * `lib/workflow-canvas/icons.ts` stays the source of the human *label*
 * (`iconForTypeKey(key).label`, used by the sanitiser and screen-reader text);
 * its emoji `glyph` is no longer drawn on the public site. Here each n8n
 * `typeKey` maps to a coarse category and each category to one lucide icon, so
 * the whole set shares a stroke weight and inherits `currentColor`.
 *
 * No hooks, no `"use client"` — usable from Server Components.
 */

import {
  Bot,
  Box,
  Calendar,
  ClipboardList,
  Clock,
  Code,
  Database,
  FileText,
  GitBranch,
  Globe,
  Hourglass,
  Layers,
  Mail,
  Merge,
  MessageCircle,
  OctagonAlert,
  PencilLine,
  Play,
  Repeat,
  Rss,
  Share2,
  Sheet,
  Sparkles,
  Users,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import { iconForTypeKey } from "@/lib/workflow-canvas/icons";

export type NodeIconCategory =
  | "schedule"
  | "webhook"
  | "manual"
  | "form"
  | "error"
  | "subworkflow"
  | "agent"
  | "ai"
  | "http"
  | "code"
  | "branch"
  | "merge"
  | "loop"
  | "edit"
  | "transform"
  | "wait"
  | "sheet"
  | "database"
  | "email"
  | "messaging"
  | "file"
  | "calendar"
  | "crm"
  | "social"
  | "feed"
  | "other";

const EXACT: Readonly<Record<string, NodeIconCategory>> = {
  scheduletrigger: "schedule",
  cron: "schedule",
  interval: "schedule",
  webhook: "webhook",
  respondtowebhook: "webhook",
  manualtrigger: "manual",
  start: "manual",
  formtrigger: "form",
  form: "form",
  errortrigger: "error",
  stopanderror: "error",
  executeworkflow: "subworkflow",
  executeworkflowtrigger: "subworkflow",
  toolworkflow: "subworkflow",
  agent: "agent",
  httprequest: "http",
  toolhttprequest: "http",
  code: "code",
  function: "code",
  functionitem: "code",
  toolcode: "code",
  if: "branch",
  switch: "branch",
  filter: "branch",
  merge: "merge",
  splitinbatches: "loop",
  set: "edit",
  renamekeys: "edit",
  aggregate: "transform",
  splitout: "transform",
  itemlists: "transform",
  sort: "transform",
  limit: "transform",
  removeduplicates: "transform",
  summarize: "transform",
  dateandtime: "transform",
  datetime: "transform",
  html: "transform",
  xml: "transform",
  markdown: "transform",
  crypto: "transform",
  noop: "transform",
  wait: "wait",
  googlesheets: "sheet",
  googlesheetstrigger: "sheet",
  airtable: "sheet",
  spreadsheetfile: "sheet",
  datatable: "sheet",
  postgres: "database",
  mysql: "database",
  mongodb: "database",
  redis: "database",
  supabase: "database",
  gmail: "email",
  gmailtrigger: "email",
  emailsend: "email",
  emailreadimap: "email",
  sendgrid: "email",
  slack: "messaging",
  telegram: "messaging",
  discord: "messaging",
  whatsapp: "messaging",
  whatsapptrigger: "messaging",
  twilio: "messaging",
  chattrigger: "messaging",
  googledrive: "file",
  googledrivetrigger: "file",
  googledocs: "file",
  s3: "file",
  awss3: "file",
  readwritefile: "file",
  extractfromfile: "file",
  converttofile: "file",
  googlecalendar: "calendar",
  calendly: "calendar",
  hubspot: "crm",
  salesforce: "crm",
  pipedrive: "crm",
  facebookgraphapi: "social",
  rssfeedread: "feed",
};

const AI_PREFIXES = ["lmchat", "lm", "embeddings", "vectorstore", "memory", "outputparser", "chain"];
const AI_KEYS = new Set([
  "openai",
  "anthropic",
  "googlegemini",
  "informationextractor",
  "textclassifier",
  "sentimentanalysis",
]);

export function nodeIconCategory(typeKey: string): NodeIconCategory {
  const key = typeKey.trim().toLowerCase();
  const exact = EXACT[key];
  if (exact) return exact;
  if (AI_KEYS.has(key) || AI_PREFIXES.some((prefix) => key.startsWith(prefix))) return "ai";
  if (key.startsWith("tool")) return "subworkflow";
  if (key.endsWith("trigger")) return "webhook";
  return "other";
}

const ICONS: Readonly<Record<NodeIconCategory, LucideIcon>> = {
  schedule: Clock,
  webhook: Webhook,
  manual: Play,
  form: ClipboardList,
  error: OctagonAlert,
  subworkflow: Workflow,
  agent: Bot,
  ai: Sparkles,
  http: Globe,
  code: Code,
  branch: GitBranch,
  merge: Merge,
  loop: Repeat,
  edit: PencilLine,
  transform: Layers,
  wait: Hourglass,
  sheet: Sheet,
  database: Database,
  email: Mail,
  messaging: MessageCircle,
  file: FileText,
  calendar: Calendar,
  crm: Users,
  social: Share2,
  feed: Rss,
  other: Box,
};

export function nodeIconComponent(typeKey: string): LucideIcon {
  return ICONS[nodeIconCategory(typeKey)];
}

type NodeTypeIconProps = {
  typeKey: string;
  className?: string;
  strokeWidth?: number;
  /** SVG-in-SVG placement (thumbnails). */
  x?: number;
  y?: number;
  size?: number;
};

/** Decorative icon for a node type; pair it with the label for a11y. */
export function NodeTypeIcon({
  typeKey,
  className,
  strokeWidth = 1.75,
  x,
  y,
  size,
}: NodeTypeIconProps) {
  // createElement rather than a capitalised local: the icon is a stable,
  // module-level component picked from a static table.
  return createElement(nodeIconComponent(typeKey), {
    "aria-hidden": true,
    focusable: "false",
    className,
    strokeWidth,
    ...(size !== undefined ? { width: size, height: size } : {}),
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
  });
}

/** Label for tooltips / screen readers — delegates to the shared mapping. */
export function nodeTypeLabel(typeKey: string): string {
  return iconForTypeKey(typeKey).label;
}
