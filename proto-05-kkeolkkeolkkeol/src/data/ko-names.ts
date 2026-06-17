import type { AssetOption } from '../types'

// 미국 주식 한국어 별칭 매핑
const US_KO: { ko: string[]; symbol: string; name: string }[] = [
  { ko: ['애플'], symbol: 'AAPL', name: 'Apple Inc.' },
  { ko: ['마이크로소프트', '마소'], symbol: 'MSFT', name: 'Microsoft Corp.' },
  { ko: ['엔비디아', '엔디비아'], symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { ko: ['알파벳', '구글'], symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { ko: ['아마존'], symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { ko: ['메타', '페이스북'], symbol: 'META', name: 'Meta Platforms Inc.' },
  { ko: ['테슬라'], symbol: 'TSLA', name: 'Tesla Inc.' },
  { ko: ['버크셔해서웨이', '버크셔'], symbol: 'BRK-B', name: 'Berkshire Hathaway Inc.' },
  { ko: ['브로드컴'], symbol: 'AVGO', name: 'Broadcom Inc.' },
  { ko: ['TSMC', '티에스엠씨'], symbol: 'TSM', name: 'Taiwan Semiconductor' },
  { ko: ['일라이릴리', '릴리'], symbol: 'LLY', name: 'Eli Lilly and Co.' },
  { ko: ['JP모건', '제이피모건'], symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ko: ['비자'], symbol: 'V', name: 'Visa Inc.' },
  { ko: ['유나이티드헬스', '유헬스'], symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
  { ko: ['엑슨모빌', '엑슨'], symbol: 'XOM', name: 'Exxon Mobil Corp.' },
  { ko: ['마스터카드'], symbol: 'MA', name: 'Mastercard Inc.' },
  { ko: ['존슨앤존슨', 'J&J'], symbol: 'JNJ', name: 'Johnson & Johnson' },
  { ko: ['월마트'], symbol: 'WMT', name: 'Walmart Inc.' },
  { ko: ['오라클'], symbol: 'ORCL', name: 'Oracle Corp.' },
  { ko: ['삼성전자 ADR', '삼성 ADR'], symbol: 'SSNLF', name: 'Samsung Electronics ADR' },
  { ko: ['코스트코'], symbol: 'COST', name: 'Costco Wholesale Corp.' },
  { ko: ['넷플릭스'], symbol: 'NFLX', name: 'Netflix Inc.' },
  { ko: ['AMD', '에이엠디'], symbol: 'AMD', name: 'Advanced Micro Devices' },
  { ko: ['인텔'], symbol: 'INTC', name: 'Intel Corp.' },
  { ko: ['세일즈포스'], symbol: 'CRM', name: 'Salesforce Inc.' },
  { ko: ['어도비'], symbol: 'ADBE', name: 'Adobe Inc.' },
  { ko: ['팔란티어'], symbol: 'PLTR', name: 'Palantir Technologies' },
  { ko: ['코인베이스'], symbol: 'COIN', name: 'Coinbase Global Inc.' },
  { ko: ['스타벅스'], symbol: 'SBUX', name: 'Starbucks Corp.' },
  { ko: ['나이키'], symbol: 'NKE', name: 'Nike Inc.' },
  { ko: ['맥도날드'], symbol: 'MCD', name: "McDonald's Corp." },
  { ko: ['보잉'], symbol: 'BA', name: 'Boeing Co.' },
  { ko: ['캐터필러'], symbol: 'CAT', name: 'Caterpillar Inc.' },
  { ko: ['스퀘어', '블록'], symbol: 'SQ', name: 'Block Inc.' },
  { ko: ['리비안'], symbol: 'RIVN', name: 'Rivian Automotive' },
  { ko: ['루시드'], symbol: 'LCID', name: 'Lucid Group' },
  { ko: ['스냅'], symbol: 'SNAP', name: 'Snap Inc.' },
  { ko: ['우버'], symbol: 'UBER', name: 'Uber Technologies' },
  { ko: ['에어비앤비'], symbol: 'ABNB', name: 'Airbnb Inc.' },
  { ko: ['쇼피파이'], symbol: 'SHOP', name: 'Shopify Inc.' },
  { ko: ['스포티파이'], symbol: 'SPOT', name: 'Spotify Technology' },
  { ko: ['핀터레스트'], symbol: 'PINS', name: 'Pinterest Inc.' },
  { ko: ['로블록스'], symbol: 'RBLX', name: 'Roblox Corp.' },
  { ko: ['모더나'], symbol: 'MRNA', name: 'Moderna Inc.' },
  { ko: ['화이자'], symbol: 'PFE', name: 'Pfizer Inc.' },
  { ko: ['버진갤럭틱'], symbol: 'SPCE', name: 'Virgin Galactic Holdings' },
  { ko: ['스페이스엑스'], symbol: 'SPCE', name: 'Virgin Galactic Holdings' },
  // ETF
  { ko: ['큐큐큐', 'QQQ'], symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { ko: ['TQQQ', '레버리지나스닥'], symbol: 'TQQQ', name: 'ProShares UltraPro QQQ' },
  { ko: ['SQQQ', '인버스나스닥'], symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ' },
  { ko: ['SPY', '에스피와이', 'S&P500ETF'], symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { ko: ['VOO', '뱅가드S&P500'], symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { ko: ['SCHD', '배당ETF'], symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF' },
  { ko: ['VTI', '전미주식'], symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { ko: ['ARKK', '아크이노베이션'], symbol: 'ARKK', name: 'ARK Innovation ETF' },
  { ko: ['GLD', '금ETF'], symbol: 'GLD', name: 'SPDR Gold Shares' },
  { ko: ['SOXL', '반도체레버리지'], symbol: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3X ETF' },
]

// 가상자산 한국어 별칭 매핑 (시가총액 상위 100개 기준)
const CRYPTO_KO: { ko: string[]; symbol: string; name: string }[] = [
  // Top 10
  { ko: ['비트코인'], symbol: 'bitcoin', name: 'BTC · Bitcoin' },
  { ko: ['이더리움', '이더'], symbol: 'ethereum', name: 'ETH · Ethereum' },
  { ko: ['테더'], symbol: 'tether', name: 'USDT · Tether' },
  { ko: ['리플', '엑스알피'], symbol: 'ripple', name: 'XRP · XRP' },
  { ko: ['바이낸스코인', '비엔비'], symbol: 'binancecoin', name: 'BNB · BNB' },
  { ko: ['솔라나'], symbol: 'solana', name: 'SOL · Solana' },
  { ko: ['유에스디코인', 'USDC코인'], symbol: 'usd-coin', name: 'USDC · USD Coin' },
  { ko: ['도지코인', '도지'], symbol: 'dogecoin', name: 'DOGE · Dogecoin' },
  { ko: ['에이다', '카르다노'], symbol: 'cardano', name: 'ADA · Cardano' },
  { ko: ['트론'], symbol: 'tron', name: 'TRX · TRON' },
  // 11~20
  { ko: ['아발란체'], symbol: 'avalanche-2', name: 'AVAX · Avalanche' },
  { ko: ['체인링크', '링크'], symbol: 'chainlink', name: 'LINK · Chainlink' },
  { ko: ['수이'], symbol: 'sui', name: 'SUI · Sui' },
  { ko: ['시바이누', '시바'], symbol: 'shiba-inu', name: 'SHIB · Shiba Inu' },
  { ko: ['폴카닷'], symbol: 'polkadot', name: 'DOT · Polkadot' },
  { ko: ['비트코인캐시'], symbol: 'bitcoin-cash', name: 'BCH · Bitcoin Cash' },
  { ko: ['헤데라', '헤바'], symbol: 'hedera-hashgraph', name: 'HBAR · Hedera' },
  { ko: ['라이트코인'], symbol: 'litecoin', name: 'LTC · Litecoin' },
  { ko: ['유니스왑'], symbol: 'uniswap', name: 'UNI · Uniswap' },
  { ko: ['하이퍼리퀴드'], symbol: 'hyperliquid', name: 'HYPE · Hyperliquid' },
  // 21~30
  { ko: ['페페'], symbol: 'pepe', name: 'PEPE · Pepe' },
  { ko: ['스텔라', '스텔라루멘'], symbol: 'stellar', name: 'XLM · Stellar' },
  { ko: ['니어', '니어프로토콜'], symbol: 'near', name: 'NEAR · NEAR Protocol' },
  { ko: ['앱토스'], symbol: 'aptos', name: 'APT · Aptos' },
  { ko: ['이더리움클래식', '이더클래식'], symbol: 'ethereum-classic', name: 'ETC · Ethereum Classic' },
  { ko: ['폴리곤', '매틱'], symbol: 'matic-network', name: 'POL · Polygon' },
  { ko: ['인터넷컴퓨터', 'ICP'], symbol: 'internet-computer', name: 'ICP · Internet Computer' },
  { ko: ['크로노스', '크로'], symbol: 'crypto-com-chain', name: 'CRO · Cronos' },
  { ko: ['렌더', '렌더토큰'], symbol: 'render-token', name: 'RENDER · Render' },
  { ko: ['코스모스', '아톰'], symbol: 'cosmos', name: 'ATOM · Cosmos' },
  // 31~40
  { ko: ['비체인', '베체인'], symbol: 'vechain', name: 'VET · VeChain' },
  { ko: ['만틀'], symbol: 'mantle', name: 'MNT · Mantle' },
  { ko: ['아비트럼'], symbol: 'arbitrum', name: 'ARB · Arbitrum' },
  { ko: ['옵티미즘'], symbol: 'optimism', name: 'OP · Optimism' },
  { ko: ['파일코인'], symbol: 'filecoin', name: 'FIL · Filecoin' },
  { ko: ['인젝티브'], symbol: 'injective-protocol', name: 'INJ · Injective' },
  { ko: ['모네로'], symbol: 'monero', name: 'XMR · Monero' },
  { ko: ['에이브'], symbol: 'aave', name: 'AAVE · Aave' },
  { ko: ['알고랜드'], symbol: 'algorand', name: 'ALGO · Algorand' },
  { ko: ['팬텀', '판텀'], symbol: 'fantom', name: 'FTM · Fantom' },
  // 41~50
  { ko: ['이오스'], symbol: 'eos', name: 'EOS · EOS' },
  { ko: ['메이커', '메이커다오'], symbol: 'maker', name: 'MKR · Maker' },
  { ko: ['온도'], symbol: 'ondo-finance', name: 'ONDO · Ondo' },
  { ko: ['셀레스티아'], symbol: 'celestia', name: 'TIA · Celestia' },
  { ko: ['샌드박스'], symbol: 'the-sandbox', name: 'SAND · The Sandbox' },
  { ko: ['디센트럴랜드'], symbol: 'decentraland', name: 'MANA · Decentraland' },
  { ko: ['엑시인피니티', '엑시'], symbol: 'axie-infinity', name: 'AXS · Axie Infinity' },
  { ko: ['플로우'], symbol: 'flow', name: 'FLOW · Flow' },
  { ko: ['세이'], symbol: 'sei-network', name: 'SEI · Sei' },
  { ko: ['세타', '세타네트워크'], symbol: 'theta-token', name: 'THETA · Theta Network' },
  // 51~60
  { ko: ['스택스'], symbol: 'blockstack', name: 'STX · Stacks' },
  { ko: ['이뮤터블', 'IMX'], symbol: 'immutable-x', name: 'IMX · Immutable' },
  { ko: ['월드코인'], symbol: 'worldcoin-wld', name: 'WLD · Worldcoin' },
  { ko: ['갈라', '갈라게임즈'], symbol: 'gala', name: 'GALA · Gala' },
  { ko: ['블러'], symbol: 'blur', name: 'BLUR · Blur' },
  { ko: ['디와이디엑스', 'dydx'], symbol: 'dydx', name: 'DYDX · dYdX' },
  { ko: ['커브', '커브파이낸스'], symbol: 'curve-dao-token', name: 'CRV · Curve DAO' },
  { ko: ['신세틱스'], symbol: 'havven', name: 'SNX · Synthetix' },
  { ko: ['컴파운드'], symbol: 'compound-governance-token', name: 'COMP · Compound' },
  { ko: ['리도', '리도다오'], symbol: 'lido-dao', name: 'LDO · Lido DAO' },
  // 61~70
  { ko: ['팬케이크스왑'], symbol: 'pancakeswap-token', name: 'CAKE · PancakeSwap' },
  { ko: ['게이트토큰'], symbol: 'gate', name: 'GT · Gate' },
  { ko: ['오케이비', 'OKB'], symbol: 'okb', name: 'OKB · OKB' },
  { ko: ['멀티버스엑스', '엘론드'], symbol: 'elrond-erd-2', name: 'EGLD · MultiversX' },
  { ko: ['텍조스'], symbol: 'tezos', name: 'XTZ · Tezos' },
  { ko: ['이오타'], symbol: 'iota', name: 'MIOTA · IOTA' },
  { ko: ['네오'], symbol: 'neo', name: 'NEO · NEO' },
  { ko: ['대시'], symbol: 'dash', name: 'DASH · Dash' },
  { ko: ['지캐시'], symbol: 'zcash', name: 'ZEC · Zcash' },
  { ko: ['베이직어텐션토큰', 'BAT'], symbol: 'basic-attention-token', name: 'BAT · Basic Attention Token' },
  // 71~80
  { ko: ['루프링'], symbol: 'loopring', name: 'LRC · Loopring' },
  { ko: ['스토리지', '스토리지코인'], symbol: 'storj', name: 'STORJ · Storj' },
  { ko: ['온톨로지'], symbol: 'ontology', name: 'ONT · Ontology' },
  { ko: ['밴드프로토콜', '밴드'], symbol: 'band-protocol', name: 'BAND · Band Protocol' },
  { ko: ['셀로'], symbol: 'celo', name: 'CELO · Celo' },
  { ko: ['질리카'], symbol: 'zilliqa', name: 'ZIL · Zilliqa' },
  { ko: ['하모니'], symbol: 'harmony', name: 'ONE · Harmony' },
  { ko: ['카바'], symbol: 'kava', name: 'KAVA · Kava' },
  { ko: ['스카이', '다이'], symbol: 'dai', name: 'DAI · Dai' },
  { ko: ['프랙스'], symbol: 'frax', name: 'FRAX · Frax' },
  // 81~90
  { ko: ['디파이체인'], symbol: 'defichain', name: 'DFI · DeFiChain' },
  { ko: ['로켓풀'], symbol: 'rocket-pool', name: 'RPL · Rocket Pool' },
  { ko: ['오리온프로토콜'], symbol: 'orion-protocol', name: 'ORN · Orion Protocol' },
  { ko: ['1인치', '원인치'], symbol: '1inch', name: '1INCH · 1inch' },
  { ko: ['그래프', '더그래프'], symbol: 'the-graph', name: 'GRT · The Graph' },
  { ko: ['앵커프로토콜'], symbol: 'anchor-protocol', name: 'ANC · Anchor Protocol' },
  { ko: ['오션프로토콜'], symbol: 'ocean-protocol', name: 'OCEAN · Ocean Protocol' },
  { ko: ['누사이퍼'], symbol: 'nucypher', name: 'NU · NuCypher' },
  { ko: ['스와이프'], symbol: 'swipe', name: 'SXP · Swipe' },
  { ko: ['라이브피어'], symbol: 'livepeer', name: 'LPT · Livepeer' },
  // 91~100
  { ko: ['아이엑스에스', 'IXS'], symbol: 'ix-swap', name: 'IXS · IX Swap' },
  { ko: ['마스크네트워크', '마스크'], symbol: 'mask-network', name: 'MASK · Mask Network' },
  { ko: ['엔진코인', '엔진'], symbol: 'enjincoin', name: 'ENJ · Enjin Coin' },
  { ko: ['골렘'], symbol: 'golem', name: 'GLM · Golem' },
  { ko: ['오거', '어거'], symbol: 'augur', name: 'REP · Augur' },
  { ko: ['카이버네트워크', '카이버'], symbol: 'kyber-network-crystal', name: 'KNC · Kyber Network' },
  { ko: ['제로엑스', '0x'], symbol: '0x', name: 'ZRX · 0x' },
  { ko: ['파이네트워크', '파이'], symbol: 'pi-network', name: 'PI · Pi Network' },
  { ko: ['클레이튼'], symbol: 'klay-token', name: 'KLAY · Klaytn' },
  { ko: ['위믹스'], symbol: 'wemix-token', name: 'WEMIX · WEMIX' },
]

function matchKo(query: string, aliases: string[]): boolean {
  const q = query.trim().toLowerCase()
  return aliases.some(alias => alias.toLowerCase().includes(q))
}

export function searchUsStockKo(query: string): AssetOption[] {
  if (!query.trim()) return []
  return US_KO
    .filter(item => matchKo(query, item.ko))
    .slice(0, 5)
    .map(item => ({ symbol: item.symbol, name: item.name, type: 'us-stock' as const }))
}

export function searchCryptoKo(query: string): AssetOption[] {
  if (!query.trim()) return []
  return CRYPTO_KO
    .filter(item => matchKo(query, item.ko))
    .slice(0, 5)
    .map(item => ({ symbol: item.symbol, name: item.name, type: 'crypto' as const }))
}

export function isKorean(query: string): boolean {
  return /[가-힣]/.test(query)
}
