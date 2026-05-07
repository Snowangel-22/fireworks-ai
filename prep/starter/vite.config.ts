import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Proxies /api/fw → Fireworks chat-completions, injecting the API key
// server-side so it never leaves the dev server bundle.
// Pattern lifted from chatbot/vite.config.ts.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/fw': {
          target: 'https://api.fireworks.ai',
          changeOrigin: true,
          rewrite: () => '/inference/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.FIREWORKS_API_KEY}`)
              proxyReq.setHeader('Content-Type', 'application/json')
            })
          },
        },
      },
    },
  }
})
