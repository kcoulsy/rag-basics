import { Hono } from "hono";
import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { chunkText } from "./chunk";
import { cosineSimilarity } from "./vector";
import { embedText } from "./openai";
import { storedChunks } from "./store";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

app.post("/api/chunk", zValidator("json", z.object({ text: z.string() })), async (c) => {
  const { text } = c.req.valid("json");
  const chunks = chunkText(text);
  return c.json({ length: chunks.length, chunks });
});

app.post(
  "/api/similarity",
  zValidator("json", z.object({ a: z.array(z.number()), b: z.array(z.number()) })),
  async (c) => {
    const { a, b } = c.req.valid("json");
    const similarity = cosineSimilarity(a, b);
    return c.json({ similarity });
  },
);

app.post(
  "/api/ingest",
  zValidator("json", z.object({ text: z.string(), source: z.string() })),
  async (c) => {
    const { text, source } = c.req.valid("json");
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);
      storedChunks.push({
        id: crypto.randomUUID(),
        source,
        content: chunk,
        embedding,
      });
    }

    return c.json({ message: "Chunks ingested successfully", source, length: chunks.length });
  },
);

app.get("/api/chunks", (c) => {
  return c.json({ chunks: storedChunks });
});

app.get("/api/hello", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

export default app;
