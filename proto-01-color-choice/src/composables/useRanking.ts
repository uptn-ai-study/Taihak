import { ref, computed } from 'vue'
import type { Difficulty, RankingEntry, RankingStore, Tier } from '../types/game'

/**
 * 랭킹 저장소 추상화 레이어
 *
 * 현재: localStorage (JSON 파일 시스템 시뮬레이션)
 * 추후: Supabase / REST API로 교체 시 이 파일의 load/save 함수만 변경
 *
 * 저장 구조 (localStorage):
 *   key: "ranking_store"
 *   value: RankingStore JSON
 *
 * DB 마이그레이션 가이드:
 *   1. RankingEntry → DB 테이블 (ranking_entries)
 *   2. date + difficulty → 복합 인덱스
 *   3. loadStore() → API GET /api/rankings?date=YYYY-MM-DD&difficulty=xxx
 *   4. saveEntry() → API POST /api/rankings
 *   5. clearUserEntries() → API DELETE /api/rankings?userId=xxx
 */

const RANKING_STORE_KEY = 'ranking_store'
const STORE_VERSION = 1
const MAX_ENTRIES_PER_DAY_DIFFICULTY = 50  // 난이도별 일간 최대 저장 수

// --- 저장소 I/O (DB 전환 시 이 부분만 교체) ---

function loadStore(): RankingStore {
  const raw = localStorage.getItem(RANKING_STORE_KEY)
  if (!raw) return { version: STORE_VERSION, entries: [] }
  try {
    const store: RankingStore = JSON.parse(raw)
    return store
  } catch {
    return { version: STORE_VERSION, entries: [] }
  }
}

function persistStore(store: RankingStore): void {
  localStorage.setItem(RANKING_STORE_KEY, JSON.stringify(store))
}

// --- 유틸리티 ---

function getTodayDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// --- Reactive State ---

const store = ref<RankingStore>(loadStore())

// 오래된 데이터 정리 (7일 이전 데이터 자동 삭제)
function purgeOldEntries() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const before = store.value.entries.length
  store.value.entries = store.value.entries.filter(e => e.date >= cutoffStr)

  if (store.value.entries.length !== before) {
    persistStore(store.value)
  }
}

// 초기 로드 시 정리
purgeOldEntries()

// --- Public API ---

export function useRanking() {
  const today = computed(() => getTodayDateString())

  /**
   * 오늘의 난이도별 랭킹 조회
   * - 같은 닉네임은 최고 점수 1건만 표시 (개인 베스트)
   * - 점수 내림차순 정렬
   */
  function getDailyRanking(difficulty: Difficulty): RankingEntry[] {
    const dateStr = getTodayDateString()

    // 해당 날짜+난이도 필터
    const dayEntries = store.value.entries.filter(
      e => e.date === dateStr && e.difficulty === difficulty
    )

    // 닉네임별 최고 점수만 추출
    const bestByUser = new Map<string, RankingEntry>()
    for (const entry of dayEntries) {
      const existing = bestByUser.get(entry.nickname)
      if (!existing || entry.score > existing.score) {
        bestByUser.set(entry.nickname, entry)
      }
    }

    // 점수 내림차순 정렬
    return Array.from(bestByUser.values())
      .sort((a, b) => b.score - a.score)
  }

  /**
   * 랭킹 엔트리 저장
   */
  function submitScore(
    nickname: string,
    difficulty: Difficulty,
    score: number,
    tier: Tier
  ): void {
    const entry: RankingEntry = {
      id: generateId(),
      userId: nickname, // 추후 회원 ID로 교체
      nickname,
      difficulty,
      score,
      tier,
      date: getTodayDateString(),
      timestamp: Date.now(),
    }

    store.value.entries.push(entry)

    // 난이도별 일간 엔트리 수 제한 (오래된 것부터 삭제)
    const dayDiffEntries = store.value.entries.filter(
      e => e.date === entry.date && e.difficulty === difficulty
    )
    if (dayDiffEntries.length > MAX_ENTRIES_PER_DAY_DIFFICULTY) {
      const sorted = dayDiffEntries.sort((a, b) => a.timestamp - b.timestamp)
      const toRemove = new Set(
        sorted.slice(0, dayDiffEntries.length - MAX_ENTRIES_PER_DAY_DIFFICULTY).map(e => e.id)
      )
      store.value.entries = store.value.entries.filter(e => !toRemove.has(e.id))
    }

    persistStore(store.value)
  }

  /**
   * 특정 유저의 모든 랭킹 데이터 삭제
   */
  function clearUserEntries(nickname: string): void {
    store.value.entries = store.value.entries.filter(e => e.nickname !== nickname)
    persistStore(store.value)
  }

  /**
   * 전체 랭킹 데이터 초기화
   */
  function clearAllEntries(): void {
    store.value = { version: STORE_VERSION, entries: [] }
    persistStore(store.value)
  }

  return {
    today,
    getDailyRanking,
    submitScore,
    clearUserEntries,
    clearAllEntries,
  }
}
