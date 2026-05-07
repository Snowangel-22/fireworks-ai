import type { ModelCost } from '../types'
import { PROVIDER_LABELS } from '../constants'
import { formatCost } from '../utils/format'

interface Props {
  costs: ModelCost[]
  selectedModelIds: Record<string, string>
  onSelectModel: (provider: string, modelId: string) => void
}

type Provider = 'fireworks' | 'openai' | 'anthropic'

const PROVIDERS: Provider[] = ['fireworks', 'openai', 'anthropic']

export function ProviderSummary({ costs, selectedModelIds, onSelectModel }: Props) {
  const costsByProvider: Record<string, ModelCost[]> = {}
  for (const c of costs) {
    const p = c.model.provider
    if (!costsByProvider[p]) costsByProvider[p] = []
    costsByProvider[p]!.push(c)
  }

  const selectedCosts = PROVIDERS.map(p => {
    const providerCosts = costsByProvider[p] ?? []
    return providerCosts.find(c => c.model.id === selectedModelIds[p]) ?? providerCosts[0] ?? null
  })

  const maxMonthly = selectedCosts.reduce(
    (max, c) => (c && c.costPerMonth > max ? c.costPerMonth : max),
    0,
  )

  return (
    <section className="provider-summary">
      {PROVIDERS.map((provider, i) => {
        const selected = selectedCosts[i]
        const providerCosts = costsByProvider[provider] ?? []

        let savingsBadge: string | null = null
        if (selected && maxMonthly > 0 && selected.costPerMonth < maxMonthly) {
          const pct = Math.round(((maxMonthly - selected.costPerMonth) / maxMonthly) * 100)
          if (pct > 0) savingsBadge = `${pct}% cheaper`
        }

        return (
          <div key={provider} className={`provider-card provider-card--${provider}`}>
            <div className="provider-card-header">
              <span className={`provider-badge provider-badge--${provider}`}>
                {PROVIDER_LABELS[provider]}
              </span>
              {savingsBadge && <span className="savings-badge">{savingsBadge}</span>}
            </div>

            <select
              className="provider-card-select"
              value={selected?.model.id ?? ''}
              onChange={e => onSelectModel(provider, e.target.value)}
            >
              {providerCosts.map(c => (
                <option key={c.model.id} value={c.model.id}>
                  {c.model.name}
                </option>
              ))}
            </select>

            {selected ? (
              <>
                <p className="provider-card-cost">{formatCost(selected.costPerMonth)}</p>
                <p className="provider-card-label">/ month</p>
                <div className="provider-card-breakdown">
                  <span>{formatCost(selected.costPerRequest)} / req</span>
                  <span>{formatCost(selected.costPerDay)} / day</span>
                </div>
              </>
            ) : (
              <p className="provider-card-empty">No models available</p>
            )}
          </div>
        )
      })}
    </section>
  )
}
