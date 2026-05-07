# Likely Prompts — Fireworks AI PM Take-Home

Eight themes derived from Fireworks' product surface, recent product launches (2025–2026), and the Forward Deployed PM job description. For each theme: a one-line description, why it fits Fireworks' strategy, and a **3-step attack plan** so you can pattern-match within 30 seconds when the email arrives.

The starter scaffold (`prep/starter/`) is built so themes 1, 2, 3, 5, 6, 7, and 8 share the same primitives — model catalog, Fireworks client, base components. You should rarely need to add deps.

---

## 1. Model Selection Advisor
**Prompt-shape:** "Build a tool that recommends a Fireworks model given a user's constraints (budget / latency / quality / context window)."

**Why it fits:** A core friction point for new Fireworks customers — there are 100+ models and devs don't know which to pick. The Forward Deployed PM JD specifically mentions "connecting technical requirements to product offerings."

**Attack plan:**
1. Use `lib/models.ts` catalog as-is. Three input controls: budget slider, max latency target, task type (chat / code / reasoning).
2. Score each model against the constraints (simple weighted sum). Render top 3 cards with rationale.
3. Add a "Why not the others?" expandable so the report can point at it as evidence of tradeoff thinking.

**Report angle:** Section 4 writes itself — you literally built a tradeoff visualizer.

---

## 2. Eval Framework / Prompt Evaluator
**Prompt-shape:** "Build a lightweight tool to run N prompts across M models and compare quality/cost/latency."

**Why it fits:** Eval Protocol was a 2025 Fireworks flagship launch. They're betting evals become as critical as observability. PMs there want devs to evaluate before committing to a model.

**Attack plan:**
1. Two textareas: one for prompts (one per line), one for expected outputs (one per line, optional).
2. Multi-select 3 models from `lib/models.ts`. Hit `/api/fw` in parallel via `Promise.all`. Capture token count + latency per call.
3. Render a grid: rows = prompts, cols = models. Cell shows output + cost + latency + (if expected) match rate. Highlight winners per row.

**Report angle:** Talk about why eval is the missing piece in inference (everyone benchmarks, nobody productionizes evals).

---

## 3. Fine-Tuning ROI Calculator
**Prompt-shape:** "Build a calculator that tells a developer whether fine-tuning a Fireworks model is cheaper than calling GPT-4o at their volume."

**Why it fits:** Reinforcement fine-tuning is a marquee Fireworks differentiator. They want devs to see the breakeven curve.

**Attack plan:**
1. Inputs: requests/day, avg input tokens, avg output tokens, expected accuracy boost from tuning.
2. Compute: closed-API monthly cost vs. (one-time tuning cost + open-model inference monthly cost). Plot a 12-month cumulative cost line for both.
3. Surface the breakeven month + the 12-month savings explicitly.

**Report angle:** Cost narrative writes itself — "Fireworks customers break even at month 4 for this workload."

---

## 4. Agentic Workflow Debugger
**Prompt-shape:** "Build a UI to visualize and debug an agent's execution — tool calls, latency per step, retries, errors."

**Why it fits:** Fireworks' AIML runtime + function calling are core agentic bets. Debugging agents is real customer pain.

**Attack plan:**
1. Hardcode a JSON trace of a fake 5-step agent run (search → parse → call API → reason → respond) with timings.
2. Render a vertical timeline: each step shows duration, input snippet, output snippet, status. Click to expand.
3. Add an "anomaly" badge on slow / retry / error steps. Bonus: total latency + cost rollup at the top.

**Report angle:** This is observability for compound AI — frame it that way in the report.

---

## 5. Cost Attribution Dashboard
**Prompt-shape:** "Build a dashboard that shows per-customer / per-model / per-API-call cost breakdown for an enterprise admin."

**Why it fits:** Fireworks processes ~10T tokens/day for 10k+ customers. Enterprise admins want cost control + chargebacks.

**Attack plan:**
1. Seed JSON: 5 customers × 3 models × 30 days of usage. Use realistic token volumes from `lib/models.ts` pricing.
2. Three filters: customer, model, date range. Render a stacked bar chart (use a tiny chart lib OR just CSS-grid bars).
3. Top stats card: total spend, top customer, fastest-growing customer.

**Report angle:** This is a real GTM/retention tool — frame as "customer success enabler" not "internal report."

---

## 6. Model Quality vs. Speed Explorer
**Prompt-shape:** "Build an interactive tool showing how quantization (FP4, FP8, FP16) or batch size affects throughput and latency for a fixed model."

