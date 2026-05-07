import { useState, useMemo } from 'react'
import { ALL_MODELS } from './data/pricing'
import { DEFAULT_INPUTS } from './constants'
import { useCalculator } from './hooks/useCalculator'
import { Header } from './components/Header'
import { TokenInputPanel } from './components/TokenInputPanel'
import { ProviderSummary } from './components/ProviderSummary'
import { ComparisonTable } from './components/ComparisonTable'
import type { CalculatorInputs } from './types'

const PROVIDERS = ['fireworks', 'openai', 'anthropic'] as const

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS)
  const [selectedModelIds, setSelectedModelIds] = useState<Record<string, string>>({})
  const { costs, cheapestId, cheapestPerProvider } = useCalculator(inputs, ALL_MODELS)

  const effectiveModelIds = useMemo(() => {
    const result: Record<string, string> = {}
    for (const provider of PROVIDERS) {
      result[provider] = selectedModelIds[provider] ?? cheapestPerProvider[provider]?.model.id ?? ''
    }
    return result
  }, [selectedModelIds, cheapestPerProvider])

  function handleSelectModel(provider: string, modelId: string) {
    setSelectedModelIds(prev => ({ ...prev, [provider]: modelId }))
  }

  return (
    <div className="app">
      <Header />
      <div className="app-inner">
        <TokenInputPanel inputs={inputs} onChange={setInputs} />
        <ProviderSummary
          costs={costs}
          selectedModelIds={effectiveModelIds}
          onSelectModel={handleSelectModel}
        />
        <ComparisonTable costs={costs} cheapestId={cheapestId} />
      </div>
    </div>
  )
}
