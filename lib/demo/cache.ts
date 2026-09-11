import type { AskAnswer } from "@/lib/demo/types";

/**
 * In-memory spend controls for the demo. Both are per-process and best-effort
 * (same trade-off as `lib/rate-limit.ts`) — they are cost dampeners, not a
 * distributed budget. On a multi-instance deployment the effective daily
 * ceiling is `DEMO_DAILY_LIMIT` per instance.
 */

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;

type CacheEntry = { value: AskAnswer; expiresAt: number };

const answerCache = new Map<string, CacheEntry>();

/** Repeat questions must never cost anything, however they were typed. */
export function normaliseQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCachedAnswer(question: string): AskAnswer | null {
  const key = normaliseQuestion(question);
  const entry = answerCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    answerCache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedAnswer(question: string, value: AskAnswer): void {
  const key = normaliseQuestion(question);
  if (answerCache.size >= CACHE_MAX_ENTRIES) {
    // Oldest insertion first — Map preserves insertion order.
    const oldest = answerCache.keys().next();
    if (!oldest.done) answerCache.delete(oldest.value);
  }
  answerCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

let budgetDay = "";
let budgetUsed = 0;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reserve one model call against the global daily ceiling. Returns false when
 * the ceiling is reached — the caller must then fail closed.
 */
export function consumeDailyBudget(limit: number): boolean {
  const day = today();
  if (day !== budgetDay) {
    budgetDay = day;
    budgetUsed = 0;
  }
  if (budgetUsed >= limit) return false;
  budgetUsed += 1;
  return true;
}

/** Test/diagnostic helper. */
export function resetDemoBudget(): void {
  budgetDay = "";
  budgetUsed = 0;
  answerCache.clear();
}
