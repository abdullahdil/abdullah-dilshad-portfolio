/** Shared types for the "Ask my case studies" retrieval demo. */

export type RetrieverKind = "lexical" | "vector";

/** One indexed chunk of Abdullah's own published content. */
export type Passage = {
  id: string;
  /** Human label for where the passage came from, e.g. a case-study title. */
  sourceTitle: string;
  /** Link back to the page the passage was taken from. */
  sourceHref: string;
  /** Which part of the source this is, e.g. "Architecture". */
  section: string;
  text: string;
};

/** A passage plus the score the active retriever gave it. */
export type PassageHit = Passage & {
  /** 0–1, normalised against the top hit so the UI can draw a bar. */
  score: number;
};

export type DemoMode = "live" | "example";

export type AskAnswer = {
  question: string;
  answer: string;
  passages: PassageHit[];
  retriever: RetrieverKind;
  /** Empty string in example mode — no model was called. */
  model: string;
  /** True when the answer came from the in-memory cache, not a fresh call. */
  cached: boolean;
  /** True when this is the pre-computed saved example, not a live answer. */
  saved: boolean;
};

export type AskDemoResult =
  | { ok: true; result: AskAnswer }
  | { ok: false; error: string };
