import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Select } from './components/Select'
import { MetricRow } from './components/MetricRow'
import { chatStream } from './lib/fireworksClient'
import { claudeStream } from './lib/anthropicClient'
import { estimateCost, findModel, FIREWORKS_MODELS } from './lib/models'
import { recommend, aiRecommend } from './lib/recommend'
import { totalSavingsPct, savingsPct as pctSaved } from './lib/costComparison'
import type { TaskTag, Rating, PromptResult, ReRec } from './types'

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

// ── Collapsible section shell ──────────────────────────────────────
function CollapsibleSection({
  title, subtitle, summary, collapsed, onToggle, extraActions, children,
}: {
  title: string
  subtitle?: string
  summary: string
  collapsed: boolean
  onToggle: () => void
  extraActions?: ReactNode
  children: ReactNode
}) {
  if (collapsed) {
    return (
      <button className="section-pill" onClick={onToggle}>
        <span className="section-pill-title">{title}</span>
        <span className="section-pill-sep">·</span>
        <span className="section-pill-summary">{summary}</span>
        <span className="section-pill-arrow">▶</span>
      </button>
    )
  }
  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {extraActions}
          <button className="section-collapse-btn" onClick={onToggle} title="Collapse">▲</button>
        </div>
      }
    >
      {children}
    </Card>
  )
}

