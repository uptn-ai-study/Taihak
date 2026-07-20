// ─────────────────────────────────────────────────────────────
// 게임 튜닝 상수 — 확률 / 보상 / 비율은 전부 이 파일에서 조정
// ─────────────────────────────────────────────────────────────

import type { AnimalSpecies, Grade, Habitat } from '../types'

export interface GradeConfig {
  id: Grade
  name: string           // 일반 / 멸종위기 II급 / 멸종위기 I급
  shortName: string      // 좁은 영역용 (일반 / II급 / I급)
  nameEn: string
  successRate: number    // 구조 성공 확률 (0~1)
  medalReward: number    // 성공 시 메달
  spawnRate: number      // 등장 비율 (0~1, 합 = 1)
  color: string          // 마커/뱃지 색상
  emoji: string          // 등급 심볼
  spawnLabel: string     // 출현 난이도 라벨
  difficultyLabel: string // 구조 난이도 라벨
  desc: string           // 등급 설명
}

/**
 * 동물 등급 = 환경부 지정 멸종위기 야생생물 등급과 연동.
 * 등급이 높을수록(I급) 출현이 드물고 구조 난이도가 높다.
 * 출처: 국립생태원 멸종위기 야생생물 (총 282종 / I급 68종 · II급 214종)
 */
export const GRADES: Record<Grade, GradeConfig> = {
  1: {
    id: 1, name: '일반', shortName: '일반', nameEn: 'Common',
    successRate: 0.9, medalReward: 10, spawnRate: 0.70,
    color: '#10B981', emoji: '🐾',
    spawnLabel: '흔하게 출현', difficultyLabel: '쉬움',
    desc: '도시와 산에서 흔히 만날 수 있는 야생동물이에요.',
  },
  2: {
    id: 2, name: '멸종위기 II급', shortName: 'II급', nameEn: 'Endangered II',
    successRate: 0.6, medalReward: 40, spawnRate: 0.25,
    color: '#3B82F6', emoji: '🌿',
    spawnLabel: '드물게 출현', difficultyLabel: '어려움',
    desc: '가까운 장래에 멸종위기에 처할 우려가 있어 보호가 필요해요.',
  },
  3: {
    id: 3, name: '멸종위기 I급', shortName: 'I급', nameEn: 'Endangered I',
    successRate: 0.3, medalReward: 150, spawnRate: 0.05,
    color: '#F59E0B', emoji: '👑',
    spawnLabel: '매우 드물게 출현', difficultyLabel: '매우 어려움',
    desc: '개체수가 크게 줄어 멸종 위기에 처한 국가 최고 보호 등급이에요.',
  },
}

export const GRADE_LIST: GradeConfig[] = [GRADES[1], GRADES[2], GRADES[3]]

/**
 * 동물 종류 (마스터 데이터).
 * 멸종위기종의 등급은 환경부/국립생태원 지정 기준을 따름.
 * imageSlot 은 나중에 AI 일러스트가 들어갈 자리.
 */
