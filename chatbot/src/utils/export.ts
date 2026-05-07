import type { ChatSession } from '../types'

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

export function exportAsJson(sessions: ChatSession[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    sessions,
  }
  download(JSON.stringify(payload, null, 2), `fw_export_${timestamp()}.json`, 'application/json')
}

export function exportAsText(sessions: ChatSession[]) {
  const lines: string[] = [
    '=== Fireworks AI Chat Export ===',
    `Exported: ${new Date().toUTCString()}`,
    '',
  ]

  for (const session of sessions) {
    lines.push(`--- ${session.title} ---`)
    lines.push(new Date(session.createdAt).toLocaleString())
    lines.push('')
    for (const msg of session.messages) {
      lines.push(`[${msg.role === 'user' ? 'User' : 'Assistant'}]`)
      lines.push(msg.content)
      lines.push('')
    }
    if (session.lastUsage) {
      const u = session.lastUsage
      lines.push(
        `Tokens: ${u.promptTokens} prompt / ${u.completionTokens} completion / ${u.totalTokens} total`,
      )
    }
    lines.push('---')
    lines.push('')
  }

  download(lines.join('\n'), `fw_export_${timestamp()}.txt`, 'text/plain')
}
