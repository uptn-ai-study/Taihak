/** HSB 색상 값 */
export interface HsbColor {
  h: number // 0-360
  s: number // 0-100
  b: number // 0-100
}

/** RGB 색상 값 */
export interface RgbColor {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

/** CIELAB 색상 값 */
export interface LabColor {
  L: number
  a: number
  b: number
}

/** XYZ 색상 값 */
export interface XyzColor {
  x: number
  y: number
  z: number
}

/** 게임에서 사용하는 완전한 색상 정보 */
export interface GameColor {
  hsb: HsbColor
  rgb: RgbColor
  lab: LabColor
}

/** 개별 색상 채점 결과 */
export interface ColorScore {
  score: number      // 0.00 ~ 10.00
  deltaE: number     // CIEDE2000 색차
  deltaH: number     // Hue 오차
  deltaS: number     // Saturation 오차
  deltaB: number     // Brightness 오차
}

/** 게임 화면 */
export type GameScreen = 'start' | 'reveal' | 'recall' | 'round_result' | 'results'

/** 등급 */
export type Tier = 'S' | 'A' | 'B' | 'C' | 'F'

/** 난이도 (DB 호환용, UI에서는 사용하지 않음) */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** 라운드 결과 (3색상 묶음) */
export interface RoundResult {
  round: number               // 1-based 라운드 번호
  targetColors: GameColor[]   // 정답 색상 3개
  userGuesses: GameColor[]    // 사용자 추측 3개
  colorScores: ColorScore[]   // 개별 색상 점수 3개
  totalScore: number          // 라운드 합산 (max 30)
  passed: boolean             // 통과 여부
}

/** 저장된 게임 기록 */
export interface GameRecord {
  date: string
  roundsCleared: number  // 통과한 라운드 수
  totalRounds: number    // 전체 라운드 수
  score: number          // 누적 점수
  tier: Tier
  eliminated: boolean    // 탈락 여부
}

/** 랭킹 엔트리 */
export interface RankingEntry {
  id: string
  userId: string
  nickname: string
  difficulty: Difficulty    // DB 호환용 (항상 'normal')
  score: number             // 누적 점수 (max 300)
  tier: Tier
  date: string
  timestamp: number
  roundsCleared?: number    // 통과한 라운드 수
}