export const SPECIES: AnimalSpecies[] = [
  // ── 일반 (비지정 · 도시/야산에서 흔한 동물) ──────────────
  { id: 'cat',        name: '길고양이',   emoji: '🐈',   grade: 1, taxon: '포유류',      status: 'common', habitat: 'land',       imageSlot: '/assets/animals/cat.png' },
  { id: 'dog',        name: '유기견',     emoji: '🐕',   grade: 1, taxon: '포유류',      status: 'common', habitat: 'land',       imageSlot: '/assets/animals/dog.png' },
  { id: 'sparrow',    name: '참새',       emoji: '🐦',   grade: 1, taxon: '조류',        status: 'common', habitat: 'land',       imageSlot: '/assets/animals/sparrow.png' },
  { id: 'pigeon',     name: '비둘기',     emoji: '🕊️',  grade: 1, taxon: '조류',        status: 'common', habitat: 'land',       imageSlot: '/assets/animals/pigeon.png' },
  { id: 'magpie',     name: '까치',       emoji: '🐦‍⬛', grade: 1, taxon: '조류',        status: 'common', habitat: 'land',       imageSlot: '/assets/animals/magpie.png' },
  { id: 'raccoon_dog',name: '너구리',     emoji: '🦝',   grade: 1, taxon: '포유류',      status: 'common', habitat: 'land',       imageSlot: '/assets/animals/raccoon_dog.png' },
  { id: 'hedgehog',   name: '고슴도치',   emoji: '🦔',   grade: 1, taxon: '포유류',      status: 'common', habitat: 'land',       imageSlot: '/assets/animals/hedgehog.png' },
  { id: 'squirrel',   name: '청설모',     emoji: '🐿️',  grade: 1, taxon: '포유류',      status: 'common', habitat: 'land',       imageSlot: '/assets/animals/squirrel.png' },
  { id: 'hare',       name: '멧토끼',     emoji: '🐇',   grade: 1, taxon: '포유류',      status: 'common', habitat: 'land',       imageSlot: '/assets/animals/hare.png' },
  { id: 'mallard',    name: '청둥오리',   emoji: '🦆',   grade: 1, taxon: '조류',        status: 'common', habitat: 'freshwater', imageSlot: '/assets/animals/mallard.png' },

  // ── 멸종위기 II급 ─────────────────────────────────────
  { id: 'leopard_cat',name: '삵',         emoji: '🐈‍⬛', grade: 2, taxon: '포유류',      status: 'endangered2', habitat: 'land',       imageSlot: '/assets/animals/leopard_cat.png' },
  { id: 'marten',     name: '담비',       emoji: '🦡',   grade: 2, taxon: '포유류',      status: 'endangered2', habitat: 'land',       imageSlot: '/assets/animals/marten.png' },
  { id: 'sea_lion',   name: '큰바다사자', emoji: '🦭',   grade: 2, taxon: '포유류',      status: 'endangered2', habitat: 'sea',        imageSlot: '/assets/animals/sea_lion.png' },
  { id: 'eagle_owl',  name: '수리부엉이', emoji: '🦉',   grade: 2, taxon: '조류',        status: 'endangered2', habitat: 'land',       imageSlot: '/assets/animals/eagle_owl.png' },
  { id: 'frog',       name: '맹꽁이',     emoji: '🐸',   grade: 2, taxon: '양서·파충류', status: 'endangered2', habitat: 'freshwater', imageSlot: '/assets/animals/frog.png' },
  { id: 'rat_snake',  name: '구렁이',     emoji: '🐍',   grade: 2, taxon: '양서·파충류', status: 'endangered2', habitat: 'land',       imageSlot: '/assets/animals/rat_snake.png' },
  { id: 'pond_turtle',name: '남생이',     emoji: '🐢',   grade: 2, taxon: '양서·파충류', status: 'endangered2', habitat: 'freshwater', imageSlot: '/assets/animals/pond_turtle.png' },

  // ── 멸종위기 I급 ──────────────────────────────────────
  { id: 'tiger',      name: '호랑이',     emoji: '🐅',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/tiger.png' },
  { id: 'leopard',    name: '표범',       emoji: '🐆',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/leopard.png' },
  { id: 'black_bear', name: '반달가슴곰', emoji: '🐻',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/black_bear.png' },
  { id: 'otter',      name: '수달',       emoji: '🦦',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'freshwater', imageSlot: '/assets/animals/otter.png' },
  { id: 'goral',      name: '산양',       emoji: '🐐',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/goral.png' },
  { id: 'fox',        name: '여우',       emoji: '🦊',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/fox.png' },
  { id: 'wolf',       name: '늑대',       emoji: '🐺',   grade: 3, taxon: '포유류',      status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/wolf.png' },
  { id: 'golden_eagle',name: '검독수리',  emoji: '🦅',   grade: 3, taxon: '조류',        status: 'endangered1', habitat: 'land',       imageSlot: '/assets/animals/golden_eagle.png' },
  { id: 'swan',       name: '혹고니',     emoji: '🦢',   grade: 3, taxon: '조류',        status: 'endangered1', habitat: 'freshwater', imageSlot: '/assets/animals/swan.png' },
]

/** 서식지 라벨 (UI 표기용) */
export const HABITAT_LABEL: Record<Habitat, string> = {
  sea: '바다',
  freshwater: '강·호수',
  land: '육지',
}

/** 등급별 종 풀 — 스포너가 등급 결정 후 해당 풀에서 종을 고름 */
export const SPECIES_BY_GRADE: Record<Grade, AnimalSpecies[]> = {
  1: SPECIES.filter((s) => s.grade === 1),
  2: SPECIES.filter((s) => s.grade === 2),
  3: SPECIES.filter((s) => s.grade === 3),
}

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

// ── 테스트 위치 (서식지별 출현 차이 확인용) ──────────────────
export interface TestLocation {
  id: string
  name: string
  desc: string   // 어떤 지형인지
  emoji: string
  lat: number
  lng: number
}

export const TEST_LOCATIONS: TestLocation[] = [
  { id: 'cityhall', name: '서울 시청',     desc: '도심 · 청계천',   emoji: '🏙️', lat: 37.5665, lng: 126.9780 },
  { id: 'hangang',  name: '여의도 한강공원', desc: '큰 강 주변',      emoji: '🌊', lat: 37.5285, lng: 126.9326 },
  { id: 'haeundae', name: '해운대 해수욕장', desc: '바다 · 해안선',   emoji: '🏖️', lat: 35.1587, lng: 129.1604 },
  { id: 'seorak',   name: '설악산',        desc: '산 · 육지 위주',   emoji: '⛰️', lat: 38.1670, lng: 128.4667 },
  { id: 'suncheon', name: '순천만 습지',    desc: '습지 · 갯벌',     emoji: '🪷', lat: 34.8853, lng: 127.5086 },
  { id: 'seongsan', name: '성산일출봉',     desc: '제주 · 바다',     emoji: '🌅', lat: 33.4580, lng: 126.9425 },
]

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
