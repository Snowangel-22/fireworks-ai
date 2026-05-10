// Vercel Edge function — production replacement for the Vite dev proxy.
// Forwards POST /api/fw → Fireworks chat-completions, streaming response back.
// Edge runtime supports native streaming, which matters for SSE chat completions.

export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.FIREWORKS_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'FIREWORKS_API_KEY not configured on the server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const body = await req.text()

  const fwRes = await fetch(
    'https://api.fireworks.ai/inference/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    },
  )

  return new Response(fwRes.body, {
    status: fwRes.status,
    headers: {
      'Content-Type': fwRes.headers.get('Content-Type') ?? 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
