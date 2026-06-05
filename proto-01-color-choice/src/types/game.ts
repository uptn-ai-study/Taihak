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

/** 라운드별 채점 결과 */
export interface RoundScore {
  score: number      // 0.00 ~ 10.00
  deltaE: number     // CIEDE2000 색차
  deltaH: number     // Hue 오차
  deltaS: number     // Saturation 오차
  deltaB: number     // Brightness 오차
}

/** 게임 난이도 */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** 게임 화면 */
export type GameScreen = 'start' | 'reveal' | 'recall' | 'results'

/** 등급 */
export type Tier = 'S' | 'A' | 'B' | 'C' | 'F'

/** 난이도별 설정 */
export interface DifficultyConfig {
  label: string
  description: string
  revealTime: number // ms
}

/** 저장된 게임 기록 */
export interface GameRecord {
  date: string
  difficulty: string
  score: number
  tier: Tier
}
