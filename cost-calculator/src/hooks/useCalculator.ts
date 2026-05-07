import { useMemo } from 'react'
import type { CalculatorInputs, ModelPricing, ModelCost } from '../types'

export function useCalculator(
  inputs: CalculatorInputs,
  models: ModelPricing[],
): {
  costs: ModelCost[]
  cheapestId: string
  cheapestPerProvider: Record<string, ModelCost>
} {
  return useMemo(() => {
    const { inputTokensPerRequest, outputTokensPerRequest, requestsPerDay } = inputs

    const costs: ModelCost[] = models.map((model) => {
      const costPerRequest =
        (inputTokensPerRequest / 1_000_000) * model.inputPricePerMillion +
        (outputTokensPerRequest / 1_000_000) * model.outputPricePerMillion
      const costPerDay = costPerRequest * requestsPerDay
      const costPerMonth = costPerDay * 30

      return { model, costPerRequest, costPerDay, costPerMonth }
    })

    costs.sort((a, b) => a.costPerMonth - b.costPerMonth)

    const cheapestId = costs[0]?.model.id ?? ''

    const cheapestPerProvider: Record<string, ModelCost> = {}
    for (const entry of costs) {
      const { provider } = entry.model
      if (!(provider in cheapestPerProvider)) {
        cheapestPerProvider[provider] = entry
      }
    }

    return { costs, cheapestId, cheapestPerProvider }
  }, [inputs, models])
}
