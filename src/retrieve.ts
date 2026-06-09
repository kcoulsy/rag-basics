import { asc, cosineDistance } from "drizzle-orm";
import { db } from "./db";
import { chunks } from "./db/schema";
import { embedText } from "./openai";
import type { DocumentChunk } from "./store";

export async function retrieveRelevantChunks(query: string, limit = 3): Promise<DocumentChunk[]> {
  const embedding = await embedText(query);

  return db
    .select()
    .from(chunks)
    .orderBy(asc(cosineDistance(chunks.embedding, embedding)))
    .limit(limit);
}
