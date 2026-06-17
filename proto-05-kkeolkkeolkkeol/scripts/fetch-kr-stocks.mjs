/**
 * 네이버 금융에서 KOSPI, KOSDAQ, ETF 전체 상장 종목을 가져와
 * src/data/kr-stocks.ts 파일을 자동 생성합니다.
 *
 * 실행: npm run update-stocks
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '../src/data/kr-stocks.ts')

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Referer': 'https://finance.naver.com/',
}

/** 네이버 금융 시가총액 페이지 HTML 파싱으로 KOSPI/KOSDAQ 목록 수집 */
async function scrapeNaverSise(sosok) {
  const marketName = sosok === 0 ? 'KOSPI' : 'KOSDAQ'
  const suffix = sosok === 0 ? 'KS' : 'KQ'
  const seen = new Set()
  const stocks = []
  let page = 1

  while (true) {
    const url = `https://finance.naver.com/sise/sise_market_sum.nhn?sosok=${sosok}&page=${page}`
    const res = await fetch(url, { headers: HEADERS })
    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('euc-kr').decode(buffer)

    // 종목 링크 패턴: /item/main.naver?code=XXXXXX" class="tltle">종목명</a>
    const matches = [...html.matchAll(/main\.naver\?code=(\d{6})" class="tltle">([^<]+)<\/a>/g)]

    let newCount = 0
    for (const [full, code, name] of matches) {
      // 중복 제거 + 빈 이름 제거
      if (!seen.has(code) && name.trim() && !full.includes('etf')) {
        seen.add(code)
        stocks.push({ symbol: `${code}.${suffix}`, name: name.trim(), type: 'kr-stock' })
        newCount++
      }
    }

    process.stdout.write(`\r  ${marketName} 수집 중... ${stocks.length}개 (페이지 ${page})`)

    // 더 이상 새 종목이 없으면 종료
    if (newCount === 0) break
    page++

    // 과도한 요청 방지
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\r  ${marketName}: ${stocks.length}개 완료         `)
  return stocks
}

/** 네이버 금융 ETF 목록 API */
async function fetchNaverEtf() {
  const res = await fetch('https://finance.naver.com/api/sise/etfItemList.nhn', { headers: HEADERS })
  const buffer = await res.arrayBuffer()
  const data = JSON.parse(new TextDecoder('euc-kr').decode(buffer))
  const list = data?.result?.etfItemList ?? []
  return list.map(e => ({
    symbol: `${e.itemcode}.KS`,
    name: e.itemname,
    type: 'kr-stock',
  }))
}

async function main() {
  console.log('네이버 금융에서 종목 데이터를 가져오는 중...\n')

  const [kospi, kosdaq, etf] = await Promise.all([
    scrapeNaverSise(0),
    scrapeNaverSise(1),
    fetchNaverEtf(),
  ])

  console.log(`  ETF: ${etf.length}개`)

  // 심볼 기준 중복 제거 (ETF 코드가 일반 주식 코드와 겹칠 수 있음)
  const all = [...kospi, ...kosdaq, ...etf]
  const unique = Array.from(new Map(all.map(s => [s.symbol, s])).values())
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  console.log(`\n합계: ${unique.length}개 (중복 제거 후)`)

  const ts = `import type { AssetOption } from '../types'

// 자동 생성 파일 — 네이버 금융 기준 상장 종목 (${new Date().toLocaleDateString('ko-KR')} 기준)
// 업데이트: npm run update-stocks

export const KR_STOCKS: AssetOption[] = ${JSON.stringify(unique, null, 2)}

export function searchKrStocks(query: string): AssetOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return KR_STOCKS.filter(
    s => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().replace('.ks', '').replace('.kq', '').includes(q)
  ).slice(0, 10)
}
`

  writeFileSync(OUT_PATH, ts, 'utf-8')
  console.log(`✅ ${OUT_PATH} 저장 완료`)
}

main().catch(e => { console.error('\n❌ 오류:', e.message); process.exit(1) })
