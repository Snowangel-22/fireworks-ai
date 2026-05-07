import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: Message[]
  isStreaming: boolean
}

export function ChatWindow({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="chat-window chat-window--empty">
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <h2 className="empty-title">Fireworks Doc Summarizer</h2>
          <p className="empty-subtitle">
            Paste any document below to get a structured summary.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
