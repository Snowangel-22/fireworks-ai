import type { ChatSession } from '../types'
import { SessionItem } from './SessionItem'

interface Props {
  sessions: ChatSession[]
  currentSessionId: string | null
  onNewChat: () => void
  onSelectSession: (session: ChatSession) => void
  onDeleteSession: (id: string) => void
  onExport: () => void
}

export function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onExport,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Fireworks</span>
        </div>
        <button className="new-chat-btn" onClick={onNewChat}>
          + New Chat
        </button>
      </div>

      <div className="sidebar-sessions">
        {sessions.length === 0 ? (
          <p className="sidebar-empty">No sessions yet</p>
        ) : (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onSelect={() => onSelectSession(session)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="export-btn" onClick={onExport} disabled={sessions.length === 0}>
          Export history
        </button>
      </div>
    </aside>
  )
}
