# Fireworks AI — Enterprise Case Studies
> PM lens: business problem → Fireworks capability → measurable outcome

---

## 1. Innovative Solutions — Multi-Agent Enterprise Services (DarcyIQ)
**Industry:** IT Services / Professional Services

**Problem:** Contract and scope generation was manual and sequential, creating delivery bottlenecks. Inference costs scaled linearly with usage, preventing margin expansion.

**Fireworks capabilities used:**
- Stable multi-model inference (rapid switching between models like GLM-5, Kimi K2.5)
- Production-grade performance for sustained multi-agent workloads
- Predictable, non-linear cost structure

**Outcomes:**
- Contract cycles: 30–45 days → ~3 days
- Delivery throughput: doubled across engineering and PM teams
- 6–10 agents running in parallel per project; engineer capacity grew from 2–4 → ~10 concurrent projects
- 90% of Anthropic inference spend migrated to Fireworks in 1–2 weeks
- Token consumption: 4–10B/month, doubling MoM

**Quote:** *"Fireworks won simply because it worked consistently... What I don't want is to get stuck in a 3-week development cycle trying to make a model work."* — Travis Rehl, CTO

---

## 2. RADPAIR — AI-Powered Radiology Workflows
**Industry:** Healthcare / Radiology

**Problem:** Radiologists spent 36–54% of their time on administrative tasks. Legacy systems caused latency spikes, transcription errors, and hallucinations that eroded trust. Scaling real-time voice transcription to 1,000+ concurrent users with medical-grade accuracy was cost-prohibitive with in-house infrastructure.

