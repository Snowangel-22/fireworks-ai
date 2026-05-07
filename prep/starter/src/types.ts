export type Role = 'user' | 'assistant' | 'system'

export type Provider = 'fireworks' | 'openai' | 'anthropic'

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
}

export interface ChatStats {
  usage: TokenUsage | null
  elapsedMs: number
  isStreaming: boolean
}
