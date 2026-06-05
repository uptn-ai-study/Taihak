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

/**
 * 랭킹 엔트리 (DB 마이그레이션 대비 구조)
 * - 추후 DB 전환 시 이 인터페이스를 테이블 스키마로 매핑
 * - id: DB 전환 시 auto-increment PK로 교체
 * - userId: 추후 회원 체계 연동 시 회원 ID로 교체
 */
export interface RankingEntry {
  id: string              // UUID (DB 전환 시 PK)
  userId: string          // 현재는 닉네임, 추후 회원 ID
  nickname: string        // 표시용 닉네임
  difficulty: Difficulty
  score: number           // 최종 점수 (30점 만점)
  tier: Tier
  date: string            // YYYY-MM-DD (일간 구분 키)
  timestamp: number       // Unix ms (정렬용)
}

/**
 * 랭킹 저장소 파일 구조 (JSON 파일 시스템 시뮬레이션)
 * - 날짜별 + 난이도별로 파티셔닝
 * - DB 전환 시: date + difficulty 복합 인덱스로 매핑
 */
export interface RankingStore {
  version: number
  entries: RankingEntry[]
}
