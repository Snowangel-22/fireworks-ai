import { useCallback, useRef, useState } from 'react'
import type { ChatSettings, Message, TokenUsage } from '../types'
import { chatStream } from '../lib/fireworksClient'
import { DEFAULT_MODEL_ID } from '../lib/models'

export interface UseFireworksChatOptions {
  initialMessages?: Message[]
  settings?: Partial<ChatSettings>
}

export function useFireworksChat({
  initialMessages = [],
  settings,
}: UseFireworksChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)
  const [usage, setUsage] = useState<TokenUsage | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const settingsRef = useRef<ChatSettings>({
    model: settings?.model ?? DEFAULT_MODEL_ID,
    temperature: settings?.temperature ?? 0.3,
    maxTokens: settings?.maxTokens ?? 1024,
    systemPrompt: settings?.systemPrompt,
  })
  settingsRef.current = {
    model: settings?.model ?? settingsRef.current.model,
    temperature: settings?.temperature ?? settingsRef.current.temperature,
    maxTokens: settings?.maxTokens ?? settingsRef.current.maxTokens,
    systemPrompt: settings?.systemPrompt ?? settingsRef.current.systemPrompt,
  }

  const send = useCallback(
    async (content: string) => {
      if (isStreaming) return
      setError(null)

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

      const prior = messages
      setMessages([...prior, userMsg, assistantMsg])
      setIsStreaming(true)
      setUsage(null)

      const abort = new AbortController()
      abortRef.current = abort

      const { systemPrompt, model, temperature, maxTokens } = settingsRef.current
      const apiMessages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...prior.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user' as const, content },
      ]

      try {
        const result = await chatStream(
          {
            model,
            messages: apiMessages,
            temperature,
            maxTokens,
            signal: abort.signal,
          },
          (token) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + token } : m,
              ),
            )
          },
        )

        setUsage(result.usage)
        setElapsedMs(result.elapsedMs)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: result.content, isStreaming: false } : m,
          ),
        )
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        const msg = (err as Error).message
        setError(msg)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `Error: ${msg}`, isStreaming: false }
              : m,
          ),
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming, messages],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const reset = useCallback((msgs: Message[] = []) => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages(msgs)
    setIsStreaming(false)
    setUsage(null)
    setElapsedMs(0)
    setError(null)
  }, [])

  return { messages, isStreaming, usage, elapsedMs, error, send, stop, reset }
}
