// ─────────────────────────────────────────────────────────────
// localStorage 캡슐화 — 나중에 서버 API 로 교체하기 쉽게 이 한 곳에 격리
// ─────────────────────────────────────────────────────────────

import type { UserProgress } from '../types'

const STORAGE_KEY = 'save-animals::progress'

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
