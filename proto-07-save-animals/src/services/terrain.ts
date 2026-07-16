// ─────────────────────────────────────────────────────────────
// 지형(물) 데이터 조회 — OpenStreetMap Overpass API (무료, 키 불필요)
//
// 주변 반경의 실제 하천·호수(민물)와 해안선(바다) 좌표를 가져와,
// 수생 동물이 물 위에만 출현하도록 스포너에 넘겨준다.
//
// Overpass 는 공용 무료 API 라 요청이 잦으면 429/504 가 난다. 그래서
//  1) 위치 격자 단위로 localStorage 에 오래(7일) 캐시하고
//  2) 실패하면 미러 엔드포인트로 재시도하며
//  3) 그래도 실패하면 만료된 캐시라도 사용, 최후에는 육지 동물만 출현시킨다.
// ─────────────────────────────────────────────────────────────

import type { LatLng, WaterContext } from '../types'
import { loadWaterCache, saveWaterCache } from './storage'

export type { WaterContext }

export const EMPTY_WATER: WaterContext = { freshwater: [], sea: [] }

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

/** 두 좌표 사이 거리 (m) — Haversine */
export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** 좌표가 너무 촘촘하면 솎아내기 (마커가 한 곳에 뭉치지 않도록) */
function thin(points: LatLng[], max: number): LatLng[] {
  if (points.length <= max) return points
  const step = points.length / max
  const out: LatLng[] = []
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * step)])
  return out
}

/** 위치 격자 키 (소수 2자리 ≈ 1km) — 같은 동네면 캐시 공유 */
function gridKey(center: LatLng): string {
  return `${center.lat.toFixed(2)}:${center.lng.toFixed(2)}`
}

const inflight = new Map<string, Promise<WaterContext>>()

/**
 * 주변 물(민물/바다) 좌표 조회.
 * 캐시가 신선하면 네트워크를 타지 않는다.
 */
export function fetchWaterContext(
  center: LatLng,
  minRadiusM: number,
  maxRadiusM: number,
): Promise<WaterContext> {
  const key = gridKey(center)

  const cached = loadWaterCache(key)
  if (cached && !cached.stale) return Promise.resolve(cached.data)

  const running = inflight.get(key)
  if (running) return running

  const p = load(center, minRadiusM, maxRadiusM)
    .then((data) => {
      saveWaterCache(key, data)
      return data
    })
    .catch((e) => {
      // 만료된 캐시라도 있으면 그걸 쓰는 편이 낫다
      if (cached) {
        console.warn('[terrain] 조회 실패 — 이전 캐시 사용', e)
        return cached.data
      }
      console.warn('[terrain] 물 데이터 조회 실패 — 육지 동물만 출현합니다.', e)
      return EMPTY_WATER
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, p)
  return p
}

async function load(center: LatLng, minR: number, maxR: number): Promise<WaterContext> {
  const { lat, lng } = center
  const query = `[out:json][timeout:20];
(
  way(around:${maxR},${lat},${lng})["natural"="water"];
  way(around:${maxR},${lat},${lng})["waterway"~"^(river|stream|canal)$"];
  way(around:${maxR},${lat},${lng})["natural"="coastline"];
);
out geom 400;`

  let lastError: unknown = null
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      })
      if (!res.ok) throw new Error(`Overpass ${res.status}`)
      return parse(await res.json(), center, minR, maxR)
    } catch (e) {
      lastError = e // 다음 미러로 재시도
    }
  }
  throw lastError ?? new Error('Overpass 조회 실패')
}

function parse(data: any, center: LatLng, minR: number, maxR: number): WaterContext {
  const freshwater: LatLng[] = []
  const sea: LatLng[] = []

  for (const el of data?.elements ?? []) {
    if (!el.geometry) continue
    // natural=coastline 은 바다와 육지의 경계 → 바다 서식 동물 배치 지점
    const isSea = el.tags?.natural === 'coastline'
    for (const g of el.geometry) {
      const p: LatLng = { lat: g.lat, lng: g.lon }
      const d = distanceM(center, p)
      if (d < minR || d > maxR) continue // 게임 규칙상 반경 밖은 제외
      ;(isSea ? sea : freshwater).push(p)
    }
  }

  return { freshwater: thin(freshwater, 150), sea: thin(sea, 150) }
}
