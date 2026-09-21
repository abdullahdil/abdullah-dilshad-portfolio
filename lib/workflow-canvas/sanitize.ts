/**
 * Genericises a real n8n export so it can be published on the public site.
 *
 * The exports behind the portfolio canvases are real client work: workflow and
 * node names carry client namespaces (`AiMark — 03A …`), colleagues' first
 * names, and the odd inbox or webhook URL inside a sticky note. Both canvas
 * columns on `public.workflows` are readable with the anon key, so the raw
 * export must never be stored — it is run through here first and the sanitised
 * object is what gets parsed *and* what gets kept as `canvas_source`.
 *
 * Two guarantees this module is built around:
 *
 * 1. **Structure is preserved exactly.** Same node count, same `position`
 *    tuples, same node `type`s, same `connections` graph. Renaming a node
 *    rewrites the matching `connections` keys and targets, because n8n keys its
 *    connection map by node *name*, so a rename that missed them would silently
 *    delete edges.
 * 2. **Only what the canvas renders survives.** `parameters` is pruned to the
 *    handful of keys `lib/workflow-canvas/parse.ts` actually reads (sticky
 *    content/colour/size, and resource/operation/method for the node subtitle).
 *    Everything else — prompts, sheet ids, credential blocks, webhook urls — is
 *    dropped rather than scrubbed, because dropping cannot be got subtly wrong.
 *
 * Pure and dependency-free, so the admin preview can call it client-side and
 * the importer can call it from Node.
 */

import { iconForTypeKey } from "@/lib/workflow-canvas/icons";

/** One human-readable string this module changed, and how often. */
export type SanitizeReplacement = { from: string; to: string; count: number };

export type SanitizeResult = {
  /** A minimal, structurally identical export: `{ name, nodes, connections }`. */
  workflow: unknown;
  replacements: SanitizeReplacement[];
};

export type SanitizeOptions = {
  /** Extra client/system namespaces to strip, on top of `KNOWN_IDENTIFIERS`. */
  identifiers?: readonly string[];
  /** Extra personal first names to strip, on top of `KNOWN_PERSONAL_NAMES`. */
  personalNames?: readonly string[];
  /** Used when sanitising empties the workflow name — normally the portfolio title. */
  fallbackName?: string;
};

/**
 * Client and system namespaces seen across the live instance. This is the
 * known-bad floor: `deriveIdentifiersFromNames` adds whatever else the current
 * workflow list turns up, but nothing here is ever allowed to slip through.
 */
export const KNOWN_IDENTIFIERS: readonly string[] = [
  "TalkEarlyEd",
  "HireScreen",
  "Little Sicily",
  "LittleSicily",
  "Ai Mark Labs",
  "AiMark Labs",
  "aimarklabs",
  "AiMark",
  "Ai Mark",
  "Aerstack",
  "Uplift AI",
  "Uplift",
  "Evolo AI",
  "EvoloAI",
  "Evolo",
  "Abdullah Goevolo",
  "Goevolo",
  "OLMDC",
  "DFA",
  "DMV",
  "CTE",
];

/** First names of colleagues/clients that appear in workflow and node names. */
export const KNOWN_PERSONAL_NAMES: readonly string[] = ["Javeria", "Rida", "Farhan", "Hamna"];

/** Parameter keys `parse.ts` reads. Everything else is dropped, not scrubbed. */
const STICKY_PARAM_KEYS = ["content", "color", "width", "height"] as const;
const NODE_PARAM_KEYS = ["resource", "operation", "method"] as const;

/** Tokens that carry no meaning in a published name: version/stage noise. */
const NOISE_TOKENS = new Set([
  "final",
  "updated",
  "update",
  "fixed",
  "prod",
  "production",
  "temp",
  "tmp",
  "test",
  "draft",
  "copy",
  "old",
  "new",
  "latest",
  "current",
  "working",
  "wip",
  "backup",
  "steps",
  "step",
  "pm",
]);

/**
 * Leading tokens that are sequence markers rather than content: `WF3b`, `03A`,
 * `Module 02`. A lone unpadded digit is *not* a marker — `5 Min Urdu Story`
 * starts with its 5.
 */
