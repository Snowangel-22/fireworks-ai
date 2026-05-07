import { useEffect } from 'react'
import type { ChatSession } from '../types'
import { exportAsJson, exportAsText } from '../utils/export'

interface Props {
  sessions: ChatSession[]
  onClose: () => void
}

export function ExportModal({ sessions, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="modal-title">Export Chat History</h2>
        <p className="modal-subtitle">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} ·{' '}
          {sessions.reduce((n, s) => n + s.messages.length, 0)} messages
        </p>
        <div className="modal-actions">
          <button
            className="modal-btn modal-btn--primary"
            onClick={() => { exportAsJson(sessions); onClose() }}
          >
            Download JSON
          </button>
          <button
            className="modal-btn modal-btn--secondary"
            onClick={() => { exportAsText(sessions); onClose() }}
          >
            Download .txt
          </button>
        </div>
      </div>
    </div>
  )
}
