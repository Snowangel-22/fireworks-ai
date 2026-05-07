import { useMemo, useState } from 'react'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Input } from './components/Input'
import { MetricRow } from './components/MetricRow'
import { Select } from './components/Select'
import { useFireworksChat } from './hooks/useFireworksChat'
import { FIREWORKS_MODELS, estimateCost, findModel } from './lib/models'

// This screen is a smoke test for the scaffold. Replace it on assignment day.
// It calls Fireworks via the Vite proxy, streams the answer, and shows
// usage + latency + estimated cost — proving every wired-up piece works.
export default function App() {
  const [model, setModel] = useState(FIREWORKS_MODELS[0]!.id)
  const [prompt, setPrompt] = useState('Explain Fireworks AI in one sentence.')

  const { messages, isStreaming, usage, elapsedMs, error, send, reset } = useFireworksChat({
    settings: { model, temperature: 0.3, maxTokens: 256 },
  })

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant'),
    [messages],
  )

  const cost = usage ? estimateCost(model, usage.promptTokens, usage.completionTokens) : 0
  const modelInfo = findModel(model)

  const modelOptions = FIREWORKS_MODELS.map((m) => ({ value: m.id, label: m.name }))

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Fireworks PM Starter</span>
        <span className="app-tagline">
          Scaffold ready. Replace this screen with your assignment build.
        </span>
      </header>

      <main className="app-main">
        <Card
          title="Smoke test"
          subtitle="Confirms the Fireworks proxy, streaming hook, model catalog, and component set are all wired up."
        >
          <div className="demo-row">
            <Select
              label="Model"
              options={modelOptions}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isStreaming}
            />
            <Input
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isStreaming}
            />
            <Button
              onClick={() => send(prompt)}
              disabled={isStreaming || !prompt.trim()}
            >
              {isStreaming ? 'Streaming…' : 'Send'}
            </Button>
            <Button variant="ghost" onClick={() => reset()} disabled={isStreaming}>
              Reset
            </Button>
          </div>

          {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}

          <div className="demo-message" style={{ marginTop: 16 }}>
            {lastAssistant?.content || (
              <span className="muted">Send a prompt to test the proxy + stream.</span>
            )}
          </div>
        </Card>

        <MetricRow
          metrics={[
            { label: 'Model', value: modelInfo?.name ?? '—', hint: modelInfo?.bestFor },
            {
              label: 'Latency',
              value: <span className="tabular">{elapsedMs ? `${Math.round(elapsedMs)} ms` : '—'}</span>,
              hint: usage ? 'first-byte to last-byte' : undefined,
            },
            {
              label: 'Tokens',
              value: (
                <span className="tabular">
                  {usage ? `${usage.promptTokens} → ${usage.completionTokens}` : '—'}
                </span>
              ),
              hint: usage ? 'in → out' : undefined,
            },
            {
              label: 'Est. cost',
              value: <span className="tabular">{cost ? `$${cost.toFixed(6)}` : '—'}</span>,
              hint: usage ? 'this request' : undefined,
            },
          ]}
        />
      </main>

      <footer className="app-footer">
        Edit <code>src/App.tsx</code> to replace this screen with your assignment build.
      </footer>
    </div>
  )
}
