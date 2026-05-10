export type Role = 'user' | 'assistant' | 'system'

export type Provider = 'fireworks' | 'openai' | 'anthropic'

export type TaskTag =
  | 'chat'
  | 'reasoning'
  | 'code'
  | 'function-calling'
  | 'long-context'
  | 'multilingual'
  | 'summarization'

export type Rating = 'good' | 'partial' | 'no' | null

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
  isStreaming?: boolean
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ChatSettings {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: Provider
  contextWindow: number
  inputPricePerMillion: number
  outputPricePerMillion: number
  bestFor: string
  tags: TaskTag[]
  qualityTier: 1 | 2 | 3 | 4 | 5
  latencyTier: 'low' | 'mid' | 'high'
  openWeights: boolean
}

export interface PromptResult {
  prompt: string
  fwOutput: string
  fwUsage: TokenUsage | null
  fwElapsedMs: number
  fwCostUsd: number
  claudeOutput: string
  claudeUsage: TokenUsage | null
  claudeElapsedMs: number
  claudeCostUsd: number
}

export interface ChatStats {
  usage: TokenUsage | null
  elapsedMs: number
  isStreaming: boolean
}
