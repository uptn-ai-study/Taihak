export type Difficulty = 'easy' | 'hard'

export type GameScreen =
  | 'intro'
  | 'countdown'
  | 'watch'
  | 'recreate'
  | 'roundResult'
  | 'totalResult'

export interface RoundData {
  targetMs: number   // 목표 시간 (밀리초)
  playerMs: number   // 플레이어가 재현한 시간 (밀리초)
  score: number      // 라운드 점수 (0~10)
}

export interface GameState {
  screen: GameScreen
  difficulty: Difficulty
  currentRound: number   // 1~5
  totalRounds: number    // 5
  rounds: RoundData[]
  countdownValue: number // 3, 2, 1
}

// 난이도별 시간 범위
export const DIFFICULTY_CONFIG: Record<Difficulty, { minMs: number; maxMs: number }> = {
  easy: { minMs: 1000, maxMs: 5000 },
  hard: { minMs: 2000, maxMs: 10000 },
}

export const TOTAL_ROUNDS = 5

// 점수대별 멘트
export const SCORE_MESSAGES: { min: number; max: number; message: string }[] = [
  { min: 48, max: 50, message: '완벽해요! 내면의 시계가 있네요 ⏱️' },
  { min: 43, max: 47, message: '놀라워요! 거의 완벽한 감각이에요 🎯' },
  { min: 35, max: 42, message: '꽤 정확해요! 감각이 좋네요 👏' },
  { min: 25, max: 34, message: '평균 수준이에요. 다시 도전해봐요! 💪' },
  { min: 0,  max: 24, message: '시간 감각을 키워보세요 😅' },
]
