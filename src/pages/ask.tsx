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

        <div
          id="source-modal"
          class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div class="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div class="flex items-center justify-between px-4 py-3 border-b">
              <h2 id="source-modal-title" class="text-sm font-medium text-gray-900 truncate pr-4" />
              <button
                id="source-modal-close"
                type="button"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <pre
              id="source-modal-content"
              class="p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto"
            />
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
const sourcesById = {};

function openSource(id) {
  const chunk = sourcesById[id];
  if (!chunk) return;
  document.getElementById('source-modal-title').textContent = chunk.source;
  document.getElementById('source-modal-content').textContent = chunk.content;
  document.getElementById('source-modal').classList.remove('hidden');
}

function closeSource() {
  document.getElementById('source-modal').classList.add('hidden');
}

document.getElementById('source-modal-close').addEventListener('click', closeSource);
document.getElementById('source-modal').addEventListener('click', (e) => {
  if (e.target.id === 'source-modal') closeSource();
});

function renderSources(sources) {
  const container = document.getElementById('sources');
  container.innerHTML = '';
  for (const chunk of sources) {
    sourcesById[chunk.id] = chunk;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer';
    btn.textContent = chunk.source;
    btn.addEventListener('click', () => openSource(chunk.id));
    container.appendChild(btn);
  }
}

document.getElementById('ask-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  const result = document.getElementById('result');
  const query = form.query.value.trim();

  button.disabled = true;
  Object.keys(sourcesById).forEach((k) => delete sourcesById[k]);
  result.className = 'mt-4 space-y-3';
  result.innerHTML =
    '<div class="rounded-md p-4 text-sm bg-white shadow">' +
      '<p class="font-medium text-gray-700 mb-2">Answer</p>' +
      '<p id="answer" class="text-gray-900 whitespace-pre-wrap"></p>' +
      '<div id="sources-wrap" class="hidden mt-3">' +
        '<p class="text-xs text-gray-500 mb-2">Sources</p>' +
        '<div id="sources" class="flex flex-wrap gap-2"></div>' +
      '</div>' +
    '</div>';
  result.classList.remove('hidden');

  const answerEl = document.getElementById('answer');
  let answer = '';

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Request failed');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const msg = JSON.parse(line);

        if (msg.type === 'sources') {
          renderSources(msg.sources);
          document.getElementById('sources-wrap').classList.remove('hidden');
        } else if (msg.type === 'delta') {
          answer += msg.text;
          answerEl.textContent = answer;
        }
      }
    }
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