const SEQUENCE_PREFIX =
  /^(?:wf[\s_-]*\d*[a-z]?|\d{2,3}[a-z]?|\d[a-z]|module\s*\d+|step\s*\d+|part\s*\d+|v\d+)(?![a-z0-9])(?:[\s:.,_\-–—·|]+|$)/i;

/** Stage words that lead a name: `PROD - …`, `Class Task - …`. */
const STAGE_PREFIX =
  /^(?:poc|prod|temp|test|draft|final|main|core|class\s+task|class|workflow)(?![a-z0-9])(?:[\s:.,_\-–—·|]+|$)/i;

/** A bare section letter, as in `DMV — C Civics Generate`. Case matters here. */
const SECTION_LETTER = /^[A-Z](?![a-z0-9])[\s:.,_\-–—·|]+/;

/** Strips every leading sequence marker, not just the first. */
function stripSequencePrefix(text: string): string {
  let out = text.trim();
  for (let pass = 0; pass < 6; pass += 1) {
    const next = out
      .replace(SEQUENCE_PREFIX, "")
      .replace(STAGE_PREFIX, "")
      .replace(SECTION_LETTER, "")
      .trim();
    if (next === out) return out;
    out = next;
  }
  return out;
}

/** Leading segments of a name that are pure scaffolding. */
const NOISE_SEGMENT = /^(?:class\s+task|class|workflow|prod|final|main|core|poc|temp|test|v\d+)$/i;

const SEGMENT_SPLIT = /\s+[—–·|]\s+|\s+-\s+|:\s+/;

