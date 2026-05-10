import { useEffect, useRef, useState } from 'react'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Select } from './components/Select'
import { MetricRow } from './components/MetricRow'
import { chatStream } from './lib/fireworksClient'
import { claudeStream } from './lib/anthropicClient'
import { estimateCost, findModel, FIREWORKS_MODELS } from './lib/models'
import { recommend } from './lib/recommend'
import { totalSavingsPct, savingsPct as pctSaved } from './lib/costComparison'
import type { TaskTag, Rating, PromptResult } from './types'

const USE_CASES: { tag: TaskTag; label: string; desc: string }[] = [
  { tag: 'chat',             label: 'Chat',             desc: 'Conversational AI, support' },
  { tag: 'summarization',    label: 'Summarization',    desc: 'Condense docs, articles, notes' },
  { tag: 'code',             label: 'Code',             desc: 'Generation, review, completion' },
  { tag: 'reasoning',        label: 'Reasoning',        desc: 'Analysis, Q&A, complex tasks' },
  { tag: 'function-calling', label: 'Function Calling', desc: 'Tool use, structured output' },
  { tag: 'long-context',     label: 'Long Context',     desc: 'Documents, codebases, threads' },
  { tag: 'multilingual',     label: 'Multilingual',     desc: 'Non-English or mixed language' },
]

const QUALITY_LABELS: Record<number, string> = { 1: 'Basic', 2: 'Fast', 3: 'Good', 4: 'Strong', 5: 'Frontier' }
const LATENCY_LABELS: Record<string, string>  = { low: 'Fast', mid: 'Medium', high: 'Slow' }

function useScrollIntoView(trigger: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (trigger && ref.current) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }, [trigger])
  return ref
}

const EMPTY_RESULT = (prompt: string): PromptResult => ({
  prompt,
  fwOutput: '', fwUsage: null, fwElapsedMs: 0, fwCostUsd: 0,
  claudeOutput: '', claudeUsage: null, claudeElapsedMs: 0, claudeCostUsd: 0,
})

