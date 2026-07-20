// ─────────────────────────────────────────────────────────────
// localStorage 캡슐화 — 나중에 서버 API 로 교체하기 쉽게 이 한 곳에 격리
// ─────────────────────────────────────────────────────────────

import type { UserProgress, WaterContext } from '../types'

const STORAGE_KEY = 'save-animals::progress'
// v4 — 바다 좌표를 해안선 근처만이 아니라 반경 내 바다 전역(격자)으로 확장, 이전 캐시 무효화
const WATER_KEY_PREFIX = 'save-animals::water::v4::'
/** 물 지형은 자주 바뀌지 않으므로 길게 캐시 (Overpass 요청 최소화) */
const WATER_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** 로컬 자정 기준 오늘 날짜 문자열 (YYYY-MM-DD) */
export function today(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 어제 날짜 (streak 판정용) */
export function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function createDefault(): UserProgress {
  return {
    totalMedals: 0,
    streakDays: 0,
    lastVisitDate: '',
    freeCountUsed: 0,
    adCountToday: 0,
    currentDate: today(),
    rescueRecords: [],
    handledWindow: -1,
    handledAnimalIds: [],
  }
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefault()
    const parsed = JSON.parse(raw) as Partial<UserProgress>
    // 누락 필드 보정 (스키마 진화 대비)
    return { ...createDefault(), ...parsed }
  } catch {
    return createDefault()
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // 저장 실패는 무시 (용량 초과 등) — MVP
  }
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ── 물(지형) 캐시 ────────────────────────────────────────────
// Overpass 는 무료 공용 API 라 요청이 잦으면 429/504 가 난다.
// 지형은 거의 변하지 않으므로 위치 격자 단위로 오래 캐시한다.

export interface CachedWater {
  data: WaterContext
  savedAt: number
  /** TTL 이 지났는지 — 지났어도 조회 실패 시 폴백용으로 쓸 수 있다 */
  stale: boolean
}

export function loadWaterCache(key: string): CachedWater | null {
  try {
    const raw = localStorage.getItem(WATER_KEY_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { data: WaterContext; savedAt: number }
    if (!parsed?.data) return null
    return {
      data: parsed.data,
      savedAt: parsed.savedAt,
      stale: Date.now() - parsed.savedAt > WATER_TTL_MS,
    }
  } catch {
    return null
  }
}

export function saveWaterCache(key: string, data: WaterContext): void {
  try {
    localStorage.setItem(
      WATER_KEY_PREFIX + key,
      JSON.stringify({ data, savedAt: Date.now() }),
    )
  } catch {
    // 용량 초과 등은 무시 — 캐시는 없어도 동작
  }
}
