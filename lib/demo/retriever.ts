import { DEMO_PASSAGE_COUNT, getDemoConfig } from "@/lib/demo/config";
import { lexicalRetrieve } from "@/lib/demo/lexical";
import { vectorRetrieve } from "@/lib/demo/vector";
import type { PassageHit, RetrieverKind } from "@/lib/demo/types";

/**
 * Retrieval facade. The active method is decided by env and reported back so
 * the UI can label it accurately — if the answer was grounded by keyword
 * scoring, the page says "keyword scoring", never "vector search".
 */
export async function retrievePassages(
  question: string,
  limit: number = DEMO_PASSAGE_COUNT,
): Promise<{ passages: PassageHit[]; retriever: RetrieverKind }> {
  const { retriever } = getDemoConfig();

  if (retriever === "vector") {
    try {
      return { passages: await vectorRetrieve(question, limit), retriever: "vector" };
    } catch {
      // An embeddings outage must not take the demo down — fall back and say so.
      return { passages: lexicalRetrieve(question, limit), retriever: "lexical" };
    }
  }

  return { passages: lexicalRetrieve(question, limit), retriever: "lexical" };
}
