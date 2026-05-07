import type { ChatSettings } from '../types'
import { AVAILABLE_MODELS } from '../constants'

interface Props {
  settings: ChatSettings
  onChange: (settings: ChatSettings) => void
}

export function SettingsBar({ settings, onChange }: Props) {
  const set = (patch: Partial<ChatSettings>) => onChange({ ...settings, ...patch })

  return (
    <div className="settings-bar">
      <div className="settings-field">
        <label className="settings-label">Model</label>
        <select
          className="settings-select"
          value={settings.model}
          onChange={(e) => set({ model: e.target.value })}
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {m.note}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-field settings-field--inline">
        <label className="settings-label">Temp</label>
        <input
          type="range"
          className="settings-range"
          min={0}
          max={1}
          step={0.05}
          value={settings.temperature}
          onChange={(e) => set({ temperature: parseFloat(e.target.value) })}
        />
        <span className="settings-value">{settings.temperature.toFixed(2)}</span>
      </div>

      <div className="settings-field settings-field--inline">
        <label className="settings-label">Max tokens</label>
        <input
          type="number"
          className="settings-number"
          min={256}
          max={8192}
          step={256}
          value={settings.maxTokens}
          onChange={(e) => set({ maxTokens: Math.max(256, parseInt(e.target.value) || 256) })}
        />
      </div>
    </div>
  )
}
