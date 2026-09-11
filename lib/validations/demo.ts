import { z } from "zod";

/**
 * Hard cap on the visitor's question. Long inputs are the cheapest way to run
 * up someone else's model bill, so this is enforced on the server before any
 * retrieval or generation happens — the client-side `maxLength` is only a
 * courtesy.
 */
export const DEMO_QUESTION_MAX_LENGTH = 240;
export const DEMO_QUESTION_MIN_LENGTH = 8;

export const askDemoSchema = z.object({
  question: z
    .string()
    .trim()
    .min(DEMO_QUESTION_MIN_LENGTH, "Ask a slightly longer question.")
    .max(
      DEMO_QUESTION_MAX_LENGTH,
      `Keep the question under ${DEMO_QUESTION_MAX_LENGTH} characters.`,
    ),
});

export type AskDemoInput = z.infer<typeof askDemoSchema>;
