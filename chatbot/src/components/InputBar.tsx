import { useState, useRef } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled: boolean
}

export function InputBar({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const charCount = value.length
  const nearLimit = charCount > 40_000

  return (
    <div className="input-bar">
      {nearLimit && (
        <div className={`char-warning${charCount > 50_000 ? ' char-warning--over' : ''}`}>
          {charCount.toLocaleString()} chars{charCount > 50_000 ? ' — may be truncated' : ''}
        </div>
      )}
      <div className="input-row">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Paste a document to summarize, or ask a follow-up… (Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
        />
        <button
          className="send-button"
          onClick={submit}
          disabled={disabled || !value.trim()}
        >
          {disabled ? (
            <span className="send-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l2 6-2 6 12-6z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
