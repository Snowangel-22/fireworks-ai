---
name: Project — Fireworks AI PM take-home prep kit
description: Completed prep package at claude-code-projs/fireworks-ai-prep/prep/ — 3 reference md files + a forkable Vite/React/TS starter with Fireworks API plumbing.
type: project
originSessionId: b7b034ff-90e0-43e0-98af-95337e090b60
---
A prep kit was built (May 2026) at [claude-code-projs/fireworks-ai-prep/prep/](claude-code-projs/fireworks-ai-prep/prep/) so that on assignment day Angela spends zero time on setup/recall and all time on framing+building.

Contents:
- `prep/day-of-checklist.md` — env checklist, curl smoke test, time gates table (0:10/0:30/1:30/1:45/1:55/2:00), email submission template, fallbacks
- `prep/execution-template.md` — 120-min contract table, CIRCLES framework, 6-section 1-pager template, AI-native signals, top 5 failure modes
- `prep/likely-prompts.md` — 8 anticipated themes (model selection advisor, eval framework, fine-tune ROI, agent debugger, cost dashboard, quant explorer, AE demo, prio tool), each with 3-step attack plan + cross-cutting competitive pitch / customer refs / numbers
- `prep/starter/` — runnable Vite+React+TS scaffold: vite.config.ts proxies `/api/fw` → Fireworks (server-side key injection), `lib/models.ts` 12-model catalog with pricing, `lib/fireworksClient.ts` streaming+non-streaming, `useFireworksChat` hook, Button/Input/Select/Card/MetricRow components, dark-navy index.css

Verified: `npm install` + `npm run build` + `npm run dev` all clean. App.tsx has a smoke-test screen meant to be replaced on assignment day.

**Why:** assignment is timed and email-triggered — any setup friction is unrecoverable.

**How to apply:** Don't re-derive prep content from scratch — read the existing md files first. The starter is intentionally minimal (no router, no state lib, no tests). On assignment day, fork via `cp -r prep/starter assignment-<short-topic>`.

**Sync across devices:** working dir `c:\Users\Angela\Downloads\git-projects` was made a git repo on 2026-05-06. Prep folder syncs via git push/pull. On a new device, clone the repo, then `cd prep/starter && cp .env.example .env` and paste the real `FIREWORKS_API_KEY` (the .env file is gitignored and does not transfer).