export default function App() {
  const [useCase, setUseCase]       = useState<TaskTag | null>(null)
  const [prompts, setPrompts]       = useState(['', '', ''])
  const [visiblePrompts, setVisible]= useState(1)
  const [selectedModelId, setModel] = useState('')
  const [results, setResults]       = useState<PromptResult[]>([])
  const [ratings, setRatings]       = useState<Rating[]>([])
  const [isRunning, setIsRunning]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  // Feedback loop state
  const [reasonDrafts,  setReasonDrafts]  = useState<string[]>([])
  const [ratingReasons, setRatingReasons] = useState<(string | null)[]>([])
  const [reRecs,        setReRecs]        = useState<(ReRec | null)[]>([])

  // Collapsible state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setCollapsed(p => ({ ...p, [key]: !p[key] }))

  const recs          = useCase ? recommend(useCase) : []
  const activePrompts = prompts.slice(0, visiblePrompts).filter(p => p.trim())
  const canRun        = activePrompts.length > 0 && !!selectedModelId && !isRunning
  const allRated      = !isRunning && ratings.length > 0 && ratings.every(r => r !== null)

  const recsRef    = useScrollIntoView(!!useCase)
  const resultsRef = useScrollIntoView(results.length > 0)
  const summaryRef = useScrollIntoView(allRated && results.length > 0)

  // Auto-collapse completed sections when results arrive
  useEffect(() => {
    if (results.length > 0 && !isRunning) {
      setCollapsed(prev => ({ ...prev, usecase: true, recs: true, prompts: true }))
    }
  }, [results.length, isRunning])

  function handleUseCaseSelect(tag: TaskTag) {
    setUseCase(tag)
    setModel(recommend(tag)[0]?.model.id ?? '')
    setResults([])
    setRatings([])
    setReasonDrafts([])
    setRatingReasons([])
    setReRecs([])
    setCollapsed({})
  }

  async function runTest() {
    setIsRunning(true)
    setError(null)
    setResults([])
    setRatings([])
    setReasonDrafts([])
    setRatingReasons([])
    setReRecs([])

    for (let i = 0; i < activePrompts.length; i++) {
      const prompt = activePrompts[i]
      setResults(prev => [...prev, EMPTY_RESULT(prompt)])
      setRatings(prev => [...prev, null])
      setReasonDrafts(prev => [...prev, ''])
      setRatingReasons(prev => [...prev, null])
      setReRecs(prev => [...prev, null])

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
            fwOutput:        fwRes.content,
            fwUsage:         fwRes.usage,
            fwElapsedMs:     fwRes.elapsedMs,
            fwCostUsd:       estimateCost(selectedModelId, fwRes.usage?.promptTokens ?? 0, fwRes.usage?.completionTokens ?? 0),
            claudeOutput:    clRes.content,
            claudeUsage:     clRes.usage,
            claudeElapsedMs: clRes.elapsedMs,
            claudeCostUsd:   estimateCost('claude-sonnet-4-6', clRes.usage?.promptTokens ?? 0, clRes.usage?.completionTokens ?? 0),
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

  async function handleSubmitFeedback(i: number) {
    const reason = reasonDrafts[i]?.trim()
    if (!reason || !useCase) return

    setRatingReasons(prev => prev.map((r, idx) => idx === i ? reason : r))
    setReRecs(prev => prev.map((r, idx) => idx === i ? { loading: true } : r))

    const rec = await aiRecommend({
      useCase,
      currentModelId: selectedModelId,
      prompt: results[i].prompt,
      output: results[i].fwOutput,
      reason,
    })

    if (rec) {
      const model = findModel(rec.modelId)
      setReRecs(prev => prev.map((r, idx) =>
        idx === i
          ? { loading: false, modelId: rec.modelId, modelName: model?.name ?? rec.modelId, rationale: rec.rationale }
          : r
      ))
    } else {
      setReRecs(prev => prev.map((r, idx) => idx === i ? { loading: false } : r))
    }
  }

  async function handleReRun(i: number) {
    const rec = reRecs[i]
    if (!rec?.modelId) return

    setReRecs(prev => prev.map((r, idx) =>
      idx === i ? { ...rec, reRunStarted: true, reRunOutput: '', reRunStreaming: true } : r
    ))

    try {
      const fwRes = await chatStream(
        { model: rec.modelId, messages: [{ role: 'user', content: results[i].prompt }], maxTokens: 512, temperature: 0.3 },
        token => setReRecs(prev => prev.map((r, idx) =>
          idx === i && r ? { ...r, reRunOutput: (r.reRunOutput ?? '') + token } : r
        )),
      )
      setReRecs(prev => prev.map((r, idx) =>
        idx === i && r
          ? {
              ...r,
              reRunOutput:    fwRes.content,
              reRunElapsedMs: fwRes.elapsedMs,
              reRunCostUsd:   estimateCost(rec.modelId!, fwRes.usage?.promptTokens ?? 0, fwRes.usage?.completionTokens ?? 0),
              reRunStreaming:  false,
              reRunUsage:     fwRes.usage,
            }
          : r
      ))
    } catch (e) {
      const msg = (e as Error).message
      setReRecs(prev => prev.map((r, idx) =>
        idx === i && r ? { ...r, reRunStreaming: false, reRunError: msg } : r
      ))
    }
  }

  function downloadResults() {
    const payload = {
      exportedAt: new Date().toISOString(),
      useCase,
      fireworksModel: selectedModel?.name,
      fireworksModelId: selectedModelId,
      results: results.map((r, i) => ({
        prompt: r.prompt,
        rating: ratings[i] ?? 'unrated',
        feedbackReason: ratingReasons[i] ?? null,
        alternativeRecommended: reRecs[i]?.modelId ?? null,
        fireworks: { output: r.fwOutput, latencyMs: Math.round(r.fwElapsedMs), inputTokens: r.fwUsage?.promptTokens, outputTokens: r.fwUsage?.completionTokens, costUsd: r.fwCostUsd },
        claude:    { output: r.claudeOutput, latencyMs: Math.round(r.claudeElapsedMs), inputTokens: r.claudeUsage?.promptTokens, outputTokens: r.claudeUsage?.completionTokens, costUsd: r.claudeCostUsd },
        savingsPct: pctSaved(r.fwCostUsd, r.claudeCostUsd),
      })),
      summary: { goodRatings: goodCount, totalPrompts: results.length, costSavingsPct: overallSavingsPct, fireworksTotalCostUsd: totalFwCost, claudeTotalCostUsd: totalClCost },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `migration-compass-${useCase ?? 'results'}-${new Date().toISOString().slice(0, 10)}.json` })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedModel     = findModel(selectedModelId)
  const goodCount         = ratings.filter(r => r === 'good').length
  const overallSavingsPct = results.length && !isRunning ? totalSavingsPct(results) : 0
  const totalFwCost       = results.reduce((s, r) => s + r.fwCostUsd, 0)
  const totalClCost       = results.reduce((s, r) => s + r.claudeCostUsd, 0)

  const usecaseSummary = USE_CASES.find(u => u.tag === useCase)?.label ?? '—'
  const recsSummary    = selectedModel?.name ? `${selectedModel.name} selected` : '—'
  const promptsSummary = `${activePrompts.length} prompt${activePrompts.length !== 1 ? 's' : ''}`

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Migration Compass</span>
        <span className="app-tagline">Find your Fireworks open-source replacement — with real output comparison</span>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {/* ── 1. Use case ─────────────────────────────────────── */}
        <CollapsibleSection
          title="What are you building?"
          subtitle="Pick your primary workload to get matched models"
          summary={usecaseSummary}
          collapsed={!!collapsed.usecase}
          onToggle={() => toggle('usecase')}
        >
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
        </CollapsibleSection>

        {/* ── 2. Recommendations + model picker ───────────────── */}
        {useCase && (
          <div ref={recsRef}>
            <CollapsibleSection
              title={`Top Fireworks models for ${usecaseSummary}`}
              subtitle="Click a card to select. Ranked for your use case — open-weights, no vendor lock-in."
              summary={recsSummary}
              collapsed={!!collapsed.recs}
              onToggle={() => toggle('recs')}
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
            </CollapsibleSection>
          </div>
        )}

        {/* ── 3. Prompts + run ────────────────────────────────── */}
        {useCase && (
          <CollapsibleSection
            title="Paste your real prompts"
            subtitle="1–3 examples from your actual workload. Runs against both Fireworks and Claude Sonnet 4.6."
            summary={promptsSummary}
            collapsed={!!collapsed.prompts}
            onToggle={() => toggle('prompts')}
          >
            <div className="prompt-stack">
              {Array.from({ length: visiblePrompts }).map((_, i) => (
                <div key={i} className="field">
                  <label className="field-label">{visiblePrompts > 1 ? `Prompt ${i + 1}` : 'Prompt'}</label>
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

            <div style={{ marginTop: 20 }}>
              <Button onClick={runTest} disabled={!canRun}>
                {isRunning
                  ? 'Running both models…'
                  : `Run test${activePrompts.length > 1 ? ` (${activePrompts.length} prompts)` : ''}`}
              </Button>
            </div>
          </CollapsibleSection>
        )}

        {/* ── 4. Side-by-side results ──────────────────────────── */}
        {results.length > 0 && (
          <div ref={resultsRef}>
            <CollapsibleSection
              title="Results"
              subtitle={isRunning ? 'Streaming…' : `Rate ${selectedModel?.name} — does it match your quality bar?`}
              summary={`${results.length} prompt${results.length !== 1 ? 's' : ''} · ${overallSavingsPct}% cheaper than Claude`}
              collapsed={!!collapsed.results}
              onToggle={() => toggle('results')}
              extraActions={
                !isRunning
                  ? <button className="btn btn--ghost" style={{ fontSize: 12 }} onClick={downloadResults}>↓ JSON</button>
                  : undefined
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {results.map((r, i) => {
                  const done       = r.fwElapsedMs > 0
                  const streaming  = isRunning && !done
                  const rec        = reRecs[i] ?? null
                  const isCollapsed = results.length > 1 && !!collapsed[`result-${i}`]
                  const ratingLabel = ratings[i] === 'good' ? '✓ Good' : ratings[i] === 'partial' ? '~ Partial' : ratings[i] === 'no' ? '✗ Missed' : null
                  const snippet     = r.prompt.length > 72 ? r.prompt.slice(0, 72) + '…' : r.prompt

                  if (isCollapsed) {
                    return (
                      <button
                        key={i}
                        className="result-pill"
                        onClick={() => toggle(`result-${i}`)}
                      >
                        <span className="result-pill-idx">#{i + 1}</span>
                        <span className="result-pill-prompt">{snippet}</span>
                        {ratingLabel && (
                          <span className={`result-pill-rating result-pill-rating--${ratings[i]}`}>{ratingLabel}</span>
                        )}
                        {done && r.claudeCostUsd > 0 && (
                          <span className="result-pill-savings">{pctSaved(r.fwCostUsd, r.claudeCostUsd)}% cheaper</span>
                        )}
                        <span className="section-pill-arrow">▶</span>
                      </button>
                    )
                  }

                  return (
                    <div key={i} className={`prompt-result ${ratings[i] ? `rated-${ratings[i]}` : ''}`}>
                      <div className="prompt-result-input">
                        <span>{results.length > 1 ? `Prompt ${i + 1}: ` : 'Prompt: '}{r.prompt}</span>
                        {results.length > 1 && done && (
                          <button className="result-collapse-btn" onClick={() => toggle(`result-${i}`)}>▲</button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        {/* Fireworks */}
                        <div style={{ borderRight: '1px solid var(--border)' }}>
                          <div className="prompt-result-header fw-header">{selectedModel?.name}</div>
                          <div className={`prompt-result-output${streaming ? ' is-streaming' : ''}`}>{r.fwOutput}</div>
                          {done && (
                            <div className="result-stats">
                              <div className="result-stat">
                                <span className="result-stat-label">Latency</span>
                                <span className="result-stat-value">{Math.round(r.fwElapsedMs).toLocaleString()} ms</span>
                              </div>
                              <div className="result-stat">
                                <span className="result-stat-label">Tokens</span>
                                <span className="result-stat-value">{r.fwUsage ? `${r.fwUsage.promptTokens}+${r.fwUsage.completionTokens}` : '—'}</span>
                              </div>
                              <div className="result-stat result-stat--green">
                                <span className="result-stat-label">Cost</span>
                                <span className="result-stat-value">${r.fwCostUsd.toFixed(6)}</span>
                                {r.claudeCostUsd > 0 && <span className="result-stat-savings">{pctSaved(r.fwCostUsd, r.claudeCostUsd)}% less</span>}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Claude */}
                        <div>
                          <div className="prompt-result-header">Claude Sonnet 4.6</div>
                          <div className={`prompt-result-output${streaming ? ' is-streaming' : ''}`}>{r.claudeOutput}</div>
                          {done && (
                            <div className="result-stats">
                              <div className="result-stat">
                                <span className="result-stat-label">Latency</span>
                                <span className="result-stat-value">{Math.round(r.claudeElapsedMs).toLocaleString()} ms</span>
                              </div>
                              <div className="result-stat">
                                <span className="result-stat-label">Tokens</span>
                                <span className="result-stat-value">{r.claudeUsage ? `${r.claudeUsage.promptTokens}+${r.claudeUsage.completionTokens}` : '—'}</span>
                              </div>
                              <div className="result-stat">
                                <span className="result-stat-label">Cost</span>
                                <span className="result-stat-value">${r.claudeCostUsd.toFixed(6)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── Rating CTA ─────────────────────────── */}
                      {done && (
                        <div className={`rating-cta ${ratings[i] ? `rated-${ratings[i]}` : ''}`}>
                          <div className="rating-cta-label">
                            How well did <strong>{selectedModel?.name}</strong> match your quality bar?
                          </div>
                          <div className="rating-cta-btns">
                            {(['good', 'partial', 'no'] as const).map(val => (
                              <button
                                key={val}
                                className={`rating-cta-btn rating-cta-btn--${val}${ratings[i] === val ? ' active' : ''}`}
                                onClick={() => {
                                  setRatings(prev => prev.map((v, idx) => idx === i ? val : v))
                                  if (val === 'good') {
                                    setRatingReasons(prev => prev.map((r, idx) => idx === i ? null : r))
                                    setReRecs(prev => prev.map((r, idx) => idx === i ? null : r))
                                  }
                                }}
                              >
                                {val === 'good' ? '✓ Looks Good' : val === 'partial' ? '~ Partially' : '✗ Missed It'}
                              </button>
                            ))}
                          </div>

                          {/* Feedback form — shown after Partial / No, before reason submitted */}
                          {(ratings[i] === 'partial' || ratings[i] === 'no') && !ratingReasons[i] && (
                            <div className="feedback-form">
                              <div className="feedback-form-label">
                                What was missing or wrong?{' '}
                                <span style={{ color: 'var(--text-subtle)' }}>helps us find a better model</span>
                              </div>
                              <textarea
                                className="prompt-textarea"
                                style={{ minHeight: 56 }}
                                placeholder='e.g. "Too verbose" or "Missed the key point" or "Wrong language"'
                                value={reasonDrafts[i] ?? ''}
                                onChange={e => setReasonDrafts(prev => prev.map((d, idx) => idx === i ? e.target.value : d))}
                              />
                              <div>
                                <Button
                                  disabled={!(reasonDrafts[i]?.trim())}
                                  onClick={() => handleSubmitFeedback(i)}
                                >
                                  Find a better model →
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Re-rec loading */}
                          {rec?.loading && (
                            <div className="rerec-card rerec-loading">Analyzing feedback…</div>
                          )}

                          {/* Re-rec result — no modelId means AI failed */}
                          {rec && !rec.loading && !rec.modelId && ratingReasons[i] && (
                            <div className="rerec-card rerec-loading">
                              Couldn't find a clear alternative — try adjusting your feedback.
                            </div>
                          )}

                          {/* Re-rec with model */}
                          {rec && !rec.loading && rec.modelId && (
                            <div className="rerec-card">
                              <div className="rerec-header">Try instead</div>
                              <div className="rerec-model">{rec.modelName}</div>
                              <div className="rerec-rationale">{rec.rationale}</div>

                              {!rec.reRunStarted && (
                                <Button onClick={() => handleReRun(i)}>
                                  ▶ Re-run with {rec.modelName}
                                </Button>
                              )}

                              {rec.reRunStarted && (
                                <div className="rerun-result">
                                  <div className="rerun-result-header">{rec.modelName} (re-run)</div>
                                  {rec.reRunError ? (
                                    <div className="error-banner" style={{ margin: '10px 14px' }}>
                                      {rec.reRunError}
                                    </div>
                                  ) : (
                                    <div className={`prompt-result-output${rec.reRunStreaming ? ' is-streaming' : ''}`}>
                                      {rec.reRunOutput}
                                    </div>
                                  )}
                                  {!rec.reRunStreaming && !rec.reRunError && rec.reRunElapsedMs !== undefined && (
                                    <div className="result-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                      <div className="result-stat">
                                        <span className="result-stat-label">Latency</span>
                                        <span className="result-stat-value">{Math.round(rec.reRunElapsedMs).toLocaleString()} ms</span>
                                      </div>
                                      <div className="result-stat result-stat--green">
                                        <span className="result-stat-label">Cost</span>
                                        <span className="result-stat-value">${rec.reRunCostUsd?.toFixed(6)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* ── 5. CTA (appears as soon as results finish) ───────── */}
        {!isRunning && results.length > 0 && (
          <div className="cta-block">
            <div>
              <div className="cta-headline">Ready to deploy on Fireworks?</div>
              <div className="cta-sub">Same open-weights models, production-grade infra — no GPU ops required.</div>
            </div>
            <div className="cta-actions">
              <button className="btn--cta" onClick={downloadResults}>↓ Download results</button>
              <a className="btn--cta-outline" href="https://fireworks.ai" target="_blank" rel="noreferrer">Talk to Sales →</a>
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
                <div className="summary-sub">Confidence-starter — validate with more prompts before ramping prod traffic.</div>
              </div>

              <MetricRow
                metrics={[
                  { label: 'Quality match',         value: `${goodCount}/${results.length} Good`,                     hint: 'your rating' },
                  { label: 'Cost savings',           value: `${overallSavingsPct}%`,                                   hint: 'vs Claude Sonnet 4.6' },
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
                    setReasonDrafts([]); setRatingReasons([]); setReRecs([])
                    setCollapsed({})
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
