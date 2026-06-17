import type { AssetOption, CalculationResult } from '../types'

const BINANCE_API = 'https://api.binance.com/api/v3'

// CoinGecko ID → Binance base ticker 매핑
const CGID_TO_BINANCE: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'tether': 'USDT',
  'ripple': 'XRP',
  'binancecoin': 'BNB',
  'solana': 'SOL',
  'usd-coin': 'USDC',
  'dogecoin': 'DOGE',
  'cardano': 'ADA',
  'tron': 'TRX',
  'avalanche-2': 'AVAX',
  'chainlink': 'LINK',
  'sui': 'SUI',
  'shiba-inu': 'SHIB',
  'polkadot': 'DOT',
  'bitcoin-cash': 'BCH',
  'hedera-hashgraph': 'HBAR',
  'litecoin': 'LTC',
  'uniswap': 'UNI',
  'pepe': 'PEPE',
  'stellar': 'XLM',
  'near': 'NEAR',
  'aptos': 'APT',
  'ethereum-classic': 'ETC',
  'matic-network': 'MATIC',
  'internet-computer': 'ICP',
  'crypto-com-chain': 'CRO',
  'render-token': 'RENDER',
  'cosmos': 'ATOM',
  'vechain': 'VET',
  'mantle': 'MNT',
  'arbitrum': 'ARB',
  'optimism': 'OP',
  'filecoin': 'FIL',
  'injective-protocol': 'INJ',
  'monero': 'XMR',
  'aave': 'AAVE',
  'algorand': 'ALGO',
  'fantom': 'FTM',
  'eos': 'EOS',
  'maker': 'MKR',
  'ondo-finance': 'ONDO',
  'celestia': 'TIA',
  'the-sandbox': 'SAND',
  'decentraland': 'MANA',
  'axie-infinity': 'AXS',
  'flow': 'FLOW',
  'sei-network': 'SEI',
  'theta-token': 'THETA',
  'blockstack': 'STX',
  'immutable-x': 'IMX',
  'worldcoin-wld': 'WLD',
  'gala': 'GALA',
  'blur': 'BLUR',
  'dydx': 'DYDX',
  'curve-dao-token': 'CRV',
  'havven': 'SNX',
  'compound-governance-token': 'COMP',
  'lido-dao': 'LDO',
  'pancakeswap-token': 'CAKE',
  'elrond-erd-2': 'EGLD',
  'tezos': 'XTZ',
  'iota': 'IOTA',
  'neo': 'NEO',
  'dash': 'DASH',
  'zcash': 'ZEC',
  'basic-attention-token': 'BAT',
  'loopring': 'LRC',
  'storj': 'STORJ',
  'ontology': 'ONT',
  'band-protocol': 'BAND',
  'celo': 'CELO',
  'zilliqa': 'ZIL',
  'harmony': 'ONE',
  'kava': 'KAVA',
  'dai': 'DAI',
  '1inch': '1INCH',
  'the-graph': 'GRT',
  'ocean-protocol': 'OCEAN',
  'livepeer': 'LPT',
  'mask-network': 'MASK',
  'enjincoin': 'ENJ',
  'golem': 'GLM',
  'kyber-network-crystal': 'KNC',
  '0x': 'ZRX',
  'klay-token': 'KLAY',
}

function resolveBinancePair(coinId: string, assetName: string): string {
  // 직접 매핑
  if (CGID_TO_BINANCE[coinId]) {
    const base = CGID_TO_BINANCE[coinId]
    // 스테이블코인은 USDT 기준 무의미 → BTC 페어로 처리
    if (base === 'USDT' || base === 'USDC' || base === 'DAI') return base + 'BTC'
    return base + 'USDT'
  }
  // name에서 추출: "BTC · Bitcoin" → BTC
  const match = assetName.match(/^([A-Z0-9]+)\s*·/)
  if (match) return match[1] + 'USDT'
  return coinId.toUpperCase() + 'USDT'
}

async function getCryptoPrice(
  coinId: string,
  assetName: string,
  date: string,
): Promise<{ buyPrice: number; currentPrice: number; currency: string }> {
  const pair = resolveBinancePair(coinId, assetName)
  const buyTs = new Date(date).getTime()
  // 해당 날짜 포함 +3일 범위 조회 (주말·공휴일 여유분)
  const endTs = buyTs + 86400 * 4 * 1000

  const [histRes, tickerRes] = await Promise.all([
    fetch(`${BINANCE_API}/klines?symbol=${pair}&interval=1d&startTime=${buyTs}&endTime=${endTs}&limit=5`),
    fetch(`${BINANCE_API}/ticker/price?symbol=${pair}`),
  ])

  if (histRes.status === 400 || tickerRes.status === 400) {
    throw new Error(`${pair} 심볼을 Binance에서 찾을 수 없습니다.`)
  }
  if (!histRes.ok || !tickerRes.ok) {
    throw new Error('가격 데이터를 불러오는데 실패했습니다.')
  }

  const klines: string[][] = await histRes.json()
  const ticker = await tickerRes.json()

  if (!klines.length) {
    throw new Error(`${date} 이전의 가격 데이터가 없습니다. 상장일 이후 날짜를 선택해주세요.`)
  }

  const buyPrice = parseFloat(klines[0][4])   // 첫 캔들 종가
  const currentPrice = parseFloat(ticker.price)

  return { buyPrice, currentPrice, currency: 'USD' }
}

async function getYahooPrice(
  symbol: string,
  date: string,
): Promise<{ buyPrice: number; currentPrice: number; currency: string }> {
  const buyTs = Math.floor(new Date(date).getTime() / 1000)
  const nowTs = Math.floor(Date.now() / 1000)
  const url = `/api/yahoo?type=chart&symbol=${encodeURIComponent(symbol)}` +
    `&period1=${buyTs - 86400 * 5}&period2=${nowTs}&interval=1d`
  const res = await fetch(url)
  if (!res.ok) throw new Error('가격 데이터를 불러오는데 실패했습니다.')
  const data = await res.json()
  const chart = data?.chart?.result?.[0]
  if (!chart) throw new Error('가격 데이터를 찾을 수 없습니다.')

  const timestamps: number[] = chart.timestamp ?? []
  const closes: number[] = chart.indicators?.quote?.[0]?.close ?? []
  const currency: string = chart.meta?.currency ?? 'USD'

  let buyIdx = 0
  let minDiff = Infinity
  for (let i = 0; i < timestamps.length; i++) {
    const diff = Math.abs(timestamps[i] - buyTs)
    if (diff < minDiff && closes[i] != null) { minDiff = diff; buyIdx = i }
  }

  let currentIdx = closes.length - 1
  while (currentIdx > 0 && closes[currentIdx] == null) currentIdx--

  return { buyPrice: closes[buyIdx], currentPrice: closes[currentIdx], currency }
}

export async function calculateReturn(
  asset: AssetOption,
  buyDate: string,
  buyAmount: number,
): Promise<CalculationResult> {
  let prices: { buyPrice: number; currentPrice: number; currency: string }

  if (asset.type === 'crypto') {
    prices = await getCryptoPrice(asset.symbol, asset.name, buyDate)
  } else {
    prices = await getYahooPrice(asset.symbol, buyDate)
  }

  const shares = buyAmount / prices.buyPrice
  const currentAmount = shares * prices.currentPrice
  const returnRate = ((currentAmount - buyAmount) / buyAmount) * 100

  return {
    asset,
    buyAmount,
    buyDate,
    buyPrice: prices.buyPrice,
    currentPrice: prices.currentPrice,
    currentAmount,
    returnRate,
    currency: prices.currency,
  }
}
