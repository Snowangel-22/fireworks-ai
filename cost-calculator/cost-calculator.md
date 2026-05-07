# Fireworks AI Cost Calculator — Product Brief

## What It Is

A single-page token cost calculator that accepts input token count, output token count, and daily request volume, then renders a live comparison of what each workload would cost per request, per day, and per month across Fireworks AI, OpenAI, and Anthropic. No backend. No API key. Opens in a browser and works instantly.

---

## What It Accomplishes

| Goal | How it's met |
|---|---|
| Demonstrate Fireworks pricing advantage | Side-by-side cost columns with Fireworks highlighted as the cheapest option |
| Make cost differences concrete | Absolute dollar amounts at three time horizons — per request, per day, per month |
| Support any workload scale | Inputs accept any value from 1 request to 100M/month; formatter adapts to the magnitude |
| Usable in 90 minutes | No backend, no auth, no deployment — `npm install && npm run dev` and it's running |
| Self-contained | Pricing data is bundled as static constants; no network requests required after page load |

---

## Priorities (ranked)

1. **Correctness of calculation first** — A wrong number kills credibility instantly. Every formula is unit-tested before any UI work touches it.
2. **Live update** — Costs recalculate on every keystroke. There is no submit button. Watching numbers change in real time as you type is the core demo moment.
3. **Cheapest model highlight** — A visual affordance (colored badge or row highlight) makes the winning provider immediately obvious without requiring the user to read all the numbers.
4. **Provider summary cards** — Headline monthly cost per provider sits above the table for decision-makers who won't drill into per-model detail.
5. **Sortable comparison table** — Full per-model breakdown for technical buyers who want to understand which specific model drives the difference.

---

## Design Choices

### No backend

Same rationale as the sibling chatbot project: no infrastructure means instant localhost setup, no credentials to manage, and no deployment surface to break mid-demo. Pricing data is static, so there is nothing a backend would add except risk.

### Pricing as static constants, not fetched from an API

Pricing data is defined in `src/data/pricing.ts` and bundled at build time. Three reasons: (1) pricing changes rarely enough that a mid-demo fetch adds network failure risk with no benefit, (2) static data is auditable — reviewers can read the file and verify the numbers, (3) it keeps the app fully offline-capable. A comment at the top of `pricing.ts` marks the last-updated date so staleness is visible.

### Per-request + per-day + per-month displayed together

Different stakeholders think at different time horizons. Engineers compare per-request costs. Finance and ops think in monthly burn. Showing all three on the same screen prevents the "but how much is that actually?" follow-up question and removes the need for mental arithmetic during a demo.

### No chart library

A sorted table with color highlights conveys rank order more precisely than a bar chart. Bar charts compress large cost differences into small visual gaps when one bar dominates (e.g., Claude Sonnet at $0.010500/req vs. Llama 3.1 8B at $0.000300/req makes the smaller bars invisible at scale). A table shows exact values regardless of magnitude. Chart.js or Recharts would also add ~200 KB to the bundle and a configuration surface that can break.

### Preset buttons on token inputs

Most users don't know their exact token counts off the top of their head. Presets labeled "1K / 10K / 100K" let them calibrate against a known reference workload in one click, without needing to look up their own usage stats first. The free-form input remains editable for users who do know their numbers.

### Provider color coding

- **Fireworks: purple** — matches Fireworks brand identity; stands out as the "home" provider
- **OpenAI: green** — neutral positive; widely associated with GPT products
- **Anthropic: orange** — warm and distinct from the other two; does not read as a warning color

Colors are chosen to be immediately distinguishable from each other and from the page background, without being alarming. Red is deliberately avoided — no provider should look like an error state.

---

## What Was Intentionally Left Out

- **Batch pricing discounts** — Varies by contract, changes the math in non-obvious ways, and is confusing in a live demo. Users who need batch pricing are past the demo stage.
- **Context caching / prefix caching pricing** — An Anthropic and OpenAI feature with no direct Fireworks equivalent at this time. Including it would require a separate input field and a footnote explaining why the comparison is not apples-to-apples.
- **Fine-tuning costs** — A separate pricing dimension aimed at a different audience. Mixing it into the inference cost comparison would muddy the message.
- **Throughput and rate limits** — Operationally important, but not a cost comparison dimension. Adding it would turn the calculator into a different tool.
- **Historical price tracking** — Would be genuinely useful, but requires a data store, a scraping or update pipeline, and a chart view. That is a different product, not a feature addition.

---

## How to Run

```bash
cd fireworks-ai-prep/cost-calculator
npm install
npm run dev
# Open http://localhost:5173
```

No API key needed.

---

## Key Risks

| Risk | Mitigation |
|---|---|
| Pricing data goes stale | Update `src/data/pricing.ts`; a comment at the top of the file records the last-updated date to make staleness visible at a glance |
| User enters 0 for token count or request volume | Inputs default to sensible non-zero values; all cost calculations guard against division by zero before formatting |
| Very small costs display as `$0.00` | Smart number formatter uses 6 decimal places for values below `$0.01`, so `$0.000300` renders correctly rather than rounding to zero |
