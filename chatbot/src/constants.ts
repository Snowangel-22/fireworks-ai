export const FIREWORKS_MODEL = 'accounts/fireworks/models/llama-v3p3-70b-instruct'
export const STORAGE_KEY = 'fw_chat_sessions'
export const SETTINGS_KEY = 'fw_chat_settings'
export const MAX_SESSIONS = 20
export const MAX_MESSAGE_CHARS = 50_000

export const AVAILABLE_MODELS = [
  { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', label: 'Llama 3.3 70B', note: 'balanced' },
  { id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',  label: 'Llama 3.1 8B',  note: 'fast' },
  { id: 'accounts/fireworks/models/deepseek-v3',             label: 'DeepSeek V3',    note: 'quality' },
  { id: 'accounts/fireworks/models/mixtral-8x7b-instruct',   label: 'Mixtral 8x7B',  note: 'efficient' },
]

export const DEFAULT_SETTINGS = {
  model: FIREWORKS_MODEL,
  temperature: 0.3,
  maxTokens: 2048,
}

export const SYSTEM_PROMPT =
  'You are a document summarization assistant. When given a document or text, extract the key points and provide a clear, structured summary. Identify main themes, critical information, and actionable insights. Use bullet points for easy scanning when appropriate.'
