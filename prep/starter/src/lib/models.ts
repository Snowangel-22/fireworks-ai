import type { ModelInfo } from '../types'

// Pricing snapshot — verify on fireworks.ai/pricing on assignment day if the prompt
// is cost-sensitive. Numbers below were current as of May 2025.
export const MODELS: ModelInfo[] = [
  {
    id: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'fireworks',
    contextWindow: 131072,
    inputPricePerMillion: 0.9,
    outputPricePerMillion: 0.9,
    bestFor: 'general-purpose chat, balanced cost/quality',
  },
  {
    id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: 'fireworks',
    contextWindow: 131072,
    inputPricePerMillion: 0.2,
    outputPricePerMillion: 0.2,
    bestFor: 'high-volume / low-latency / cost-sensitive workloads',
  },
  {
    id: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    provider: 'fireworks',
    contextWindow: 131072,
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 3.0,
    bestFor: 'reasoning-heavy tasks, frontier-quality',
  },
  {
    id: 'accounts/fireworks/models/deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'fireworks',
    contextWindow: 131072,
    inputPricePerMillion: 0.9,
    outputPricePerMillion: 0.9,
    bestFor: 'reasoning, code, multilingual; strong price/quality',
  },
  {
    id: 'accounts/fireworks/models/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    provider: 'fireworks',
    contextWindow: 32768,
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 0.5,
    bestFor: 'fast MoE inference, multilingual',
  },
  {
    id: 'accounts/fireworks/models/qwen2p5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'fireworks',
    contextWindow: 131072,
    inputPricePerMillion: 0.9,
    outputPricePerMillion: 0.9,
    bestFor: 'multilingual, structured output',
  },
  {
    id: 'accounts/fireworks/models/firefunction-v2',
    name: 'FireFunction v2',
    provider: 'fireworks',
    contextWindow: 8192,
    inputPricePerMillion: 0.9,
    outputPricePerMillion: 0.9,
    bestFor: 'function calling / tool use / agents',
  },
  // Comparison anchors — useful if the prompt is cost or quality benchmarking.
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10.0,
    bestFor: 'closed-API benchmark for quality',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    contextWindow: 128000,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    bestFor: 'cheap closed-API alternative',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    contextWindow: 200000,
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
    bestFor: 'long-context reasoning benchmark',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    contextWindow: 200000,
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 4.0,
    bestFor: 'cheap closed-API with long context',
  },
  {
    id: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'anthropic',
    contextWindow: 200000,
    inputPricePerMillion: 15.0,
    outputPricePerMillion: 75.0,
    bestFor: 'frontier-quality benchmark (expensive)',
  },
]

export const FIREWORKS_MODELS = MODELS.filter((m) => m.provider === 'fireworks')
export const COMPARISON_MODELS = MODELS.filter((m) => m.provider !== 'fireworks')

export const DEFAULT_MODEL_ID = 'accounts/fireworks/models/llama-v3p3-70b-instruct'

export function findModel(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id)
}

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const m = findModel(modelId)
  if (!m) return 0
  return (
    (inputTokens / 1_000_000) * m.inputPricePerMillion +
    (outputTokens / 1_000_000) * m.outputPricePerMillion
  )
}