export default function App() {
  const [useCase, setUseCase]       = useState<TaskTag | null>(null)
  const [prompts, setPrompts]       = useState(['', '', ''])
  const [visiblePrompts, setVisible]= useState(1)
  const [selectedModelId, setModel] = useState('')
  const [results, setResults]       = useState<PromptResult[]>([])
  const [ratings, setRatings]       = useState<Rating[]>([])
  const [isRunning, setIsRunning]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const recs          = useCase ? recommend(useCase) : []
  const activePrompts = prompts.slice(0, visiblePrompts).filter(p => p.trim())
  const canRun        = activePrompts.length > 0 && !!selectedModelId && !isRunning
  const allRated      = !isRunning && ratings.length > 0 && ratings.every(r => r !== null)

  const recsRef    = useScrollIntoView(!!useCase)
  const resultsRef = useScrollIntoView(results.length > 0)
  const summaryRef = useScrollIntoView(allRated && results.length > 0)

  function handleUseCaseSelect(tag: TaskTag) {
    setUseCase(tag)
    setModel(recommend(tag)[0]?.model.id ?? '')
    setResults([])
    setRatings([])
  }

  async function runTest() {
    setIsRunning(true)
    setError(null)
    setResults([])
    setRatings([])

    for (let i = 0; i < activePrompts.length; i++) {
      const prompt = activePrompts[i]
      setResults(prev => [...prev, EMPTY_RESULT(prompt)])
      setRatings(prev => [...prev, null])

      try {
        const [fwRes, clRes] = await Promise.all([
          chatStream(
            { model: selectedModelId, messages: [{ role: 'user', content: prompt }], maxTokens: 512, temperature: 0.3 },
            token => setResults(prev => prev.map((r, idx) =>
              idx === i ? { ...r, fwOutput: r.fwOutput + token } : r
            )),
          ),
          claudeStream(
            prompt,
            token => setResults(prev => prev.map((r, idx) =>
              idx === i ? { ...r, claudeOutput: r.claudeOutput + token } : r
            )),
          ),
        ])
        setResults(prev => prev.map((r, idx) => {
          if (idx !== i) return r
          return {
            ...r,
            fwOutput:       fwRes.content,
            fwUsage:        fwRes.usage,
            fwElapsedMs:    fwRes.elapsedMs,
            fwCostUsd:      estimateCost(selectedModelId, fwRes.usage?.promptTokens ?? 0, fwRes.usage?.completionTokens ?? 0),
            claudeOutput:   clRes.content,
            claudeUsage:    clRes.usage,
            claudeElapsedMs: clRes.elapsedMs,
            claudeCostUsd:  estimateCost('claude-sonnet-4-6', clRes.usage?.promptTokens ?? 0, clRes.usage?.completionTokens ?? 0),
          }
        }))
      } catch (e) {
        setError((e as Error).message)
        setIsRunning(false)
        return
      }
    }

    setIsRunning(false)
  }

  const selectedModel    = findModel(selectedModelId)
  const goodCount        = ratings.filter(r => r === 'good').length
  const overallSavingsPct = results.length && !isRunning ? totalSavingsPct(results) : 0
  const totalFwCost      = results.reduce((s, r) => s + r.fwCostUsd, 0)
  const totalClCost      = results.reduce((s, r) => s + r.claudeCostUsd, 0)

  function downloadResults() {
    const payload = {
      exportedAt: new Date().toISOString(),
      useCase,
      fireworksModel: selectedModel?.name,
      fireworksModelId: selectedModelId,
      results: results.map((r, i) => ({
        prompt: r.prompt,
        rating: ratings[i] ?? 'unrated',
        fireworks: {
          output: r.fwOutput,
          latencyMs: Math.round(r.fwElapsedMs),
          inputTokens: r.fwUsage?.promptTokens,
          outputTokens: r.fwUsage?.completionTokens,
          costUsd: r.fwCostUsd,
        },
        claude: {
          output: r.claudeOutput,
          latencyMs: Math.round(r.claudeElapsedMs),
          inputTokens: r.claudeUsage?.promptTokens,
          outputTokens: r.claudeUsage?.completionTokens,
          costUsd: r.claudeCostUsd,
        },
        savingsPct: pctSaved(r.fwCostUsd, r.claudeCostUsd),
      })),
      summary: {
        goodRatings: goodCount,
        totalPrompts: results.length,
        costSavingsPct: overallSavingsPct,
        fireworksTotalCostUsd: totalFwCost,
        claudeTotalCostUsd: totalClCost,
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `migration-compass-${useCase ?? 'results'}-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Migration Compass</span>
        <span className="app-tagline">Find your Fireworks open-source replacement — with real output comparison</span>
      </header>

      <main className="app-main">

        {/* ── 1. Use case ─────────────────────────────────────── */}
        <Card title="What are you building?" subtitle="Pick your primary workload to get matched models">
          <div className="chip-grid">
            {USE_CASES.map(({ tag, label, desc }) => (
              <button
                key={tag}
                className={`chip ${useCase === tag ? 'selected' : ''}`}
                onClick={() => handleUseCaseSelect(tag)}
              >
                <span className="chip-label">{label}</span>
                <span className="chip-desc">{desc}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* ── 2. Recommendations + model picker ───────────────── */}
        {useCase && (
          <div ref={recsRef}>
            <Card
              title={`Top Fireworks models for ${USE_CASES.find(u => u.tag === useCase)?.label}`}
              subtitle="Click a card to select. Ranked for your use case — open-weights, no vendor lock-in."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {recs.map((rec, i) => (
                  <div
                    key={rec.model.id}
                    className={`rec-card ${selectedModelId === rec.model.id ? 'selected' : ''}`}
                    onClick={() => setModel(rec.model.id)}
                  >
                    <div className="rec-rank">#{i + 1} Recommended</div>
                    <div className="rec-model-name">{rec.model.name}</div>
                    <div className="rec-rationale">{rec.rationale}</div>
                    <div className="rec-badges">
                      <span className="badge">Quality: {QUALITY_LABELS[rec.model.qualityTier]}</span>
                      <span className="badge">Speed: {LATENCY_LABELS[rec.model.latencyTier]}</span>
                      <span className="badge">${rec.model.inputPricePerMillion}/1M tokens</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="field">
                <label className="field-label">Or pick any Fireworks model</label>
                <Select
                  label=""
                  value={selectedModelId}
                  onChange={e => setModel(e.target.value)}
                  options={FIREWORKS_MODELS.map(m => ({ value: m.id, label: m.name }))}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ── 3. Prompts + run ────────────────────────────────── */}
        {useCase && (
          <Card
            title="Paste your real prompts"
            subtitle="1–3 examples from your actual workload. Runs against both Fireworks and Claude Sonnet 4.6."
          >
            <div className="prompt-stack">
              {Array.from({ length: visiblePrompts }).map((_, i) => (
                <div key={i} className="field">
                  <label className="field-label">
                    {visiblePrompts > 1 ? `Prompt ${i + 1}` : 'Prompt'}
                  </label>
                  <textarea
                    className="prompt-textarea"
                    placeholder={i === 0 ? 'Paste a prompt from your production or staging system…' : 'Optional additional prompt…'}
                    value={prompts[i]}
                    onChange={e => setPrompts(prev => prev.map((p, idx) => idx === i ? e.target.value : p))}
                  />
                </div>
              ))}
              {visiblePrompts < 3 && (
                <button className="add-prompt-link" onClick={() => setVisible(v => Math.min(v + 1, 3))}>
                  + Add another prompt
                </button>
              )}
            </div>

            {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}

            <div style={{ marginTop: 20 }}>
              <Button onClick={runTest} disabled={!canRun}>
                {isRunning
                  ? 'Running both models…'
                  : `Run test${activePrompts.length > 1 ? ` (${activePrompts.length} prompts)` : ''}`}
              </Button>
            </div>
          </Card>
        )}

        {/* ── 4. Side-by-side results (streams in progressively) ── */}
        {results.length > 0 && (
          <div ref={resultsRef}>
            <Card
              title="Results"
              subtitle={`Rate the ${selectedModel?.name} output — does it match your quality bar?`}
              actions={
                !isRunning && results.length > 0
                  ? <button className="btn btn--ghost" style={{ fontSize: 12 }} onClick={downloadResults}>↓ Download JSON</button>
                  : undefined
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {results.map((r, i) => {
                  const done      = r.fwElapsedMs > 0
                  const streaming = isRunning && !done

                  return (
                    <div key={i} className={`prompt-result ${ratings[i] ? `rated-${ratings[i]}` : ''}`}>
                      <div className="prompt-result-input">Prompt: {r.prompt}</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

                        {/* Fireworks */}
                        <div style={{ borderRight: '1px solid var(--border)' }}>
                          <div className="prompt-result-header fw-header">
                            {selectedModel?.name}
                          </div>
                          <div className={`prompt-result-output${streaming ? ' is-streaming' : ''}`}>
                            {r.fwOutput}
                          </div>
                          {done && (
                            <div className="result-stats">
                              <div className="result-stat">
                                <span className="result-stat-label">Latency</span>
                                <span className="result-stat-value">{Math.round(r.fwElapsedMs).toLocaleString()} ms</span>
                              </div>
                              <div className="result-stat">
                                <span className="result-stat-label">Tokens</span>
                                <span className="result-stat-value">
                                  {r.fwUsage ? `${r.fwUsage.promptTokens}+${r.fwUsage.completionTokens}` : '—'}
                                </span>
                              </div>
                              <div className="result-stat result-stat--green">
                                <span className="result-stat-label">Cost</span>
                                <span className="result-stat-value">${r.fwCostUsd.toFixed(6)}</span>
                                {r.claudeCostUsd > 0 && (
                                  <span className="result-stat-savings">
                                    {pctSaved(r.fwCostUsd, r.claudeCostUsd)}% less
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Claude */}
                        <div>
                          <div className="prompt-result-header">Claude Sonnet 4.6</div>
                          <div className={`prompt-result-output${streaming ? ' is-streaming' : ''}`}>
                            {r.claudeOutput}
                          </div>
                          {done && (
                            <div className="result-stats">
                              <div className="result-stat">
                                <span className="result-stat-label">Latency</span>
                                <span className="result-stat-value">{Math.round(r.claudeElapsedMs).toLocaleString()} ms</span>
                              </div>
                              <div className="result-stat">
                                <span className="result-stat-label">Tokens</span>
                                <span className="result-stat-value">
                                  {r.claudeUsage ? `${r.claudeUsage.promptTokens}+${r.claudeUsage.completionTokens}` : '—'}
                                </span>
                              </div>
                              <div className="result-stat">
                                <span className="result-stat-label">Cost</span>
                                <span className="result-stat-value">${r.claudeCostUsd.toFixed(6)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {done && (
                        <div className="rating-row">
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>
                            Rate Fireworks:
                          </span>
                          {(['good', 'partial', 'no'] as const).map(val => (
                            <button
                              key={val}
                              className={`rating-btn ${ratings[i] === val ? `active-${val}` : ''}`}
                              onClick={() => setRatings(prev => prev.map((v, idx) => idx === i ? val : v))}
                            >
                              {val === 'good' ? '✓ Good' : val === 'partial' ? '~ Partial' : '✗ No'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ── 5. CTA (appears as soon as results finish streaming) ── */}
        {!isRunning && results.length > 0 && (
          <div className="cta-block">
            <div>
              <div className="cta-headline">Ready to deploy on Fireworks?</div>
              <div className="cta-sub">
                Same open-weights models, production-grade infra — no GPU ops required.
              </div>
            </div>
            <div className="cta-actions">
              <button className="btn--cta" onClick={downloadResults}>↓ Download results</button>
              <a className="btn--cta-outline" href="https://fireworks.ai" target="_blank" rel="noreferrer">
                Talk to Sales →
              </a>
            </div>
          </div>
        )}

        {/* ── 6. Summary (appears when all rated) ──────────────── */}
        {allRated && results.length > 0 && (
          <div ref={summaryRef}>
            <Card title="Migration summary">
              <div style={{ marginBottom: 24 }}>
                <div className="summary-headline">
                  <span className="highlight">{selectedModel?.name}</span> passed your quality bar on{' '}
                  {goodCount}/{results.length} prompt{results.length > 1 ? 's' : ''} at{' '}
                  <span className="highlight">{overallSavingsPct}% lower cost</span> than Claude Sonnet 4.6
                </div>
                <div className="summary-sub">
                  Confidence-starter — validate with more prompts before ramping prod traffic.
                </div>
              </div>

              <MetricRow
                metrics={[
                  { label: 'Quality match',         value: `${goodCount}/${results.length} Good`,                    hint: 'your rating' },
                  { label: 'Cost savings',           value: `${overallSavingsPct}%`,                                  hint: 'vs Claude Sonnet 4.6' },
                  { label: `${selectedModel?.name}`, value: <span className="tabular">${totalFwCost.toFixed(6)}</span>, hint: `${results.length} prompt${results.length > 1 ? 's' : ''}` },
                  { label: 'Claude Sonnet 4.6',      value: <span className="tabular">${totalClCost.toFixed(6)}</span>, hint: 'same prompts' },
                ]}
              />

              <div style={{ marginTop: 20 }}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUseCase(null); setPrompts(['', '', '']); setVisible(1)
                    setResults([]); setRatings([]); setModel('')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ↑ Test another use case
                </Button>
              </div>
            </Card>
          </div>
        )}

      </main>

      <footer className="app-footer">
        Migration Compass · Fireworks AI · Cost anchor: Claude Sonnet 4.6
      </footer>
    </div>
  )
}
