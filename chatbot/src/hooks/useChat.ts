import { useState, useCallback, useRef } from 'react'
import type { Message, TokenUsage, ChatStats, ChatSettings } from '../types'
import { SYSTEM_PROMPT } from '../constants'
import { useElapsedTimer } from './useElapsedTimer'

interface StreamDelta {
  choices: Array<{
    delta: { content?: string }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export function useChat(initialMessages: Message[] = [], settings?: ChatSettings) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)
  const [usage, setUsage] = useState<TokenUsage | null>(null)
  const { elapsedMs, start: startTimer, stop: stopTimer, reset: resetTimer } = useElapsedTimer()

  // Refs so async callbacks always read current values without stale closures
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (
      content: string,
    ): Promise<{ messages: Message[]; usage: TokenUsage | null } | null> => {
      if (isStreaming) return null

      const prior = messagesRef.current
      const { model, temperature, maxTokens } = settingsRef.current ?? {
        model: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
        temperature: 0.3,
        maxTokens: 2048,
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: Date.now(),
      }

      const assistantId = crypto.randomUUID()
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        isStreaming: true,
      }

      setMessages([...prior, userMsg, assistantMsg])
      setIsStreaming(true)
      setUsage(null)
      startTimer()

      const abort = new AbortController()
      abortRef.current = abort

      let finalContent = ''
      let finalUsage: TokenUsage | null = null

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abort.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...prior.map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content },
            ],
            stream: true,
            max_tokens: maxTokens,
            temperature,
            stream_options: { include_usage: true },
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`API ${response.status}: ${errText}`)
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + token } : m,
                  ),
                )
              }
              if (delta.usage) {
                finalUsage = {
                  promptTokens: delta.usage.prompt_tokens,
                  completionTokens: delta.usage.completion_tokens,
                  totalTokens: delta.usage.total_tokens,
                }
                setUsage(finalUsage)
              }
            } catch {
              // malformed chunk, skip
            }
          }
        }

        const finalElapsed = stopTimer()
        const meta = {
          model,
          elapsedMs: finalElapsed,
          usage: finalUsage,
          finishedAt: Date.now(),
        }
        setIsStreaming(false)
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false, meta } : m)),
        )

        const completedMsg = { ...assistantMsg, content: finalContent, isStreaming: false, meta }
        return {
          messages: [...prior, userMsg, completedMsg],
          usage: finalUsage,
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return null
        const msg = (err as Error).message
        stopTimer()
        setIsStreaming(false)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Error: ${msg}`, isStreaming: false } : m,
          ),
        )
        return null
      }
    },
    [isStreaming, startTimer, stopTimer],
  )

  const reset = useCallback(
    (msgs: Message[] = []) => {
      abortRef.current?.abort()
      abortRef.current = null
      setMessages(msgs)
      setIsStreaming(false)
      setUsage(null)
      resetTimer()
    },
    [resetTimer],
  )

  const stats: ChatStats = { usage, elapsedMs, isStreaming }

  return { messages, stats, sendMessage, reset }
}
