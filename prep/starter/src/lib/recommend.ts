import { FIREWORKS_MODELS, findModel } from './models'
import type { ModelInfo, TaskTag } from '../types'

export interface Recommendation {
  model: ModelInfo
  rationale: string
}

// Hardcoded top-3 per use case — transparent, auditable, zero API calls.
// Rationale is shown directly in the UI. Update on assignment day if new models land.
const RANKINGS: Record<TaskTag, Array<{ id: string; rationale: string }>> = {
  chat: [
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', rationale: 'Best balance of quality and speed for conversational AI on Fireworks.' },
    { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', rationale: 'Strong instruction-following and multilingual chat at 70B quality.' },
    { id: 'accounts/fireworks/models/kimi-k2-instruct', rationale: 'Frontier-quality responses when nuance or complex reasoning is needed.' },
  ],
  reasoning: [
    { id: 'accounts/fireworks/models/kimi-k2-instruct', rationale: 'Frontier reasoning model — matches or exceeds GPT-4o quality at open-weights cost.' },
    { id: 'accounts/fireworks/models/llama-v3p1-405b-instruct', rationale: 'Deepest reasoning in the Llama family; strong benchmark performance.' },
    { id: 'accounts/fireworks/models/deepseek-v3', rationale: 'Exceptional reasoning and code with one of the best price/quality ratios on Fireworks.' },
  ],
  code: [
    { id: 'accounts/fireworks/models/deepseek-v3', rationale: 'State-of-the-art code generation — outperforms GPT-4o on many coding benchmarks.' },
    { id: 'accounts/fireworks/models/kimi-k2-instruct', rationale: 'Top-tier code completion; particularly strong on complex algorithmic tasks.' },
    { id: 'accounts/fireworks/models/llama-v3p1-405b-instruct', rationale: 'Frontier-quality code for the hardest problems; higher latency but highest accuracy.' },
  ],
  'function-calling': [
    { id: 'accounts/fireworks/models/firefunction-v2', rationale: 'Purpose-built for function calling on Fireworks — lowest schema error rate.' },
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', rationale: 'Strong native tool-use support; good fallback when FireFunction v2 doesn\'t cover your schema.' },
    { id: 'accounts/fireworks/models/deepseek-v3', rationale: 'Reliable structured output and tool invocation at competitive cost.' },
  ],
  'long-context': [
    { id: 'accounts/fireworks/models/minimax-text-01', rationale: '1M+ token context window — handles full codebases, books, or long conversation histories.' },
    { id: 'accounts/fireworks/models/kimi-k2-instruct', rationale: '128k context with frontier reasoning; ideal when long context AND quality both matter.' },
    { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', rationale: '128k context with solid long-document summarization and extraction.' },
  ],
  multilingual: [
    { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', rationale: 'Leading multilingual model on Fireworks; top performance across CJK and European languages.' },
    { id: 'accounts/fireworks/models/kimi-k2-instruct', rationale: 'Frontier multilingual reasoning; strong on non-English tasks requiring nuanced understanding.' },
    { id: 'accounts/fireworks/models/mixtral-8x7b-instruct', rationale: 'Efficient MoE model with solid multilingual capability at the lowest latency tier.' },
  ],
  summarization: [
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', rationale: 'High-quality summarization with strong instruction-following; great default choice.' },
    { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', rationale: 'Excels at multi-document and cross-language summarization tasks.' },
    { id: 'accounts/fireworks/models/minimax-text-01', rationale: 'Best for summarizing very long documents — handles inputs other models truncate.' },
  ],
}

export function recommend(useCase: TaskTag): Recommendation[] {
  return RANKINGS[useCase]
    .map(({ id, rationale }) => {
      const model = FIREWORKS_MODELS.find((m) => m.id === id)
      if (!model) return null
      return { model, rationale }
    })
    .filter((r): r is Recommendation => r !== null)
}

export function topModelId(useCase: TaskTag): string {
  const recs = recommend(useCase)
  return recs[0]?.model.id ?? 'accounts/fireworks/models/llama-v3p3-70b-instruct'
}
