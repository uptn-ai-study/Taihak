// Yahoo Finance 프록시 코어 로직
// Vercel 서버리스 함수(api/yahoo.js)와 Vite dev 미들웨어가 공유합니다.
// 서버 측에서 호출하므로 CORS 이슈가 없고, User-Agent 헤더로 Yahoo 429를 회피합니다.

const ENDPOINTS = {
  chart: 'https://query1.finance.yahoo.com/v8/finance/chart',
  search: 'https://query2.finance.yahoo.com/v1/finance/search',
}

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * @param {Record<string,string|undefined>} query - 요청 쿼리 파라미터
 * @returns {Promise<{ status: number, body: unknown }>}
 */
export async function fetchYahoo(query) {
  const type = query.type
  let url

  if (type === 'chart') {
    const symbol = query.symbol
    if (!symbol) return { status: 400, body: { error: 'symbol is required' } }
    const period1 = query.period1 ?? '0'
    const period2 = query.period2 ?? String(Math.floor(Date.now() / 1000))
    const interval = query.interval ?? '1d'
    url = `${ENDPOINTS.chart}/${encodeURIComponent(symbol)}` +
      `?period1=${encodeURIComponent(period1)}&period2=${encodeURIComponent(period2)}` +
      `&interval=${encodeURIComponent(interval)}`
  } else if (type === 'search') {
    const q = query.q
    if (!q) return { status: 400, body: { error: 'q is required' } }
    url = `${ENDPOINTS.search}?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`
  } else {
    return { status: 400, body: { error: 'invalid type (expected "chart" or "search")' } }
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json' },
    })
    const text = await res.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      return { status: 502, body: { error: 'invalid upstream response' } }
    }
    return { status: res.ok ? 200 : res.status, body }
  } catch (e) {
    return { status: 502, body: { error: e instanceof Error ? e.message : 'upstream fetch failed' } }
  }
}
