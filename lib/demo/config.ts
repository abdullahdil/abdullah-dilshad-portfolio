import type { RetrieverKind } from "@/lib/demo/types";

/**
 * Server-only configuration for the "Ask my case studies" demo.
 *
 * Everything here reads plain `process.env` — never `NEXT_PUBLIC_*`. The API key
 * must stay on the server; the client only ever learns the *mode* and the name
 * of the active retriever.
 */

export type DemoProvider = "anthropic" | "openai-compatible";

export type DemoConfig = {
  /** True only when the demo is switched on AND a key is actually present. */
  live: boolean;
  provider: DemoProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  retriever: RetrieverKind;
  maxOutputTokens: number;
  /** Global ceiling on model calls per UTC day. Fails closed when exceeded. */
  dailyLimit: number;
};

/** How many passages are retrieved and shown alongside the answer. */
export const DEMO_PASSAGE_COUNT = 4;

/** Per-passage character cap before a passage is sent to the model. */
export const DEMO_PASSAGE_CHAR_LIMIT = 900;

/** Requests per client per window. Deliberately strict — each one costs money. */
export const DEMO_RATE_LIMIT = 4;
export const DEMO_RATE_WINDOW_MS = 15 * 60 * 1000;

const DEFAULT_DAILY_LIMIT = 100;
const DEFAULT_MAX_OUTPUT_TOKENS = 700;

const PROVIDER_DEFAULTS: Record<DemoProvider, { baseUrl: string; model: string }> = {
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    // Haiku by default: this task is grounded restatement of retrieved
    // passages, not reasoning, so the cheapest capable model is the right
    // default for a public demo the owner pays for. Override with
    // DEMO_LLM_MODEL if answer quality ever needs it.
    model: "claude-haiku-4-5-20251001",
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com",
    model: "gpt-4o-mini",
  },
};

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function flag(name: string): boolean {
  const value = env(name).toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function positiveInt(name: string, fallback: number): number {
  const parsed = Number.parseInt(env(name), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readProvider(): DemoProvider {
  return env("DEMO_LLM_PROVIDER").toLowerCase() === "openai-compatible"
    ? "openai-compatible"
    : "anthropic";
}

function readRetriever(): RetrieverKind {
  // The vector path needs its own embeddings endpoint. Without one, fall back to
  // lexical rather than advertising a retriever that cannot run.
  if (env("DEMO_RETRIEVER").toLowerCase() !== "vector") return "lexical";
  return env("DEMO_EMBEDDINGS_API_KEY") || env("DEMO_LLM_API_KEY")
    ? "vector"
    : "lexical";
}

export function getDemoConfig(): DemoConfig {
  const provider = readProvider();
  const defaults = PROVIDER_DEFAULTS[provider];
  const apiKey = env("DEMO_LLM_API_KEY");

  return {
    live: flag("DEMO_ASK_ENABLED") && apiKey.length > 0,
    provider,
    apiKey,
    baseUrl: (env("DEMO_LLM_BASE_URL") || defaults.baseUrl).replace(/\/+$/, ""),
    model: env("DEMO_LLM_MODEL") || defaults.model,
    retriever: readRetriever(),
    maxOutputTokens: positiveInt("DEMO_MAX_OUTPUT_TOKENS", DEFAULT_MAX_OUTPUT_TOKENS),
    dailyLimit: positiveInt("DEMO_DAILY_LIMIT", DEFAULT_DAILY_LIMIT),
  };
}

/** Embeddings settings for the vector retriever (written, inactive by default). */
export function getEmbeddingsConfig() {
  const apiKey = env("DEMO_EMBEDDINGS_API_KEY") || env("DEMO_LLM_API_KEY");
  return {
    apiKey,
    url:
      env("DEMO_EMBEDDINGS_URL") ||
      `${(env("DEMO_LLM_BASE_URL") || PROVIDER_DEFAULTS["openai-compatible"].baseUrl).replace(/\/+$/, "")}/v1/embeddings`,
    model: env("DEMO_EMBEDDING_MODEL") || "text-embedding-3-small",
  };
}
