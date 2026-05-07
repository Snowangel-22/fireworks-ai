import type { ModelCost } from '../types'
import { PROVIDER_LABELS } from '../constants'
import { formatCost } from '../utils/format'

interface Props {
  costs: ModelCost[]
  cheapestId: string
}

export function ComparisonTable({ costs, cheapestId }: Props) {
  return (
    <section className="comparison-table-wrap">
      <h2 className="comparison-table-heading">All Models</h2>
      <div className="comparison-table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="comparison-th">Provider</th>
              <th className="comparison-th">Model</th>
              <th className="comparison-th comparison-th--num">$ / request</th>
              <th className="comparison-th comparison-th--num">$ / day</th>
              <th className="comparison-th comparison-th--num">$ / month</th>
            </tr>
          </thead>
          <tbody>
            {costs.map(({ model, costPerRequest, costPerDay, costPerMonth }) => {
              const isCheapest = model.id === cheapestId
              return (
                <tr
                  key={model.id}
                  className={`comparison-row${isCheapest ? ' comparison-row--cheapest' : ''}`}
                >
                  <td className="comparison-td">
                    <span className={`provider-badge provider-badge--${model.provider}`}>
                      {PROVIDER_LABELS[model.provider]}
                    </span>
                  </td>
                  <td className="comparison-td comparison-td--model">
                    {model.name}
                    {isCheapest && <span className="cheapest-tag">cheapest</span>}
                  </td>
                  <td className="comparison-td comparison-td--num">{formatCost(costPerRequest)}</td>
                  <td className="comparison-td comparison-td--num">{formatCost(costPerDay)}</td>
                  <td className="comparison-td comparison-td--num comparison-td--month">
                    {formatCost(costPerMonth)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
