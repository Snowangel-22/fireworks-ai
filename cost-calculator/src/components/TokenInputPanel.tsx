import type { CalculatorInputs } from '../types'
import { formatLargeNumber } from '../utils/format'

interface Props {
  inputs: CalculatorInputs
  onChange: (next: CalculatorInputs) => void
}

const TOKEN_PRESETS = [1_000, 10_000, 100_000]
const REQUEST_PRESETS = [100, 1_000, 10_000, 100_000]

function formatMonthly(daily: number): string {
  return `${formatLargeNumber(daily * 30)} requests/month`
}

export function TokenInputPanel({ inputs, onChange }: Props) {
  const set = (key: keyof CalculatorInputs) => (val: number) =>
    onChange({ ...inputs, [key]: val })

  const handleChange =
    (key: keyof CalculatorInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(0, parseInt(e.target.value, 10) || 0)
      onChange({ ...inputs, [key]: val })
    }

  return (
    <section className="token-input-panel">
      <div className="token-input-fields">
        <div className="token-input-field">
          <label className="token-input-label" htmlFor="input-tokens">
            Input tokens / request
          </label>
          <input
            id="input-tokens"
            type="number"
            className="token-input-number"
            value={inputs.inputTokensPerRequest}
            min={0}
            onChange={handleChange('inputTokensPerRequest')}
          />
          <div className="token-input-presets">
            {TOKEN_PRESETS.map((p) => (
              <button
                key={p}
                className={`token-preset-btn${inputs.inputTokensPerRequest === p ? ' token-preset-btn--active' : ''}`}
                onClick={() => set('inputTokensPerRequest')(p)}
              >
                {formatLargeNumber(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="token-input-field">
          <label className="token-input-label" htmlFor="output-tokens">
            Output tokens / request
          </label>
          <input
            id="output-tokens"
            type="number"
            className="token-input-number"
            value={inputs.outputTokensPerRequest}
            min={0}
            onChange={handleChange('outputTokensPerRequest')}
          />
          <div className="token-input-presets">
            {TOKEN_PRESETS.map((p) => (
              <button
                key={p}
                className={`token-preset-btn${inputs.outputTokensPerRequest === p ? ' token-preset-btn--active' : ''}`}
                onClick={() => set('outputTokensPerRequest')(p)}
              >
                {formatLargeNumber(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="token-input-field">
          <label className="token-input-label" htmlFor="requests-day">
            Requests / day
          </label>
          <input
            id="requests-day"
            type="number"
            className="token-input-number"
            value={inputs.requestsPerDay}
            min={0}
            onChange={handleChange('requestsPerDay')}
          />
          <div className="token-input-presets">
            {REQUEST_PRESETS.map((p) => (
              <button
                key={p}
                className={`token-preset-btn${inputs.requestsPerDay === p ? ' token-preset-btn--active' : ''}`}
                onClick={() => set('requestsPerDay')(p)}
              >
                {formatLargeNumber(p)}
              </button>
            ))}
          </div>
          <p className="token-input-helper">{formatMonthly(inputs.requestsPerDay)}</p>
        </div>
      </div>
    </section>
  )
}
