import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const ingestUrl = process.env.INGEST_URL ?? "http://localhost:5173/api/ingest";

async function ingestFile(filePath) {
  const source = path.basename(filePath);
  const text = await readFile(filePath, "utf8");

  const res = await fetch(ingestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, text }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `HTTP ${res.status}`);
  }

  return { source, chunks: data.length };
}

const files = (await readdir(dataDir))
  .filter((name) => name.endsWith(".txt"))
  .sort()
  .map((name) => path.join(dataDir, name));

console.log(`Ingesting ${files.length} files to ${ingestUrl}\n`);

let failed = 0;
for (const filePath of files) {
  const source = path.basename(filePath);
  try {
    const { chunks } = await ingestFile(filePath);
    console.log(`✓ ${source} (${chunks} chunks)`);
  } catch (err) {
    failed++;
    console.error(`✗ ${source}: ${err.message}`);
  }
}

if (failed > 0) {
  process.exitCode = 1;
  console.log(`\nDone with ${failed} failure(s).`);
} else {
  console.log("\nAll files ingested.");
}
