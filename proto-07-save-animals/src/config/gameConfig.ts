// ─────────────────────────────────────────────────────────────
// 게임 튜닝 상수 — 확률 / 보상 / 비율은 전부 이 파일에서 조정
// ─────────────────────────────────────────────────────────────

import type { AnimalSpecies, Grade } from '../types'

export interface GradeConfig {
  id: Grade
  name: string        // 일반 / 희귀 / 전설
  nameEn: string
  successRate: number // 구조 성공 확률 (0~1)
  medalReward: number // 성공 시 메달
  spawnRate: number   // 등장 비율 (0~1, 합 = 1)
  color: string       // 마커/뱃지 색상
  emoji: string       // 등급 심볼
}

/** 동물 등급 (3단계) */
export const GRADES: Record<Grade, GradeConfig> = {
  1: { id: 1, name: '일반', nameEn: 'Common',    successRate: 0.9, medalReward: 10,  spawnRate: 0.70, color: '#10B981', emoji: '🐾' },
  2: { id: 2, name: '희귀', nameEn: 'Rare',      successRate: 0.6, medalReward: 40,  spawnRate: 0.25, color: '#3B82F6', emoji: '✨' },
  3: { id: 3, name: '전설', nameEn: 'Legendary', successRate: 0.3, medalReward: 150, spawnRate: 0.05, color: '#F59E0B', emoji: '👑' },
}

export const GRADE_LIST: GradeConfig[] = [GRADES[1], GRADES[2], GRADES[3]]

/** 동물 종류 (마스터 데이터). imageSlot 은 나중에 AI 일러스트가 들어갈 자리 */
export const SPECIES: AnimalSpecies[] = [
  { id: 'cat',     name: '길고양이', emoji: '🐈', imageSlot: '/assets/animals/cat.png' },
  { id: 'dog',     name: '유기견',   emoji: '🐕', imageSlot: '/assets/animals/dog.png' },
  { id: 'rabbit',  name: '토끼',     emoji: '🐇', imageSlot: '/assets/animals/rabbit.png' },
  { id: 'bird',    name: '참새',     emoji: '🐦', imageSlot: '/assets/animals/bird.png' },
  { id: 'raccoon', name: '너구리',   emoji: '🦝', imageSlot: '/assets/animals/raccoon.png' },
  { id: 'hedgehog',name: '고슴도치', emoji: '🦔', imageSlot: '/assets/animals/hedgehog.png' },
]

export function getSpecies(id: string): AnimalSpecies {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0]
}

// ── 스폰 규칙 ────────────────────────────────────────────────
export const SPAWN = {
  /** 한 window 에 생성할 동물 수 */
  count: 10,
  /** 사용자 위치 기준 최소/최대 반경 (m) */
  minRadiusM: 200,
  maxRadiusM: 3000,
  /** 좌표 갱신 주기 (ms) — 30분 */
  windowMs: 30 * 60 * 1000,
}

// ── 하루 구조 규칙 ───────────────────────────────────────────
export const DAILY = {
  freeRescues: 5,      // 하루 무료 구조 횟수
  adTimerSec: 3,       // 광고 목업 타이머 (초)
}

// ── 출석 보너스 ──────────────────────────────────────────────
export const ATTENDANCE = {
  baseMedals: 20,      // 출석 기본 메달
  adMultiplier: 2,     // 광고 보고 2배
  specialStreak: 7,    // 특별 보너스 도달일
}

// ── 기본 위치 (위치 권한 거부/실패 시) ───────────────────────
export const DEFAULT_LOCATION = {
  lat: 37.5665,        // 서울 시청
  lng: 126.9780,
  name: '서울 시청',
}

// ── 메달샵 상품 (UI 목업) ────────────────────────────────────
export interface ShopItem {
  id: string
  name: string
  desc: string
  cost: number
  emoji: string
  donation?: boolean   // 기부 옵션 표시
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'coffee',   name: '아메리카노 기프티콘', desc: '카페 교환권',       cost: 300,  emoji: '☕' },
  { id: 'convenience', name: '편의점 5천원권',   desc: 'GS25 / CU 사용',    cost: 500,  emoji: '🏪' },
  { id: 'chicken',  name: '치킨 기프티콘',       desc: '반반무 가능',       cost: 1200, emoji: '🍗' },
  { id: 'donation', name: '동물구호단체 기부',   desc: '유기동물 보호에 사용', cost: 100, emoji: '💚', donation: true },
]
