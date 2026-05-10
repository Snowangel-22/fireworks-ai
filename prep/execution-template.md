# Execution Template — Fireworks AI PM Take-Home

> Print this. Tape it next to your monitor. Don't deviate.

---

## The 120-minute contract

| Block | Time | What you do | What you DON'T do |
|-------|------|-------------|-------------------|
| 1. Read | 0:00–0:10 | Read prompt 2x. Write down assumptions and what's NOT being asked. | Don't open code yet. |
| 2. Frame | 0:10–0:30 | CIRCLES pass: target user, top need, 3 candidate solutions, picked one + why. Write the problem statement. | Don't start building. |
| 3. Build | 0:30–1:30 | Single golden-path MVP. Stub edge cases. Vibe-code aggressively. | Don't refactor, don't polish, don't add features beyond MVP. |
| 4. Write | 1:30–1:45 | First draft of the 1-pager. | Don't edit the prototype. |
| 5. Ship | 1:45–1:55 | Deploy to Vercel, screenshot, polish 1-pager, finalize email. | Don't add features. |
| 6. Send | 1:55–2:00 | Email it. | Don't re-read. |

**Hard rule:** if you're behind at the 0:30 gate, *cut scope*, don't skip framing. A crisp problem-statement with a half-built prototype outscores a shipped feature with no narrative.

---

## Framework: CIRCLES (the 7 letters)

Use this in the framing block (0:10–0:30). It maps cleanly to a build-prompt because Comprehend / Identify / Report force user framing *before* code, and Cut / List / Evaluate force you to articulate the tradeoffs that distinguish a strong PM submission.

- **C — Comprehend** the situation. Restate the prompt in one sentence. What's the constraint?
- **I — Identify** the customer. Who specifically is this for? (role, context, behavior — not "users")
- **R — Report** their needs. What's the pain you're solving? Why now?
- **C — Cut** through prioritization. What's the ONE need that matters most given 2 hours?
- **L — List** solutions. Brainstorm 3 ways to solve it. Don't filter yet.
- **E — Evaluate** tradeoffs. Pick one. Articulate why the other two were rejected.
- **S — Summarize** for the reader. State the chosen solution + headline tradeoff in 2 sentences.

Spend 20 minutes here. Resist the urge to start coding earlier — every minute spent on framing pays back 3x in the build phase.

---

## The 1-page report — section headers + 1-line guidance

Aim for ~400-500 words total. Bullets > prose. Section 4 (Tradeoffs) gets the most words.

### 1. Problem & target user
*One sentence each: who is this for, what's their pain, what evidence/assumption you're relying on.*

### 2. Goals & non-goals
*One primary success metric. Two things you intentionally cut.*

### 3. What I built
*What the prototype does, link/screenshot, three key design decisions in bullets.*

### 4. Tradeoffs
*Model / cost / latency / UX choices with the reason. **This section is your differentiator — give it the most words.** Show your decision process, not your output.*

### 5. Risks & open questions
*What would break at scale. What you'd validate with a real customer.*

### 6. What's next, what to build with two more hours
*2-3 concrete next steps with rough effort sizing.*

---

## AI-native signals to weave in (Fireworks-specific)

These are the technical PM signals reviewers will look for. You don't need all of them — pick the 2-3 that fit your prototype and call them out explicitly:

- **Model choice rationale** — name the model you used, name the alternative you rejected, say why (size vs. latency vs. cost vs. quality)
- **TTFT / inter-token-latency awareness** — if streaming, mention the user-perceived latency win
- **Token cost estimate at scale** — "$X per 1k users/day at current pricing" beats vague hand-waving
- **Eval thinking** — even "I sanity-tested 5 inputs and noted a hallucination on edge case Y" shows you understand model quality isn't free
- **Why Fireworks specifically** — open-weight, fine-tunable, 2-3x throughput vs. closed APIs at lower per-token cost. One sentence is enough.
- **Compound / agentic framing** — if your prototype calls multiple models or chains steps, frame it as a "compound AI" pattern (a Fireworks marketing term)

---

## Top 5 failure modes to actively avoid

1. **No clear user.** "I built a feature" instead of "I built this for [role] to [goal] because [insight]."
2. **Metrics theater.** Listing 8 vanity metrics instead of one primary metric that actually proves success.
3. **Hidden tradeoffs.** You cut things but don't explain why. Always own your cuts in Section 4.
4. **Diagnosis-free solutioning.** Jumping to "build feature X" without a sentence on *why* the pain exists.
5. **One continuous 2-hour sprint with no break.** If you code for 90 straight minutes, your 1-pager will read like garbage. Use the time blocks.

---

## Quick decision rules under time pressure

- **Stuck on naming / styling?** Use the starter's existing tokens. Don't redesign.
- **Stuck on a feature?** Mock the data, ship the UI. Note "next: real backing."
- **Stuck choosing a model?** Default to `accounts/fireworks/models/llama-v3p3-70b-instruct`. Justify in the report.
- **Stuck on auth / accounts?** Skip them. localStorage is fine for a 2-hour demo.
- **Stuck on whether to use streaming?** Yes if the user reads the output (chat, summarization). No if they don't (classification, structured output).
- **Stuck on whether to deploy?** Yes — Vercel takes <5 minutes and a live URL beats a zip every time.

---

## Pre-flight: the only thing you should look at when the email arrives

> "Read the prompt. Write the user in one sentence. Pick the smallest thing you can build that proves the user's pain is solved."

That's it. Everything else is in this template.
