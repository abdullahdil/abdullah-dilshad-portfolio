/**
 * Offline icon lookup for n8n node types.
 *
 * Data only — no network calls, no image assets, no icon library — so both the
 * public canvas and the admin preview can call it, including on the
 * seed-fallback path where Supabase is not configured.
 */

export type CanvasIcon = {
  /** Short human label, e.g. `Google Sheets`. */
  label: string;
  /** Single character drawn inside the node badge. */
  glyph: string;
};

/** Neutral badge for a node type we do not have a hand-written entry for. */
const FALLBACK_GLYPH = "◆";

/**
 * Keys are the parser's `typeKey` (last dot-segment of the n8n type,
 * lowercased). Only common nodes live here; anything else is derived.
 */
const ICONS: Readonly<Record<string, CanvasIcon>> = {
  // Triggers and entry points
  webhook: { label: "Webhook", glyph: "🔗" },
  scheduletrigger: { label: "Schedule", glyph: "⏰" },
  cron: { label: "Cron", glyph: "⏰" },
  interval: { label: "Interval", glyph: "⏱️" },
  start: { label: "Start", glyph: "▶️" },
  manualtrigger: { label: "Manual Trigger", glyph: "▶️" },
  formtrigger: { label: "Form", glyph: "📝" },
  chattrigger: { label: "Chat", glyph: "💬" },
  emailreadimap: { label: "Email (IMAP)", glyph: "📥" },
  executeworkflowtrigger: { label: "Sub-workflow", glyph: "🧩" },
  errortrigger: { label: "Error Trigger", glyph: "🚨" },

  // Core logic
  set: { label: "Edit Fields", glyph: "✏️" },
  code: { label: "Code", glyph: "🧮" },
  function: { label: "Function", glyph: "🧮" },
  if: { label: "If", glyph: "🔀" },
  switch: { label: "Switch", glyph: "🔀" },
  merge: { label: "Merge", glyph: "🔗" },
  splitinbatches: { label: "Loop", glyph: "🔁" },
  splitout: { label: "Split Out", glyph: "✂️" },
  aggregate: { label: "Aggregate", glyph: "📦" },
  filter: { label: "Filter", glyph: "🧹" },
  wait: { label: "Wait", glyph: "⏸️" },
  noop: { label: "No Op", glyph: "⚪" },
  stopanderror: { label: "Stop and Error", glyph: "🛑" },
  executeworkflow: { label: "Execute Workflow", glyph: "🧩" },
  httprequest: { label: "HTTP Request", glyph: "🌐" },
  respondtowebhook: { label: "Respond", glyph: "↩️" },
  stickynote: { label: "Note", glyph: "🗒️" },

  // AI
  agent: { label: "AI Agent", glyph: "🤖" },
  openai: { label: "OpenAI", glyph: "🧠" },
  lmchatopenai: { label: "OpenAI Chat Model", glyph: "🧠" },
  lmchatanthropic: { label: "Anthropic Chat Model", glyph: "🧠" },
  lmchatgooglegemini: { label: "Gemini Chat Model", glyph: "🧠" },
  memorybufferwindow: { label: "Window Memory", glyph: "🧵" },
  memorypostgateschat: { label: "Chat Memory", glyph: "🧵" },
  toolworkflow: { label: "Workflow Tool", glyph: "🛠️" },
  toolhttprequest: { label: "HTTP Tool", glyph: "🛠️" },
  toolcode: { label: "Code Tool", glyph: "🛠️" },
  vectorstoresupabase: { label: "Supabase Vector Store", glyph: "📚" },
  vectorstorepinecone: { label: "Pinecone Vector Store", glyph: "📚" },
  embeddingsopenai: { label: "OpenAI Embeddings", glyph: "🧬" },
  outputparserstructured: { label: "Output Parser", glyph: "🧾" },
  chainllm: { label: "LLM Chain", glyph: "⛓️" },
  informationextractor: { label: "Extractor", glyph: "🔍" },
  textclassifier: { label: "Classifier", glyph: "🏷️" },

  // SaaS integrations
  googlesheets: { label: "Google Sheets", glyph: "📊" },
  googledrive: { label: "Google Drive", glyph: "📁" },
  googlecalendar: { label: "Google Calendar", glyph: "📅" },
  googledocs: { label: "Google Docs", glyph: "📄" },
  gmail: { label: "Gmail", glyph: "✉️" },
  slack: { label: "Slack", glyph: "💬" },
  telegram: { label: "Telegram", glyph: "✈️" },
  discord: { label: "Discord", glyph: "🎮" },
  whatsapp: { label: "WhatsApp", glyph: "💚" },
  airtable: { label: "Airtable", glyph: "🗂️" },
  notion: { label: "Notion", glyph: "📓" },
  hubspot: { label: "HubSpot", glyph: "🧲" },
  salesforce: { label: "Salesforce", glyph: "☁️" },
  stripe: { label: "Stripe", glyph: "💳" },
  shopify: { label: "Shopify", glyph: "🛒" },
  github: { label: "GitHub", glyph: "🐙" },
  linear: { label: "Linear", glyph: "📐" },
  jira: { label: "Jira", glyph: "🧭" },
  trello: { label: "Trello", glyph: "📋" },
  clickup: { label: "ClickUp", glyph: "✅" },
  asana: { label: "Asana", glyph: "✅" },
  postgres: { label: "Postgres", glyph: "🐘" },
  mysql: { label: "MySQL", glyph: "🗄️" },
  mongodb: { label: "MongoDB", glyph: "🍃" },
  redis: { label: "Redis", glyph: "🧱" },
  supabase: { label: "Supabase", glyph: "⚡" },
  s3: { label: "S3", glyph: "🪣" },
  awss3: { label: "AWS S3", glyph: "🪣" },
  twilio: { label: "Twilio", glyph: "📱" },
  sendgrid: { label: "SendGrid", glyph: "📧" },
  emailsend: { label: "Send Email", glyph: "📧" },
  calendly: { label: "Calendly", glyph: "📅" },
  zoom: { label: "Zoom", glyph: "🎥" },
  pipedrive: { label: "Pipedrive", glyph: "🧲" },
  xero: { label: "Xero", glyph: "💠" },
  quickbooks: { label: "QuickBooks", glyph: "💠" },
  extractfromfile: { label: "Extract from File", glyph: "📄" },
  converttofile: { label: "Convert to File", glyph: "📄" },
  readwritefile: { label: "Read/Write File", glyph: "💾" },
  rssfeedread: { label: "RSS Feed", glyph: "📰" },
  crypto: { label: "Crypto", glyph: "🔐" },
  dateandtime: { label: "Date & Time", glyph: "📆" },
  html: { label: "HTML", glyph: "🧱" },
  xml: { label: "XML", glyph: "🧱" },
  markdown: { label: "Markdown", glyph: "📝" },
  spreadsheetfile: { label: "Spreadsheet File", glyph: "📊" },
};

/**
 * Turns an unknown `typeKey` into something readable: `googlebigquery`
 * has no entry, so it renders as `Googlebigquery` with the neutral glyph.
 * n8n type keys are lowercase concatenations, so there is nothing better to
 * split on than the first character.
 */
function deriveLabel(typeKey: string): string {
  const cleaned = typeKey.trim();
  if (cleaned === "") return "Node";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Display label and glyph for a parser `typeKey`. Always returns something. */
export function iconForTypeKey(typeKey: string): CanvasIcon {
  const key = typeKey.trim().toLowerCase();
  const match = ICONS[key];
  if (match) return match;
  return { label: deriveLabel(key), glyph: FALLBACK_GLYPH };
}
