import { useState, useCallback, useEffect, useRef } from 'react'
import type { ChatSession, ChatSettings } from './types'
import { useChat } from './hooks/useChat'
import { useSessions } from './hooks/useSessions'
import { Sidebar } from './components/Sidebar'
import { ChatWindow } from './components/ChatWindow'
import { StatsBar } from './components/StatsBar'
import { InputBar } from './components/InputBar'
import { SettingsBar } from './components/SettingsBar'
import { ExportModal } from './components/ExportModal'
import { DEFAULT_SETTINGS, SETTINGS_KEY } from './constants'

function loadSettings(): ChatSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export default function App() {
  const { sessions, createSession, updateSession, deleteSession } = useSessions()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessions[0]?.id ?? null)
  const [exportOpen, setExportOpen] = useState(false)
  const [settings, setSettings] = useState<ChatSettings>(loadSettings)

  const { messages, stats, sendMessage, reset } = useChat(sessions[0]?.messages ?? [], settings)

  const handleSettingsChange = useCallback((next: ChatSettings) => {
    setSettings(next)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }, [])

  // Auto-create a session if none exist on first mount
  const didInit = useRef(false)
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    if (sessions.length === 0) {
      const session = createSession()
      setCurrentSessionId(session.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNewChat = useCallback(() => {
    const session = createSession()
    setCurrentSessionId(session.id)
    reset([])
  }, [createSession, reset])

  const handleSelectSession = useCallback(
    (session: ChatSession) => {
      setCurrentSessionId(session.id)
      reset(session.messages)
    },
    [reset],
  )

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id)
      if (id === currentSessionId) {
        const remaining = sessions.filter((s) => s.id !== id)
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id)
          reset(remaining[0].messages)
        } else {
          const session = createSession()
          setCurrentSessionId(session.id)
          reset([])
        }
      }
    },
    [deleteSession, currentSessionId, sessions, createSession, reset],
  )

  const handleSend = useCallback(
    async (content: string) => {
      const result = await sendMessage(content)
      if (result && currentSessionId) {
        updateSession(currentSessionId, result.messages, result.usage)
      }
    },
    [sendMessage, currentSessionId, updateSession],
  )

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onExport={() => setExportOpen(true)}
      />
      <div className="chat-area">
        <ChatWindow messages={messages} isStreaming={stats.isStreaming} />
        <StatsBar stats={stats} />
        <SettingsBar settings={settings} onChange={handleSettingsChange} />
        <InputBar onSend={handleSend} disabled={stats.isStreaming} />
      </div>
      {exportOpen && (
        <ExportModal sessions={sessions} onClose={() => setExportOpen(false)} />
      )}
    </div>
  )
}