**Why it fits:** B200 + FP4 is a 2025 Fireworks tech bet. Enterprise customers don't intuit the tradeoff space.

**Attack plan:**
1. Hardcoded benchmark JSON: 1 model × 4 quantizations × 3 batch sizes → throughput/latency/quality numbers. Make them plausible.
2. Two sliders: quantization, batch size. Render a tradeoff card: TTFT, throughput, est. quality (e.g. MMLU drop), $/1M tokens.
3. Add a "recommended config for [chat / batch / real-time]" preset row.

**Report angle:** Frame as a sales-engineering tool that demystifies infra tradeoffs for customers.

---

## 7. Customer-Facing "Build with Fireworks" Demo
**Prompt-shape:** "Build a demo that an AE could show a prospect — chat, RAG, voice, or vision — using Fireworks inference."

**Why it fits:** AEs at Fireworks need polished demos to close enterprise deals. PMs often own the demo surface.

**Attack plan:**
1. Pick the most impressive demo for 60 minutes of build: doc Q&A (RAG-lite) is the safest choice — paste a doc, ask questions, stream answer.
2. Use `useFireworksChat` for streaming. Add a "model picker" so the AE can swap to compare.
3. Polish the empty state and the loading state — that's what AEs screenshot.

**Report angle:** Talk about what makes a good demo (single insight, fast first-token, no setup).

---

## 8. Internal Feature Prioritization Tool
**Prompt-shape:** "Build a tool for the Fireworks PM team to rank customer feature requests by impact / effort / strategic fit."

**Why it fits:** The FDPM JD literally says "oversee the Fireworks roadmap to reflect customer needs." This tests internal process thinking.

**Attack plan:**
1. Seed a list of 10 plausible customer asks (more model coverage, faster fine-tuning, longer context, region X, SOC2-type-2, etc.).
2. Each row has: title, source (which customer), impact slider (1–5), effort slider (1–5), strategic fit dropdown. Auto-compute priority = impact * fit / effort.
3. Sort by priority. Add an "owner" column and a "decision" column (build / monitor / decline).

**Report angle:** Frame around the *process*, not the tool — how does a PM team go from 50 customer asks to 5 quarterly bets?

---

## Cross-cutting prep ("anything else") — keep these in your back pocket

You may not need all of these, but having them ready in working memory means you can drop one into the 1-pager or use it as a tiebreaker when picking scope.

### Competitive 30-second pitch
- **vs. Together AI:** Fireworks emphasizes faster inference + built-in agentic features (function calling, structured outputs, eval protocol). Together leads on breadth of fine-tuning options across 200+ models.
- **vs. Groq:** Fireworks wins on production-grade throughput and breadth of models; Groq wins on lowest first-token latency for real-time apps.
- **vs. OpenAI / Anthropic direct:** Open-weight + fine-tunable at ~10% of closed-model cost with comparable quality on tuned tasks.
- **vs. hyperscalers (Bedrock, Vertex):** Open model freedom, faster ship cadence (Day-0 launches like Kimi K2.5), single integration vs. cloud lock-in.

### Real Fireworks customer references (drop one in the 1-pager if it fits)
- **Uber** — high-volume production inference
- **Shopify** — ecommerce / merchant-facing AI features
- **Cresta** — contact-center AI, latency-sensitive

### Key numbers worth memorizing
- Llama 3.3 70B on Fireworks: ~$0.90 / 1M tokens (input + output)
- Llama 3.1 8B on Fireworks: ~$0.20 / 1M tokens
- GPT-4o: ~$2.50 input / $10 output per 1M tokens (so ~10x the cost for similar-quality on tuned tasks)
- DeepSeek V3 on Fireworks B200+FP4: ~264 tokens/sec throughput

### One-sentence opinions to have ready
- *On agentic inference:* "It's the next frontier — the bottleneck is no longer per-token speed, it's coordinating multi-step compound AI workflows reliably and cheaply."
- *On fine-tuning vs. prompting:* "Prompt first, fine-tune when prompts plateau or unit economics demand it. RFT changes the math."
- *On eval:* "Eval is the missing primitive in inference platforms — everyone benchmarks, almost nobody productionizes evals against their own data."

### What Fireworks PMs likely care about (signals to drop in the 1-pager)
- **Customer obsession.** "I'd validate this with X customer profile by Y." Don't say "users" — say a specific role.
- **Technical depth.** Name a model, name a tradeoff. Don't write generic AI prose.
- **Revenue/cost framing.** "This unlocks [segment]" or "This saves [enterprise customers] $X."
- **Speed of judgment.** Show you cut things deliberately, not because you ran out of time.
