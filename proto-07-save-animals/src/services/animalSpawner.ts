// ─────────────────────────────────────────────────────────────
// 동물 좌표 생성 로직 — 순수 함수 (외부 의존성 없음)
// 물(지형) 데이터는 인자로 주입받아 순수성을 유지 → 서버 이식 가능
// ─────────────────────────────────────────────────────────────

import type { AnimalSpecies, Grade, LatLng, SpawnedAnimal } from '../types'
import { GRADE_LIST, SPAWN, SPECIES_BY_GRADE } from '../config/gameConfig'
import { EMPTY_WATER, distanceM, type WaterContext } from './terrain'

/** 현재 시각 → 30분 window 시드값 */
export function getSpawnWindow(now: number = Date.now()): number {
  return Math.floor(now / SPAWN.windowMs)
}

/** mulberry32 — 시드 기반 결정적 의사난수 생성기 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 등장 비율에 따라 등급 배정 */
function pickGrade(rng: () => number): Grade {
  const r = rng()
  let acc = 0
  for (const g of GRADE_LIST) {
    acc += g.spawnRate
    if (r < acc) return g.id
  }
  return GRADE_LIST[0].id
}

/**
 * 반경(m) → 위/경도 오프셋 적용.
 * 위도 1도 ≈ 111,320m, 경도는 위도에 따라 cos 보정.
 */
function offsetLatLng(center: LatLng, distanceM: number, bearingRad: number): LatLng {
  const dLat = (distanceM * Math.cos(bearingRad)) / 111320
  const dLng = (distanceM * Math.sin(bearingRad)) / (111320 * Math.cos((center.lat * Math.PI) / 180))
  return { lat: center.lat + dLat, lng: center.lng + dLng }
}

/** 물 좌표 위에 살짝 흔들어 배치 (여러 마리가 완전히 겹치지 않도록) */
function jitter(p: LatLng, rng: () => number): LatLng {
  const d = rng() * 15 // 최대 15m
  return offsetLatLng(p, d, rng() * Math.PI * 2)
}

/** 육지 좌표 — 물에서 최소 40m 떨어지도록 몇 번 재시도 */
function randomLandPoint(center: LatLng, rng: () => number, water: WaterContext): LatLng {
  let point = center
  for (let attempt = 0; attempt < 6; attempt++) {
    const distance = SPAWN.minRadiusM + rng() * (SPAWN.maxRadiusM - SPAWN.minRadiusM)
    point = offsetLatLng(center, distance, rng() * Math.PI * 2)
    const nearWater = [...water.freshwater, ...water.sea].some(
      (w) => distanceM(point, w) < 40,
    )
    if (!nearWater) return point
  }
  return point // 계속 물이면 마지막 좌표 사용 (희박)
}

/**
 * 사용자 위치 중심으로 동물 N마리 생성.
 * 같은 spawnWindow + 같은 위치 + 같은 물 데이터면 항상 동일한 결과.
 *
 * @param center 사용자 현재 위치
 * @param window 30분 시드값 (getSpawnWindow 결과)
 * @param water  주변 물 좌표 (없으면 육지 동물만 출현)
 */
export function spawnAnimals(
  center: LatLng,
  window: number,
  water: WaterContext = EMPTY_WATER,
): SpawnedAnimal[] {
  // 위치가 조금 달라도 window 안에서 안정적이도록 좌표를 격자로 반올림해 시드에 반영
  const latKey = Math.round(center.lat * 100)
  const lngKey = Math.round(center.lng * 100)
  const seed = (window * 73856093) ^ (latKey * 19349663) ^ (lngKey * 83492791)
  const rng = mulberry32(seed >>> 0)

  const hasFresh = water.freshwater.length > 0
  const hasSea = water.sea.length > 0
  const available = (s: AnimalSpecies) =>
    s.habitat === 'land' ||
    (s.habitat === 'freshwater' && hasFresh) ||
    (s.habitat === 'sea' && hasSea)

  const animals: SpawnedAnimal[] = []
  for (let i = 0; i < SPAWN.count; i++) {
    // 1) 등급(=멸종위기 등급) 결정
    const grade = pickGrade(rng)

    // 2) 그 등급 중 '주변 지형에 살 수 있는' 종만 후보로
    let pool = SPECIES_BY_GRADE[grade].filter(available)
    if (pool.length === 0) pool = SPECIES_BY_GRADE[grade].filter((s) => s.habitat === 'land')
    if (pool.length === 0) continue
    const species = pool[Math.floor(rng() * pool.length)]

    // 3) 서식지에 맞는 좌표에 배치
    let position: LatLng
    if (species.habitat === 'freshwater') {
      position = jitter(water.freshwater[Math.floor(rng() * water.freshwater.length)], rng)
    } else if (species.habitat === 'sea') {
      position = jitter(water.sea[Math.floor(rng() * water.sea.length)], rng)
    } else {
      position = randomLandPoint(center, rng, water)
    }

    animals.push({
      id: `${window}-${i}`,
      speciesId: species.id,
      grade,
      lat: position.lat,
      lng: position.lng,
      spawnWindow: window,
    })
  }
  return animals
}
