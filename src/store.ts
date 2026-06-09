import { db } from "./db";
import { chunks } from "./db/schema";

export type DocumentChunk = {
  id: string;
  source: string;
  content: string;
  embedding: number[];
};

export async function insertChunk(input: {
  id: string;
  source: string;
  content: string;
  embedding: number[];
}): Promise<DocumentChunk> {
  const [chunk] = await db
    .insert(chunks)
    .values({
      id: input.id,
      source: input.source,
      content: input.content,
      embedding: input.embedding,
    })
    .returning();

  return chunk;
}

export async function listChunks(): Promise<DocumentChunk[]> {
  return db.select().from(chunks);
}
