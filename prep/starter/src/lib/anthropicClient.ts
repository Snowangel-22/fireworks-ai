import type { TokenUsage } from '../types'

export interface AnthropicResult {
  content: string
  usage: TokenUsage | null
  elapsedMs: number
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>
  usage?: { input_tokens: number; output_tokens: number }
}

export async function claudeComplete(
  userMessage: string,
  model = 'claude-sonnet-4-6',
  maxTokens = 512,
): Promise<AnthropicResult> {
  const started = performance.now()

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic ${response.status}: ${err}`)
  }

  const data: AnthropicResponse = await response.json()
  const elapsedMs = performance.now() - started
  const content = data.content?.find((b) => b.type === 'text')?.text ?? ''
  const usage = data.usage
    ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      }
    : null

  return { content, usage, elapsedMs }
}

export async function claudeStream(
  userMessage: string,
  onToken: (token: string) => void,
  model = 'claude-sonnet-4-6',
  maxTokens = 512,
): Promise<AnthropicResult> {
  const started = performance.now()

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic ${response.status}: ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalContent = ''
  let inputTokens = 0
  let outputTokens = 0

  outer: while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop()!

    for (const event of events) {
      const dataLine = event.split('\n').find(l => l.startsWith('data:'))
      if (!dataLine) continue
      const raw = dataLine.slice(5).trim()
      if (raw === '[DONE]') break outer

      try {
        const msg = JSON.parse(raw)
        if (msg.type === 'content_block_delta' && msg.delta?.type === 'text_delta') {
          const token: string = msg.delta.text ?? ''
          if (token) { finalContent += token; onToken(token) }
        }
        if (msg.type === 'message_start' && msg.message?.usage) {
          inputTokens = msg.message.usage.input_tokens
        }
        if (msg.type === 'message_delta' && msg.usage) {
          outputTokens = msg.usage.output_tokens
        }
      } catch { /* malformed chunk */ }
    }
  }

  const usage = inputTokens || outputTokens
    ? { promptTokens: inputTokens, completionTokens: outputTokens, totalTokens: inputTokens + outputTokens }
    : null

  return { content: finalContent, usage, elapsedMs: performance.now() - started }
}