const URL_RE = /\bhttps?:\/\/[^\s<>"'`)\]]+/gi;
const BARE_HOST_RE = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.app\.n8n\.cloud\b[^\s<>"'`)\]]*/gi;
const MONGO_RE = /\bmongodb(?:\+srv)?:\/\/[^\s<>"'`)\]]+/gi;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b/g;
const SECRET_RE =
  /\b(?:sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{16,}|(?:api[_-]?key|token|secret|password)\s*[:=]\s*\S+)/gi;
const PHONE_RE = /(?<![\w.])\+?\d[\d\s().-]{8,}\d(?![\w.])/g;
/**
 * An opaque id: 20+ chars of id alphabet carrying a digit *and* both cases —
 * a Google file id or Airtable base id, but not `HireScreen_Applications`.
 */
const OPAQUE_ID_RE =
  /\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[a-z])(?=[A-Za-z0-9_-]*[A-Z])[A-Za-z0-9_-]{20,}\b/g;

const HONORIFIC = "(?:Mam|Ma'am|Mr|Mrs|Ms|Miss|Sir|Dr)\\.?\\s+";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Longest-first so `Ai Mark Labs` wins over `Ai Mark`. */
function identifierRegex(identifiers: readonly string[]): RegExp | null {
  const sorted = [...new Set(identifiers)].filter(Boolean).sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return null;
  return new RegExp(
    `(?<![A-Za-z0-9])(?:${sorted.map(escapeRegExp).join("|")})(?![A-Za-z0-9])`,
    "gi",
  );
}

function personRegex(names: readonly string[]): RegExp | null {
  const sorted = [...new Set(names)].filter(Boolean).sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return null;
  return new RegExp(
    `(?<![A-Za-z0-9])(?:${HONORIFIC})?(?:${sorted.map(escapeRegExp).join("|")})(?:'s|’s)?(?![A-Za-z0-9])`,
    "g",
  );
}

/** Collects every change so a dry run can show exactly what it would publish. */
class Recorder {
  private readonly counts = new Map<string, SanitizeReplacement>();

  record(from: string, to: string): void {
    if (from === to) return;
    const key = `${from}\u001f${to}`;
    const existing = this.counts.get(key);
    if (existing) existing.count += 1;
    else this.counts.set(key, { from, to, count: 1 });
  }

  list(): SanitizeReplacement[] {
    return [...this.counts.values()].sort(
      (a, b) => b.count - a.count || a.from.localeCompare(b.from),
    );
  }
}

type Context = {
  identifiers: RegExp | null;
  persons: RegExp | null;
  personLabels: Map<string, string>;
  personNames: readonly string[];
  recorder: Recorder;
};

/* ------------------------------------------------------------------ */
/* Derivation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Everyday automation vocabulary. A multi-word prefix built only from these is
 * a description (`Social Media Publishing`), not a client namespace.
 */
const COMMON_WORDS = new Set([
  "ai", "api", "automation", "blog", "bot", "brand", "campaign", "chat", "client",
  "content", "crm", "daily", "data", "demo", "design", "digest", "discovery",
  "doc", "docs", "drive", "email", "engine", "error", "form", "handler", "hr",
  "image", "images", "intake", "job", "jobs", "lead", "leads", "magnet", "mail",
  "manager", "media", "meta", "monthly", "news", "notification", "ops", "outreach",
  "pipeline", "post", "posts", "product", "publisher", "publishing", "queue",
  "report", "reports", "review", "runner", "scraper", "screening", "search",
  "sender", "sequence", "sheet", "sheets", "social", "summary", "support", "sync",
  "task", "tasks", "template", "tracker", "video", "weekly",
]);

/** Acronyms that are industry vocabulary, never a client namespace. */
const ACRONYM_ALLOWLIST = new Set([
  "AI",
  "API",
  "APIS",
  "B2B",
  "CRM",
  "CSV",
  "CTA",
  "CV",
  "CVS",
  "DM",
  "FB",
  "GET",
  "HR",
  "HTML",
  "HTTP",
  "IG",
  "ID",
  "JD",
  "JSON",
  "KPI",
  "LLM",
  "MVP",
  "N8N",
  "OTP",
  "PDF",
  "PM",
  "POST",
  "QA",
  "RAG",
  "SEO",
  "SMS",
  "SQL",
  "TTS",
  "UI",
  "URL",
  "UX",
  "WF",
  "CORE",
  "MAIN",
  "PROD",
  "TEMP",
  "TEST",
  "FINAL",
  "CLASS",
  "NEW",
  "OLD",
]);

/**
 * Derives client namespaces from a list of live workflow names, so the floor in
 * `KNOWN_IDENTIFIERS` does not have to be exhaustive. A namespace shows itself
 * by sitting in the prefix position (`DFA - …`, `TalkEarlyEd — …`) — an
 * all-caps acronym has to do that at least twice before it counts, while a
 * CamelCase compound (`HireScreen`) is distinctive enough on one sighting.
 */
export function deriveIdentifiersFromNames(names: readonly string[]): string[] {
  const prefixCounts = new Map<string, { label: string; count: number }>();

  for (const raw of names) {
    const name = String(raw ?? "")
      .replace(/^[\p{Extended_Pictographic}\s]+/u, "")
      .trim();
    if (!name) continue;
    const parts = name.split(SEGMENT_SPLIT);
    if (parts.length < 2) continue;
    const segment = (parts[0] ?? "").trim();
    if (!segment || segment.split(/\s+/).length > 3) continue;

    // Drop leading sequence markers so `WF3 — OLMDC · …` still offers `OLMDC`.
    const stripped = stripSequencePrefix(segment);
    for (const candidate of [segment, stripped]) {
      if (!candidate || NOISE_SEGMENT.test(candidate)) continue;
      if (!/^[A-Za-z][A-Za-z0-9 ]*$/.test(candidate)) continue;
      const key = candidate.toLowerCase();
      const entry = prefixCounts.get(key) ?? { label: candidate, count: 0 };
      entry.count += 1;
      prefixCounts.set(key, entry);
    }
  }

  const derived = new Set<string>();
  for (const { label, count } of prefixCounts.values()) {
    const words = label.split(/\s+/);
    const isAcronym = words.length === 1 && /^[A-Z]{2,6}$/.test(label);
    const isCamel = words.some((word) => /^[A-Z][a-z]+[A-Z][A-Za-z]*$/.test(word));
    const isTitlePhrase =
      words.length >= 2 &&
      words.every((word) => /^[A-Z][A-Za-z0-9]*$/.test(word)) &&
      words.some((word) => !COMMON_WORDS.has(word.toLowerCase()));

    if (isAcronym && !ACRONYM_ALLOWLIST.has(label.toUpperCase()) && count >= 2) derived.add(label);
    else if (isCamel) derived.add(label);
    else if (isTitlePhrase && count >= 2) derived.add(label);
  }

  return [...derived].sort((a, b) => b.length - a.length);
}

/* ------------------------------------------------------------------ */
/* Scrubbing                                                           */
/* ------------------------------------------------------------------ */

type Mode = "name" | "prose";

/**
 * Removes URLs, inboxes, opaque ids and anything credential-shaped. In a node
 * name the match is simply deleted (a name is too short to carry a phrase); in
 * sticky prose it becomes a readable stand-in so the instructions still parse.
 */
function scrubSecrets(text: string, mode: Mode, recorder: Recorder): string {
  const replace = (input: string, pattern: RegExp, prose: string): string =>
    input.replace(pattern, (match) => {
      const to = mode === "prose" ? prose : "";
      recorder.record(match, to || "(removed)");
      return to;
    });

  let out = text;
  out = replace(out, MONGO_RE, "the database connection string");
  out = out.replace(URL_RE, (match) => {
    const to =
      mode === "prose" ? (/\/webhook|\/form/i.test(match) ? "the webhook URL" : "an internal link") : "";
    recorder.record(match, to || "(removed)");
    return to;
  });
  out = replace(out, BARE_HOST_RE, "the n8n instance");
  out = replace(out, EMAIL_RE, "an internal inbox");
  out = replace(out, SECRET_RE, "a stored credential");
  out = replace(out, PHONE_RE, "a phone number");
  out = replace(out, OPAQUE_ID_RE, "an internal ID");
  return out;
}

/**
 * Deleting a word out of prose has to take one of its spaces with it, or
 * `**AiMark Drive**` turns into `** Drive**`. The surrounding whitespace is
 * part of the match: one space survives only when the word had a space on both
 * sides, which is exactly when the sentence still needs one.
 */
function closeGap(lead: string, trail: string): string {
  return lead && trail ? " " : "";
}

function removeIdentifiers(text: string, ctx: Context): string {
  if (!ctx.identifiers) return text;
  const pattern = new RegExp(
    `([ \t]*)(?:${ctx.identifiers.source})[_-]?([ \t]*)`,
    ctx.identifiers.flags,
  );
  return text.replace(pattern, (match: string, lead: string, trail: string) => {
    ctx.recorder.record(match.trim(), "(removed)");
    return closeGap(lead, trail);
  });
}

function labelForPerson(match: string, ctx: Context): string {
  const bare =
    ctx.personNames.find((name) => new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name)}`, "i").test(match)) ??
    match;
  const key = bare.toLowerCase();
  const existing = ctx.personLabels.get(key);
  if (existing) return existing;
  const label = `Reviewer ${ctx.personLabels.size + 1}`;
  ctx.personLabels.set(key, label);
  return label;
}

/**
 * Personal names never survive. In a name they go entirely, taking the
 * connector that introduced them (`Weekly Report to Javeria` → `Weekly
 * Report`). In prose a standalone mention becomes an anonymous `Reviewer n`,
 * so a mapping list or an instruction still reads as a sentence, while an
 * attributive use (`Farhan Task Tracker`) is simply dropped.
 */
function removePersonalNames(text: string, mode: Mode, ctx: Context): string {
  if (!ctx.persons) return text;

  if (mode === "name") {
    const pattern = new RegExp(
      `(?:\\s+(?:to|for|from|by|with)\\b)?\\s*${ctx.persons.source}`,
      ctx.persons.flags,
    );
    return text.replace(pattern, (match: string) => {
      ctx.recorder.record(match.trim(), "(removed)");
      return "";
    });
  }

  const pattern = new RegExp(`([ \\t]*)(?:${ctx.persons.source})([ \\t]*)`, ctx.persons.flags);
  return text.replace(
    pattern,
    (match: string, lead: string, trail: string, offset: number, whole: string) => {
      const possessive = /(?:'s|\u2019s)[ \t]*$/.test(match);
      const nextWord = /^([A-Za-z][A-Za-z0-9-]*)/.exec(whole.slice(offset + match.length))?.[1] ?? "";
      if (!possessive && trail && /^[A-Z]/.test(nextWord)) {
        ctx.recorder.record(match.trim(), "(removed)");
        return closeGap(lead, trail);
      }
      const label = `${labelForPerson(match, ctx)}${possessive ? "'s" : ""}`;
      ctx.recorder.record(match.trim(), label);
      return `${lead}${label}${trail}`;
    },
  );
}

function tidyName(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:!?)])/g, "$1")
    .replace(/([([])\s+/g, "$1")
    .replace(/(?:\s*[—–·|]\s*){2,}/g, " — ")
    .replace(/^[\s\-–—·|:,.]+/, "")
    .replace(/[\s\-–—·|:,]+$/, "")
    .trim();
}

function tidyProse(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]{2,}/g, " ")
        .replace(/``/g, "")
        .replace(/\*\*\*\*/g, "")
        .replace(/\(\s*\)/g, "")
        .replace(/[ \t]+([,.;:!?)])/g, "$1")
        .replace(/([([])[ \t]+/g, "$1")
        .replace(/^(#{1,6})[ \t]*[—–·|:-]+[ \t]*/, "$1 ")
        .replace(/^[ \t]*[—–·|][ \t]+/, "")
        .replace(/[ \t]+$/g, ""),
    )
    .join("\n")
    .trim();
}

/** True when a string still carries a client namespace or a personal name. */
function leaksIn(text: string, ctx: Context): boolean {
  if (ctx.identifiers && new RegExp(ctx.identifiers.source, ctx.identifiers.flags).test(text)) {
    return true;
  }
  if (ctx.persons && new RegExp(ctx.persons.source, ctx.persons.flags).test(text)) return true;
  return false;
}

/**
 * Node ids are hand-written in places (`olmdc-wf3-step1`) and are persisted as
 * the canvas graph keys, so they get the same treatment as a name. Uniqueness
 * is all the parser needs from them, so a hopeless id becomes `node-n`.
 */
function sanitizeNodeId(rawId: string, index: number, ctx: Context): string {
  if (!rawId) return `node-${index}`;
  if (!leaksIn(rawId, ctx)) return rawId;
  const stripped = rawId
    .replace(ctx.identifiers ?? /$^/g, "")
    .replace(ctx.persons ?? /$^/g, "")
    .replace(/[-_]{2,}/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  ctx.recorder.record(rawId, stripped || `node-${index}`);
  if (!stripped || leaksIn(stripped, ctx)) return `node-${index}`;
  return stripped;
}

/** A leftover that says nothing — triggers the caller's fallback. */
function isDegenerate(name: string): boolean {
  if (name.trim() === "") return true;
  return /^(?:main|core|prod|temp|final|test|new|old|wf|v\d+|\d+)$/i.test(name.trim());
}

function stripNoiseParentheticals(text: string): string {
  return text.replace(/\s*\(([^()]*)\)/g, (match, inner: string) => {
    const tokens = String(inner)
      .split(/[\s,/+&-]+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);
    if (tokens.length === 0) return "";
    const allNoise = tokens.every(
      (token) => NOISE_TOKENS.has(token) || /^v?\d+$/.test(token),
    );
    return allNoise ? "" : match;
  });
}

/* ------------------------------------------------------------------ */
/* Names                                                               */
/* ------------------------------------------------------------------ */

function sanitizeNameCore(raw: string, ctx: Context): string {
  let out = scrubSecrets(raw, "name", ctx.recorder);
  out = removeIdentifiers(out, ctx);
  out = removePersonalNames(out, "name", ctx);
  return tidyName(out);
}

/**
 * Node label. Falls back to the node type's own label rather than ever
 * publishing an empty box.
 */
function sanitizeNodeNameIn(raw: string, typeKey: string, ctx: Context): string {
  const cleaned = sanitizeNameCore(raw, ctx);
  if (!isDegenerate(cleaned)) return cleaned;
  const fallback = iconForTypeKey(typeKey).label;
  ctx.recorder.record(raw, fallback);
  return fallback;
}

/**
 * Workflow title. Leading segments that are only a client namespace or a
 * sequence marker are dropped, then version noise goes: `AiMark — 03A Cold
 * Email Outreach (FINAL)` becomes `Cold Email Outreach`.
 */
function sanitizeWorkflowNameIn(raw: string, fallback: string, ctx: Context): string {
  const withoutEmoji = String(raw ?? "").replace(/^[\p{Extended_Pictographic}\s]+/u, "");
  const segments = withoutEmoji.split(SEGMENT_SPLIT).map((segment) => segment.trim());

  const kept: string[] = [];
  for (const segment of segments) {
    if (kept.length === 0) {
      const cleaned = sanitizeNameCore(segment, ctx);
      const stripped = tidyName(stripSequencePrefix(cleaned));
      if (isDegenerate(stripped) || NOISE_SEGMENT.test(stripped)) continue;
      kept.push(stripped);
      continue;
    }
    kept.push(segment);
  }

  let out = kept.join(" — ");
  out = sanitizeNameCore(out, ctx);
  out = tidyName(stripNoiseParentheticals(out));
  // `DFA - WF_MAIN_PROD` style names only hold markers once the client is gone.
  if (/^[A-Z0-9_ ]+$/.test(out)) out = tidyName(stripSequencePrefix(out.replace(/_/g, " ")));

  if (isDegenerate(out)) {
    const safe = fallback.trim() || "Automation";
    ctx.recorder.record(String(raw ?? ""), safe);
    return safe;
  }
  ctx.recorder.record(String(raw ?? ""), out);
  return out;
}

/** Sticky-note markdown: identifiers go, the instructions stay readable. */
function sanitizeProseIn(raw: string, ctx: Context): string {
  let out = scrubSecrets(raw, "prose", ctx.recorder);
  out = removeIdentifiers(out, ctx);
  out = removePersonalNames(out, "prose", ctx);
  return tidyProse(out);
}

function makeContext(options: SanitizeOptions | undefined, recorder: Recorder): Context {
  const identifiers = [...KNOWN_IDENTIFIERS, ...(options?.identifiers ?? [])];
  const personNames = [...KNOWN_PERSONAL_NAMES, ...(options?.personalNames ?? [])];
  return {
    identifiers: identifierRegex(identifiers),
    persons: personRegex(personNames),
    personLabels: new Map(),
    personNames,
    recorder,
  };
}

/* ------------------------------------------------------------------ */
/* Export sanitisation                                                 */
/* ------------------------------------------------------------------ */

function prunedParameters(
  parameters: Record<string, unknown>,
  isSticky: boolean,
  ctx: Context,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys = isSticky ? STICKY_PARAM_KEYS : NODE_PARAM_KEYS;
  for (const key of keys) {
    const value = parameters[key];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      out[key] = value;
      continue;
    }
    out[key] = isSticky && key === "content" ? sanitizeProseIn(value, ctx) : sanitizeNameCore(value, ctx);
  }
  return out;
}

/** `connections` is keyed by node name, so every rename has to land here too. */
function remapConnections(
  connections: Record<string, unknown>,
  renames: ReadonlyMap<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [sourceName, ports] of Object.entries(connections)) {
    const source = renames.get(sourceName) ?? sourceName;
    if (!isRecord(ports)) {
      out[source] = ports;
      continue;
    }
    const mappedPorts: Record<string, unknown> = {};
    for (const [port, outputs] of Object.entries(ports)) {
      if (!Array.isArray(outputs)) {
        mappedPorts[port] = outputs;
        continue;
      }
      mappedPorts[port] = outputs.map((slot) =>
        Array.isArray(slot)
          ? slot.map((target) =>
              isRecord(target) && typeof target.node === "string"
                ? { ...target, node: renames.get(target.node) ?? target.node }
                : target,
            )
          : slot,
      );
    }
    out[source] = mappedPorts;
  }
  return out;
}

/**
 * Takes a raw n8n export and returns a publishable one. The result is always a
 * `{ name, nodes, connections }` object — the shape `parseN8nWorkflow` reads —
 * with node ids, types and positions untouched.
 */
export function sanitizeN8nExport(input: unknown, options?: SanitizeOptions): SanitizeResult {
  const recorder = new Recorder();
  const ctx = makeContext(options, recorder);

  if (!isRecord(input)) return { workflow: input, replacements: [] };

  const rawNodes = Array.isArray(input.nodes) ? input.nodes : [];
  const renames = new Map<string, string>();
  const takenNames = new Set<string>();
  const takenIds = new Set<string>();

  const nodes = rawNodes.map((entry, index) => {
    if (!isRecord(entry)) return entry;
    const type = typeof entry.type === "string" ? entry.type : "";
    const typeKey = (type.split(".").pop() ?? "").toLowerCase();
    const isSticky = typeKey === "stickynote";
    const originalName = typeof entry.name === "string" ? entry.name : "";

    let name = sanitizeNodeNameIn(originalName, typeKey, ctx);
    // Names are the connection key, so a collision would silently merge edges.
    if (takenNames.has(name)) {
      let suffix = 2;
      while (takenNames.has(`${name} ${suffix}`)) suffix += 1;
      name = `${name} ${suffix}`;
    }
    takenNames.add(name);
    if (originalName && originalName !== name) renames.set(originalName, name);
    recorder.record(originalName, name);

    const parameters = isRecord(entry.parameters) ? entry.parameters : {};
    const rawId = typeof entry.id === "string" ? entry.id : "";
    let id = sanitizeNodeId(rawId, index, ctx);
    if (takenIds.has(id)) {
      let suffix = 2;
      while (takenIds.has(`${id}-${suffix}`)) suffix += 1;
      id = `${id}-${suffix}`;
    }
    takenIds.add(id);

    const node: Record<string, unknown> = {
      id,
      name,
      type,
      position: Array.isArray(entry.position) ? [...entry.position] : entry.position,
      parameters: prunedParameters(parameters, isSticky, ctx),
    };
    if (entry.typeVersion !== undefined) node.typeVersion = entry.typeVersion;
    if (entry.disabled === true) node.disabled = true;
    return node;
  });

  const connections = isRecord(input.connections)
    ? remapConnections(input.connections, renames)
    : {};

  const name = sanitizeWorkflowNameIn(
    typeof input.name === "string" ? input.name : "",
    options?.fallbackName ?? "",
    ctx,
  );

  return { workflow: { name, nodes, connections }, replacements: recorder.list() };
}

/** Sanitises a single node label. Exported for tests and the admin preview. */
export function sanitizeNodeName(raw: string, typeKey: string, options?: SanitizeOptions): string {
  return sanitizeNodeNameIn(raw, typeKey, makeContext(options, new Recorder()));
}

/** Sanitises a workflow title, falling back when nothing meaningful is left. */
export function sanitizeWorkflowName(
  raw: string,
  fallback: string,
  options?: SanitizeOptions,
): string {
  return sanitizeWorkflowNameIn(raw, fallback, makeContext(options, new Recorder()));
}

/** Sanitises sticky-note markdown. */
export function sanitizeProse(raw: string, options?: SanitizeOptions): string {
  return sanitizeProseIn(raw, makeContext(options, new Recorder()));
}

/* ------------------------------------------------------------------ */
/* Verification gate                                                   */
/* ------------------------------------------------------------------ */

/**
 * Last line of defence, run over the exact strings about to be written to
 * `canvas_json` and `canvas_source`. Returns every identifier, inbox or URL
 * still present; an empty array is the only result that may be published.
 */
export function findLeakedIdentifiers(text: string, options?: SanitizeOptions): string[] {
  const identifiers = identifierRegex([...KNOWN_IDENTIFIERS, ...(options?.identifiers ?? [])]);
  const persons = personRegex([...KNOWN_PERSONAL_NAMES, ...(options?.personalNames ?? [])]);
  const hits = new Set<string>();

  const collect = (pattern: RegExp | null) => {
    if (!pattern) return;
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
      if (match[0].trim()) hits.add(match[0].trim());
    }
  };

  collect(identifiers);
  collect(persons);
  collect(new RegExp(EMAIL_RE.source, EMAIL_RE.flags));
  collect(new RegExp(URL_RE.source, URL_RE.flags));
  collect(new RegExp(BARE_HOST_RE.source, BARE_HOST_RE.flags));
  collect(new RegExp(MONGO_RE.source, MONGO_RE.flags));

  return [...hits].sort();
}
