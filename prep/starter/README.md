# Fireworks PM Starter

Forkable Vite + React + TypeScript scaffold for the Fireworks AI PM take-home. Pre-wired with a Vite proxy that injects the Fireworks API key server-side, a model catalog, a streaming chat hook, and a base component set. Optimized to **stop being a barrier** during a 2-hour build window.

## Run

```bash
npm install
cp .env.example .env   # paste your real FIREWORKS_API_KEY
npm run dev            # opens http://localhost:5173
```

## Fork it on assignment day

```bash
cp -r prep/starter assignment-<short-topic>
cd assignment-<short-topic>
npm install   # already done if reusing the parent's node_modules path
npm run dev
```

## Deploy

```bash
npm i -g vercel
vercel login
vercel deploy
```

When prompted, set the `FIREWORKS_API_KEY` env var in the Vercel dashboard. Note: in production, the proxy in [vite.config.ts](vite.config.ts) only runs in dev — for a Vercel deploy you'll need either a serverless function or to inline the call (acceptable risk for a 2-hour demo).

## What's included

```
src/
├── main.tsx             # entry
├── App.tsx              # placeholder demo screen — replace this
├── index.css            # design tokens (dark navy aesthetic)
├── types.ts             # Message, TokenUsage, ChatSettings, ModelInfo
├── lib/
│   ├── fireworksClient.ts   # streaming + non-streaming fetch wrapper
│   └── models.ts            # 12-model catalog (Fireworks + OpenAI + Anthropic) with pricing
├── hooks/
│   └── useFireworksChat.ts  # streaming chat hook with usage + latency
└── components/
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Card.tsx
    └── MetricRow.tsx
```

## What's NOT included (intentionally)

- No router (single page is fast enough for a 2-hour demo)
- No state library (useState / useReducer)
- No test framework (sanity-test by clicking)
- No backend (the Vite proxy is the backend; for prod, see Deploy section)
- No CSS framework (plain CSS variables in [index.css](src/index.css) — fast to override)
