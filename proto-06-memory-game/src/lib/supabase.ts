import { createClient } from '@supabase/supabase-js'
import type { RankingEntry } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function saveRanking(nickname: string, stage: number): Promise<void> {
  if (!supabase) return
  await supabase.from('memory_rankings').insert({ nickname, stage })
}

function dedupeByNickname(entries: RankingEntry[], limit: number): RankingEntry[] {
  const seen = new Map<string, RankingEntry>()
  for (const e of entries) {
    const prev = seen.get(e.nickname)
    if (!prev || e.stage > prev.stage || (e.stage === prev.stage && e.achieved_at < prev.achieved_at)) {
      seen.set(e.nickname, e)
    }
  }
  return [...seen.values()]
    .sort((a, b) => b.stage - a.stage || a.achieved_at.localeCompare(b.achieved_at))
    .slice(0, limit)
}

export async function fetchAllTimeRanking(limit = 50): Promise<RankingEntry[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('memory_rankings')
    .select('*')
    .order('stage', { ascending: false })
    .order('achieved_at', { ascending: true })
    .limit(limit * 10)
  return dedupeByNickname((data as RankingEntry[]) ?? [], limit)
}

export async function fetchTodayRanking(limit = 50): Promise<RankingEntry[]> {
  if (!supabase) return []
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { data } = await supabase
    .from('memory_rankings')
    .select('*')
    .gte('achieved_at', todayStart.toISOString())
    .order('stage', { ascending: false })
    .order('achieved_at', { ascending: true })
    .limit(limit * 10)
  return dedupeByNickname((data as RankingEntry[]) ?? [], limit)
}

export async function fetchMyRanking(nickname: string): Promise<RankingEntry[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('memory_rankings')
    .select('*')
    .eq('nickname', nickname)
    .order('stage', { ascending: false })
    .order('achieved_at', { ascending: true })
    .limit(20)
  return (data as RankingEntry[]) ?? []
}
