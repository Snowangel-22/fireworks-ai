// Prices as of May 2025. Update as providers change pricing.
import type { ModelPricing } from '../types'

export const ALL_MODELS: ModelPricing[] = [
  {
    id: 'fw-llama-3-3-70b',
    name: 'Llama 3.3 70B Instruct',
    provider: 'fireworks',
    inputPricePerMillion: 0.90,
    outputPricePerMillion: 0.90,
  },
  {
    id: 'fw-llama-3-1-8b',
    name: 'Llama 3.1 8B Instruct',
    provider: 'fireworks',
    inputPricePerMillion: 0.20,
    outputPricePerMillion: 0.20,
  },
  {
    id: 'fw-deepseek-v3',
    name: 'DeepSeek V3 (0324)',
    provider: 'fireworks',
    inputPricePerMillion: 0.90,
    outputPricePerMillion: 0.90,
  },
  {
    id: 'fw-mixtral-8x7b',
    name: 'Mixtral 8x7B Instruct',
    provider: 'fireworks',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 0.50,
  },
  {
    id: 'fw-llama-3-1-405b',
    name: 'Llama 3.1 405B Instruct',
    provider: 'fireworks',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 3.00,
  },
  {
    id: 'openai-gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
  },
  {
    id: 'openai-gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
  },
  {
    id: 'openai-gpt-3-5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 1.50,
  },
  {
    id: 'openai-o1',
    name: 'o1',
    provider: 'openai',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
  },
  {
    id: 'anthropic-claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'anthropic',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
  },
  {
    id: 'anthropic-claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
  },
  {
    id: 'anthropic-claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
  },
]

export const MODELS_BY_PROVIDER: Record<string, ModelPricing[]> = ALL_MODELS.reduce<
  Record<string, ModelPricing[]>
>((acc, model) => {
  if (!acc[model.provider]) {
    acc[model.provider] = []
  }
  acc[model.provider]!.push(model)
  return acc
}, {})
