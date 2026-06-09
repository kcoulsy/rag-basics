import { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { chunkText } from "./chunk";
import { cosineSimilarity } from "./vector";
import { embedText, openai } from "./openai";
import { insertChunk, listChunks } from "./store";
import { retrieveRelevantChunks } from "./retrieve";
import { IngestPage } from "./pages/ingest";
import { AskPage } from "./pages/ask";

const app = new Hono();

app.get("/", (c) => {
  return c.html(<IngestPage />);
});

app.get("/ask", (c) => {
  return c.html(<AskPage />);
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
      await insertChunk({
        id: crypto.randomUUID(),
        source,
        content: chunk,
        embedding,
      });
    }

    return c.json({ message: "Chunks ingested successfully", source, length: chunks.length });
  },
);

app.get("/api/chunks", async (c) => {
  const chunks = await listChunks();
  return c.json({ chunks });
});

app.post("/api/ask", zValidator("json", z.object({ query: z.string() })), async (c) => {
  const { query } = c.req.valid("json");
  const relevantChunks = await retrieveRelevantChunks(query);

  const context = relevantChunks
    .map((chunk, index) => `[${index + 1}] ${chunk.source}: ${chunk.content}`)
    .join("\n\n---\n\n");

  const sources = relevantChunks.map((chunk) => ({
    id: chunk.id,
    source: chunk.source,
    content: chunk.content,
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
You answer questions using only the provided context.

If the answer is not in the context, say:
"I don't know based on the provided documents."

Be concise.
      `.trim(),
      },
      {
        role: "user",
        content: `
        Question: ${query}

        Context: ${context}
        `.trim(),
      },
    ],
  });

  c.header("Content-Type", "application/x-ndjson");
  return stream(c, async (s) => {
    await s.write(JSON.stringify({ type: "sources", sources }) + "\n");

    for await (const chunk of completion) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        await s.write(JSON.stringify({ type: "delta", text }) + "\n");
      }
    }

    await s.write(JSON.stringify({ type: "done" }) + "\n");
  });
});

export default app;
