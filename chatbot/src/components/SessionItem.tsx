import type { ChatSession } from '../types'

interface Props {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function SessionItem({ session, isActive, onSelect, onDelete }: Props) {
  return (
    <div
      className={`session-item${isActive ? ' session-item--active' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <span className="session-title">{session.title}</span>
      <button
        className="session-delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        title="Delete session"
        aria-label="Delete session"
      >
        ×
      </button>
    </div>
  )
}
