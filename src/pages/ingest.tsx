export function IngestPage() {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ingest</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <main class="w-full max-w-lg">
          <nav class="mb-6 flex gap-4 text-sm">
            <a href="/" class="font-medium text-gray-900">
              Ingest
            </a>
            <a href="/ask" class="text-gray-500 hover:text-gray-900">
              Ask
            </a>
          </nav>
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Ingest Content</h1>
          <form id="ingest-form" class="space-y-4 bg-white p-6 rounded-lg shadow">
            <div>
              <label for="source" class="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                id="source"
                name="source"
                required
                placeholder="e.g. lipsum.com"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label for="text" class="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                id="text"
                name="text"
                required
                rows={8}
                placeholder="Paste content to ingest..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Ingest
            </button>
          </form>
          <div id="result" class="mt-4 hidden rounded-md p-4 text-sm" />
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
document.getElementById('ingest-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  const result = document.getElementById('result');
  const source = form.source.value.trim();
  const text = form.text.value.trim();

  button.disabled = true;
  result.className = 'mt-4 rounded-md p-4 text-sm bg-blue-50 text-blue-800';
  result.textContent = 'Ingesting...';
  result.classList.remove('hidden');

  try {
    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Ingest failed');
    result.className = 'mt-4 rounded-md p-4 text-sm bg-green-50 text-green-800';
    result.textContent = data.message + ' (' + data.length + ' chunks from ' + data.source + ')';
    form.reset();
  } catch (err) {
    result.className = 'mt-4 rounded-md p-4 text-sm bg-red-50 text-red-800';
    result.textContent = err.message || 'Something went wrong';
  } finally {
    button.disabled = false;
  }
});
            `.trim(),
          }}
        />
      </body>
    </html>
  );
}
