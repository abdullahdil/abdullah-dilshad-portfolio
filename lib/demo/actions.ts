"use server";

import { formString } from "@/lib/admin/form-utils";
import { getRequestClientKey } from "@/lib/contact/client-meta";
import {
  consumeDailyBudget,
  getCachedAnswer,
  setCachedAnswer,
} from "@/lib/demo/cache";
import {
  DEMO_PASSAGE_CHAR_LIMIT,
  DEMO_RATE_LIMIT,
  DEMO_RATE_WINDOW_MS,
  getDemoConfig,
} from "@/lib/demo/config";
import { generateAnswer, ProviderError } from "@/lib/demo/provider";
import { retrievePassages } from "@/lib/demo/retriever";
import type { AskDemoResult, PassageHit } from "@/lib/demo/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { askDemoSchema } from "@/lib/validations/demo";

/** Keep the prompt bounded regardless of how long a source passage grows. */
function trimPassage(passage: PassageHit): PassageHit {
  if (passage.text.length <= DEMO_PASSAGE_CHAR_LIMIT) return passage;
  return { ...passage, text: `${passage.text.slice(0, DEMO_PASSAGE_CHAR_LIMIT)}…` };
}

export async function askDemoAction(
  _prev: AskDemoResult | null,
  formData: FormData,
): Promise<AskDemoResult> {
  const config = getDemoConfig();

  if (!config.live) {
    return {
      ok: false,
      error:
        "The live demo is switched off on this deployment. The saved example below shows the same retrieval and grounding.",
    };
  }

  const parsed = askDemoSchema.safeParse({
    question: formString(formData, "question"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the question.",
    };
  }
  const { question } = parsed.data;

  // A repeat question costs nothing — served before the rate limit so a visitor
  // is never punished for re-reading an answer they already triggered.
  const cached = getCachedAnswer(question);
  if (cached) {
    return { ok: true, result: { ...cached, cached: true } };
  }

  const clientKey = await getRequestClientKey();
  const limited = checkRateLimit(
    `demo-ask:${clientKey}`,
    DEMO_RATE_LIMIT,
    DEMO_RATE_WINDOW_MS,
  );
  if (!limited.ok) {
    const minutes = Math.max(1, Math.ceil(limited.retryAfterSec / 60));
    return {
      ok: false,
      error: `That's the question limit for now — this demo calls a paid model, so it is capped. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  if (!consumeDailyBudget(config.dailyLimit)) {
    return {
      ok: false,
      error:
        "The demo has reached its daily question budget. It resets tomorrow — the saved example below still shows how it works.",
    };
  }

  const { passages, retriever } = await retrievePassages(question);
  if (passages.length === 0) {
    return {
      ok: false,
      error:
        "Nothing in the case studies matched that question. Try asking about lead generation, internal operations, or the RAG support workflow.",
    };
  }

  try {
    const trimmed = passages.map(trimPassage);
    const { answer, model } = await generateAnswer(question, trimmed);
    const result = {
      question,
      answer,
      passages: trimmed,
      retriever,
      model,
      cached: false,
      saved: false,
    };
    setCachedAnswer(question, result);
    return { ok: true, result };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof ProviderError
          ? `${error.message} The saved example below still shows how the retrieval works.`
          : "The demo could not reach the model. Please try again shortly.",
    };
  }
}
