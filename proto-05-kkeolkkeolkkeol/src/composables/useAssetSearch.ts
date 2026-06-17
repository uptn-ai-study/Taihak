import { ref } from 'vue'
import type { AssetOption, AssetType } from '../types'
import { searchKrStocks } from '../data/kr-stocks'
import { searchUsStockKo, searchCryptoKo, isKorean } from '../data/ko-names'

const COINGECKO_SEARCH = 'https://api.coingecko.com/api/v3/search'

async function searchUsStock(query: string): Promise<AssetOption[]> {
  const url = `/api/yahoo?type=search&q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('미국 주식 검색에 실패했습니다.')
  const data = await res.json()
  const quotes: Record<string, unknown>[] = data?.quotes ?? []
  return quotes
    .filter((q) => ['EQUITY', 'ETF', 'MUTUALFUND'].includes(q['quoteType'] as string) && !(q['symbol'] as string)?.includes('.'))
    .slice(0, 8)
    .map((q) => ({
      symbol: q['symbol'] as string,
      name: (q['shortname'] ?? q['longname'] ?? q['symbol']) as string,
      type: 'us-stock' as AssetType,
    }))
}

async function searchCrypto(query: string): Promise<AssetOption[]> {
  const url = `${COINGECKO_SEARCH}?query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (res.status === 429) throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.')
  if (!res.ok) throw new Error('가상자산 검색에 실패했습니다.')
  const data = await res.json()
  return (data.coins ?? []).slice(0, 8).map((c: { id: string; name: string; symbol: string }) => ({
    symbol: c.id,          // CoinGecko ID — 가격 조회용
    name: `${c.symbol.toUpperCase()} · ${c.name}`,  // 표시: BTC · Bitcoin
    type: 'crypto' as AssetType,
  }))
}

export function useAssetSearch() {
  const results = ref<AssetOption[]>([])
  const loading = ref(false)
  const searchError = ref('')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function search(query: string, type: AssetType) {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!query.trim()) { results.value = []; searchError.value = ''; return }

    // 크립토는 레이트 리밋 방지를 위해 디바운스를 더 길게
    const delay = type === 'crypto' ? 500 : 150

    debounceTimer = setTimeout(async () => {
      loading.value = true
      searchError.value = ''
      try {
        if (type === 'kr-stock') {
          results.value = searchKrStocks(query)
        } else if (type === 'crypto') {
          if (isKorean(query)) {
            results.value = searchCryptoKo(query)
          } else {
            results.value = await searchCrypto(query)
          }
        } else {
          if (isKorean(query)) {
            results.value = searchUsStockKo(query)
          } else {
            results.value = await searchUsStock(query)
          }
        }
      } catch (e) {
        results.value = []
        searchError.value = e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }, delay)
  }

  function clear() { results.value = []; searchError.value = '' }

  return { results, loading, searchError, search, clear }
}
