// Vercel 서버리스 함수: GET /api/yahoo?type=chart&symbol=AAPL&period1=...&period2=...
//                       GET /api/yahoo?type=search&q=AAPL
// 동일 출처(same-origin)로 호출되므로 CORS 이슈가 없습니다.
import { fetchYahoo } from './_yahoo.mjs'

export default async function handler(req, res) {
  const { status, body } = await fetchYahoo(req.query ?? {})
  // 가격 데이터는 변동성이 낮아 짧게 캐싱 (CDN 60초, stale 5분)
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(status).json(body)
}
