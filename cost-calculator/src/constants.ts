import type { CalculatorInputs } from './types'

export const DEFAULT_INPUTS: CalculatorInputs = {
  inputTokensPerRequest: 1000,
  outputTokensPerRequest: 500,
  requestsPerDay: 1000,
}

export const PROVIDER_COLORS: Record<string, string> = {
  fireworks: '#7c5cfc',
  openai: '#10b981',
  anthropic: '#f97316',
}

export const PROVIDER_LABELS: Record<string, string> = {
  fireworks: 'Fireworks AI',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
}
