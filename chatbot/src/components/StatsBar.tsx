import type { ChatStats } from '../types'

interface Props {
  stats: ChatStats
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function StatsBar({ stats }: Props) {
  const { usage, elapsedMs, isStreaming } = stats
  const hasData = isStreaming || usage !== null || elapsedMs > 0

  if (!hasData) return <div className="stats-bar stats-bar--empty" />

  return (
    <div className="stats-bar">
      <span className="stats-item">
        <span className="stats-label">time</span>
        <span className="stats-value">{formatMs(elapsedMs)}</span>
      </span>
      {usage ? (
        <>
          <span className="stats-divider">·</span>
          <span className="stats-item">
            <span className="stats-label">prompt</span>
            <span className="stats-value">{usage.promptTokens.toLocaleString()} tk</span>
          </span>
          <span className="stats-divider">·</span>
          <span className="stats-item">
            <span className="stats-label">completion</span>
            <span className="stats-value">{usage.completionTokens.toLocaleString()} tk</span>
          </span>
          <span className="stats-divider">·</span>
          <span className="stats-item">
            <span className="stats-label">total</span>
            <span className="stats-value">{usage.totalTokens.toLocaleString()} tk</span>
          </span>
        </>
      ) : isStreaming ? (
        <>
          <span className="stats-divider">·</span>
          <span className="stats-item stats-item--muted">counting tokens…</span>
        </>
      ) : null}
    </div>
  )
}
