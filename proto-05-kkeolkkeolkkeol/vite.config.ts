import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-expect-error - .mjs 파일에 타입 선언이 없습니다
import { fetchYahoo } from './api/_yahoo.mjs'

// "?a=1&b=2" → { a: '1', b: '2' } (node:url/URL 전역 의존 없이 파싱)
function parseQuery(reqUrl: string): Record<string, string> {
  const qs = reqUrl.slice(reqUrl.indexOf('?') + 1)
  const out: Record<string, string> = {}
  for (const pair of qs.split('&')) {
    if (!pair) continue
    const i = pair.indexOf('=')
    const k = decodeURIComponent(i < 0 ? pair : pair.slice(0, i))
    const v = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1))
    out[k] = v
  }
  return out
}

// 로컬 dev에서 Vercel 서버리스 함수(/api/yahoo)를 흉내내는 미들웨어.
// 프로덕션에서는 api/yahoo.js 가 동일 동작을 수행합니다.
function devApiPlugin(): Plugin {
  return {
    name: 'dev-yahoo-api',
    configureServer(server) {
      server.middlewares.use('/api/yahoo', async (req, res) => {
        const query = parseQuery((req as { url?: string }).url ?? '')
        const { status, body } = await fetchYahoo(query)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), devApiPlugin()],
})
