import { useState, useCallback } from 'react'
import type { ChatSession, Message, TokenUsage } from '../types'
import { STORAGE_KEY, MAX_SESSIONS, MAX_MESSAGE_CHARS } from '../constants'

interface StorageSchema {
  version: 1
  sessions: ChatSession[]
}

export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data: StorageSchema = JSON.parse(raw)
    return data.sessions ?? []
  } catch {
    return []
  }
}

function persist(sessions: ChatSession[]) {
  const capped = sessions.slice(0, MAX_SESSIONS).map((s) => ({
    ...s,
    messages: s.messages.map((m) => ({
      ...m,
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    })),
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sessions: capped }))
}

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions)

  const createSession = useCallback((): ChatSession => {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsage: null,
    }
    setSessions((prev) => {
      const next = [session, ...prev]
      persist(next)
      return next
    })
    return session
  }, [])

  const updateSession = useCallback(
    (id: string, messages: Message[], usage: TokenUsage | null) => {
      setSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id !== id) return s
          const firstMsg = messages[0]
          const title = firstMsg
            ? firstMsg.content.slice(0, 60).replace(/\n/g, ' ') +
              (firstMsg.content.length > 60 ? '…' : '')
            : s.title
          return { ...s, messages, title, updatedAt: Date.now(), lastUsage: usage }
        })
        persist(next)
        return next
      })
    },
    [],
  )

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      persist(next)
      return next
    })
  }, [])

  return { sessions, createSession, updateSession, deleteSession }
}
