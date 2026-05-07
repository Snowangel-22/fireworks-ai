# Fireworks AI Document Summarization Chatbot

## Context
Building a document summarization chatbot for a PM interview demo at Fireworks AI. Must be deployable (locally) within 90 minutes. Uses the Fireworks AI API for streaming LLM responses. Runs on localhost only; chat history stored in localStorage.

---

## Stack
- **Frontend:** Vite + React + TypeScript
- **Backend:** None — Vite dev server proxy injects API key and forwards `/api/chat` → Fireworks API
- **Styling:** Plain CSS with custom properties (no Tailwind — too risky to configure in 90 min)
- **Persistence:** `localStorage` only
- **Model:** `accounts/fireworks/models/llama-v3p3-70b-instruct`

---

## File Structure

```
chatbot/
├── .env                        # FIREWORKS_API_KEY=fw_...
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts              # proxy + Authorization header injection
├── index.html                  # loads Inter font, sets title
└── src/
    ├── main.tsx
    ├── App.tsx                  # grid layout: sidebar + chat
    ├── types.ts                 # all shared interfaces
    ├── constants.ts             # model ID, system prompt, localStorage key
    ├── index.css                # CSS variables + global reset
    ├── components/
    │   ├── Sidebar.tsx          # session list, New Chat, Export
    │   ├── SessionItem.tsx      # single clickable session row
    │   ├── ChatWindow.tsx       # scrollable messages + auto-scroll
    │   ├── MessageBubble.tsx    # user (right/blue) and assistant (left/card)
    │   ├── InputBar.tsx         # growing textarea, Enter to send
    │   ├── StatsBar.tsx         # live tokens + elapsed time
    │   └── ExportModal.tsx      # JSON / plain-text download
    ├── hooks/
    │   ├── useChat.ts           # streaming fetch, message state, stats
    │   ├── useSessions.ts       # localStorage CRUD for sessions
    │   └── useElapsedTimer.ts   # setInterval elapsed ms
    └── utils/
        └── export.ts            # Blob + <a download> export logic
```

---

## Key Types (`src/types.ts`)

```typescript
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatStats {
  usage: TokenUsage | null;
  elapsedMs: number;
  isStreaming: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  lastUsage: TokenUsage | null;
}
```

---

## Vite Proxy (`vite.config.ts`)

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // loads non-VITE_ vars too

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://api.fireworks.ai',
          changeOrigin: true,
          rewrite: () => '/inference/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.FIREWORKS_API_KEY}`)
              proxyReq.setHeader('Content-Type', 'application/json')
            })
          }
        }
      }
    }
  }
})
```

`FIREWORKS_API_KEY` never enters the browser bundle — only accessed in the Vite Node process.

---

## Streaming SSE Logic (`src/hooks/useChat.ts`)

1. Append user message to state
2. Append empty assistant message with `isStreaming: true`
3. Start elapsed timer
4. POST to `/api/chat` with `{ model, messages, stream: true, max_tokens: 2048, temperature: 0.3, stream_options: { include_usage: true } }`
5. Read `response.body` via `ReadableStream` + `TextDecoder`
6. Buffer chunks, split on `\n\n`, parse `data:` lines as JSON
7. Use `setMessages(prev => ...)` functional updater on every token — **never** capture `messages` in the closure
8. On final SSE chunk: extract `delta.usage`, freeze timer, set `isStreaming: false`
9. Persist session to localStorage after stream completes

---

## localStorage Schema

Key: `fw_chat_sessions`

```typescript
interface LocalStorageSchema {
  version: 1;
  sessions: ChatSession[]; // newest-first, capped at 20
}
```

- Save only after stream completes (not on every token)
- Cap at 20 sessions; truncate message content to 50,000 chars per message
- Session title = `messages[0].content.slice(0, 60).replace(/\n/g, ' ') + '...'`

---

## Export (`src/utils/export.ts`)

- **JSON:** Full `ChatSession[]` with metadata, download as `fw_export_<timestamp>.json`
- **Plain text:** Human-readable with role labels and token stats, download as `fw_export_<timestamp>.txt`
- Both use `URL.createObjectURL(new Blob([...]))` + programmatic `<a>` click — no server needed

---

## CSS Variables (`src/index.css`)

```css
:root {
  --bg-base:       #0a0e27;
  --bg-surface:    #12183a;
  --bg-card:       #1a2240;
  --accent-blue:   #4f8ef7;
  --accent-purple: #7c5cfc;
  --text-primary:  #f0f4ff;
  --text-muted:    #7a85a3;
  --border:        rgba(255, 255, 255, 0.08);
  --radius:        12px;
  --radius-sm:     8px;
  --gap:           16px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
}
```

Layout: CSS Grid `260px 1fr` for sidebar + main. Flexbox column inside ChatWindow.

---

## 90-Minute Schedule

| Time     | Task |
|----------|------|
| 0–10 min | Scaffold with `npm create vite@latest`, install deps, write `vite.config.ts`, verify proxy streams with a raw `fetch` in browser console |
| 10–25 min | `types.ts`, `constants.ts`, `useChat.ts` (streaming core) |
| 25–40 min | `useSessions.ts`, `useElapsedTimer.ts` |
| 40–65 min | All components: `ChatWindow`, `MessageBubble`, `InputBar`, `StatsBar` |
| 65–75 min | `Sidebar` + session switching |
| 75–85 min | `ExportModal` + `export.ts` |
| 85–90 min | Final styling pass, smoke test, cursor blink |

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| Vite proxy buffers stream → tokens arrive in one batch | Test proxy streaming in first 10 min before writing any UI; add `proxyRes` header fix if needed |
| Stale closure in stream loop | Always use `setMessages(prev => ...)` functional updater |
| Fireworks `usage` absent from stream | Add `stream_options: { include_usage: true }` to request; fall back to `Math.ceil(text.length / 4)` estimate |
| Large document hits token limits | Add char counter in InputBar; warn at ~50,000 chars; set `max_tokens: 2048` explicitly |

---

## Verification

1. `npm run dev` starts on `localhost:5173`
2. Paste any multi-paragraph document → click Send
3. Tokens stream in visibly (not all at once)
4. Token counter and elapsed timer update live during streaming
5. After response: token usage shows actual counts, timer freezes
6. Refresh page → prior session appears in sidebar
7. Export → downloads a valid JSON or .txt file
8. New Chat → clears window, prior session preserved in sidebar
