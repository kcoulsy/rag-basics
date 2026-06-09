import { embedText } from "./openai";
import { storedChunks, type DocumentChunk } from "./store";
import { cosineSimilarity } from "./vector";

export async function retrieveRelevantChunks(query: string, limit = 3): Promise<DocumentChunk[]> {
  const embedding = await embedText(query);
  const relevantChunks = storedChunks
    .sort(
      (a, b) => cosineSimilarity(a.embedding, embedding) - cosineSimilarity(b.embedding, embedding),
    )
    .slice(0, limit);
  return relevantChunks;
}
