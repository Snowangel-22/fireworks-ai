import type { Message } from '../types'

interface Props {
  message: Message
}

function formatMs(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const { meta } = message

  return (
    <div className={`message-row ${isUser ? 'message-row--user' : 'message-row--assistant'}`}>
      <div className={`message-bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}>
        {!isUser && <div className="bubble-label">Assistant</div>}
        <div className={`bubble-content${message.isStreaming ? ' streaming' : ''}`}>
          {message.content || (message.isStreaming ? '' : '…')}
          {message.isStreaming && <span className="cursor" />}
        </div>
        {!isUser && meta && !message.isStreaming && (
          <div className="bubble-meta">
            <span title="Time to generate">{formatMs(meta.elapsedMs)}</span>
            {meta.usage && (
              <>
                <span className="meta-dot">·</span>
                <span title="Prompt tokens">{meta.usage.promptTokens.toLocaleString()} in</span>
                <span className="meta-dot">·</span>
                <span title="Completion tokens">{meta.usage.completionTokens.toLocaleString()} out</span>
                <span className="meta-dot">·</span>
                <span title="Total tokens">{meta.usage.totalTokens.toLocaleString()} total</span>
              </>
            )}
            <span className="meta-dot">·</span>
            <span title="Model" className="meta-model">{meta.model.split('/').pop()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
