export type Screen = 'home' | 'game' | 'result'

export interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
  isFree?: boolean
}

export interface GameResult {
  stage: number
  success: boolean
  nickname: string
  achievedAt: string
}

export interface RankingEntry {
  id: string
  nickname: string
  stage: number
  achieved_at: string
}

export interface LocalRecord {
  stage: number
  achievedAt: string
}
