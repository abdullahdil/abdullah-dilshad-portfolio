import {
  DEMO_PASSAGE_COUNT,
  DEMO_RATE_LIMIT,
  DEMO_RATE_WINDOW_MS,
  getDemoConfig,
} from "@/lib/demo/config";
import { demoPassages } from "@/lib/demo/corpus";
import { getDemoExample } from "@/lib/demo/example";
import type { AskAnswer, DemoMode, RetrieverKind } from "@/lib/demo/types";
import { DEMO_QUESTION_MAX_LENGTH } from "@/lib/validations/demo";

/**
 * Everything the client needs to render the demo honestly — and nothing more.
 * No key, no provider URL, no model name leaves the server unless a live answer
 * was actually produced by it.
 */
export type DemoStatus = {
  mode: DemoMode;
  retriever: RetrieverKind;
  passageCount: number;
  retrievedCount: number;
  maxQuestionLength: number;
  rateLimit: number;
  rateWindowMinutes: number;
  example: AskAnswer;
};

export function getDemoStatus(): DemoStatus {
  const config = getDemoConfig();
  return {
    mode: config.live ? "live" : "example",
    retriever: config.retriever,
    passageCount: demoPassages.length,
    retrievedCount: DEMO_PASSAGE_COUNT,
    maxQuestionLength: DEMO_QUESTION_MAX_LENGTH,
    rateLimit: DEMO_RATE_LIMIT,
    rateWindowMinutes: Math.round(DEMO_RATE_WINDOW_MS / 60000),
    example: getDemoExample(),
  };
}
