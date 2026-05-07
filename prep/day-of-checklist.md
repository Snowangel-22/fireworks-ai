# Day-Of Checklist — Fireworks AI PM Take-Home

A 2-hour clock starts the moment the email arrives. Everything below should be **already done** before you click "start." During the assignment, your only job is framing + building.

---

## Pre-assignment (do the night before, again the morning of)

### Environment
- [ ] `cd prep/starter && npm install` runs cleanly
- [ ] `npm run dev` opens localhost:5173 with the starter page rendering
- [ ] `prep/starter/.env` has a real `FIREWORKS_API_KEY` (not the placeholder)
- [ ] `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` also in `.env` (for cost-comparison or fallback prompts)
- [ ] Node version ≥ 18 (`node -v`)

### API key smoke test
Run this curl to confirm the Fireworks key works before the assignment, not during:

```bash
curl -X POST https://api.fireworks.ai/inference/v1/chat/completions \
  -H "Authorization: Bearer $FIREWORKS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"accounts/fireworks/models/llama-v3p3-70b-instruct","messages":[{"role":"user","content":"ping"}],"max_tokens":10}'
```

Expect a 200 with a `choices` array. A 401 means the key is wrong/expired.

### Tooling
- [ ] Claude Code (or Cursor) installed, signed in, opens `prep/starter/` without errors
- [ ] `vercel` CLI installed (`npm i -g vercel`) and `vercel login` complete
- [ ] Git installed and configured if you'll push to GitHub
- [ ] A blank Google Doc / Notion page open and titled "Fireworks PM Take-Home — 1-pager"
- [ ] Stopwatch app picked (phone OK on Do Not Disturb)

### Tabs to have open before the email arrives
- fireworks.ai/docs (esp. /docs/api-reference, /docs/models)
- fireworks.ai/pricing
- fireworks.ai/models (the model catalog)
- fireworks.ai/blog (recent posts — you may quote one)
- The local starter dev server (localhost:5173)
- A scratch ChatGPT / Claude window for fast questions
- Your `prep/likely-prompts.md` and `prep/execution-template.md` — printed or on a second monitor

### Logistics
- [ ] Phone on Do Not Disturb
- [ ] Water + snack within reach
- [ ] Restroom done
- [ ] House quiet for 2 hours (housemates / pets warned)
- [ ] Charger plugged in
- [ ] Slack / iMessage / email notifications muted on laptop

---

## During the assignment (within the 2-hour window)

### First 5 minutes (don't skip)
1. Start the stopwatch the moment the email is open
2. **Read the prompt twice.** Once for content, once for what's *not* being asked
3. Copy the prompt verbatim into your scratch doc
4. Open `prep/likely-prompts.md` and pattern-match — does it look like one of the 8 themes?
5. `cp -r prep/starter assignment-<short-topic>` to fork the scaffold
6. Open the fork in Claude Code/Cursor and paste the prompt + relevant Fireworks docs into context

### Time gates (hard stops)
| Time mark | What must be true |
|-----------|-------------------|
| 0:10 | Prompt re-read, scratch doc has assumptions written, fork created |
| 0:30 | Target user + problem stated in 1 sentence each, MVP scope picked |
| 1:30 | Prototype works end-to-end on the golden path (don't polish past this) |
| 1:45 | 1-pager first draft written |
| 1:55 | Prototype deployed/zipped, 1-pager finalized, screenshot taken |
| 2:00 | Email sent. Don't re-read; send. |

If you slip a gate by more than 5 minutes, **cut scope** rather than extend. A complete-but-small submission beats a half-finished ambitious one.

---

## Email submission template

Pre-draft this before the day so you only paste links:

```
Subject: PM Take-Home Submission — Angela [Last Name]

Hi [recruiter / hiring manager],

Thanks for the assignment. Submitting:

• Live prototype: <vercel URL>
• Source code: <github URL or attached zip>
• 1-page report: <attached PDF>

Quick summary: I built [X] for [target user] to [solve Y]. The 1-pager
walks through the framing and the tradeoffs I made within the 2-hour window.

Happy to walk through it live. Looking forward to next steps.

Best,
Angela
```

---

## Last-resort fallbacks

If something breaks during the assignment, here's the priority order:

1. **API key fails** → swap to `OPENAI_API_KEY` via the same client, note in the report
2. **Streaming fails** → switch to non-streaming (`stream: false`), note as a known limitation
3. **Vercel deploy fails** → zip the repo, send a recorded Loom of localhost as backup
4. **Build error you can't fix in 5 min** → `git stash`, ship the last working state, mention the unfinished feature in "What's next"
5. **You're under-framed at 0:45** → stop coding, write the 1-pager problem statement first, then code from a clearer brief
