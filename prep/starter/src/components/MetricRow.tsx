import type { ReactNode } from 'react'

interface Metric {
  label: string
  value: ReactNode
  hint?: string
}

interface MetricRowProps {
  metrics: Metric[]
}

export function MetricRow({ metrics }: MetricRowProps) {
  return (
    <div className="metric-row">
      {metrics.map((m) => (
        <div className="metric" key={m.label}>
          <span className="metric-label">{m.label}</span>
          <span className="metric-value">{m.value}</span>
          {m.hint && <span className="metric-hint">{m.hint}</span>}
        </div>
      ))}
    </div>
  )
}
