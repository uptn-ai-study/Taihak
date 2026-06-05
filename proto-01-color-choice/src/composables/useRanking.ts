import { ref } from 'vue'
import type { Difficulty, RankingEntry, Tier } from '../types/game'
import { supabase } from '../utils/supabase'

/**
 * 랭킹 저장소 - Supabase 연동
 *
 * DB 테이블: rankings
 * 조회: play_date + difficulty 기준 일간 랭킹
 * 저장: 게임 완료 시 insert
 */

// --- 유틸리티 ---

function getTodayDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// --- Reactive State ---

const rankingCache = ref<Map<Difficulty, RankingEntry[]>>(new Map())
const isLoading = ref(false)

// --- DB → RankingEntry 변환 ---

interface DbRow {
  id: string
  user_id: string
  nickname: string
  difficulty: Difficulty
  score: number
  tier: Tier
  play_date: string
  created_at: string
}

function dbRowToEntry(row: DbRow): RankingEntry {
  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname,
    difficulty: row.difficulty,
    score: Number(row.score),
    tier: row.tier,
    date: row.play_date,
    timestamp: new Date(row.created_at).getTime(),
  }
}

// --- Public API ---

export function useRanking() {
  /**
   * 오늘의 난이도별 랭킹 조회 (Supabase)
   * - 같은 닉네임은 최고 점수 1건만 표시
   * - 점수 내림차순 정렬
   */
  async function fetchDailyRanking(difficulty: Difficulty): Promise<RankingEntry[]> {
    const dateStr = getTodayDateString()

    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('play_date', dateStr)
      .eq('difficulty', difficulty)
      .order('score', { ascending: false })

    if (error) {
      console.error('[Ranking] 조회 실패:', error.message)
      return []
    }

    const rows = (data || []) as DbRow[]

    // 닉네임별 최고 점수만 추출
    const bestByUser = new Map<string, RankingEntry>()
    for (const row of rows) {
      const entry = dbRowToEntry(row)
      const existing = bestByUser.get(entry.nickname)
      if (!existing || entry.score > existing.score) {
        bestByUser.set(entry.nickname, entry)
      }
    }

    return Array.from(bestByUser.values())
      .sort((a, b) => b.score - a.score)
  }

  /**
   * 랭킹 데이터 로드 (캐시 갱신)
   */
  async function loadRanking(difficulty: Difficulty): Promise<void> {
    isLoading.value = true
    try {
      const entries = await fetchDailyRanking(difficulty)
      rankingCache.value.set(difficulty, entries)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 캐시된 랭킹 반환 (동기)
   */
  function getDailyRanking(difficulty: Difficulty): RankingEntry[] {
    return rankingCache.value.get(difficulty) || []
  }

  /**
   * 점수 제출 (Supabase insert)
   */
  async function submitScore(
    nickname: string,
    difficulty: Difficulty,
    score: number,
    tier: Tier
  ): Promise<void> {
    const { error } = await supabase
      .from('rankings')
      .insert({
        user_id: nickname,
        nickname,
        difficulty,
        score,
        tier,
        play_date: getTodayDateString(),
      })

    if (error) {
      console.error('[Ranking] 저장 실패:', error.message)
      return
    }

    // 캐시 갱신
    await loadRanking(difficulty)
  }

  return {
    rankingCache,
    isLoading,
    getDailyRanking,
    loadRanking,
    submitScore,
  }
}
