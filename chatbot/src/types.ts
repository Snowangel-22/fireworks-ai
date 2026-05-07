export type Role = 'user' | 'assistant'

export interface MessageMeta {
  model: string
  elapsedMs: number
  usage: TokenUsage | null
  finishedAt: number
}

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
  isStreaming?: boolean
  meta?: MessageMeta
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ChatStats {
  usage: TokenUsage | null
  elapsedMs: number
  isStreaming: boolean
}

export interface ChatSettings {
  model: string
  temperature: number
  maxTokens: number
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  lastUsage: TokenUsage | null
}