**Fireworks capabilities used:**
- Real-time STT hosting (RADPAIR's fine-tuned speech-to-text model)
- Sub-200ms streaming inference
- Multi-model orchestration (transcription + reasoning + workflow automation in parallel)
- Scalable serverless infrastructure — eliminated custom STT infrastructure

**Outcomes:**
- Report turnaround: 15–20 sec → 2–5 sec
- ~25% reduction in time per case
- ~12% fewer reporting errors
- Supports 1,000+ concurrent microphones; 100–200 reports/day per physician
- Powers Radiology Partners' 40–50M cases annually

**Quotes:**
- *"Radiologists can dictate naturally and have AI keep up in real time, which is a major leap forward."* — Dr. Vikram Krishnasetty, Associate CMO, Radiology Partners
- *"Fireworks AI has been an exceptional partner...powering our proprietary models with unmatched performance, scalability, and reliability."* — Avez Rizvi, CEO, RADPAIR

---

## 3. Vercel — 40x Faster Code Fixing (v0)
**Industry:** Developer Tools

**Problem:** Vercel's v0 code generation tool had slow error correction and poor quality. Relying on proprietary closed models limited customization and couldn't keep pace with evolving open-source capabilities.

**Fireworks capabilities used:**
- Reinforcement Fine-Tuning (RFT) on open-source models
- Speculative Decoding with Adaptive Speculation
- Day-0 access to latest open-source models

**Outcomes:**
- Error-free generation rate: 64.71% (Claude Sonnet baseline) → **93.87%**
- Speed: **40x faster** than GPT-4o-mini (8,130 chars/sec vs. 238.9)
- Single-pass error fixing (vs. 2-pass previously) — critical for large files (800+ LOC)

**Quotes:**
- *"Using a fine-tuned reinforcement learning model with Fireworks, we perform substantially better than SOTA...error-free generation rate well into the 90s."* — Malte Ubl, CTO, Vercel
- *"Our current model takes 2 passes to fix it, while using Fireworks this new model took 1. On an 800 LOC file, that is huge!"* — Ido Pesok, Engineering

---

## 4. Genspark — Deep Research Agent Outperforming Frontier Closed Models
**Industry:** AI / Research Agents

**Problem:** Genspark's Deep Research Agent was constrained by closed-source model limitations — poor tool-calling customization and multi-agent workflow support that couldn't be addressed through prompt engineering alone.

**Fireworks capabilities used:**
- Reinforcement Fine-Tuning (RFT) on open-source models (Kimi K2, 1T parameters)
- NVIDIA B200 hardware access
- Dedicated research engineer support from Fireworks

**Outcomes:**
- Quality: **12% better** than frontier closed-source models
- Tool calls: **33% more** (5 avg vs. 3.74)
- Cost: **50% reduction**
- Reward score improved: 0.65 → 0.82
- POC to production: **4 weeks**

**Quotes:**
- *"Fireworks enabled us to own our AI journey, and unlock better quality in just four weeks."* — Kay Zhu, CTO, Genspark
- *"We've achieved fantastic results...performed comparably to SOTA closed source models in detailed human evaluations."* — Flame Zhou, Research Engineer

---

## 5. Notion — 4x Latency Reduction for Enterprise AI Workflows
**Industry:** Productivity / SaaS

**Problem:** Notion needed to scale AI beyond simple chat to power agentic workflows across Slack, Jira, and GitHub for 100M+ users. High latency (~2 sec) was undermining perceived search quality and user experience. Their org was bottlenecked at 10 ML engineers owning all AI work.

**Fireworks capabilities used:**
- Model fine-tuning
- Scalable agent infrastructure
- Enterprise-grade tooling and monitoring

**Outcomes:**
- Latency: ~2 seconds → **350ms (4x improvement)**
- Serving 100M+ users reliably at scale
- Democratized AI development: shifted from 10 ML engineers owning AI → hundreds of engineers building their own AI-powered workflows

**Quote:** *"By fine-tuning models, we reduced latency from about 2 seconds to 350 milliseconds, significantly improving performance."* — Sarah Sachs, Head of AI Engineering, Notion

---

## 6. Sentient — Decentralized AI at Viral Scale
**Industry:** AI / Consumer Products

**Problem:** Sentient needed to handle extreme concurrency and unpredictable traffic spikes from viral product launches (Dobby-70B, Sentient Chat, Open Deep Search) without latency degradation or runaway infrastructure costs.

**Fireworks capabilities used:**
- Serverless endpoints for rapid iteration
- Custom dedicated deployments for ultra-low latency real-time inference
- FP8-optimized NVIDIA Blackwell hardware
- Burst-tolerant high-concurrency infrastructure

**Outcomes:**
- **25–50% higher throughput per GPU** vs. competitors
- **5.6M+ queries** in one week with zero degradation
- **1.8M+ users waitlisted** within 24 hours of Sentient Chat launch
- Sub-2-second responses maintained at thousands of concurrent users
- Hackathon to viral launch: **30 days**

**Quote:** *"The very first feedback we got from early testers was, 'Wow, how did you get it this fast?'"* — Oleg Golev, Technical PM, Sentient

---

## 7. Sourcegraph — Real-Time Code Assistance at Scale
**Industry:** Developer Tools

**Problem:** Sourcegraph (Cody) needed sub-second latency code completions for enterprise clients while supporting multiple LLMs and avoiding vendor lock-in. Open-source model deployment was taking 4+ months internally.

**Fireworks capabilities used:**
- Multi-model flexibility (DeepSeek-Coder-V2, StarCoder)
- Flash Attention-2, prompt speculation, speculative decoding
- Flexible pricing (serverless → on-demand → reserved GPU)
- Rapid open-source model deployment

**Outcomes:**
- Latency: **30% reduction**
- Code acceptance rate (CAR): 15% → **40% (2.5x improvement)**
- Context length support: **40% increase**
- Model deployment time: 4 months → **under 1 month**

**Quotes:**
- *"Fireworks has been a fantastic partner in building AI dev tools at Sourcegraph. Their fast, reliable model inference lets us focus on fine-tuning..."* — Beyang Liu, CTO
- *"The collaborative spirit of the Fireworks team was unmatched. They helped with critical inference optimizations..."* — Hitesh Sagtani, MLE

---

## 8. Cresta — Millions of Real-Time Contact Center Interactions
**Industry:** Contact Center / CX

**Problem:** Cresta needed production-grade infrastructure for real-time AI guidance to contact center agents at massive scale. Each customer required a custom-tuned model — deploying thousands of per-customer fine-tunes at low latency and low cost was architecturally hard.

**Fireworks capabilities used:**
- Multi-LoRA serving: single base model (mistral-based "Ocean") + thousands of fine-tuned LoRA adapters per customer
- Low-latency, high-throughput LLM serving
- Dedicated instances + serverless for trial/testing environments

**Outcomes:**
- **100x cost reduction** per inference unit vs. GPT-4
- Fine-tuned Ocean-1 consistently **outperforms GPT-4** on RAG tasks
- Powers millions of real-time customer interactions
- Improved contact center KPIs: handle time, first-call resolution

**Quotes:**
- *"Low-latency, high-throughput serving of LLMs has been particularly valuable, as latency is crucial for our real-time applications."* — Chuan Wang, Technical Lead Manager
- *"Multi-LoRA capabilities align with Cresta's strategy to deploy custom AI through fine-tuning cutting-edge base models."* — Tim Shi, Co-Founder & CTO

---

## 9. Upwork — Faster, Smarter Freelancer Proposals (Uma)
**Industry:** Marketplace / Future of Work

**Problem:** Upwork's AI assistant Uma needed to generate tailored proposal drafts for millions of freelancers globally in real time. Open-source alternatives had too much latency; building and managing in-house GPU infrastructure was expensive and distracting.

**Fireworks capabilities used:**
- FireAttention v2 for low-latency long-context processing
- Custom Llama-3.1 LoRA models via Enterprise API
- FireOptimizer for resource scaling
- Quantization + multi-LoRA support

**Outcomes:**
- Near order-of-magnitude latency improvement vs. open-source alternatives
- Favorable TCO vs. internal hardware procurement
- Real-time proposal drafts, reducing time-to-apply for freelancers

**Quote:** *"Fireworks offers incredible TTFT and ITL without managing our own machines."* — Zhao Chen, Director of AI & ML, Upwork

---

## 10. Healthcare & E-Commerce — Multimodal Models in Production
**Industry:** Healthcare / Insurance / E-Commerce

**Problem (Healthcare/Insurance):** Classifying and extracting data from large volumes of complex medical and insurance records at scale — existing solutions were too slow and too expensive.

**Problem (AlliumAI / E-Commerce):** Extracting structured product data from tens of thousands of product images efficiently and cost-effectively.

**Fireworks capabilities used:**
- Fine-tuned multimodal models on Fireworks inference stack
- On-demand and reserved deployments
- Serverless pricing
- Multi-LoRA deployment, document layout models, structured output generation

**Outcomes:**
- Healthcare/Insurance: **100x lower cost** vs. GPT-4o; **1.5x faster** than GPT-4o; higher accuracy; real-time processing of hundreds of documents in seconds
- AlliumAI: High-accuracy structured extraction from product images; significantly reduced deployment time and complexity; cost-competitive with text-only models

**Quote:** *"Fireworks Serverless pricing has been a game changer for our cost structure...dramatically reduces time and complexity to deploy models."* — Daniel DeMillard, CEO, AlliumAI

---

## PM Pattern Summary

| Use Case Pattern | Key Fireworks Capability | Common Outcome |
|---|---|---|
| Replace closed models | RFT + open-source models | Better quality, 50%+ cost reduction |
| Real-time / low-latency | Optimized serving (FireAttention, speculative decoding) | 4–40x latency improvement |
| Per-customer customization | Multi-LoRA serving | 100x cost reduction vs. GPT-4 |
| Viral / burst traffic | Serverless + dedicated deployments | Sustained scale without degradation |
| Speech / multimodal | Custom model hosting on Fireworks infra | Speed + accuracy gains over legacy systems |
| Agentic workflows | Multi-model orchestration + stable inference | Faster cycles, more parallel capacity |

---

## Why Enterprises Still Choose Frontier Labs (Anthropic / OpenAI)

Despite Fireworks' advantages, frontier model labs retain enterprise customers for structural reasons:

| Reason | What's Really Happening |
|---|---|
| **Buying intelligence, not infra** | Claude/GPT-4o are complete answers. Fireworks is the start of a longer conversation — you still have to pick and manage a model. |
| **Risk aversion** | Frontier labs offer named accountability: safety commitments, enterprise DPAs, HIPAA BAAs, SOC 2. Enterprises want someone to call when the model misbehaves. |
| **No fine-tuning need yet** | Fireworks' value (RFT, LoRA, custom models) only pays off at scale, with data, and with ML engineers. Most v1 use cases don't meet that bar. |
| **Ecosystem lock-in** | OpenAI's API is the de facto standard. Claude is embedded in Cursor, GitHub Copilot, and enterprise tooling. Switching has real retraining and integration costs. |
| **Bundled capabilities** | Vision, web search, code interpreter — frontier labs bundle these out of the box. Fireworks requires composing them yourself. |
| **Relationship and roadmap access** | Large contracts buy early model access, dedicated teams, and executive relationships — not just API calls. |
| **Scale pain isn't felt yet** | Cost and latency only become urgent at volume. Companies running modest token volumes don't feel the economics that justify migration. |

**The PM Takeaway:** Fireworks wins *after* a company has shipped v1 on a frontier model and hit latency or cost ceilings — not before. The motion is "you've outgrown the frontier lab for this use case," which is a land-and-expand story. The strategic risk: Anthropic and OpenAI keep improving inference economics and fine-tuning fast enough that enterprises never accumulate enough pain to switch.
