import { getEmbeddingsConfig } from "@/lib/demo/config";
import { demoPassages } from "@/lib/demo/corpus";
import type { PassageHit } from "@/lib/demo/types";

/**
 * Embeddings retrieval path.
 *
 * Written, but inactive unless an embeddings endpoint and key are configured
 * (`DEMO_RETRIEVER=vector`). It speaks the widely supported OpenAI-compatible
 * `/v1/embeddings` shape over plain `fetch`, so any provider exposing that
 * endpoint can be pointed at it with `DEMO_EMBEDDINGS_URL`. No SDK, no vector
 * database: the corpus is small enough to hold as float arrays in memory, and
 * the vectors are computed once per server process.
 */

const EMBED_TIMEOUT_MS = 20_000;

let corpusVectors: number[][] | null = null;
let corpusVectorsPromise: Promise<number[][]> | null = null;

type EmbeddingsResponse = {
  data?: { embedding?: number[] }[];
};

async function embed(inputs: string[]): Promise<number[][]> {
  const { apiKey, url, model } = getEmbeddingsConfig();
  if (!apiKey) {
    throw new Error("Embeddings are not configured.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: inputs }),
    signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Embeddings request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as EmbeddingsResponse;
  const vectors = payload.data?.map((entry) => entry.embedding ?? []) ?? [];
  if (vectors.length !== inputs.length || vectors.some((vec) => vec.length === 0)) {
    throw new Error("Embeddings response was malformed.");
  }
  return vectors;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getCorpusVectors(): Promise<number[][]> {
  if (corpusVectors) return corpusVectors;
  // One in-flight embed at a time: concurrent first requests must not each pay
  // for a full corpus embedding.
  corpusVectorsPromise ??= embed(
    demoPassages.map((item) => `${item.sourceTitle} — ${item.section}\n${item.text}`),
  )
    .then((vectors) => {
      corpusVectors = vectors;
      return vectors;
    })
    .catch((error: unknown) => {
      corpusVectorsPromise = null;
      throw error;
    });

  return corpusVectorsPromise;
}

export async function vectorRetrieve(
  question: string,
  limit: number,
): Promise<PassageHit[]> {
  const [vectors, [queryVector]] = await Promise.all([
    getCorpusVectors(),
    embed([question]),
  ]);

  const scored = demoPassages.map((item, position) => ({
    passage: item,
    score: cosine(queryVector ?? [], vectors[position] ?? []),
  }));

  const top = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const best = top[0]?.score ?? 0;

  return top.map((entry) => ({
    ...entry.passage,
    score: best > 0 ? Number((entry.score / best).toFixed(3)) : 0,
  }));
}
