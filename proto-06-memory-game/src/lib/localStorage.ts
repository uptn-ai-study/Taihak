import type { LocalRecord } from '../types'

const NICKNAME_KEY = 'memory_game_nickname'
const RECORDS_KEY = 'memory_game_records'
const POINTS_KEY = 'memory_game_points'

export function getNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) ?? ''
}

export function saveNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname)
}

export function getMyRecords(): LocalRecord[] {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]') as LocalRecord[]
  } catch {
    return []
  }
}

export function addMyRecord(stage: number): void {
  const records = getMyRecords()
  records.unshift({ stage, achievedAt: new Date().toISOString() })
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records.slice(0, 50)))
}

export function getBestStage(): number {
  const records = getMyRecords()
  return records.reduce((max, r) => Math.max(max, r.stage), 0)
}

export function getTotalPoints(): number {
  return parseInt(localStorage.getItem(POINTS_KEY) ?? '0', 10)
}

export function addPoints(pts: number): void {
  const current = getTotalPoints()
  localStorage.setItem(POINTS_KEY, String(current + pts))
}
