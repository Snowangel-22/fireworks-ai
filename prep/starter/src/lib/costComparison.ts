// Claude Sonnet 4.6 as the closed-model cost anchor.
// Cost is computed from pricing data — no Anthropic API call needed.
const CLAUDE_INPUT_PER_M = 3.0
const CLAUDE_OUTPUT_PER_M = 15.0

export function claudeCost(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * CLAUDE_INPUT_PER_M +
    (outputTokens / 1_000_000) * CLAUDE_OUTPUT_PER_M
  )
}

export function savingsPct(fireworksCost: number, claudeCost: number): number {
  if (claudeCost === 0) return 0
  return Math.round(((claudeCost - fireworksCost) / claudeCost) * 100)
}

export function totalSavingsPct(results: Array<{ fwCostUsd: number; claudeCostUsd: number }>): number {
  const fw = results.reduce((s, r) => s + r.fwCostUsd, 0)
  const cl = results.reduce((s, r) => s + r.claudeCostUsd, 0)
  return savingsPct(fw, cl)
}
