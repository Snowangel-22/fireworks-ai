import { FIREWORKS_MODELS, findModel } from './models'
import { chatComplete } from './fireworksClient'
import type { ModelInfo, TaskTag } from '../types'

export interface Recommendation {
  model: ModelInfo
  rationale: string
}

// Hardcoded top-3 per use case — transparent, auditable, zero API calls.
// All IDs verified against this account's available models on 2026-08-04.
const RANKINGS: Record<TaskTag, Array<{ id: string; rationale: string }>> = {
  chat: [
    { id: 'accounts/fireworks/models/kimi-k3', rationale: 'Best overall quality for conversational AI on this account — frontier reasoning at open-weights cost.' },
    { id: 'accounts/fireworks/models/kimi-k2p6', rationale: 'Strong instruction-following and chat at lower cost than K3.' },
    { id: 'accounts/fireworks/models/deepseek-v4-flash', rationale: 'Fastest and cheapest option when latency and volume matter more than peak quality.' },
  ],
  reasoning: [
    { id: 'accounts/fireworks/models/deepseek-v4-pro', rationale: 'Top-tier reasoning and analysis — matches frontier closed models at open-weights cost.' },
    { id: 'accounts/fireworks/models/kimi-k3', rationale: 'Excellent complex Q&A and multi-step reasoning; strong alternative to DeepSeek Pro.' },
    { id: 'accounts/fireworks/models/gpt-oss-120b', rationale: 'Large open-source model for the hardest reasoning tasks where size matters.' },
  ],
  code: [
    { id: 'accounts/fireworks/models/kimi-k2p7-code', rationale: 'Purpose-built for code — strongest completion and review accuracy on this account.' },
    { id: 'accounts/fireworks/models/deepseek-v4-pro', rationale: 'State-of-the-art code generation; particularly strong on algorithmic and systems tasks.' },
    { id: 'accounts/fireworks/models/kimi-k3', rationale: 'Solid all-around code quality; good when the task mixes code and natural language.' },
  ],
  'function-calling': [
    { id: 'accounts/fireworks/models/deepseek-v4-flash', rationale: 'Fast and reliable structured output — lowest latency for tool-use pipelines.' },
    { id: 'accounts/fireworks/models/deepseek-v4-pro', rationale: 'Highest schema accuracy when tool calls are complex or deeply nested.' },
    { id: 'accounts/fireworks/models/qwen3p7-plus', rationale: 'Strong JSON and structured output capability with good multilingual function-calling.' },
  ],
  'long-context': [
    { id: 'accounts/fireworks/models/minimax-m2p7', rationale: '1M token context window — handles full codebases, books, or long conversation histories.' },
    { id: 'accounts/fireworks/models/minimax-m3', rationale: '512k context with better quality than M2.7; ideal when long context AND output quality both matter.' },
    { id: 'accounts/fireworks/models/kimi-k3', rationale: '128k context with frontier reasoning; best when document length fits and quality is critical.' },
  ],
  multilingual: [
    { id: 'accounts/fireworks/models/qwen3p7-plus', rationale: 'Leading multilingual model on this account; top performance across CJK and European languages.' },
    { id: 'accounts/fireworks/models/glm-5p2', rationale: 'Excellent Chinese-language tasks; strong cross-lingual reasoning and generation.' },
    { id: 'accounts/fireworks/models/kimi-k3', rationale: 'Frontier multilingual reasoning; strong on non-English tasks requiring nuanced understanding.' },
  ],
  summarization: [
    { id: 'accounts/fireworks/models/minimax-m3', rationale: 'Best for long documents — 512k context handles inputs other models truncate.' },
    { id: 'accounts/fireworks/models/kimi-k3', rationale: 'High-quality summaries with strong instruction-following; great for precision tasks.' },
    { id: 'accounts/fireworks/models/deepseek-v4-flash', rationale: 'Fastest and cheapest for high-volume summarization pipelines.' },
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
  return recs[0]?.model.id ?? 'accounts/fireworks/models/kimi-k3'
}

const ADVISOR_MODEL = 'accounts/fireworks/models/deepseek-v4-flash'

export async function aiRecommend(params: {
  useCase: TaskTag
  currentModelId: string
  prompt: string
  output: string
  reason: string
}): Promise<{ modelId: string; rationale: string } | null> {
  const { useCase, currentModelId, prompt, output, reason } = params
  const currentModel = findModel(currentModelId)
  const candidates = FIREWORKS_MODELS.filter(m => m.id !== currentModelId)
  const modelList = candidates.map(m => `${m.id} | ${m.name} | ${m.tags.join(', ')}`).join('\n')

  const userMsg = `Task type: ${useCase}
Current model: ${currentModel?.name ?? currentModelId}
Prompt tested: ${prompt.slice(0, 300)}
Output quality issue: ${reason}
Output snippet: ${output.slice(0, 200)}

Available Fireworks models (id | name | tags):
${modelList}

Pick the single best alternative. Reply with ONLY valid JSON, no markdown: {"modelId":"<exact id from list>","rationale":"<one sentence why>"}`

  try {
    const res = await chatComplete({
      model: ADVISOR_MODEL,
      messages: [
        { role: 'system', content: 'You are a Fireworks AI model selection advisor. Reply ONLY with valid JSON {"modelId":"...","rationale":"..."} — no other text, no markdown.' },
        { role: 'user', content: userMsg },
      ],
      maxTokens: 200,
      temperature: 0.1,
    })

    const raw = res.content.trim()
    const match = raw.match(/\{[\s\S]*?\}/)
    const parsed = JSON.parse(match?.[0] ?? raw) as { modelId?: string; rationale?: string }

    if (!parsed.modelId || !FIREWORKS_MODELS.find(m => m.id === parsed.modelId)) return null
    return { modelId: parsed.modelId, rationale: parsed.rationale ?? '' }
  } catch {
    return null
  }
}
