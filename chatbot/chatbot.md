# Fireworks AI Document Summarizer — Product Brief

## What It Is

A single-page document summarization chatbot built on the Fireworks AI inference API. Users paste any document into the chat input, receive a structured summary streamed back in real time, and can review or export the full history of past sessions — including per-response metadata — at any time.

---

## What It Accomplishes

| Goal | How it's met |
|---|---|
| Demonstrate Fireworks API usage | Direct integration with `/inference/v1/chat/completions` via streaming SSE |
| Show model flexibility | 4 curated models switchable without reloading |
| Surface inference performance | Per-response token counts + latency, persisted with each message |
| Usable in 90 minutes | No backend, no database, no deployment — pure localhost |
| Retain value across sessions | Full chat history in `localStorage`, survives refresh |
| Exportable output | JSON and plain-text download of all sessions |

---

## Priorities (ranked)

1. **Streaming first** — The core value prop of Fireworks is speed. The UI shows tokens arriving in real time so that's immediately visible.
2. **Observability** — Token usage and latency are shown live during generation and saved permanently on each message, so performance differences across models are directly comparable.
3. **Model switcher** — A PM demoing this needs to show model awareness. Four choices cover the key tradeoffs (speed, quality, efficiency) without overwhelming the UI.
4. **Session persistence** — Demo credibility requires that history survives a page refresh. localStorage gives this with zero infrastructure.
5. **Export** — Closes the loop on the "assistant" use case: summaries need to leave the app.

---

## Design Choices

### Architecture: no backend
The Fireworks API key is injected by the Vite dev server proxy (`vite.config.ts`), never exposed to the browser bundle. This eliminates a Node/Express backend entirely, cutting setup time from ~30 minutes to ~5 minutes — critical for the 90-minute constraint. Tradeoff: this only works locally; a production deployment would need a real server-side proxy.

### Styling: plain CSS with custom properties
Tailwind was ruled out. Configuring Tailwind v4 with Vite reliably takes 10–15 minutes, and a misconfigured PostCSS pipeline kills a demo. Plain CSS variables (`--bg-base`, `--accent-blue`, etc.) are set once in `index.css` and produce the same dark-navy Fireworks aesthetic with less risk. All layout is CSS Grid + Flexbox — no library needed.

### State: localStorage only
No backend database. Sessions are capped at 20 entries, message content is truncated at 50,000 characters per message to stay within the ~5 MB localStorage limit. Settings (model, temperature, max tokens) persist separately so they survive across sessions.

### Streaming: `fetch` + `ReadableStream` SSE parsing
No EventSource or third-party streaming library. Raw `fetch` with a chunked `TextDecoder` loop handles SSE reliably and gives direct control over buffering. Key invariant: React state inside the stream loop is always updated via `setMessages(prev => ...)` functional form to avoid stale closures on rapid token updates.

### Metadata on messages, not sessions
Token usage and latency are stored on each individual assistant `Message` (as `meta: { model, elapsedMs, usage, finishedAt }`) rather than only at the session level. This means you can compare performance across responses in the same conversation after switching models mid-session.

### Model selection: 4 options
Curated to cover the key decision axes a user cares about:

| Model | Why included |
|---|---|
| **Llama 3.3 70B** | Default. Best general-purpose balance of quality and speed on Fireworks |
| **Llama 3.1 8B** | Fastest and cheapest — useful to show the speed/quality tradeoff directly |
| **DeepSeek V3** | Highest output quality for complex documents |
| **Mixtral 8x7B** | MoE architecture — different latency/quality profile worth demonstrating |

More models were deliberately not added. A long dropdown adds decision fatigue and suggests the product doesn't have a recommendation — these four make the tradeoffs obvious.

### Parameters exposed: temperature + max tokens
- **Temperature** (0–1, default 0.3): Low default reflects the summarization use case — factual extraction, not creative generation. Exposed so users can see the effect on output style.
- **Max tokens** (256–8192, default 2048): Controls response length. Exposed because document length varies widely and users need to be able to tune this without editing code.
- Parameters not exposed (top_p, frequency penalty, etc.) were left out intentionally — they're less intuitive and don't have a clear demo value for summarization.

---

## What Was Intentionally Left Out

- **Markdown rendering** — Would require a library (react-markdown + remark). Not worth the dependency for a demo; `white-space: pre-wrap` handles bullet points adequately.
- **Authentication** — Out of scope for a local demo.
- **File upload** — Paste is faster to demo and avoids file parsing complexity.
- **Mobile layout** — Sidebar + two-column layout assumes a desktop browser, which is where a PM interview demo runs.
- **Error retry** — Failed requests show an inline error message; no auto-retry to keep error handling transparent.

---

## How to Run

```bash
# Requires Node.js installed
cd fireworks-ai-prep/chatbot
npm install
npm run dev
# Open http://localhost:5173
```

API key is pre-configured in `.env`. To swap it: edit `FIREWORKS_API_KEY` in `.env`.
