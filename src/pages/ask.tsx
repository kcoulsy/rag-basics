export function AskPage() {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ask</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <main class="w-full max-w-lg">
          <nav class="mb-6 flex gap-4 text-sm">
            <a href="/" class="text-gray-500 hover:text-gray-900">
              Ingest
            </a>
            <a href="/ask" class="font-medium text-gray-900">
              Ask
            </a>
          </nav>
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h1>
          <form id="ask-form" class="space-y-4 bg-white p-6 rounded-lg shadow">
            <div>
              <label for="query" class="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <textarea
                id="query"
                name="query"
                required
                rows={4}
                placeholder="e.g. How long do I have to cancel my subscription?"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Ask
            </button>
          </form>
          <div id="result" class="mt-4 hidden space-y-3" />
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
document.getElementById('ask-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  const result = document.getElementById('result');
  const query = form.query.value.trim();

  button.disabled = true;
  result.className = 'mt-4 space-y-3';
  result.innerHTML = '<div class="rounded-md p-4 text-sm bg-blue-50 text-blue-800">Thinking...</div>';
  result.classList.remove('hidden');

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');

    const sources = data.sources?.length
      ? '<p class="text-xs text-gray-500 mt-2">Sources: ' + data.sources.join(', ') + '</p>'
      : '';

    result.innerHTML =
      '<div class="rounded-md p-4 text-sm bg-white shadow">' +
        '<p class="font-medium text-gray-700 mb-2">Answer</p>' +
        '<p class="text-gray-900 whitespace-pre-wrap">' + data.answer + '</p>' +
        sources +
      '</div>';
  } catch (err) {
    result.innerHTML =
      '<div class="rounded-md p-4 text-sm bg-red-50 text-red-800">' +
        (err.message || 'Something went wrong') +
      '</div>';
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
