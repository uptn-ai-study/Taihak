// ─────────────────────────────────────────────────────────────
// 동물 좌표 생성 로직 — 순수 함수 (외부 의존성 없음)
// 나중에 서버로 그대로 이식 가능하도록 작성
// ─────────────────────────────────────────────────────────────

import type { Grade, LatLng, SpawnedAnimal } from '../types'
import { GRADE_LIST, SPAWN, SPECIES } from '../config/gameConfig'

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

/**
 * 사용자 위치 중심으로 동물 N마리 생성.
 * 같은 spawnWindow + 같은 위치라면 항상 동일한 결과 (새로고침해도 동일).
 *
 * @param center  사용자 현재 위치
 * @param window  30분 시드값 (getSpawnWindow 결과)
 */
export function spawnAnimals(center: LatLng, window: number): SpawnedAnimal[] {
  // 위치가 조금 달라도 window 안에서 안정적이도록 좌표를 격자로 반올림해 시드에 반영
  const latKey = Math.round(center.lat * 100)
  const lngKey = Math.round(center.lng * 100)
  const seed = (window * 73856093) ^ (latKey * 19349663) ^ (lngKey * 83492791)
  const rng = mulberry32(seed >>> 0)

  const animals: SpawnedAnimal[] = []
  for (let i = 0; i < SPAWN.count; i++) {
    const grade = pickGrade(rng)
    const distance = SPAWN.minRadiusM + rng() * (SPAWN.maxRadiusM - SPAWN.minRadiusM)
    const bearing = rng() * Math.PI * 2
    const { lat, lng } = offsetLatLng(center, distance, bearing)
    const species = SPECIES[Math.floor(rng() * SPECIES.length)]

    animals.push({
      id: `${window}-${i}`,
      speciesId: species.id,
      grade,
      lat,
      lng,
      spawnWindow: window,
    })
  }
  return animals
}
