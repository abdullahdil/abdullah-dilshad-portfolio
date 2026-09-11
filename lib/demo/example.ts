import { DEMO_PASSAGE_COUNT } from "@/lib/demo/config";
import { lexicalRetrieve } from "@/lib/demo/lexical";
import type { AskAnswer } from "@/lib/demo/types";

/**
 * The saved example shown when no model key is configured, and as the starting
 * state when one is.
 *
 * The passages are retrieved for real by the lexical retriever at render time —
 * only the answer text is pre-written, by hand, from those same passages. It is
 * labelled "saved example" in the UI. Nothing here pretends to be a live call.
 */

export const DEMO_EXAMPLE_QUESTION =
  "How do you stop an automation from sending the same email twice?";

const DEMO_EXAMPLE_ANSWER = [
  "In the AI Lead Generation and Outreach Engine, three controls work together.",
  "Deduplication checks existing contacts and recent sends so the same prospect is not processed twice.",
  "Idempotency uses stable identifiers on re-runs, so retries do not create duplicate CRM rows or repeated emails.",
  "Send guards mean outreach only continues after validation and, where configured, human approval.",
  "Reply detection then stops unnecessary follow-up once a prospect has responded.",
  "The other retrieved passages describe the before-automation state and the tools used, and add nothing further on duplicate prevention.",
].join(" ");

export function getDemoExample(): AskAnswer {
  return {
    question: DEMO_EXAMPLE_QUESTION,
    answer: DEMO_EXAMPLE_ANSWER,
    passages: lexicalRetrieve(DEMO_EXAMPLE_QUESTION, DEMO_PASSAGE_COUNT),
    retriever: "lexical",
    model: "",
    cached: false,
    saved: true,
  };
}
