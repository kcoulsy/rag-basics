import { index, pgTable, text, uuid, vector } from "drizzle-orm/pg-core";

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("chunks_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ],
);
