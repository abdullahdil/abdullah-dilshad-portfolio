import { demoPassages } from "@/lib/demo/corpus";
import type { Passage, PassageHit } from "@/lib/demo/types";

/**
 * A small BM25 retriever over the in-repo passage index.
 *
 * Zero keys, zero cost, zero network. This is what ships today, and the UI
 * names it honestly — it is keyword scoring, not embeddings.
 */

const K1 = 1.4;
const B = 0.72;

const STOPWORDS = new Set([
  "a", "about", "an", "and", "any", "are", "as", "at", "be", "but", "by", "can",
  "did", "do", "does", "for", "from", "had", "has", "have", "he", "her", "him",
  "his", "how", "i", "in", "into", "is", "it", "its", "me", "my", "of", "on",
  "or", "our", "she", "so", "that", "the", "their", "them", "then", "there",
  "these", "they", "this", "to", "up", "was", "we", "were", "what", "when",
  "where", "which", "who", "why", "will", "with", "you", "your",
]);

/** Lowercase, split on non-alphanumerics, drop stopwords, fold simple plurals. */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map((token) =>
      token.length > 4 && token.endsWith("s") && !token.endsWith("ss")
        ? token.slice(0, -1)
        : token,
    );
}

type IndexedPassage = {
  passage: Passage;
  termFrequency: Map<string, number>;
  length: number;
};

type LexicalIndex = {
  documents: IndexedPassage[];
  documentFrequency: Map<string, number>;
  averageLength: number;
};

function buildIndex(passages: Passage[]): LexicalIndex {
  const documentFrequency = new Map<string, number>();

  const documents = passages.map((item) => {
    // Section and source titles carry real signal ("tools", "architecture"),
    // so they are indexed alongside the body text.
    const tokens = tokenize(`${item.sourceTitle} ${item.section} ${item.text}`);
    const termFrequency = new Map<string, number>();
    for (const token of tokens) {
      termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
    }
    for (const term of termFrequency.keys()) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
    return { passage: item, termFrequency, length: tokens.length };
  });

  const totalLength = documents.reduce((sum, doc) => sum + doc.length, 0);

  return {
    documents,
    documentFrequency,
    averageLength: documents.length > 0 ? totalLength / documents.length : 1,
  };
}

const index: LexicalIndex = buildIndex(demoPassages);

function inverseDocumentFrequency(term: string): number {
  const total = index.documents.length;
  const seen = index.documentFrequency.get(term) ?? 0;
  if (seen === 0) return 0;
  return Math.log(1 + (total - seen + 0.5) / (seen + 0.5));
}

export function lexicalRetrieve(question: string, limit: number): PassageHit[] {
  const terms = tokenize(question);
  if (terms.length === 0) return [];

  const scored = index.documents.map((doc) => {
    let score = 0;
    for (const term of terms) {
      const frequency = doc.termFrequency.get(term);
      if (!frequency) continue;
      const normalisation =
        frequency +
        K1 * (1 - B + (B * doc.length) / (index.averageLength || 1));
      score += inverseDocumentFrequency(term) * ((frequency * (K1 + 1)) / normalisation);
    }
    return { passage: doc.passage, score };
  });

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
