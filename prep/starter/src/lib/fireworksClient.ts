import type { TokenUsage } from '../types'

// Thin wrapper around the Fireworks chat-completions endpoint (OpenAI-compatible
// schema). All requests go through the Vite dev-server proxy at /api/fw, which
// injects the Authorization header server-side. See vite.config.ts.

export interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  model: string
  messages: ChatRequestMessage[]
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export interface ChatResult {
  content: string
  usage: TokenUsage | null
  elapsedMs: number
}

interface RawCompletionResponse {
  choices: Array<{ message: { content: string } }>
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

interface StreamDelta {
  choices: Array<{
    delta: { content?: string }
    finish_reason: string | null
  }>
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

/** Non-streaming call. Returns full content + usage + latency. */
export async function chatComplete(req: ChatRequest): Promise<ChatResult> {
  const started = performance.now()
  const response = await fetch('/api/fw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: req.signal,
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: false,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.3,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Fireworks ${response.status}: ${errText}`)
  }

  const data: RawCompletionResponse = await response.json()
  const elapsedMs = performance.now() - started
  const content = data.choices[0]?.message?.content ?? ''
  const usage = data.usage
    ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      }
    : null

  return { content, usage, elapsedMs }
}

/**
 * Streaming call. Invokes onToken for each chunk. Resolves when the stream ends
 * with the final aggregate result (content + usage + elapsedMs).
 */
export async function chatStream(
  req: ChatRequest,
  onToken: (token: string) => void,
): Promise<ChatResult> {
  const started = performance.now()
  const response = await fetch('/api/fw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: req.signal,
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: true,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.3,
      stream_options: { include_usage: true },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Fireworks ${response.status}: ${errText}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalContent = ''
  let finalUsage: TokenUsage | null = null

  outer: while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop()!

    for (const event of events) {
      const line = event.trim()
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') break outer

      try {
        const delta: StreamDelta = JSON.parse(raw)
        const token = delta.choices[0]?.delta?.content ?? ''
        if (token) {
          finalContent += token
          onToken(token)
        }
        if (delta.usage) {
          finalUsage = {
            promptTokens: delta.usage.prompt_tokens,
            completionTokens: delta.usage.completion_tokens,
            totalTokens: delta.usage.total_tokens,
          }
        }
      } catch {
        // malformed chunk, skip
      }
    }
  }

  return {
    content: finalContent,
    usage: finalUsage,
    elapsedMs: performance.now() - started,
  }
}
